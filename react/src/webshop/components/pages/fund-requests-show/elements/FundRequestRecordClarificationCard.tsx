import React, { useCallback, useState } from 'react';
import FundRequestRecord from '../../../../../dashboard/props/models/FundRequestRecord';
import FormError from '../../../../../dashboard/components/elements/forms/errors/FormError';
import useFormBuilder from '../../../../../dashboard/hooks/useFormBuilder';
import UIControlText from '../../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import FileUploader from '../../../elements/file-uploader/FileUploader';
import FundRequest from '../../../../../dashboard/props/models/FundRequest';
import FundRequestClarification from '../../../../../dashboard/props/models/FundRequestClarification';
import usePushSuccess from '../../../../../dashboard/hooks/usePushSuccess';
import { ResponseError } from '../../../../../dashboard/props/ApiResponses';
import { useFundRequestClarificationService } from '../../../../services/FundRequestClarificationService';
import MultilineText from '../../../../../dashboard/components/elements/multiline-text/MultilineText';

export default function FundRequestRecordClarificationCard({
    record,
    fundRequest,
    clarification,
    setFundRequest,
}: {
    record: FundRequestRecord;
    fundRequest: FundRequest;
    clarification: FundRequestClarification;
    setFundRequest: React.Dispatch<React.SetStateAction<FundRequest>>;
}) {
    const pushSuccess = usePushSuccess();

    const fundRequestClarificationService = useFundRequestClarificationService();

    const [uploading, setUploading] = useState(false);

    const [showForm, setShowForm] = useState(false);

    const openReplyForm = useCallback(() => {
        setShowForm(true);
    }, []);

    const form = useFormBuilder({ answer: '', files: [] }, (values) => {
        fundRequestClarificationService
            .update(fundRequest.id, clarification.id, values)
            .then((res) => {
                pushSuccess('Succes!');

                record.clarifications = record.clarifications.map((item) => {
                    return item.id === res.data.data.id ? res.data.data : item;
                });

                setFundRequest((request) => ({
                    ...request,
                    records: request.records.map((item) => (item.id === record.id ? record : item)),
                }));

                setShowForm(false);
            })
            .catch((res: ResponseError) => form.setErrors(res.data.errors))
            .finally(() => form.setIsLocked(false));
    });

    const { update: updateForm } = form;

    return (
        <div
            key={clarification.id}
            className={`fund-request-chat ${
                clarification.state === 'pending' ? 'fund-request-chat-new' : 'fund-request-chat-answered'
            }`}>
            <div className="fund-request-chat-number">
                {record.clarifications.length - record.clarifications.indexOf(clarification)}
            </div>
            <div className="fund-request-chat-info">
                <div className="fund-request-chat-time">
                    <em className="mdi mdi-clock-outline fund-request-chat-time-icon" />
                    {clarification.created_at_locale?.split(' - ')[1]}
                </div>
                {clarification.state === 'pending' && (
                    <div className="fund-request-chat-status">
                        <em className="fund-request-chat-status-icon" />
                        Nieuw verzoek
                    </div>
                )}

                {clarification.state === 'answered' && (
                    <div className="fund-request-chat-status">
                        <em className="mdi mdi-check fund-request-chat-status-icon" />
                        Beantwoord
                    </div>
                )}
            </div>
            <div className="fund-request-chat-conversation">
                <div className="fund-request-chat-conversation-content">
                    <div className="fund-request-chat-message fund-request-chat-message-in">
                        <div className="fund-request-chat-message-time">{clarification.created_at_locale}</div>
                        <div className="fund-request-chat-message-content">
                            <div className="fund-request-chat-message-text">
                                <MultilineText text={clarification.question} />
                            </div>
                        </div>
                    </div>
                    {clarification.state === 'answered' && (
                        <div className="fund-request-chat-message fund-request-chat-message-out">
                            <div className="fund-request-chat-message-time">{clarification.answered_at_locale}</div>
                            <div className="fund-request-chat-message-content">
                                <div className="fund-request-chat-message-text">
                                    <MultilineText text={clarification.answer} />
                                </div>
                                {clarification.files.length > 0 && (
                                    <div className="fund-request-chat-message-file-uploader">
                                        <FileUploader
                                            type="fund_request_clarification_proof"
                                            files={clarification.files}
                                            template={'compact'}
                                            readOnly={true}
                                            hideButtons={true}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {clarification.state === 'pending' && !showForm && (
                    <div className="fund-request-chat-conversation-reply" onClick={() => openReplyForm()}>
                        <button className="button button-light button-xs button-fill flex flex-center">
                            <em className="mdi mdi-reply" />
                            Antwoord
                        </button>
                    </div>
                )}

                {clarification.state === 'pending' && showForm && (
                    <form onSubmit={form.submit} className="fund-request-chat-conversation-answer form form-compact">
                        <div className="fund-request-chat-conversation-answer-box form-group">
                            <UIControlText
                                type={'textarea'}
                                rows={5}
                                value={form.values.answer}
                                onChangeValue={(answer) => form.update({ answer })}
                            />
                            <FormError error={form.errors?.answer} />
                        </div>
                        <div className="fund-request-chat-conversation-answer-options">
                            <FileUploader
                                type="fund_request_clarification_proof"
                                files={[]}
                                template={'compact'}
                                cropMedia={false}
                                multiple={true}
                                onFilesChange={({ files, fileItems }) => {
                                    updateForm({ files: files.map((file) => file?.uid) });
                                    setUploading(fileItems.filter((item) => item.uploading).length > 0);
                                }}
                            />
                            <div className="button-group">
                                <button
                                    type="button"
                                    className="button button-light button-xs"
                                    onClick={() => setShowForm(false)}>
                                    <em className="mdi mdi-close" />
                                    Annuleer
                                </button>
                                <button
                                    type={'submit'}
                                    className="button button-primary button-xs"
                                    disabled={uploading || !form.values.answer}>
                                    <em className="mdi mdi-send-outline" />
                                    Verzend
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
