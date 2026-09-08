import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
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
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import usePushDanger from '../../../../../dashboard/hooks/usePushDanger';
import { uniq } from 'lodash';
import ModalNotification from '../../../modals/ModalNotification';
import useOpenModal from '../../../../../dashboard/hooks/useOpenModal';

export default function FundRequestClarificationPending({
    record,
    fundRequest,
    clarification,
    setFundRequest,
    setClarificationsResponded,
}: {
    record: FundRequestRecord;
    fundRequest: FundRequest;
    clarification: FundRequestClarification;
    setFundRequest: React.Dispatch<React.SetStateAction<FundRequest>>;
    setClarificationsResponded: React.Dispatch<React.SetStateAction<number[]>>;
}) {
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const openModal = useOpenModal();

    const fundRequestClarificationService = useFundRequestClarificationService();

    const [uploading, setUploading] = useState(false);

    const form = useFormBuilder({ answer: '', files: [] }, (values) => {
        confirmSubmit().then((confirm) => {
            if (!confirm) {
                setTimeout(() => form.setIsLocked(false));
                return;
            }

            fundRequestClarificationService
                .update(fundRequest.id, clarification.id, values)
                .then((res) => {
                    pushSuccess(translate('push.success'));
                    setClarificationsResponded((ids) => uniq([...ids, clarification.id]));

                    record.clarifications = record.clarifications.map((item) => {
                        return item.id === res.data.data.id ? res.data.data : item;
                    });

                    setFundRequest((request) => ({
                        ...request,
                        records: request.records.map((item) => (item.id === record.id ? record : item)),
                    }));

                    form.setErrors(null);

                    setTimeout(() => {
                        document
                            ?.getElementById(`fundRequestRecords${record.id}`)
                            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                })
                .catch((err: ResponseError) => {
                    pushDanger(translate('push.error'), err.data?.message);
                    form.setErrors(err.data?.errors);
                })
                .finally(() => form.setIsLocked(false));
        });
    });

    const { update: updateForm } = form;

    const confirmSubmit = useCallback((): Promise<boolean> => {
        return new Promise((resolve) => {
            openModal(
                (modal) => (
                    <ModalNotification
                        modal={modal}
                        type={'confirm'}
                        title={translate('confirm_fund_request_clarification_submit.title')}
                        description={translate('confirm_fund_request_clarification_submit.description')}
                        mdiIconType={'warning'}
                        mdiIconClass="alert-outline"
                        confirmBtnText={translate('confirm_fund_request_clarification_submit.confirm_btn')}
                        onConfirm={() => resolve(true)}
                        onCancel={() => resolve(false)}
                    />
                ),
                { onClosed: () => resolve(false) },
            );
        });
    }, [openModal, translate]);

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

            <form
                onSubmit={form.submit}
                className={classNames(
                    'fund-request-conversation-section',
                    'fund-request-conversation-form',
                    'form form-compact',
                )}>
                {clarification?.text_requirement !== 'no' && (
                    <div className="fund-request-conversation-content">
                        <label className="fund-request-conversation-label" htmlFor={`answerInput${clarification.id}`}>
                            {translate('fund_request.record.answer_question_label')}
                        </label>
                        <UIControlText
                            type={'textarea'}
                            rows={5}
                            id={`answerInput${clarification.id}`}
                            dataDusk="answerInput"
                            value={form.values.answer}
                            onChangeValue={(answer) => form.update({ answer })}
                        />
                        <FormError duskPrefix={'errorAnswer'} error={form.errors?.answer} />
                    </div>
                )}

                {clarification?.files_requirement !== 'no' && (
                    <div className="fund-request-conversation-content">
                        <div className="fund-request-conversation-label">
                            {translate('fund_request.record.add_document_label')}{' '}
                            {clarification?.files_requirement === 'optional'
                                ? translate('fund_request.record.optional_label')
                                : ''}
                        </div>
                        <FileUploader
                            type="fund_request_clarification_proof"
                            className="block-file-uploader-stacked-mobile"
                            files={[]}
                            template={'compact'}
                            cropMedia={false}
                            onFilesChange={({ files, fileItems }) => {
                                updateForm({ files: files.map((file) => file?.uid) });
                                setUploading(fileItems.filter((item) => item.uploading).length > 0);
                            }}
                        />
                        <FormError duskPrefix={'errorFiles'} error={form.errors?.files} />
                    </div>
                )}

                <div className="button-group">
                    <button
                        type={'submit'}
                        className="button button-primary button-xs"
                        data-dusk="submitBtn"
                        disabled={uploading}>
                        <em className="mdi mdi-send-outline" aria-hidden="true" />
                        {translate('fund_request.record.send_btn')}
                    </button>
                </div>
            </form>
        </div>
    );
}
