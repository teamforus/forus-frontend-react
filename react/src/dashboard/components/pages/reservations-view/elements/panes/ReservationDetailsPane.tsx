import React from 'react';
import useTranslate from '../../../../../hooks/useTranslate';
import FormPane from '../../../../elements/forms/elements/FormPane';
import Reservation from '../../../../../props/models/Reservation';
import BlockInlineCopy from '../../../../elements/block-inline-copy/BlockInlineCopy';
import { strLimit } from '../../../../../helpers/string';
import KeyValueItem from '../../../../elements/key-value/KeyValueItem';
import FileAttachmentsList from '../../../../elements/FileAttachmentsList';

export default function ReservationDetailsPane({ reservation }: { reservation: Reservation }) {
    const translate = useTranslate();

    return (
        <FormPane title={'Gegevens'} large={true}>
            <div className="card-block card-block-keyvalue card-block-keyvalue-md card-block-keyvalue-text-sm">
                <KeyValueItem label={translate('reservation.labels.email')}>
                    <BlockInlineCopy className={'text-strong text-primary'} value={reservation.identity_email}>
                        {strLimit(reservation.identity_email, 27)}
                    </BlockInlineCopy>
                </KeyValueItem>
                <KeyValueItem label={translate('reservation.labels.first_name')}>{reservation.first_name}</KeyValueItem>
                <KeyValueItem label={translate('reservation.labels.last_name')}>{reservation.last_name}</KeyValueItem>
                {reservation.phone && (
                    <KeyValueItem label={translate('reservation.labels.phone')}>{reservation.phone}</KeyValueItem>
                )}
                {reservation.address && (
                    <KeyValueItem label={translate('reservation.labels.address')}>{reservation.address}</KeyValueItem>
                )}
                {reservation.birth_date && (
                    <KeyValueItem label={translate('reservation.labels.birth_date')}>
                        {reservation.birth_date_locale}
                    </KeyValueItem>
                )}
                {reservation.custom_fields?.map((field, index) => (
                    <KeyValueItem key={index} label={field.label}>
                        {field.file ? <FileAttachmentsList attachments={[{ file: field.file }]} /> : field.value}
                    </KeyValueItem>
                ))}
                {reservation.user_note && (
                    <KeyValueItem label={translate('reservation.labels.user_note')}>
                        {reservation.user_note}
                    </KeyValueItem>
                )}
            </div>
        </FormPane>
    );
}
