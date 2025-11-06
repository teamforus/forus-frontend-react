import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
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
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import UIControlCheckbox from '../../../../dashboard/components/elements/forms/ui-controls/UIControlCheckbox';
import UIControlStep from '../../../../dashboard/components/elements/forms/ui-controls/UIControlStep';
import UIControlDate from '../../../../dashboard/components/elements/forms/ui-controls/UIControlDate';
import { dateFormat, dateParse } from '../../../../dashboard/helpers/dates';
import UIControlNumber from '../../../../dashboard/components/elements/forms/ui-controls/UIControlNumber';
import UIControlText from '../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import FundsListItemPreCheck from '../../elements/lists/funds-list/templates/FundsListItemPreCheck';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import classNames from 'classnames';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';
import useFilterNext from '../../../../dashboard/modules/filter_next/useFilterNext';

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
    const [showMoreRecordsInfo, setShowMoreRecordsInfo] = useState(false);

    const hasTotals = useMemo(() => !!totals, [totals]);

    const recordTypesByKey = useMemo(() => {
        return recordTypes?.reduce((acc, type) => ({ ...acc, [type.key]: type }), {});
    }, [recordTypes]);

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        q: string;
        tag_id?: number;
        organization_id?: number;
    }>({
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
            .calculateTotals({ ...filterValuesActive, records })
            .then((res) => setTotals(res.data))
            .catch((res) => pushDanger(translate('push.error'), res.data.message))
            .finally(() => setProgress(100));
    }, [setProgress, filterValuesActive, preCheckService, preChecks, pushDanger, translate]);

    const changeAnswers = useCallback(() => {
        setTotals(null);
        setActiveStepIndex(0);
    }, []);

    const downloadPDF = useCallback(() => {
        const records = mapRecords(preChecks);

        setProgress(0);

        preCheckService
            .downloadPDF({ ...filterValuesActive, records })
            .then((res) => {
                pushSuccess(translate('push.success'), translate('push.pre_check.downloaded'));

                fileService.downloadFile(
                    `pre-check_${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}.pdf`,
                    res.data,
                    res.headers['Content-Type'] + ';charset=utf-8;',
                );
            })
            .catch((err: ResponseError) => pushDanger(translate('push.error'), err.data.message))
            .finally(() => setProgress(100));
    }, [fileService, filterValuesActive, preCheckService, preChecks, pushDanger, pushSuccess, setProgress, translate]);

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
            .then((res) => setTags([{ id: null, name: translate('pre_check.all_categories') }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [setProgress, tagService, translate]);

    const fetchOrganizations = useCallback(() => {
        setProgress(0);

        organizationService
            .list({ type: 'sponsor' })
            .then((res) =>
                setOrganizations([{ id: null, name: translate('pre_check.all_organizations') }, ...res.data.data]),
            )
            .finally(() => setProgress(100));
    }, [organizationService, setProgress, translate]);

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
            pushDanger(translate('push.error'), translate('push.pre_check.not_available'));
            navigateState(WebshopRoutes.HOME);
        }
    }, [appConfigs.pre_check_enabled, navigateState, pushDanger, translate]);

    const PreCheckActions = useCallback(() => {
        return (
            <div className="pre-check-actions">
                <button className="button button-download button-fill button-sm" type="button" onClick={downloadPDF}>
                    {translate('pre_check.download_pdf')}
                </button>
                <button className="button button-light button-fill button-sm" type="button" onClick={changeAnswers}>
                    {translate('pre_check.change_answers')}
                </button>
            </div>
        );
    }, [changeAnswers, downloadPDF, translate]);

    const PreCheckProgress = useCallback(
        ({ id, title = true }: { id?: string; title?: boolean }) => (
            <div id={id} className={`pre-check-progress ${totals ? 'pre-check-progress-complete' : ''}`}>
                {totals && (
                    <a
                        className="pre-check-progress-header"
                        type="button"
                        onClick={(e) => {
                            e?.preventDefault();
                            setShowMoreRecordsInfo(!showMoreRecordsInfo);
                        }}
                        aria-expanded={showMoreRecordsInfo}
                        aria-controls={'preCheckMoreRecords'}>
                        {translate('pre_check.your_data')}
                        {showMoreRecordsInfo ? (
                            <em className="mdi mdi-chevron-up" />
                        ) : (
                            <em className="mdi mdi-chevron-right" />
                        )}
                    </a>
                )}

                <div
                    className={classNames(
                        'pre-check-progress-steps',
                        !showMoreRecordsInfo && 'pre-check-progress-steps-hide-mobile',
                    )}>
                    {title && <div className="pre-check-progress-title">{translate('pre_check.your_data')}</div>}

                    {preChecks?.map((preCheck, index) => (
                        <div
                            key={preCheck.id}
                            className={classNames(
                                'pre-check-progress-step',
                                activeStepIndex == index && 'active',
                                (activeStepIndex > index || totals) && 'completed',
                            )}>
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
                                                    <strong className="text-muted">
                                                        {translate('pre_check.no_value')}
                                                    </strong>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className={classNames('pre-check-progress-step', totals && 'active')}>
                        <div className="pre-check-progress-step-icon" />
                        <div className="pre-check-progress-questions">
                            <div className="pre-check-progress-question">
                                <div className="pre-check-progress-question-title">{translate('pre_check.advice')}</div>
                                <div className="pre-check-progress-question-answer">
                                    {translate('pre_check.almost_there')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {totals && (
                    <Fragment>
                        <div
                            className={classNames(
                                'pre-check-totals',
                                !showMoreRecordsInfo && 'pre-check-totals-hide-mobile',
                            )}>
                            <div className="block block-key-value-list">
                                <div className="block-key-value-list-item">
                                    <div className="key-value-list-item-label">
                                        {translate('pre_check.total_amount')}
                                    </div>
                                    <div className="key-value-list-item-value">{totals.products_amount_total}</div>
                                </div>
                                <div className="block-key-value-list-item">
                                    <div className="key-value-list-item-label">
                                        {translate('pre_check.total_offers')}
                                    </div>
                                    <div className="key-value-list-item-value">{totals.products_count_total}</div>
                                </div>
                            </div>
                        </div>

                        <PreCheckActions />
                    </Fragment>
                )}
            </div>
        ),
        [PreCheckActions, activeStepIndex, preChecks, showMoreRecordsInfo, totals, translate],
    );

    return (
        <BlockShowcase
            breadcrumbItems={[
                { name: translate('pre_check.breadcrumb.home'), state: WebshopRoutes.HOME },
                { name: translate('pre_check.breadcrumb.check') },
            ]}>
            {preChecks && appConfigs && recordTypesByKey && (
                <div className="block block-fund-pre-check">
                    <div className="showcase-wrapper">
                        <div className="show-sm">
                            <div className="pre-check-info">
                                <div className="pre-check-info-title">{appConfigs.pre_check_title}</div>
                                <div className="pre-check-info-description">{appConfigs.pre_check_description}</div>
                            </div>

                            {!totals && (
                                <div className="pre-check-mobile-progress">
                                    <div className="pre-check-mobile-progress-title">
                                        {translate('pre_check.progress', {
                                            step: activeStepIndex + 1,
                                            total: preChecks.length,
                                        })}
                                    </div>
                                    <a
                                        type="button"
                                        className="pre-check-mobile-progress-collapse"
                                        onClick={(e) => {
                                            e?.preventDefault();
                                            setShowMorePreCheckInfo(!showMorePreCheckInfo);
                                        }}
                                        aria-expanded={showMorePreCheckInfo}
                                        aria-controls={'preCheckMoreInfo'}>
                                        Alle stappen bekijken
                                        {showMorePreCheckInfo ? (
                                            <em className="mdi mdi-chevron-up" />
                                        ) : (
                                            <em className="mdi mdi-chevron-down" />
                                        )}
                                    </a>
                                </div>
                            )}

                            {(showMorePreCheckInfo || totals) && (
                                <PreCheckProgress id={'preCheckMoreInfo'} title={false} />
                            )}
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
                                                <label className="form-label" htmlFor="search">
                                                    {translate('funds.labels.search')}
                                                </label>
                                                <UIControlText
                                                    value={filterValues.q}
                                                    onChangeValue={(q) => filterUpdate({ q })}
                                                    ariaLabel={translate('pre_check.search')}
                                                    dataDusk="listFundsPreCheckSearch"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label" htmlFor="select_organization">
                                                    {translate('funds.labels.organization')}
                                                </label>
                                                <SelectControl
                                                    id="select_organization"
                                                    propKey="id"
                                                    value={filterValues.organization_id}
                                                    options={organizations}
                                                    onChange={(organization_id: number) =>
                                                        filterUpdate({ organization_id })
                                                    }
                                                    multiline={true}
                                                    dusk="selectControlOrganizations"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label" htmlFor="select_category">
                                                    {translate('funds.labels.category')}
                                                </label>
                                                <SelectControl
                                                    id="select_category"
                                                    propKey="id"
                                                    value={filterValues.tag_id}
                                                    onChange={(tag_id: number) => filterUpdate({ tag_id })}
                                                    options={tags}
                                                    multiline={true}
                                                    dusk="selectControlTags"
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
                                                    {preChecks[activeStepIndex]?.title}
                                                </div>
                                                <div className="pre-check-step-section-description">
                                                    {preChecks[activeStepIndex]?.description}
                                                </div>
                                            </div>
                                            {preChecks[activeStepIndex]?.record_types?.map((preCheckRecord, index) => (
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
                                                                multiline={true}
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
                                                                dataDusk={`controlNumber${preCheckRecord.record_type_key}`}
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
                                                                dataDusk={`controlText${preCheckRecord.record_type_key}`}
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
                                                                dataDusk={`controlCurrency${preCheckRecord.record_type_key}`}
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
                                                                {translate('pre_check.record_required')}
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
                                                        {translate('pre_check.previous_step')}
                                                    </button>
                                                </div>
                                                <div className="flex flex-grow flex-end">
                                                    <button
                                                        className="button button-primary button-sm"
                                                        data-dusk="submitBtn"
                                                        type="submit">
                                                        {translate('pre_check.next_step')}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}

                                    {totals && (
                                        <div className="pre-check-step-section-results">
                                            <div className="showcase-content-header hide-sm">
                                                <h1 className="showcase-filters-title">
                                                    <span>{translate('pre_check.funds')}</span>
                                                    <div className="showcase-filters-title-count">
                                                        {totals.funds.length}
                                                    </div>
                                                </h1>
                                            </div>
                                            <div
                                                className="block block-fund-pre-check-result"
                                                id="fund_list"
                                                data-dusk="listFundsPreCheckContent">
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
