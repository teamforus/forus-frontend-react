import React, { Fragment } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { ModalButton } from './elements/ModalButton';
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
import Modal from './elements/Modal';

export default function ModalReservationInvoiceNumberEdit({
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

    const form = useFormBuilder<{ invoice_number: string }>(
        {
            invoice_number: reservation.invoice_number,
        },
        (values) => {
            setProgress(0);

            productReservationService
                .update(organization.id, reservation.id, values)
                .then((res) => {
                    pushSuccess('Opgeslagen!');
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
                });
        },
    );

    return (
        <Modal
            modal={modal}
            dusk={'modalReservationInvoiceNumberEdit'}
            title={translate('modals.modal_invoice_number_edit.title')}
            onSubmit={form.submit}
            footer={
                <Fragment>
                    <ModalButton
                        type="default"
                        button={{ onClick: modal.close }}
                        text={translate('modals.modal_invoice_number_edit.buttons.cancel')}
                    />
                    <ModalButton
                        type="primary"
                        button={{ onClick: form.submit }}
                        dusk="submitBtn"
                        text={translate('modals.modal_invoice_number_edit.buttons.confirm')}
                    />
                </Fragment>
            }>
            <FormGroup
                label={translate('modals.modal_invoice_number_edit.labels.invoice_number')}
                error={form.errors.invoice_number}
                info={
                    <Fragment>
                        Het factuurnummer dat u invult kunt u gebruiken ter registratie. Let hierbij op dat het
                        factuurnummer aan het bankafschrift wordt toegevoegd wanneer de reservering is uitbetaald. U
                        kunt dit aan- of uitzetten bij de transactie instellingen.
                    </Fragment>
                }
                input={(id) => (
                    <input
                        id={id}
                        className="form-control"
                        placeholder={translate('modals.modal_invoice_number_edit.labels.invoice_number')}
                        value={form.values.invoice_number || ''}
                        data-dusk="invoiceNumberInput"
                        onChange={(e) => form.update({ invoice_number: e.target.value })}
                    />
                )}
            />
        </Modal>
    );
}
