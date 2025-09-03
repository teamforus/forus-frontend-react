import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { ModalButton } from './elements/ModalButton';
import classNames from 'classnames';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormGroup from '../elements/forms/elements/FormGroup';
import Reservation from '../../props/models/Reservation';
import Organization from '../../props/models/Organization';
import useProductReservationService from '../../services/ProductReservationService';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushApiError from '../../hooks/usePushApiError';
import { ResponseError } from '../../props/ApiResponses';
import useTranslate from '../../hooks/useTranslate';
import useSetProgress from '../../hooks/useSetProgress';
import CheckboxControl from '../elements/forms/controls/CheckboxControl';

export default function ModalReservationExtraPaymentRefund({
    modal,
    onDone,
    organization,
    reservation,
}: {
    modal: ModalState;
    onDone?: (reservation: Reservation) => void;
    organization: Organization;
    reservation: Reservation;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const productReservationService = useProductReservationService();

    const form = useFormBuilder<{ note: string; share_note_by_email: boolean }>(
        {
            note: '',
            share_note_by_email: false,
        },
        (values) => {
            setProgress(0);

            productReservationService
                .refundReservationExtraPayment(organization.id, reservation.id, values)
                .then((res) => {
                    pushSuccess('Refund created!');
                    onDone?.(res.data.data);
                    modal.close();
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err?.data?.errors);
                    form.setIsLocked(false);
                    pushApiError(err);
                })
                .finally(() => {
                    setProgress(100);
                    modal.close();
                });
        },
    );

    return (
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading')}>
            <div className="modal-backdrop" onClick={modal.close} />
            <div className="modal-window">
                <div className="modal-body form">
                    <div className="modal-section">
                        <div className="block block-danger_zone">
                            <div className="danger_zone-title">
                                <em className="mdi mdi-alert" />
                                {translate('modals.modal_extra_payment_refund.title')}
                            </div>
                        </div>

                        <div className="modal-text">{translate('modals.modal_extra_payment_refund.description')}</div>

                        <FormGroup
                            label="Notitie"
                            error={form.errors.note}
                            input={(id) => (
                                <textarea
                                    id={id}
                                    className="form-control r-n"
                                    rows={3}
                                    defaultValue={form.values.note}
                                    onChange={(e) => form.update({ note: e.target.value })}
                                    placeholder="Notitie"
                                />
                            )}
                        />

                        <FormGroup
                            error={form.errors.share_note_by_email}
                            input={(id) => (
                                <CheckboxControl
                                    id={id}
                                    title={'Verstuur een bericht naar de inwoner'}
                                    narrow={true}
                                    checked={form.values.share_note_by_email}
                                    onChange={(e) => form.update({ share_note_by_email: e.target.checked })}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <ModalButton
                        type="default"
                        button={{ onClick: modal.close }}
                        text={translate('modals.modal_extra_payment_refund.buttons.cancel')}
                    />
                    <ModalButton
                        type="primary"
                        button={{ onClick: form.submit }}
                        text={translate('modals.modal_extra_payment_refund.buttons.confirm')}
                    />
                </div>
            </div>
        </div>
    );
}
