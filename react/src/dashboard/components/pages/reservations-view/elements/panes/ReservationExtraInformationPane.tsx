import React, { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import Organization from '../../../../../props/models/Organization';
import Reservation, { ReservationCustomFieldValue } from '../../../../../props/models/Reservation';
import KeyValueItem from '../../../../elements/key-value/KeyValueItem';
import useOpenModal from '../../../../../hooks/useOpenModal';
import useTranslate from '../../../../../hooks/useTranslate';
import ModalReservationInvoiceNumberEdit from '../../../../modals/ModalReservationInvoiceNumberEdit';
import FormPane from '../../../../elements/forms/elements/FormPane';
import BlockInlineEdit from '../../../../elements/block-inline-copy/BlockInlineEdit';
import EmptyValue from '../../../../elements/empty-value/EmptyValue';
import FileAttachmentsList from '../../../../elements/FileAttachmentsList';
import ModalReservationCustomFieldEdit from '../../../../modals/ModalReservationCustomFieldEdit';
import ReservationField from '../../../../../props/models/ReservationField';
import Product from '../../../../../props/models/Product';
import FileModel from '../../../../../props/models/File';

export default function ReservationExtraInformationPane({
    setReservation,
    reservation,
    organization,
    customFields,
    product,
}: {
    setReservation?: Dispatch<SetStateAction<Reservation>>;
    reservation: Reservation;
    organization: Organization;
    customFields: ReservationCustomFieldValue[];
    product: Product;
}) {
    const openModal = useOpenModal();
    const translate = useTranslate();

    const availableFields = useMemo(
        () =>
            product?.available_reservation_fields_for_provider?.filter(
                (field) => !customFields.map((i) => i.reservation_field.id).includes(field.id),
            ),
        [customFields, product?.available_reservation_fields_for_provider],
    );

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

    const openEditCustomFieldValueModal = useCallback(
        (field: ReservationField & { value?: string; file?: FileModel }) => {
            openModal((modal) => (
                <ModalReservationCustomFieldEdit
                    modal={modal}
                    organization={organization}
                    reservation={reservation}
                    field={field}
                    onDone={(reservation) => setReservation(reservation)}
                />
            ));
        },
        [setReservation, openModal, reservation, organization],
    );

    const editCustomField = useCallback(
        (field: ReservationField) => {
            openEditCustomFieldValueModal({
                id: field.id,
                type: field.type,
                label: field.label,
                description: field.description,
                required: field.required,
                value: null,
                file: null,
            });
        },
        [openEditCustomFieldValueModal],
    );

    const editCustomFieldValue = useCallback(
        (field: ReservationCustomFieldValue) => {
            openEditCustomFieldValueModal({
                id: field.reservation_field.id,
                type: field.reservation_field.type,
                label: field.reservation_field.label,
                description: field.reservation_field.description,
                required: field.reservation_field.required,
                value: field.value,
                file: field.file,
            });
        },
        [openEditCustomFieldValueModal],
    );

    return (
        <FormPane title={'Extra informatie'} large={true} dusk={'reservationAdditionalDetails'}>
            <div className="card-block card-block-keyvalue card-block-keyvalue-md card-block-keyvalue-text-sm">
                <KeyValueItem label={translate('reservation.labels.invoice_number')}>
                    <BlockInlineEdit onClick={() => editInvoiceNumber()} editDusk={'editInvoiceNumberBtn'}>
                        {reservation.invoice_number || <EmptyValue />}
                    </BlockInlineEdit>
                </KeyValueItem>

                {customFields?.map((field, index) => (
                    <KeyValueItem key={index} label={field.reservation_field.label}>
                        <BlockInlineEdit
                            onClick={() => editCustomFieldValue(field)}
                            className={field.file ? 'flex flex-grow' : null}
                            editDusk={`editCustomFieldBtn${field.id}`}>
                            {field.file ? (
                                <FileAttachmentsList attachments={[{ file: field.file }]} />
                            ) : (
                                field.value || <EmptyValue />
                            )}
                        </BlockInlineEdit>
                    </KeyValueItem>
                ))}

                {availableFields?.map((field, index) => (
                    <KeyValueItem key={index} label={field.label}>
                        <BlockInlineEdit
                            onClick={() => editCustomField(field)}
                            editDusk={`editCustomFieldBtn${field.id}`}>
                            <EmptyValue />
                        </BlockInlineEdit>
                    </KeyValueItem>
                ))}
            </div>
        </FormPane>
    );
}
