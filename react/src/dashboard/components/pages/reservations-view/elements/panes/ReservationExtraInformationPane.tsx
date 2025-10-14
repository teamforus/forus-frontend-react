import React, { Dispatch, SetStateAction, useCallback } from 'react';
import Organization from '../../../../../props/models/Organization';
import Reservation from '../../../../../props/models/Reservation';
import KeyValueItem from '../../../../elements/key-value/KeyValueItem';
import useOpenModal from '../../../../../hooks/useOpenModal';
import useTranslate from '../../../../../hooks/useTranslate';
import ModalReservationInvoiceNumberEdit from '../../../../modals/ModalReservationInvoiceNumberEdit';
import FormPane from '../../../../elements/forms/elements/FormPane';
import BlockInlineEdit from '../../../../elements/block-inline-copy/BlockInlineEdit';
import EmptyValue from '../../../../elements/empty-value/EmptyValue';

export default function ReservationExtraInformationPane({
    setReservation,
    reservation,
    organization,
}: {
    setReservation?: Dispatch<SetStateAction<Reservation>>;
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
                onDone={(reservation) => setReservation(reservation)}
            />
        ));
    }, [setReservation, openModal, reservation, organization]);

    return (
        <FormPane title={'Extra informatie'} large={true} dusk={'reservationAdditionalDetails'}>
            <div className="card-block card-block-keyvalue card-block-keyvalue-md card-block-keyvalue-text-sm">
                <KeyValueItem label={translate('reservation.labels.invoice_number')}>
                    <BlockInlineEdit onClick={() => editInvoiceNumber()} editDusk={'editInvoiceNumberBtn'}>
                        {reservation.invoice_number || <EmptyValue />}
                    </BlockInlineEdit>
                </KeyValueItem>
            </div>
        </FormPane>
    );
}
