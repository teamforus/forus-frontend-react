import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { useFundService } from '../../../services/FundService';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import PreCheck from '../../../props/models/PreCheck';
import { usePreCheckService } from '../../../services/PreCheckService';
import usePushDanger from '../../../../dashboard/hooks/usePushDanger';
import PreCheckTotals from '../../../services/types/PreCheckTotals';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { useFileService } from '../../../../dashboard/services/FileService';
import usePushSuccess from '../../../../dashboard/hooks/usePushSuccess';
import { format } from 'date-fns';
import { ResponseError } from '../../../../dashboard/props/ApiResponses';
import useAppConfigs from '../../../hooks/useAppConfigs';
import { useNavigateState } from '../../../modules/state_router/Router';
import RecordType from '../../../../dashboard/props/models/RecordType';
import { useRecordTypeService } from '../../../../dashboard/services/RecordTypeService';
import { useTagService } from '../../../../dashboard/services/TagService';
import Tag from '../../../../dashboard/props/models/Tag';
import { useOrganizationService } from '../../../../dashboard/services/OrganizationService';
import Organization from '../../../../dashboard/props/models/Organization';
import ProgressPie from '../../elements/progress-pie/ProgressPie';
import UIControlSearch from '../../../../dashboard/components/elements/forms/ui-controls/UIControlSearch';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import UIControlCheckbox from '../../../../dashboard/components/elements/forms/ui-controls/UIControlCheckbox';
import UIControlStep from '../../../../dashboard/components/elements/forms/ui-controls/UIControlStep';
import UIControlDate from '../../../../dashboard/components/elements/forms/ui-controls/UIControlDate';
import { dateFormat, dateParse } from '../../../../dashboard/helpers/dates';
import UIControlNumber from '../../../../dashboard/components/elements/forms/ui-controls/UIControlNumber';
import UIControlText from '../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import FundsListItemPreCheck from '../../elements/lists/funds-list/templates/FundsListItemPreCheck';
import useFilter from '../../../../dashboard/hooks/useFilter';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import BlockLoader from '../../elements/block-loader/BlockLoader';
import BlockLoaderBreadcrumbs from '../../elements/block-loader/BlockLoaderBreadcrumbs';

type PreCheckLocal = PreCheck<{
    label?: string;
    is_checked?: boolean;
    input_value?: string;
    control_type?: string;
}>;

