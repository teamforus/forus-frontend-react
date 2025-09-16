import React, { useCallback } from 'react';
import Organization from '../../../../props/models/Organization';
import Reservation from '../../../../props/models/Reservation';
import KeyValueItem from '../../../elements/key-value/KeyValueItem';
import useOpenModal from '../../../../hooks/useOpenModal';
import useTranslate from '../../../../hooks/useTranslate';
import ModalReservationInvoiceNumberEdit from '../../../modals/ModalReservationInvoiceNumberEdit';
import FormPane from '../../../elements/forms/elements/FormPane';

export default function ReservationAdditionalDetails({
    onUpdate,
    reservation,
    organization,
}: {
    onUpdate?: (reservation: Reservation) => void;
    reservation: Reservation;
    organization: Organization;
}) {
    const openModal = useOpenModal();
    const translate = useTranslate();

    const editInvoiceNumber = useCallback(() => {
        openModal((modal) => (
            <ModalReservationInvoiceNumberEdit
                modal={modal}
                organization={organization}
                reservation={reservation}
                onDone={(reservation) => onUpdate(reservation)}
            />
        ));
    }, [onUpdate, openModal, reservation, organization]);

    return (
        <div className="card" data-dusk="reservationAdditionalDetails">
            <div className="card-header">
                <div className="flex flex-grow card-title">{translate('reservation.header.extra_details.title')}</div>

                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <button
                            className="button button-primary button-sm"
                            data-dusk="editInvoiceNumberBtn"
                            onClick={() => editInvoiceNumber()}>
                            <em className="mdi mdi-pencil icon-start"></em>
                            {translate('reservation.buttons.edit_invoice_number')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="card-section">
                <div className="form">
                    <FormPane title={translate('product.labels.details')} large={true}>
                        <div className="card-block card-block-keyvalue card-block-keyvalue-md card-block-keyvalue-text-sm">
                            <KeyValueItem label={translate('reservation.labels.invoice_number')}>
                                {reservation.invoice_number}
                            </KeyValueItem>
                        </div>
                    </FormPane>
                </div>
            </div>
        </div>
    );
}
