import React, { useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import CheckboxControl from '../elements/forms/controls/CheckboxControl';
import useTranslate from '../../hooks/useTranslate';
import classNames from 'classnames';
import FormGroup from '../elements/forms/elements/FormGroup';
import FormValuesModel from '../../types/FormValuesModel';
import { ApiResponseSingle, ResponseError } from '../../props/ApiResponses';
import Note from '../../props/models/Note';
import usePushApiError from '../../hooks/usePushApiError';
import useSetProgress from '../../hooks/useSetProgress';
import FundRequest from '../../props/models/FundRequest';
import useFundRequestMissedRecords from '../../hooks/useFundRequestMissedRecords';

export default function ModalFundRequestApproveMissedRecords({
    modal,
    onSubmit,
    fundRequest,
    storeNote,
}: {
    modal: ModalState;
    onSubmit: () => void;
    fundRequest: FundRequest;
    storeNote: (values: FormValuesModel) => Promise<ApiResponseSingle<Note>>;
}) {
    const pushApiError = usePushApiError();
    const setProgress = useSetProgress();
    const translate = useTranslate();

    const { missedRecordsText } = useFundRequestMissedRecords(fundRequest);

    const [recordsNoteStored, setRecordsNoteStored] = useState(false);

    const form = useFormBuilder(
        {
            description: '',
            approve: false,
        },
        async (values) => {
            if (!recordsNoteStored) {
                await storeNote({ description: missedRecordsText })
                    .then(() => setRecordsNoteStored(true))
                    .catch((err) => pushApiError(err));
            }

            if (values.description.trim() === '') {
                onSubmit();
                modal.close();
                return;
            }

            setProgress(0);

            storeNote(values)
                .then(() => {
                    onSubmit();
                    modal.close();
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err?.data?.errors);
                    form.setIsLocked(false);
                    pushApiError(err);
                })
                .finally(() => setProgress(100));
        },
    );

    return (
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading')}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-icon">
                    <i className="mdi mdi-message-alert-outline" />
                </div>

                <div className="modal-body">
                    <div className="modal-section modal-section-pad">
                        <div className="text-center">
                            <div className="modal-heading">
                                {translate('modals.modal_fund_request_approve_missed_records.title')}
                            </div>
                            <div className="modal-text">
                                {translate('modals.modal_fund_request_approve_missed_records.description')}
                            </div>
                            <span />
                        </div>

                        <FormGroup
                            label={translate('modals.modal_fund_request_approve_missed_records.labels.note')}
                            hint={translate('modals.modal_voucher_activation.hints.note')}
                            error={form.errors?.description}
                            input={(id) => (
                                <textarea
                                    className="form-control r-n"
                                    id={id}
                                    maxLength={140}
                                    value={form.values.description || ''}
                                    placeholder={translate(
                                        'modals.modal_fund_request_approve_missed_records.placeholders.note',
                                    )}
                                    onChange={(e) => form.update({ description: e.target.value })}
                                />
                            )}
                        />

                        <FormGroup
                            input={() => (
                                <CheckboxControl
                                    title={'Ik heb de aanvraag gecontroleerd en de ontbrekende gegevens aangevuld.'}
                                    checked={form.values.approve || false}
                                    onChange={(e) => form.update({ approve: e.target.checked })}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        {translate('modals.modal_fund_request_approve_missed_records.buttons.cancel')}
                    </button>

                    <button
                        type="submit"
                        className="button button-primary"
                        disabled={form.values.description.length > 140 || !form.values.approve}>
                        {translate('modals.modal_fund_request_approve_missed_records.buttons.submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}