export default function FundsPreCheck() {
    const appConfigs = useAppConfigs();

    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const tagService = useTagService();
    const fundService = useFundService();
    const fileService = useFileService();
    const organizationService = useOrganizationService();
    const preCheckService = usePreCheckService();
    const recordTypeService = useRecordTypeService();

    const [tags, setTags] = useState<Array<Tag>>(null);
    const [totals, setTotals] = useState<PreCheckTotals>(null);
    const [preChecks, setPreChecks] = useState<Array<PreCheckLocal>>(null);
    const [recordTypes, setRecordTypes] = useState<Array<RecordType>>(null);
    const [organizations, setOrganizations] = useState<Array<Partial<Organization>>>(null);
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [emptyRecordTypeKeys, setEmptyRecordTypeKeys] = useState<Array<string>>(null);
    const [showMorePreCheckInfo, setShowMorePreCheckInfo] = useState(false);

    const hasTotals = useMemo(() => !!totals, [totals]);

    const recordTypesByKey = useMemo(() => {
        return recordTypes?.reduce((acc, type) => ({ ...acc, [type.key]: type }), {});
    }, [recordTypes]);

    const filter = useFilter({
        q: '',
        tag_id: null,
        organization_id: null,
    });

    const mapPreCheck = useCallback(
        (preCheck: PreCheckLocal) => {
            return {
                ...preCheck,
                record_types: preCheck.record_types.map((record_type) => ({
                    ...record_type,
                    label: fundService.getCriterionLabelValue(record_type.record_type, record_type.value, translate),
                    control_type: fundService.getCriterionControlType(record_type.record_type),
                    input_value: fundService.getCriterionControlDefaultValue(record_type.record_type, '=', false),
                })),
            };
        },
        [fundService, translate],
    );

    const mapRecords = (preChecks: Array<PreCheckLocal>) => {
        return preChecks.reduce(
            (recordsData, preCheck) => [
                ...recordsData,
                ...preCheck.record_types.reduce(
                    (recordData, record) => [
                        ...recordData,
                        { key: record.record_type_key, value: record.input_value?.toString() || '' },
                    ],
                    [],
                ),
            ],
            [],
        );
    };

    const preCheckFilled = useCallback(
        (index: number) => {
            const activePreCheck = preChecks[index];
            const filledRecordTypes = activePreCheck.record_types.filter((pre_check_record) => {
                return (
                    pre_check_record.input_value ||
                    pre_check_record.input_value === '0' ||
                    pre_check_record.control_type === 'ui_control_checkbox'
                );
            });

            const recordTypeKeys = activePreCheck.record_types.map((recordType) => recordType.record_type_key);
            const filledRecordTypeKeys = filledRecordTypes.map((recordType) => recordType.record_type_key);

            const emptyRecordTypeKeys = recordTypeKeys.filter((recordTypeKey) => {
                return !filledRecordTypeKeys.includes(recordTypeKey);
            });

            setEmptyRecordTypeKeys(emptyRecordTypeKeys);

            return !emptyRecordTypeKeys.length;
        },
        [preChecks],
    );

    const fetchPreCheckTotals = useCallback(() => {
        const records = mapRecords(preChecks);

        setProgress(0);

        preCheckService
            .calculateTotals({ ...filter.activeValues, records })
            .then((res) => setTotals(res.data))
            .catch((res) => pushDanger(res.data.message))
            .finally(() => setProgress(100));
    }, [setProgress, filter.activeValues, preCheckService, preChecks, pushDanger]);

    const changeAnswers = useCallback(() => {
        setTotals(null);
        setActiveStepIndex(0);
    }, []);

    const downloadPDF = useCallback(() => {
        const records = mapRecords(preChecks);

        setProgress(0);

        preCheckService
            .downloadPDF({ ...filter.values, records })
            .then((res) => {
                pushSuccess('Succes!', 'De download begint over enkele ogenblikken.');

                fileService.downloadFile(
                    `pre-check_${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}.pdf`,
                    res.data,
                    res.headers['Content-Type'] + ';charset=utf-8;',
                );
            })
            .catch((err: ResponseError) => pushDanger(err.data.message))
            .finally(() => setProgress(100));
    }, [fileService, filter.values, preCheckService, preChecks, pushDanger, pushSuccess, setProgress]);

    const prev = useCallback(() => {
        setActiveStepIndex(Math.max(activeStepIndex - 1, 0));
    }, [activeStepIndex]);

    const next = useCallback(() => {
        const isLastPreCheck = activeStepIndex == preChecks.length - 1;

        if (preCheckFilled(activeStepIndex)) {
            if (isLastPreCheck) {
                return fetchPreCheckTotals();
            }

            setActiveStepIndex(Math.min(activeStepIndex + 1, preChecks.length));
        }
    }, [activeStepIndex, fetchPreCheckTotals, preCheckFilled, preChecks?.length]);

    const fetchRecordTypes = useCallback(() => {
        setProgress(0);

        recordTypeService
            .list()
            .then((res) => setRecordTypes(res.data))
            .finally(() => setProgress(100));
    }, [recordTypeService, setProgress]);

    const fetchTags = useCallback(() => {
        setProgress(0);

        tagService
            .list({ type: 'funds', per_page: 1000 })
            .then((res) => setTags([{ id: null, name: 'Alle categorieën' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [tagService, setProgress]);

    const fetchOrganizations = useCallback(() => {
        setProgress(0);

        organizationService
            .list({ implementation: 1, is_employee: 0 })
            .then((res) => setOrganizations([{ id: null, name: 'Alle organisaties' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [organizationService, setProgress]);

    const fetchPreCheck = useCallback(() => {
        setProgress(0);

        preCheckService
            .list()
            .then((res) =>
                setPreChecks(
                    res.data.data
                        .filter((preCheck) => preCheck.record_types.length > 0)
                        .map((preCheck) => mapPreCheck(preCheck)),
                ),
            )
            .finally(() => setProgress(100));
    }, [mapPreCheck, preCheckService, setProgress]);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    useEffect(() => {
        fetchOrganizations();
    }, [fetchOrganizations]);

    useEffect(() => {
        fetchPreCheck();
    }, [fetchPreCheck]);

    useEffect(() => {
        if (hasTotals) {
            return fetchPreCheckTotals();
        }
    }, [fetchPreCheckTotals, hasTotals]);

    useEffect(() => {
        if (!appConfigs.pre_check_enabled) {
            pushDanger('Deze pagina is niet beschikbaar.');
            navigateState('home');
        }
    }, [appConfigs.pre_check_enabled, navigateState, pushDanger]);

    const PreCheckProgress = useCallback(
        ({ id }: { id?: string }) => (
            <div id={id} className={`pre-check-progress ${totals ? 'pre-check-progress-complete' : ''}`}>
                <div className="pre-check-progress-title">Uw gegevens</div>
                <div className="pre-check-progress-steps">
                    {preChecks?.map((preCheck, index) => (
                        <div
                            key={preCheck.id}
                            className={`pre-check-progress-step ${activeStepIndex == index ? 'active' : ''} ${
                                activeStepIndex > index || totals ? 'completed' : ''
                            }`}>
                            <div className="pre-check-progress-step-icon">{index + 1}</div>

                            <div className="pre-check-progress-questions">
                                <div className="pre-check-progress-question">
                                    <div className="pre-check-progress-question-title">{preCheck.title}</div>
                                    {index <= activeStepIndex &&
                                        preCheck.record_types?.map((preCheckRecord, index) => (
                                            <div key={index} className="pre-check-progress-question-answer">
                                                {preCheckRecord.title_short}:{' '}
                                                {(preCheckRecord.input_value || preCheckRecord.input_value == '0') && (
                                                    <strong>{preCheckRecord.input_value}</strong>
                                                )}
                                                {!preCheckRecord.input_value && preCheckRecord.input_value != '0' && (
                                                    <strong className="text-muted">---</strong>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className={`pre-check-progress-step ${totals ? 'active' : ''}`}>
                        <div className="pre-check-progress-step-icon" />
                        <div className="pre-check-progress-questions">
                            <div className="pre-check-progress-question">
                                <div className="pre-check-progress-question-title">Advies</div>
                                <div className="pre-check-progress-question-answer">Je bent er bijna!</div>
                            </div>
                        </div>
                    </div>
                </div>

                {totals && (
                    <div className="pre-check-actions">
                        <button
                            className="button button-download button-fill button-sm"
                            type="button"
                            onClick={downloadPDF}>
                            Download als PDF
                        </button>
                        <button
                            className="button button-light button-fill button-sm"
                            type="button"
                            onClick={changeAnswers}>
                            Wijzig antwoorden
                        </button>
                    </div>
                )}
            </div>
        ),
        [activeStepIndex, changeAnswers, downloadPDF, preChecks, totals],
    );

    return (
        <BlockShowcase
            loaderElement={
                <div className={'wrapper'}>
                    <BlockLoaderBreadcrumbs />
                    <BlockLoader />
                </div>
            }>
            {preChecks && appConfigs && (
                <div className="block block-fund-pre-check">
                    <div className="showcase-wrapper">
                        <div className="block block-breadcrumbs">
                            <StateNavLink className="breadcrumb-item" name="home">
                                Home
                            </StateNavLink>
                            <div className="breadcrumb-item active" aria-current="location">
                                De Potjes check
                            </div>
                        </div>

                        <div className="show-sm">
                            <div className="pre-check-info">
                                <div className="pre-check-info-title">{appConfigs.pre_check_title}</div>
                                <div className="pre-check-info-description">{appConfigs.pre_check_description}</div>
                            </div>

                            {!totals && (
                                <div className="block-progress-pie">
                                    <div className="progress-pie">
                                        <ProgressPie
                                            styleImage={{ width: '70px' }}
                                            title={activeStepIndex + 1 + ' van ' + preChecks.length}
                                            size={100}
                                            progress={(activeStepIndex + 1) / preChecks.length}
                                            color="#315EFD"
                                            backgroundColor="#D9D9D9"
                                            strokeWidth={0}
                                        />
                                        <div className="progress-pie-text">
                                            {activeStepIndex + 1} van {preChecks.length}
                                        </div>
                                    </div>
                                    <div className="progress-pie-info">
                                        <div className="progress-pie-info-title">
                                            {preChecks?.[activeStepIndex]?.title_short}
                                        </div>
                                        {preChecks[activeStepIndex].record_types?.map((record, index) => (
                                            <div key={index} className="progress-pie-info-details">
                                                <div className="progress-pie-info-details-key">
                                                    {record.title_short}: &nbsp;
                                                </div>
                                                <div className="progress-pie-info-details-value">
                                                    {record?.input_value || '---'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="progress-pie-show-details">
                                        <button
                                            type="button"
                                            className="button button-text button-xs"
                                            onClick={() => setShowMorePreCheckInfo(false)}
                                            onCompositionEnd={() => setShowMorePreCheckInfo(!showMorePreCheckInfo)}
                                            aria-expanded={showMorePreCheckInfo}
                                            aria-controls={'preCheckMoreInfo'}>
                                            {showMorePreCheckInfo ? (
                                                <Fragment>
                                                    Toon minder
                                                    <em className="mdi mdi-chevron-up icon-right"> </em>
                                                </Fragment>
                                            ) : (
                                                <Fragment>
                                                    Toon meer
                                                    <em className="mdi mdi-chevron-down icon-right" />
                                                </Fragment>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showMorePreCheckInfo && <PreCheckProgress id={'preCheckMoreInfo'} />}
                        </div>

                        <div className="showcase-layout">
                            <div className="showcase-aside hide-sm">
                                <div className="showcase-aside-block">
                                    <PreCheckProgress />
                                </div>

                                {totals && (
                                    <div className="showcase-aside-block">
                                        <div className="form form-compact">
                                            <div className="form-group">
                                                <UIControlSearch
                                                    value={filter.values.q}
                                                    onChangeValue={(q) => filter.update({ q })}
                                                    placeholder="Zoeken..."
                                                    ariaLabel="Zoeken"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label" htmlFor="select_organization">
                                                    Organisatie
                                                </label>
                                                <SelectControl
                                                    id="select_organization"
                                                    propKey="id"
                                                    value={filter.values.organization_id}
                                                    options={organizations}
                                                    onChange={(organization_id: number) =>
                                                        filter.update({ organization_id })
                                                    }
                                                    placeholder={organizations?.[0]?.name}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label" htmlFor="select_category">
                                                    Categorie
                                                </label>
                                                <SelectControl
                                                    id="select_category"
                                                    propKey="id"
                                                    value={filter.values.tag_id}
                                                    onChange={(tag_id: number) => filter.update({ tag_id })}
                                                    options={tags}
                                                    placeholder={tags?.[0]?.name}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="showcase-content">
                                <div className="pre-check-step">
                                    <div className="hide-sm">
                                        <div className="pre-check-info">
                                            <div className="pre-check-info-title">{appConfigs.pre_check_title}</div>
                                            <div className="pre-check-info-description">
                                                {appConfigs.pre_check_description}
                                            </div>
                                        </div>
                                    </div>

                                    {!totals && (
                                        <form
                                            className="pre-check-step-section form"
                                            onSubmit={(e) => {
                                                e?.preventDefault();
                                                next();
                                            }}>
                                            <div className="pre-check-step-section-details">
                                                <div className="pre-check-step-section-title">
                                                    {preChecks[activeStepIndex].title}
                                                </div>
                                                <div className="pre-check-step-section-description">
                                                    {preChecks[activeStepIndex].description}
                                                </div>
                                            </div>
                                            {preChecks[activeStepIndex].record_types?.map((preCheckRecord, index) => (
                                                <div
                                                    key={`${activeStepIndex}_${index}`}
                                                    className="pre-check-step-section-question">
                                                    <div className="pre-check-step-section-question-title">
                                                        {preCheckRecord.title}
                                                    </div>
                                                    <div className="pre-check-step-section-question-description">
                                                        {preCheckRecord.description}
                                                    </div>
                                                    <div className="form-group">
                                                        {preCheckRecord.control_type == 'select_control' && (
                                                            <SelectControl
                                                                id={`pre_check_record_${preCheckRecord.record_type_key}`}
                                                                propKey="value"
                                                                value={preCheckRecord.input_value}
                                                                onChange={(value: never) => {
                                                                    setPreChecks((preChecks) => {
                                                                        preChecks[activeStepIndex].record_types[
                                                                            index
                                                                        ].input_value = value;

                                                                        return [...preChecks];
                                                                    });
                                                                }}
                                                                options={
                                                                    recordTypesByKey[preCheckRecord.record_type_key]
                                                                        .options
                                                                }
                                                                placeholder={`Maak een keuze`}
                                                            />
                                                        )}

                                                        {preCheckRecord.control_type == 'ui_control_checkbox' && (
                                                            <UIControlCheckbox
                                                                id={`pre_check_record_${preCheckRecord.record_type_key}`}
                                                                checked={preCheckRecord.is_checked || false}
                                                                name={preCheckRecord.record_type_key}
                                                                label={preCheckRecord.label}
                                                                onChangeValue={(checked) => {
                                                                    setPreChecks((preChecks) => {
                                                                        preChecks[activeStepIndex].record_types[
                                                                            index
                                                                        ].is_checked = checked;

                                                                        preChecks[activeStepIndex].record_types[
                                                                            index
                                                                        ].input_value = checked
                                                                            ? preCheckRecord.value
                                                                            : null;

                                                                        return [...preChecks];
                                                                    });
                                                                }}
                                                            />
                                                        )}

                                                        {preCheckRecord.control_type == 'ui_control_step' && (
                                                            <UIControlStep
                                                                id={`pre_check_record_${preCheckRecord.id}`}
                                                                value={parseInt(preCheckRecord.input_value)}
                                                                name={preCheckRecord.record_type_key}
                                                                min={0}
                                                                max={32}
                                                                onChange={(value) => {
                                                                    setPreChecks((preChecks) => {
                                                                        preChecks[activeStepIndex].record_types[
                                                                            index
                                                                        ].input_value = value.toFixed(0);

                                                                        return [...preChecks];
                                                                    });
                                                                }}
                                                            />
                                                        )}

                                                        {preCheckRecord.control_type == 'ui_control_date' && (
                                                            <UIControlDate
                                                                id={`pre_check_record_${preCheckRecord.record_type_key}`}
                                                                value={
                                                                    preCheckRecord.input_value
                                                                        ? dateParse(
                                                                              preCheckRecord.input_value,
                                                                              'dd-MM-yyyy',
                                                                          )
                                                                        : null
                                                                }
                                                                format={'dd-MM-yyyy'}
                                                                onChange={(date) => {
                                                                    setPreChecks((preChecks) => {
                                                                        preChecks[activeStepIndex].record_types[
                                                                            index
                                                                        ].input_value = date
                                                                            ? dateFormat(date, 'dd-MM-yyyy')
                                                                            : '';

                                                                        return [...preChecks];
                                                                    });
                                                                }}
                                                            />
                                                        )}

                                                        {preCheckRecord.control_type == 'ui_control_number' && (
                                                            <UIControlNumber
                                                                value={
                                                                    preCheckRecord.input_value
                                                                        ? parseFloat(preCheckRecord.input_value)
                                                                        : null
                                                                }
                                                                onChangeValue={(value) => {
                                                                    setPreChecks((preChecks) => {
                                                                        preChecks[activeStepIndex].record_types[
                                                                            index
                                                                        ].input_value = (value || 0).toString();

                                                                        return [...preChecks];
                                                                    });
                                                                }}
                                                                name={preCheckRecord.record_type_key}
                                                                id={`pre_check_record_${preCheckRecord.record_type_key}`}
                                                                placeholder={preCheckRecord?.record_type?.name}
                                                            />
                                                        )}

                                                        {preCheckRecord.control_type == 'ui_control_text' && (
                                                            <UIControlText
                                                                value={preCheckRecord.input_value}
                                                                onChangeValue={(value) => {
                                                                    setPreChecks((preChecks) => {
                                                                        preChecks[activeStepIndex].record_types[
                                                                            index
                                                                        ].input_value = value;

                                                                        return [...preChecks];
                                                                    });
                                                                }}
                                                                name={preCheckRecord.record_type_key}
                                                                id={`pre_check_record_${preCheckRecord.record_type_key}`}
                                                                placeholder={`Uw ${preCheckRecord.record_type.name}`}
                                                            />
                                                        )}

                                                        {preCheckRecord.control_type == 'ui_control_currency' && (
                                                            <UIControlNumber
                                                                type={'currency'}
                                                                value={
                                                                    preCheckRecord.input_value
                                                                        ? parseFloat(preCheckRecord.input_value)
                                                                        : null
                                                                }
                                                                min={0}
                                                                name={preCheckRecord.record_type.key}
                                                                id={`criterion_${preCheckRecord.record_type_key}`}
                                                                placeholder={`Uw ${preCheckRecord.record_type.name}`}
                                                                onChangeValue={(value) => {
                                                                    setPreChecks((preChecks) => {
                                                                        preChecks[activeStepIndex].record_types[
                                                                            index
                                                                        ].input_value = (value || 0).toString();

                                                                        return [...preChecks];
                                                                    });
                                                                }}
                                                            />
                                                        )}

                                                        {emptyRecordTypeKeys?.includes(
                                                            preCheckRecord.record_type.key,
                                                        ) && (
                                                            <div className="form-error">
                                                                Het {preCheckRecord?.title} veld is verplicht.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="pre-check-step-section-actions">
                                                <div className="flex flex-grow">
                                                    <button
                                                        className="button button-light button-sm"
                                                        type="button"
                                                        onClick={prev}
                                                        disabled={activeStepIndex == 0}>
                                                        Vorige stap
                                                    </button>
                                                </div>
                                                <div className="flex flex-grow flex-end">
                                                    <button className="button button-primary button-sm" type="submit">
                                                        Volgende
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}

                                    {totals && (
                                        <div className="pre-check-step-section-results">
                                            <div className="showcase-content-header hide-sm">
                                                <h1 className="showcase-filters-title">
                                                    <span>Fondsen</span>
                                                    <div className="showcase-filters-title-count">
                                                        {totals.funds.length}
                                                    </div>
                                                </h1>
                                            </div>
                                            <div className="block block-fund-pre-check-result" id="fund_list">
                                                {totals.funds?.map((fund) => (
                                                    <FundsListItemPreCheck key={fund.id} fund={fund} />
                                                ))}

                                                {totals.funds.length == 0 && (
                                                    <EmptyBlock
                                                        title={translate('block_funds.labels.title')}
                                                        description={translate('block_funds.labels.subtitle')}
                                                        hideLink={true}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </BlockShowcase>
    );
}
