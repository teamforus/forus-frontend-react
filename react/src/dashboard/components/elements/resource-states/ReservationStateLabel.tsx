import React from 'react';
import Reservation from '../../../props/models/Reservation';
import Label from '../image_cropper/Label';

export default function ReservationStateLabel({ reservation }: { reservation: Reservation }) {
    if (reservation.expired) {
        return <Label type="danger_light">Verlopen</Label>;
    }

    if (reservation?.state === 'waiting' || reservation?.state === 'pending') {
        return <Label type="default">{reservation.state_locale}</Label>;
    }

    if (reservation?.state === 'accepted') {
        return <Label type="success">{reservation.state_locale}</Label>;
    }

    if (
        reservation?.state === 'rejected' ||
        reservation?.state === 'canceled' ||
        reservation?.state === 'canceled_by_client' ||
        reservation?.state === 'canceled_payment_expired' ||
        reservation?.state === 'canceled_payment_canceled'
    ) {
        return <Label type="danger">{reservation.state_locale}</Label>;
    }

    return <Label type={'default'}>reservation.state_locale</Label>;
}
