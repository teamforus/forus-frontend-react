import React, { Fragment, useCallback, useMemo } from 'react';
import Fund from '../../../../../props/models/Fund';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import { LocalCriterion } from '../../FundRequest';
import Markdown from '../../../../elements/markdown/Markdown';
import SelectControl from '../../../../../../dashboard/components/elements/select-control/SelectControl';
import UIControlCheckbox from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlCheckbox';
import UIControlStep from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlStep';
import UIControlDate from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlDate';
import { dateFormat, dateParse } from '../../../../../../dashboard/helpers/dates';
import UIControlNumber from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlNumber';
import UIControlText from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import FormError from '../../../../../../dashboard/components/elements/forms/errors/FormError';
import FileUploader from '../../../../elements/file-uploader/FileUploader';
import RecordType from '../../../../../../dashboard/props/models/RecordType';
import { ResponseError } from '../../../../../../dashboard/props/ApiResponses';
import { useFundRequestService } from '../../../../../services/FundRequestService';
import { uniq } from 'lodash';
import useSetProgress from '../../../../../../dashboard/hooks/useSetProgress';
import SignUpFooter from '../../../../elements/sign-up/SignUpFooter';

export default function FundRequestStepCriteria({
    fund,
    step,
    steps,
    title,
    onPrevStep,
    onNextStep,
    progress,
    bsnWarning,
    criteria,
    recordTypes,
    submitInProgress,
    setSubmitInProgress,
    uploaderTemplate,
    formDataBuild,
    setCriterion,
}: {
    fund: Fund;
    step: number;
    steps: Array<string>;
    title: string;
    onPrevStep: () => void;
    onNextStep: () => void;
    progress: React.ReactElement;
    bsnWarning: React.ReactElement;
    criteria: Array<LocalCriterion>;
    recordTypes: Array<RecordType>;
    submitInProgress: boolean;
    uploaderTemplate: 'default' | 'inline';
    setSubmitInProgress: React.Dispatch<React.SetStateAction<boolean>>;
    formDataBuild: (criteria: Array<LocalCriterion>) => object;
    setCriterion: (index: number, update: Partial<LocalCriterion>) => void;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const fundRequestService = useFundRequestService();

    const recordTypesByKey = useMemo(() => {
        return recordTypes?.reduce((acc, type) => ({ ...acc, [type.key]: type }), {});
    }, [recordTypes]);

    // Submit or Validate record criteria
    const validateCriteria = useCallback(
        async (criteria: Array<LocalCriterion>): Promise<false | { [key: string]: string | string[] }> => {
            if (submitInProgress) {
                return;
            }

            setSubmitInProgress(true);

            return fundRequestService
                .storeValidate(fund.id, formDataBuild(criteria))
                .then((): false => false)
                .catch((err: ResponseError) => err.data.errors)
                .finally(() => setSubmitInProgress(false));
        },
        [formDataBuild, fund.id, fundRequestService, setSubmitInProgress, submitInProgress],
    );

    // Submit criteria record
    const validateStepCriteria = useCallback(
        (criteria: Array<LocalCriterion>) => {
            setProgress(0);

            validateCriteria(criteria)
                .then((errors) => {
                    if (!errors) {
                        criteria.forEach((item) => setCriterion(item.id, { errors: {} }));
                        return onNextStep();
                    }

                    const indexes = uniq(Object.keys(errors).map((errorKey) => parseInt(errorKey.split('.')[1])));

                    const errorsList: Array<{ id: number; errors: { [key: string]: string | string[] } }> =
                        indexes.reduce((list, index) => {
                            const errorsPrefix = `records.${index}.`;

                            const errorsList = Object.keys(errors).reduce((errorsList, errorKey) => {
                                if (!errorKey.startsWith(errorsPrefix)) {
                                    return { ...errorsList };
                                }

                                return {
                                    ...errorsList,
                                    [errorKey.substring(errorsPrefix.length)]: errors[errorKey],
                                };
                            }, {});

                            return [...list, { id: criteria[index].id, errors: errorsList }];
                        }, []);

                    criteria.forEach((item) => {
                        setCriterion(item.id, {
                            errors: errorsList.find((errItem) => errItem.id == item.id)?.errors || {},
                        });
                    });
                })
                .catch((err: ResponseError) => {
                    console.error(err);
                })
                .finally(() => setProgress(100));
        },
        [onNextStep, setProgress, setCriterion, validateCriteria],
    );

    return (
        <Fragment>
            {progress}

            <form
                className="sign_up-pane"
                onSubmit={(e) => {
                    e.preventDefault();
                    validateStepCriteria(criteria);
                }}>
                <h2 className="sign_up-pane-header">{title}</h2>

                {criteria.map((criterion, index) => (
                    <div className="sign_up-pane-body sign_up-pane-content" key={index}>
                        {uploaderTemplate === 'inline' ? (
                            <Fragment>
                                {(criterion.title ||
                                    criterion.title_default ||
                                    (criterion.description && criterion.description !== '_')) && (
                                    <div className="sign_up-pane-text">
                                        <div className="sign_up-pane-text">
                                            <div className="sign_up-pane-heading">
                                                {criterion.title || criterion.title_default}
                                            </div>

                                            {criterion.description && criterion.description !== '_' && (
                                                <Markdown content={criterion.description_html} />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Fragment>
                        ) : (
                            <Fragment>
                                <div className="sign_up-pane-text">
                                    <div className="sign_up-pane-text">
                                        {criterion.description && criterion.description !== '_' && (
                                            <Markdown ng-if="" content={criterion.description_html} fontSize={16} />
                                        )}
                                    </div>

                                    {!criterion.description && criterion.description !== '_' && (
                                        <div className="sign_up-pane-text">{criterion.title_default}</div>
                                    )}
                                </div>

                                <label
                                    className="form-label"
                                    htmlFor={`criterion_${criterion.id}`}
                                    style={{ margin: '0 0 -5px' }}>
                                    {recordTypesByKey?.[criterion?.record_type?.key]?.name}
                                </label>
                            </Fragment>
                        )}

                        {criterion.control_type == 'select_control' && (
                            <SelectControl
                                id={`criterion_${criterion.id}`}
                                propKey="value"
                                value={criterion.input_value}
                                options={recordTypesByKey?.[criterion?.record_type?.key]?.options}
                                onChange={(input_value?: string) => {
                                    setCriterion(criterion.id, { input_value: input_value });
                                }}
                                placeholder={`Maak een keuze`}
                            />
                        )}

                        {criterion.control_type == 'ui_control_checkbox' && (
                            <UIControlCheckbox
                                checked={!!criterion.is_checked}
                                name={criterion.record_type.key}
                                id={`criterion_${criterion.id}`}
                                label={criterion.label}
                                slim={true}
                                onChangeValue={(checked) => {
                                    setCriterion(criterion.id, {
                                        is_checked: checked,
                                        input_value: checked ? criterion.value : null,
                                    });
                                }}
                            />
                        )}

                        {criterion.control_type == 'ui_control_step' && (
                            <UIControlStep
                                id={`criterion_${criterion.id}`}
                                value={parseInt(criterion.input_value)}
                                onChange={(value) => {
                                    setCriterion(criterion.id, { input_value: value.toFixed() });
                                }}
                                name={criterion.record_type.key}
                                min={0}
                                max={32}
                            />
                        )}

                        {criterion.control_type == 'ui_control_date' && (
                            <UIControlDate
                                value={
                                    criterion?.input_value
                                        ? dateParse(criterion?.input_value, 'dd-MM-yyyy')
                                        : new Date()
                                }
                                format={'dd-MM-yyyy'}
                                onChange={(date) => {
                                    setCriterion(criterion.id, {
                                        input_value: date ? dateFormat(date, 'dd-MM-yyyy') : '',
                                    });
                                }}
                                id={`criterion_${criterion.id}`}
                            />
                        )}

                        {criterion.control_type == 'ui_control_number' && (
                            <UIControlNumber
                                type={'number'}
                                value={criterion.input_value ? parseFloat(criterion.input_value) : null}
                                name={criterion.record_type.key}
                                id={`criterion_${criterion.id}`}
                                onChangeValue={(value) => {
                                    setCriterion(criterion.id, { input_value: (value || '').toString() });
                                }}
                            />
                        )}

                        {criterion.control_type == 'ui_control_text' && (
                            <UIControlText
                                type={'text'}
                                value={criterion.input_value}
                                name={criterion.record_type.key}
                                id={`criterion_${criterion.id}`}
                                onChange={(e) => {
                                    setCriterion(criterion.id, { input_value: e.target.value });
                                }}
                            />
                        )}

                        {criterion.control_type == 'ui_control_currency' && (
                            <UIControlNumber
                                type={'currency'}
                                value={criterion.input_value ? parseFloat(criterion.input_value) : null}
                                min={0}
                                name={criterion.record_type.key}
                                id={`criterion_${criterion.id}`}
                                onChangeValue={(value) => {
                                    setCriterion(criterion.id, { input_value: (value || '').toString() });
                                }}
                            />
                        )}

                        <FormError error={criterion.errors?.value} />

                        {criterion.show_attachment && (
                            <FileUploader
                                type="fund_request_record_proof"
                                files={criterion.files}
                                cropMedia={false}
                                multiple={true}
                                template={uploaderTemplate}
                                onFilesChange={({ files }) => {
                                    setCriterion(criterion.id, {
                                        files,
                                        files_uid: files.map((file) => file.uid),
                                    });
                                }}
                            />
                        )}

                        <FormError error={criterion.errors?.files} />
                        <FormError error={criterion.errors?.record} />
                    </div>
                ))}

                <SignUpFooter
                    startActions={
                        <button
                            type={'button'}
                            role="button"
                            className="button button-text button-text-padless"
                            onClick={onPrevStep}
                            tabIndex={0}>
                            <em className="mdi mdi-chevron-left icon-left" />
                            {translate('fund_request.sign_up.pane.footer.prev')}
                        </button>
                    }
                    endActions={
                        steps[step + 1] !== 'done' ? (
                            <button className="button button-text button-text-padless" type="submit" role="button">
                                {translate('fund_request.sign_up.pane.footer.next')}
                                <em className="mdi mdi-chevron-right icon-right" />
                            </button>
                        ) : (
                            <button className="button button-primary" type="submit" role="button">
                                Verzenden
                            </button>
                        )
                    }
                />

                {bsnWarning}
            </form>
        </Fragment>
    );
}
