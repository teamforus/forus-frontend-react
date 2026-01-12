import React, { Fragment, useCallback, useMemo } from 'react';
import FileUploader from '../../../../elements/file-uploader/FileUploader';
import { FundCriteriaStepLocal, LocalCriterion, Prefills } from '../../FundRequest';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import SignUpFooter from '../../../../elements/sign-up/SignUpFooter';
import FundRequestHelpBlock from '../FundRequestHelpBlock';
import Fund from '../../../../../props/models/Fund';
import FileModel from '../../../../../../dashboard/props/models/File';
import Markdown from '../../../../elements/markdown/Markdown';
import FundRequestCriteriaPartner from './criteria/FundRequestCriteriaPartner';
import FundRequestCriteriaChildren from './criteria/FundRequestCriteriaChildren';
import RecordType from '../../../../../../dashboard/props/models/RecordType';

export default function FundRequestValuesOverview({
    fund,
    address,
    onSubmitRequest,
    contactInformation,
    emailSetupShow,
    criteriaSteps,
    onPrevStep,
    progress,
    bsnWarning,
    prefills,
    recordTypesByKey,
}: {
    fund: Fund;
    address: {
        street?: string;
        house_nr?: string;
        house_nr_addition?: string;
        postal_code?: string;
        city?: string;
    };
    onSubmitRequest: () => void;
    contactInformation: string;
    emailSetupShow: boolean;
    criteriaSteps: Array<FundCriteriaStepLocal>;
    onPrevStep: () => void;
    progress: React.ReactElement;
    bsnWarning: React.ReactElement;
    prefills: Prefills;
    recordTypesByKey: { [_key: string]: RecordType };
}) {
    const translate = useTranslate();

    const groupFiles = useMemo<{ [key: number]: Array<FileModel> }>(() => {
        return criteriaSteps
            ?.reduce((acc, step) => [...acc, ...step.groups], [])
            .reduce(
                (acc, group) => ({
                    ...acc,
                    [group.id]: group.criteria
                        .filter((item) => item.requested)
                        .reduce((list, item) => [...list, ...item.files], []),
                }),
                {},
            );
    }, [criteriaSteps]);

    const criterionValue = useCallback(
        (criterion: LocalCriterion, inGroup: boolean = false) => {
            if (criterion.record_type.type === 'select' || criterion.record_type.type === 'select_number') {
                return (
                    criterion.record_type?.options?.find((item) => item?.value === criterion.input_value)?.name ||
                    criterion.input_value
                );
            }

            if (inGroup && criterion.record_type.type === 'bool' && criterion.record_type.control_type === 'checkbox') {
                return criterion.input_value || translate('fund_request.options.no');
            }

            return criterion.input_value;
        },
        [translate],
    );

    return (
        <Fragment>
            {progress}

            <div className="sign_up-pane">
                <h2 className="sign_up-pane-header">
                    {translate('fund_request.sign_up.fund_request_overview.application_summary')}
                </h2>
                <div className="sign_up-pane-body">
                    <p className="sign_up-pane-text">
                        <span>{translate('fund_request.sign_up.fund_request_overview.check_information')}</span>
                        <strong>{translate('fund_request.sign_up.fund_request_overview.previous_step')}</strong>
                    </p>
                    <p className="sign_up-pane-text">
                        <span>{translate('fund_request.sign_up.fund_request_overview.correct_information')}</span>
                        <strong>{translate('fund_request.sign_up.fund_request_overview.submit_application')}</strong>
                    </p>

                    <FundRequestHelpBlock fund={fund} />
                </div>
                <div className="sign_up-pane-body sign_up-pane-body-padless">
                    <div className="sign_up-request-preview">
                        {criteriaSteps?.map((step, index) => (
                            <div className="preview-item" key={index}>
                                <div className="preview-item-info">
                                    <div className="preview-item-icon">{index + 1}</div>
                                    <div className="preview-item-title">{step.title}</div>
                                </div>

                                {step.groups.map((group) => (
                                    <Fragment key={group.id}>
                                        {group.criteria.filter((item) => item.requested).length > 0 && (
                                            <Fragment>
                                                <div className="preview-item-info preview-item-info-vertical">
                                                    <div className="preview-item-subtitle">{group.title}</div>
                                                    {group.description_html && (
                                                        <Markdown
                                                            content={group.description_html}
                                                            className="preview-item-description"
                                                        />
                                                    )}
                                                </div>

                                                <div className="preview-item-panel">
                                                    <div className="preview-item-values">
                                                        {group.criteria
                                                            .filter((item) => item.requested)
                                                            .map((criterion) => (
                                                                <div
                                                                    className="preview-item-values-item"
                                                                    key={criterion.id}>
                                                                    <div className="preview-item-values-item-label">
                                                                        {criterion.title || criterion.title_default}
                                                                    </div>
                                                                    <div className="preview-item-values-item-value">
                                                                        {criterionValue(criterion, true)}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>

                                                    {groupFiles?.[group.id].length > 0 && (
                                                        <div className="preview-item-files">
                                                            <div className="preview-item-files-title">
                                                                Attachments
                                                                <div className="preview-item-files-title-count">
                                                                    {groupFiles[group.id].length}
                                                                </div>
                                                            </div>
                                                            <FileUploader
                                                                type="fund_request_record_proof"
                                                                files={groupFiles[group.id]}
                                                                readOnly={true}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </Fragment>
                                        )}
                                    </Fragment>
                                ))}

                                {step.criteria
                                    .filter((criterion) => criterion.fill_type === 'prefill')
                                    .filter((criterion) => criterion.record_type_key === 'partner_same_address_nth')
                                    .length > 0 &&
                                    prefills.partner.length > 0 && (
                                        <FundRequestCriteriaPartner
                                            recordTypesByKey={recordTypesByKey}
                                            prefills={prefills}
                                        />
                                    )}

                                {step.criteria
                                    .filter((criterion) => criterion.fill_type === 'prefill')
                                    .filter((criterion) => criterion.record_type_key === 'children_same_address_nth')
                                    .length > 0 &&
                                    prefills.children.length > 0 && (
                                        <FundRequestCriteriaChildren
                                            recordTypesByKey={recordTypesByKey}
                                            prefills={prefills}
                                        />
                                    )}

                                {step.criteria
                                    .filter((item) => item.requested)
                                    .filter(
                                        (criterion) =>
                                            !(
                                                criterion.fill_type === 'prefill' &&
                                                ['children_same_address_nth', 'partner_same_address_nth'].includes(
                                                    criterion.record_type_key,
                                                )
                                            ),
                                    ).length > 0 && (
                                    <div className="preview-item-panel">
                                        <div className="preview-item-values">
                                            {step.criteria
                                                .filter((item) => item.requested)
                                                .filter(
                                                    (criterion) =>
                                                        !(
                                                            criterion.fill_type === 'prefill' &&
                                                            [
                                                                'children_same_address_nth',
                                                                'partner_same_address_nth',
                                                            ].includes(criterion.record_type_key)
                                                        ),
                                                )
                                                .map((criterion) => (
                                                    <div className="preview-item-values-item" key={criterion.id}>
                                                        <div className="preview-item-values-item-label">
                                                            {criterion.title || criterion.title_default}
                                                        </div>
                                                        <div className="preview-item-values-item-value">
                                                            {criterionValue(criterion)}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>

                                        {step.criteria
                                            .filter((item) => item.requested)
                                            .reduce((list, item) => [...list, ...item.files], []).length > 0 && (
                                            <div className="preview-item-files">
                                                <div className="preview-item-files-title">
                                                    Attachments
                                                    <div className="preview-item-files-title-count">
                                                        {
                                                            step.criteria
                                                                .filter((item) => item.requested)
                                                                .reduce((list, item) => [...list, ...item.files], [])
                                                                .length
                                                        }
                                                    </div>
                                                </div>
                                                <FileUploader
                                                    type="fund_request_record_proof"
                                                    files={step.criteria
                                                        .filter((item) => item.requested)
                                                        .reduce((list, item) => [...list, ...item.files], [])}
                                                    readOnly={true}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {address && Object.keys(address).length > 0 && (
                            <div className="preview-item">
                                <div className="preview-item-info">
                                    <div className="preview-item-title">Adresgegevens</div>
                                </div>
                                <div className="preview-item-panel">
                                    <div className="preview-item-values">
                                        {Object.keys(address).map((key) => (
                                            <div className="preview-item-values-item" key={key}>
                                                <div className="preview-item-values-item-label">
                                                    {translate(
                                                        `fund_request.sign_up.fund_request_physical_card_request.labels.${key}`,
                                                    )}
                                                </div>
                                                <div className="preview-item-values-item-value">
                                                    {address[key] || '-'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {(contactInformation || emailSetupShow) && (
                    <div className="sign_up-pane-body">
                        <p className=" sign_up-pane-text" />
                        <div className=" text-strong">
                            {translate('fund_request.sign_up.fund_request_overview.contact_info')}
                        </div>
                        <span>
                            {contactInformation || translate('fund_request.sign_up.fund_request_overview.none')}
                        </span>
                        <p />
                    </div>
                )}

                <SignUpFooter
                    startActions={
                        <button
                            className="button button-text button-text-padless"
                            onClick={onPrevStep}
                            role="button"
                            tabIndex={0}>
                            <em className="mdi mdi-chevron-left icon-left" />
                            {translate('fund_request.sign_up.pane.footer.prev')}
                        </button>
                    }
                    endActions={
                        <button
                            className="button button-primary button-sm"
                            onClick={onSubmitRequest}
                            role="button"
                            data-dusk="submitButton"
                            tabIndex={0}>
                            {translate('fund_request.sign_up.pane.footer.apply')}
                            <em className="mdi mdi-chevron-right icon-right" />
                        </button>
                    }
                />

                {bsnWarning}
            </div>
        </Fragment>
    );
}
