import { useCallback } from 'react';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import Reservation from '../../../../../dashboard/props/models/Reservation';
import { startCase } from 'lodash';

export default function useComposeStateAndExpires() {
    const translate = useTranslate();

    return useCallback(
        (reservation: Reservation) => {
            const stateClasses = {
                pending: 'warning',
                accepted: 'success',
                rejected: 'default',
                waiting: 'waiting',
            };

            const data: {
                stateText?: string;
                stateClass?: 'warning' | 'success' | 'default' | 'waiting' | 'danger';
                stateDusk?: string;
                expiresIn?: number;
            } = {
                expiresIn: Math.ceil(reservation.extra_payment_expires_in / 60),
            };

            if (reservation.expired) {
                data.stateText = translate(`reservation.labels.status.expired`);
                data.stateClass = 'danger';
                data.stateDusk = 'labelExpired';
            } else if (reservation.canceled) {
                data.stateText = translate(`reservation.labels.status.${reservation.state}`);
                data.stateClass = 'default';
                data.stateDusk = 'labelCanceled';
            } else {
                data.stateText = translate(`reservation.labels.status.${reservation.state}`);
                data.stateClass = stateClasses[reservation.state];
                data.stateDusk = `label${startCase(reservation.state)}`;
            }

            return data;
        },
        [translate],
    );
}
