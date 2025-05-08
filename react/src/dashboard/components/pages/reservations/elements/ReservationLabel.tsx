import React from 'react';
import Reservation from '../../../../props/models/Reservation';
import classNames from 'classnames';

export default function ReservationLabel({ reservation }: { reservation: Reservation }) {
    if (reservation.expired) {
        return <label className="label label-danger-light">Verlopen</label>;
    }

    return (
        <label
            className={classNames(
                `label`,
                reservation?.state === 'waiting' && 'label-default',
                reservation?.state === 'pending' && 'label-default',
                reservation?.state === 'accepted' && 'label-success',
                reservation?.state === 'rejected' && 'label-danger',
                reservation?.state === 'canceled' && 'label-danger',
                reservation?.state === 'canceled_by_client' && 'label-danger',
                reservation?.state === 'canceled_payment_expired' && 'label-danger',
                reservation?.state === 'canceled_payment_canceled' && 'label-danger',
            )}>
            {reservation.state_locale}
        </label>
    );
}
