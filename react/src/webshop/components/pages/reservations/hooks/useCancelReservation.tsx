import React, { useCallback } from 'react';
import Reservation from '../../../../../dashboard/props/models/Reservation';
import { ResponseError } from '../../../../../dashboard/props/ApiResponses';
import usePushDanger from '../../../../../dashboard/hooks/usePushDanger';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import { useProductReservationService } from '../../../../services/ProductReservationService';
import useOpenModal from '../../../../../dashboard/hooks/useOpenModal';
import ModalProductReserveCancel from '../../../modals/ModalProductReserveCancel';
import usePushSuccess from '../../../../../dashboard/hooks/usePushSuccess';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';

export default function useCancelReservation(onDelete?: () => void) {
    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const productReservationService = useProductReservationService();

    return useCallback(
        (e, reservation: Reservation) => {
            e.stopPropagation();
            e.preventDefault();

            openModal((modal) => (
                <ModalProductReserveCancel
                    modal={modal}
                    reservation={reservation}
                    onConfirm={() => {
                        setProgress(0);

                        productReservationService
                            .cancel(reservation.id)
                            .then(() => {
                                pushSuccess(translate('push.success'), translate('push.reservation.canceled'));
                                onDelete?.();
                            })
                            .catch((err: ResponseError) => pushDanger(translate('push.error'), err.data.message))
                            .finally(() => setProgress(100));
                    }}
                />
            ));
        },
        [onDelete, openModal, productReservationService, pushDanger, pushSuccess, setProgress, translate],
    );
}
