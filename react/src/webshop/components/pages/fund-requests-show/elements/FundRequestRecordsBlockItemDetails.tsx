import React, { Dispatch, Fragment, SetStateAction, useCallback, useState } from 'react';
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
import classNames from 'classnames';
import usePushDanger from '../../../../../dashboard/hooks/usePushDanger';
import { uniq } from 'lodash';
import TranslateHtml from '../../../../../dashboard/components/elements/translate-html/TranslateHtml';

export default function FundRequestRecordsBlockItemDetails({
    record,
    fundRequest,
    clarification,
    setFundRequest,
    setClarificationsResponded,
    shownClarificationForms,
    setShownClarificationForms,
}: {
    record: FundRequestRecord;
    fundRequest: FundRequest;
    clarification: FundRequestClarification;
    setFundRequest: React.Dispatch<React.SetStateAction<FundRequest>>;
    setClarificationsResponded: React.Dispatch<React.SetStateAction<number[]>>;
    shownClarificationForms: Array<number>;
    setShownClarificationForms: Dispatch<SetStateAction<Array<number>>>;
}) {
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();

    const fundRequestClarificationService = useFundRequestClarificationService();

    const [uploading, setUploading] = useState(false);

    const showForm = shownClarificationForms.includes(clarification?.id);

    const setShowForm = useCallback(
        (show: boolean) => {
            setShownClarificationForms((ids) =>
                uniq(show ? [...ids, clarification?.id] : ids?.filter((id) => id !== clarification?.id)),
            );
        },
        [clarification?.id, setShownClarificationForms],
    );

    const form = useFormBuilder({ answer: '', files: [] }, (values) => {
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
                setShowForm(false);

                setTimeout(() => {
                    document
                        ?.getElementById(`clarificationsRecordsSuccess${record.id}`)
                        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            })
            .catch((err: ResponseError) => {
                pushDanger(translate('push.error'), err.data?.message);
                form.setErrors(err.data?.errors);
            })
            .finally(() => form.setIsLocked(false));
    });

    const { update: updateForm } = form;

    return (
        <div
            key={clarification.id}
            id={`clarificationCard${clarification.id}`}
            data-dusk={`clarificationCard${clarification.id}`}
            className={'conversation-item'}>
            <div className="conversation-item-number">{record.clarifications.indexOf(clarification) + 1}</div>
            <div
                className={classNames(
                    'conversation-item-body',
                    clarification?.state === 'answered' && 'conversation-item-body-responded',
                )}>
                <div className="conversation-item-section conversation-item-section-question">
                    <div className="conversation-item-section-header">
                        <div className="conversation-item-section-header-label">
                            <em className="mdi mdi-help-circle" aria-hidden="true" />
                            {translate('fund_request.labels.question')}
                        </div>

                        <div className="conversation-item-section-header-date">
                            {translate('fund_request.labels.date')} <strong>{clarification?.created_at_locale}</strong>
                        </div>

                        <div className="conversation-item-section-header-status">
                            {clarification.state === 'pending' && (
                                <Fragment>
                                    <em className="conversation-item-section-header-status-dot" aria-hidden="true" />
                                    {translate('fund_request.record.new_message')}
                                </Fragment>
                            )}

                            {clarification.state === 'answered' && (
                                <Fragment>
                                    <em className="mdi mdi-check-all" aria-hidden="true" />
                                    {translate('fund_request.record.answer')}
                                </Fragment>
                            )}
                        </div>
                    </div>

                    <div className="conversation-item-section-body">
                        <div className="conversation-item-section-body-label">
                            {translate('fund_request.labels.question_from', {
                                name: fundRequest?.fund?.organization_name,
                            })}
                        </div>
                        <div className="conversation-item-section-body-bubble">
                            <div
                                className="conversation-item-section-body-bubble-content"
                                data-dusk="clarificationQuestion">
                                <MultilineText text={clarification.question} />
                            </div>
                        </div>
                    </div>
                </div>

                {clarification.state === 'answered' && (
                    <div className="conversation-item-section">
                        <div className="conversation-item-section-header">
                            <div className="conversation-item-section-header-label">
                                <em className="mdi mdi-check-circle" aria-hidden="true" />
                                {translate('fund_request.record.my_answer')}
                            </div>

                            <div className="conversation-item-section-header-date">
                                {translate('fund_request.labels.date')}{' '}
                                <strong>{clarification?.answered_at_locale}</strong>
                            </div>
                        </div>

                        <div className="conversation-item-section-body" data-dusk="clarificationAnswer">
                            <div className="conversation-item-section-body-label">
                                {translate('fund_request.record.my_message')}
                            </div>
                            <div className="conversation-item-section-body-bubble">
                                {clarification.answer && (
                                    <div className="conversation-item-section-body-bubble-content">
                                        <MultilineText text={clarification.answer} />
                                    </div>
                                )}

                                {clarification.files?.length > 0 && (
                                    <div className="conversation-item-section-body-bubble-files">
                                        <FileUploader
                                            type="fund_request_clarification_proof"
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
                    </div>
                )}

                {clarification.state === 'pending' && !showForm && (
                    <div className="conversation-item-section">
                        <div className="conversation-item-section-body">
                            <button
                                type="button"
                                className="button button-light button-xs button-fill flex flex-center"
                                data-dusk="openReplyForm"
                                onClick={() => setShowForm(true)}>
                                {translate('fund_request.record.answer_btn')}
                                <em className="mdi send-outline" aria-hidden="true" />
                            </button>
                            <TranslateHtml
                                i18n={'fund_request.record.answer_btn_info'}
                                className="conversation-item-section-info"
                            />
                        </div>
                    </div>
                )}

                {clarification.state === 'pending' && showForm && (
                    <form onSubmit={form.submit} className="form form-compact">
                        <div className="conversation-item-section">
                            {clarification?.text_requirement !== 'no' && (
                                <div className="conversation-item-section-body">
                                    <label
                                        className="conversation-item-section-body-label"
                                        htmlFor={`answerInput${clarification.id}`}>
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
                                <div className="conversation-item-section-body">
                                    <div className="conversation-item-section-body-label">
                                        {translate('fund_request.record.add_document_label')}{' '}
                                        {clarification?.files_requirement === 'optional'
                                            ? translate('fund_request.record.optional_label')
                                            : ''}
                                    </div>
                                    <FileUploader
                                        type="fund_request_clarification_proof"
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
                        </div>

                        <div className="conversation-item-section">
                            <div className="button-group flex-space-between">
                                <button
                                    type="button"
                                    className="button button-light button-xs"
                                    onClick={() => setShowForm(false)}>
                                    <em className="mdi mdi-close" aria-hidden="true" />
                                    {translate('fund_request.record.cancel_btn')}
                                </button>
                                <button
                                    type={'submit'}
                                    className="button button-primary button-xs"
                                    data-dusk="submitBtn"
                                    disabled={uploading}>
                                    <em className="mdi mdi-send-outline" aria-hidden="true" />
                                    {translate('fund_request.record.send_btn')}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
