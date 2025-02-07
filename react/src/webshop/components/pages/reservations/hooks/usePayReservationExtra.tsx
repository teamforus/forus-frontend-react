import { useCallback } from 'react';
import Reservation from '../../../../../dashboard/props/models/Reservation';
import { ResponseError } from '../../../../../dashboard/props/ApiResponses';
import usePushDanger from '../../../../../dashboard/hooks/usePushDanger';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import { useProductReservationService } from '../../../../services/ProductReservationService';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';

export default function usePayReservationExtra() {
    const pushDanger = usePushDanger();
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const productReservationService = useProductReservationService();

    return useCallback(
        (e, reservation: Reservation) => {
            e.stopPropagation();
            e.preventDefault();

            setProgress(0);

            productReservationService
                .checkoutExtra(reservation.id)
                .then((res) => (document.location.href = res.data.url))
                .catch((err: ResponseError) => pushDanger(translate('push.error'), err.data?.message))
                .finally(() => setProgress(100));
        },
        [productReservationService, pushDanger, setProgress, translate],
    );
}
