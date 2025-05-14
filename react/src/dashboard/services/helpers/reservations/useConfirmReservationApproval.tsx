import Reservation from '../../../props/models/Reservation';
import useOpenModal from '../../../hooks/useOpenModal';
import { useCallback } from 'react';
import ModalDangerZone from '../../../components/modals/ModalDangerZone';
import React from 'react';

export default function useConfirmReservationApproval() {
    const openModal = useOpenModal();

    return useCallback(
        (reservations: Reservation[], onConfirm: () => void) => {
            openModal((modal) => {
                const isMultiple = reservations.length > 1;

                // Title: singular vs. plural
                const description_title = isMultiple
                    ? 'Weet u zeker dat u de reserveringen wilt accepteren?'
                    : 'Weet u zeker dat u de reservering wilt accepteren?';

                // Intro line: singular vs. plural
                const introLine = isMultiple
                    ? 'U staat op het punt om de volgende reserveringen te accepteren:'
                    : 'U staat op het punt om een reservering te accepteren voor het aanbod:';

                // List out each reservation
                const itemsList = reservations.map((r) => `- ${r.product.name} voor ${r.amount_locale}`).join('\n');

                // Cancellation sentence: adjust 'transactie(s)'
                const cancelLine = isMultiple
                    ? 'U kunt de transacties annuleren binnen 14 dagen, daarna volgt de uitbetaling.'
                    : 'U kunt de transactie annuleren binnen 14 dagen, daarna volgt de uitbetaling.';

                const description_text = [introLine, itemsList, cancelLine].join('\n\n');

                return (
                    <ModalDangerZone
                        modal={modal}
                        description_title={description_title}
                        description_text={description_text}
                        buttonCancel={{ text: 'Annuleren', onClick: modal.close }}
                        buttonSubmit={{
                            text: 'Bevestigen',
                            onClick: () => {
                                onConfirm();
                                modal.close();
                            },
                        }}
                    />
                );
            });
        },
        [openModal],
    );
}
