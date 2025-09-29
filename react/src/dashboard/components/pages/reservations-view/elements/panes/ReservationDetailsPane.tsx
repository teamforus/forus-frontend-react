import React from 'react';
import useTranslate from '../../../../../hooks/useTranslate';
import FormPane from '../../../../elements/forms/elements/FormPane';
import Reservation from '../../../../../props/models/Reservation';
import BlockInlineCopy from '../../../../elements/block-inline-copy/BlockInlineCopy';
import { strLimit } from '../../../../../helpers/string';

export default function ReservationDetailsPane({ reservation }: { reservation: Reservation }) {
    const translate = useTranslate();

    return (
        <FormPane title={'Gegevens'} large={true}>
            <div className="card-block card-block-keyvalue card-block-keyvalue-md card-block-keyvalue-text-sm">
                <div className="keyvalue-item">
                    <div className="keyvalue-key">{translate('reservation.labels.email')}</div>
                    <div className="keyvalue-value">
                        <BlockInlineCopy className={'text-strong text-primary'} value={reservation.identity_email}>
                            {strLimit(reservation.identity_email, 27)}
                        </BlockInlineCopy>
                    </div>
                </div>
                <div className="keyvalue-item">
                    <div className="keyvalue-key">{translate('reservation.labels.first_name')}</div>
                    <div className="keyvalue-value">{reservation.first_name}</div>
                </div>
                <div className="keyvalue-item">
                    <div className="keyvalue-key">{translate('reservation.labels.last_name')}</div>
                    <div className="keyvalue-value">{reservation.last_name}</div>
                </div>
                {reservation.phone && (
                    <div className="keyvalue-item">
                        <div className="keyvalue-key">{translate('reservation.labels.phone')}</div>
                        <div className="keyvalue-value">{reservation.phone}</div>
                    </div>
                )}
                {reservation.address && (
                    <div className="keyvalue-item">
                        <div className="keyvalue-key">{translate('reservation.labels.address')}</div>
                        <div className="keyvalue-value">{reservation.address}</div>
                    </div>
                )}
                {reservation.birth_date && (
                    <div className="keyvalue-item">
                        <div className="keyvalue-key">{translate('reservation.labels.birth_date')}</div>
                        <div className="keyvalue-value">{reservation.birth_date_locale}</div>
                    </div>
                )}
                {reservation.custom_fields?.map((field, index) => (
                    <div className="keyvalue-item" key={index}>
                        <div className="keyvalue-key">{field.label}</div>
                        <div className="keyvalue-value">{field.value}</div>
                    </div>
                ))}
                {reservation.user_note && (
                    <div className="keyvalue-item">
                        <div className="keyvalue-key">{translate('reservation.labels.user_note')}</div>
                        <div className="keyvalue-value">{reservation.user_note}</div>
                    </div>
                )}
            </div>
        </FormPane>
    );
}
