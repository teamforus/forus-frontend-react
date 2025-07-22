import React, { useCallback } from 'react';
import Reservation from '../../../../props/models/Reservation';
import { runSequentially } from '../../../../helpers/utils';
import useConfirmReservationArchive from '../../../../services/helpers/reservations/useConfirmReservationArchive';
import useConfirmReservationApproval from '../../../../services/helpers/reservations/useConfirmReservationApproval';
import useConfirmReservationUnarchive from '../../../../services/helpers/reservations/useConfirmReservationUnarchive';
import useShowReservationRejectInfoExtraPaid from '../../../../services/helpers/reservations/useShowRejectInfoExtraPaid';
import useProductReservationService from '../../../../services/ProductReservationService';
import Organization from '../../../../props/models/Organization';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import usePushApiError from '../../../../hooks/usePushApiError';
import ModalReservationReject from '../../../modals/ModalReservationReject';
import useOpenModal from '../../../../hooks/useOpenModal';

export default function useReservationsTableActions(organization: Organization, fetchReservations: () => void) {
    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const productReservationService = useProductReservationService();

    const confirmReservationArchive = useConfirmReservationArchive();
    const confirmReservationApproval = useConfirmReservationApproval();
    const confirmReservationUnarchive = useConfirmReservationUnarchive();
    const showReservationRejectInfoExtraPaid = useShowReservationRejectInfoExtraPaid();

    const unarchiveReservations = useCallback(
        (reservations: Reservation[]) => {
            confirmReservationUnarchive(reservations, () => {
                const total = reservations.length;
                const isSingle = total === 1;

                const tasks = reservations.map(
                    (reservation, idx) => () =>
                        productReservationService.unarchive(organization.id, reservation.id).then(() => {
                            const prefix = isSingle ? '' : `${idx + 1}/${total}: `;

                            pushSuccess(
                                `${prefix}Reservering voor ${reservation.product!.name} voor ${reservation.amount_locale} uit het archief gehaald.`,
                            );
                        }),
                );

                runSequentially(tasks)
                    .then(() => {
                        if (!isSingle) {
                            pushSuccess('Alle reserveringen zijn uit het archief gehaald.');
                        }
                        fetchReservations();
                    })
                    .catch(pushApiError);
            });
        },
        [
            organization.id,
            confirmReservationUnarchive,
            fetchReservations,
            productReservationService,
            pushApiError,
            pushSuccess,
        ],
    );

    const acceptReservations = useCallback(
        (reservations: Reservation[]) => {
            confirmReservationApproval(reservations, () => {
                const total = reservations.length;
                const isSingle = reservations.length === 1;

                const tasks = reservations.map(
                    (reservation, idx) => () =>
                        productReservationService.accept(organization.id, reservation.id).then(() => {
                            const prefix = isSingle ? '' : `${idx + 1}/${total}: `;

                            pushSuccess(
                                `${prefix}Reservering voor ${reservation.product!.name} voor ${reservation.amount_locale} geaccepteerd.`,
                            );
                        }),
                );

                runSequentially(tasks)
                    .then(() => {
                        if (!isSingle) {
                            pushSuccess('Alle reserveringen zijn geaccepteerd.');
                        }
                        fetchReservations();
                    })
                    .catch(pushApiError);
            });
        },
        [
            organization.id,
            confirmReservationApproval,
            fetchReservations,
            productReservationService,
            pushApiError,
            pushSuccess,
        ],
    );

    const rejectReservations = useCallback(
        (reservations: Reservation[]) => {
            for (let i = 0; i < reservations.length; i++) {
                const reservation = reservations[0];

                if (reservation.extra_payment?.is_paid && !reservation.extra_payment?.is_fully_refunded) {
                    return showReservationRejectInfoExtraPaid();
                }
            }

            openModal((modal) => {
                return (
                    <ModalReservationReject
                        modal={modal}
                        organization={organization}
                        reservations={reservations}
                        onDone={() => fetchReservations()}
                    />
                );
            });
        },
        [openModal, showReservationRejectInfoExtraPaid, organization, fetchReservations],
    );

    const archiveReservations = useCallback(
        (reservations: Reservation[]) => {
            confirmReservationArchive(reservations, () => {
                const total = reservations.length;
                const isSingle = total === 1;

                const tasks = reservations.map(
                    (reservation, idx) => () =>
                        productReservationService.archive(organization.id, reservation.id).then(() => {
                            const prefix = isSingle ? '' : `${idx + 1}/${total}: `;

                            pushSuccess(
                                `${prefix}Reservering voor ${reservation.product!.name} voor ${reservation.amount_locale} gearchiveerd.`,
                            );
                        }),
                );

                runSequentially(tasks)
                    .then(() => {
                        if (!isSingle) {
                            pushSuccess('Alle reserveringen zijn gearchiveerd.');
                        }
                        fetchReservations();
                    })
                    .catch(pushApiError);
            });
        },
        [
            organization.id,
            confirmReservationArchive,
            fetchReservations,
            productReservationService,
            pushApiError,
            pushSuccess,
        ],
    );

    return { unarchiveReservations, acceptReservations, rejectReservations, archiveReservations };
}
