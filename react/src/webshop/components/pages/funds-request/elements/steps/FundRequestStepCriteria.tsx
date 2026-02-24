import React, { Fragment, useCallback, useMemo, useState } from 'react';
import Fund from '../../../../../props/models/Fund';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import { LocalCriterion, Prefills } from '../../FundRequest';
import RecordType from '../../../../../../dashboard/props/models/RecordType';
import { ResponseError } from '../../../../../../dashboard/props/ApiResponses';
import { useFundRequestService } from '../../../../../services/FundRequestService';
import { uniq } from 'lodash';
import useSetProgress from '../../../../../../dashboard/hooks/useSetProgress';
import SignUpFooter from '../../../../elements/sign-up/SignUpFooter';
import FundRequestStepCriterion from './FundRequestStepCriterion';
import FundCriteriaGroup from '../../../../../../dashboard/props/models/FundCriteriaGroup';
import FormError from '../../../../../../dashboard/components/elements/forms/errors/FormError';
import Markdown from '../../../../elements/markdown/Markdown';
import FundRequestCriteriaPartner from './criteria/FundRequestCriteriaPartner';
import FundRequestCriteriaChildren from './criteria/FundRequestCriteriaChildren';

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
    recordTypesByKey,
    submitInProgress,
    setSubmitInProgress,
    uploaderTemplate,
    formDataBuild,
    setCriterion,
    groups,
    prefills,
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
    recordTypesByKey: { [_key: string]: RecordType };
    submitInProgress: boolean;
    uploaderTemplate: 'default' | 'inline';
    setSubmitInProgress: React.Dispatch<React.SetStateAction<boolean>>;
    formDataBuild: (criteria: Array<LocalCriterion>) => object;
    setCriterion: (index: number, update: Partial<LocalCriterion>) => void;
    groups: Array<FundCriteriaGroup & { criteria: Array<LocalCriterion> }>;
    prefills: Prefills;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const fundRequestService = useFundRequestService();

    const [errors, setErrors] = useState({});

    const hasPrefills = useMemo(() => {
        return (
            criteria.filter((criterion) => criterion.fill_type === 'prefill').length > 0 ||
            groups
                .map((group) => group.criteria.filter((criterion) => criterion.fill_type === 'prefill').length > 0)
                .filter((group) => group).length > 0
        );
    }, [criteria, groups]);

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
        (criteria: Array<LocalCriterion>, groups: Array<FundCriteriaGroup & { criteria: Array<LocalCriterion> }>) => {
            const items: Array<LocalCriterion> = [
                ...criteria,
                ...groups.reduce((list, group) => [...list, ...group.criteria], []),
            ];
            setProgress(0);

            validateCriteria(items)
                .then((errors) => {
                    const indexes = uniq(
                        Object.keys(errors || {})
                            .filter((err) => err.startsWith('records.'))
                            .map((errorKey) => parseInt(errorKey.split('.')[1])),
                    );

                    const groupIndexes = uniq(
                        Object.keys(errors || {})
                            .filter((err) => err.startsWith('criteria_groups.'))
                            .map((errorKey) => parseInt(errorKey.split('.')[1])),
                    );

                    if (indexes.length === 0 && groupIndexes.length === 0) {
                        items.forEach((item) => setCriterion(item.id, { errors: {} }));
                        setErrors({});
                        return onNextStep();
                    }

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

                            return [...list, { id: items[index].id, errors: errorsList }];
                        }, []);

                    items.forEach((item) => {
                        setCriterion(item.id, {
                            errors: errorsList.find((errItem) => errItem.id == item.id)?.errors || {},
                        });
                    });

                    setErrors(errors);
                })
                .catch((err: ResponseError) => {
                    console.error(err);
                    setErrors({});
                })
                .finally(() => setProgress(100));
        },
        [onNextStep, setProgress, setCriterion, validateCriteria, setErrors],
    );

    return (
        <Fragment>
            {progress}

            <form
                className="sign_up-pane"
                onSubmit={(e) => {
                    e.preventDefault();
                    validateStepCriteria(criteria, groups);
                }}>
                <h2 className="sign_up-pane-header">{title}</h2>

                <div className="sign_up-pane-body sign_up-pane-content">
                    {hasPrefills && (
                        <Fragment>
                            <div className="sign_up-pane-heading sign_up-pane-heading-lg">
                                {translate('fund_request.prefills.title')}
                            </div>

                            {fund.help_enabled && (
                                <div className="sign_up-pane-text">{translate('fund_request.prefills.subtitle')}</div>
                            )}
                        </Fragment>
                    )}

                    {groups.map((group, index) => (
                        <Fragment key={index}>
                            <div className="preview-item-info preview-item-info-vertical">
                                <div className="preview-item-subtitle">{group.title}</div>
                                {group.description_html && (
                                    <Markdown content={group.description_html} className="preview-item-description" />
                                )}

                                {group.required && (
                                    <div className="form">
                                        <div className="form-label">
                                            <div className={'form-label-info form-label-info-required'}>
                                                {translate('form.required')}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <FormError error={errors['criteria_groups.' + group.id]} />

                            {group.criteria.filter((criterion) => criterion.fill_type === 'prefill').length > 0 && (
                                <div className="preview-item-panel">
                                    <div className="preview-item-values">
                                        {group.criteria
                                            .filter((criterion) => criterion.fill_type === 'prefill')
                                            .map((criterion) => (
                                                <div className="preview-item-values-item" key={criterion.id}>
                                                    <div className="preview-item-values-item-label">
                                                        {criterion.title || criterion.title_default}
                                                    </div>
                                                    <div className="preview-item-values-item-value">
                                                        {criterion.input_value || '-'}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {group.criteria
                                .filter((criterion) => criterion.fill_type === 'manual')
                                .map((criterion, index) => (
                                    <FundRequestStepCriterion
                                        key={index}
                                        fund={fund}
                                        criterion={criterion}
                                        setCriterion={setCriterion}
                                        recordTypesByKey={recordTypesByKey}
                                        uploaderTemplate={uploaderTemplate}
                                        isGroup={true}
                                    />
                                ))}
                        </Fragment>
                    ))}

                    {criteria.length > 0 && (
                        <Fragment>
                            {criteria.filter((criterion) => criterion.fill_type === 'prefill').length > 0 && (
                                <Fragment>
                                    {criteria
                                        .filter((criterion) => criterion.fill_type === 'prefill')
                                        .filter((criterion) => criterion.record_type_key === 'partner_same_address_nth')
                                        .length > 0 &&
                                        prefills.partner.length > 0 && (
                                            <FundRequestCriteriaPartner
                                                recordTypesByKey={recordTypesByKey}
                                                prefills={prefills}
                                            />
                                        )}

                                    {criteria
                                        .filter((criterion) => criterion.fill_type === 'prefill')
                                        .filter(
                                            (criterion) => criterion.record_type_key === 'children_same_address_nth',
                                        ).length > 0 &&
                                        prefills.children.length > 0 && (
                                            <FundRequestCriteriaChildren
                                                recordTypesByKey={recordTypesByKey}
                                                prefills={prefills}
                                            />
                                        )}

                                    {criteria
                                        .filter((criterion) => criterion.fill_type === 'prefill')
                                        .filter(
                                            (criterion) =>
                                                !['children_same_address_nth', 'partner_same_address_nth'].includes(
                                                    criterion.record_type_key,
                                                ),
                                        ).length > 0 && (
                                        <div className="preview-item-panel">
                                            <div className="preview-item-values">
                                                {criteria
                                                    .filter((criterion) => criterion.fill_type === 'prefill')
                                                    .filter(
                                                        (criterion) =>
                                                            ![
                                                                'children_same_address_nth',
                                                                'partner_same_address_nth',
                                                            ].includes(criterion.record_type_key),
                                                    )
                                                    .map((criterion) => (
                                                        <div className="preview-item-values-item" key={criterion.id}>
                                                            <div className="preview-item-values-item-label">
                                                                {criterion.title || criterion.title_default}
                                                            </div>
                                                            <div className="preview-item-values-item-value">
                                                                {criterion.input_value || '-'}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </Fragment>
                            )}

                            {criteria
                                .filter((criterion) => criterion.fill_type === 'manual')
                                .map((criterion, index) => (
                                    <FundRequestStepCriterion
                                        key={index}
                                        fund={fund}
                                        criterion={criterion}
                                        setCriterion={setCriterion}
                                        recordTypesByKey={recordTypesByKey}
                                        uploaderTemplate={uploaderTemplate}
                                    />
                                ))}
                        </Fragment>
                    )}
                </div>

                <SignUpFooter
                    startActions={
                        <button
                            type={'button'}
                            role="button"
                            className="button button-text button-text-padless"
                            onClick={onPrevStep}
                            data-dusk="prevStepButton"
                            tabIndex={0}>
                            <em className="mdi mdi-chevron-left icon-left" />
                            {translate('fund_request.sign_up.pane.footer.prev')}
                        </button>
                    }
                    endActions={
                        steps[step + 1] !== 'done' ? (
                            <button
                                className="button button-text button-text-padless"
                                type="submit"
                                role="button"
                                data-dusk="nextStepButton"
                                tabIndex={0}>
                                {translate('fund_request.sign_up.pane.footer.next')}
                                <em className="mdi mdi-chevron-right icon-right" />
                            </button>
                        ) : (
                            <button
                                className="button button-primary"
                                type="submit"
                                role="button"
                                data-dusk="submitButton"
                                tabIndex={0}>
                                {translate('fund_request.buttons.send')}
                            </button>
                        )
                    }
                />
                {bsnWarning}
            </form>
        </Fragment>
    );
}
