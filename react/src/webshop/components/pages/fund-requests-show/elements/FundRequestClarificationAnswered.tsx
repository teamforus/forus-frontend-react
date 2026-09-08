import React from 'react';
import FileUploader from '../../../elements/file-uploader/FileUploader';
import FundRequest from '../../../../../dashboard/props/models/FundRequest';
import FundRequestClarification from '../../../../../dashboard/props/models/FundRequestClarification';
import MultilineText from '../../../../../dashboard/components/elements/multiline-text/MultilineText';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';

export default function FundRequestClarificationAnswered({
    fundRequest,
    clarification,
}: {
    fundRequest: FundRequest;
    clarification: FundRequestClarification;
}) {
    const translate = useTranslate();

    return (
        <div className="fund-request-conversation" data-dusk={`clarificationCard${clarification.id}`}>
            <div className="fund-request-conversation-section fund-request-conversation-question">
                <div className="fund-request-conversation-header">
                    <div className="fund-request-conversation-date">
                        {clarification?.created_at_locale}
                        {!!clarification?.changed_at && (
                            <span>
                                | {translate('fund_request.labels.edited')}: {clarification?.changed_at_locale}
                            </span>
                        )}
                    </div>
                </div>

                <div className="fund-request-conversation-content">
                    <div className="fund-request-conversation-bubble">
                        <div className="fund-request-conversation-label">{fundRequest?.fund?.organization_name}:</div>
                        <div className="fund-request-conversation-text" data-dusk="clarificationQuestion">
                            <MultilineText text={clarification.question} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="fund-request-conversation-section fund-request-conversation-answer">
                <div className="fund-request-conversation-header">
                    <div className="fund-request-conversation-date">{clarification?.resolved_at_locale}</div>
                </div>

                {clarification.state === 'closed' ? (
                    <div className="fund-request-conversation-content" data-dusk="clarificationAnswer">
                        <div className="fund-request-conversation-bubble">
                            <div className="fund-request-conversation-label">
                                {translate('fund_request.labels.closed_by_sponsor', {
                                    sponsor_name: fundRequest?.fund?.organization_name,
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="fund-request-conversation-content" data-dusk="clarificationAnswer">
                        <div className="fund-request-conversation-bubble">
                            <div className="fund-request-conversation-label">
                                {translate('fund_request.labels.your_answer')}:
                            </div>

                            {clarification.answer && (
                                <div className="fund-request-conversation-text">
                                    <MultilineText text={clarification.answer} />
                                </div>
                            )}

                            {clarification.files?.length > 0 && (
                                <div className="fund-request-conversation-files">
                                    <FileUploader
                                        type="fund_request_clarification_proof"
                                        className="block-file-uploader-stacked-mobile"
                                        files={clarification.files}
                                        template={'compact'}
                                        readOnly={true}
                                        hidePreviewButton={true}
                                        hideDownloadButton={true}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
