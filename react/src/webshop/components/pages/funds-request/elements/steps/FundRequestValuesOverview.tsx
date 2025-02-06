import React, { Fragment, useCallback } from 'react';
import FileUploader from '../../../../elements/file-uploader/FileUploader';
import { LocalCriterion } from '../../FundRequest';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import FundCriteriaStep from '../../../../../../dashboard/props/models/FundCriteriaStep';
import SignUpFooter from '../../../../elements/sign-up/SignUpFooter';
import FundRequestHelpBlock from '../FundRequestHelpBlock';
import Fund from '../../../../../props/models/Fund';

export default function FundRequestValuesOverview({
    fund,
    onSubmitRequest,
    contactInformation,
    emailSetupShow,
    criteriaSteps,
    onPrevStep,
    progress,
    bsnWarning,
}: {
    fund: Fund;
    onSubmitRequest: () => void;
    contactInformation: string;
    emailSetupShow: boolean;
    criteriaSteps: Array<
        FundCriteriaStep & { uid?: string; uploaderTemplate: 'inline' | 'default'; criteria: Array<LocalCriterion> }
    >;
    onPrevStep: () => void;
    progress: React.ReactElement;
    bsnWarning: React.ReactElement;
}) {
    const translate = useTranslate();

    const criterionValue = useCallback((criterion: LocalCriterion) => {
        if (criterion.record_type.type === 'select' || criterion.record_type.type === 'select_number') {
            return (
                criterion.record_type?.options?.find((item) => item?.value === criterion.input_value)?.name ||
                criterion.input_value
            );
        }

        return criterion.input_value;
    }, []);

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
                                <div className="preview-item-panel">
                                    <div className="preview-item-values">
                                        {step.criteria
                                            .filter((item) => item.requested)
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
                                                            .reduce((list, item) => [...list, ...item.files], []).length
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
                            </div>
                        ))}
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
                            tabIndex={0}>
                            {translate('fund_request.sign_up.pane.footer.applt')}
                            <em className="mdi mdi-chevron-right icon-right" />
                        </button>
                    }
                />

                {bsnWarning}
            </div>
        </Fragment>
    );
}
