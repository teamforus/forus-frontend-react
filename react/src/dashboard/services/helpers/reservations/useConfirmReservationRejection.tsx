import Reservation from '../../../props/models/Reservation';
import useOpenModal from '../../../hooks/useOpenModal';
import { useCallback } from 'react';
import ModalDangerZone from '../../../components/modals/ModalDangerZone';
import React from 'react';

export default function useConfirmReservationRejection() {
    const openModal = useOpenModal();

    return useCallback(
        (reservations: Reservation[], onConfirm: () => void) => {
            openModal((modal) => {
                const isMultiple = reservations.length > 1;

                const title = isMultiple
                    ? 'Weet u zeker dat u de betalingen wilt annuleren?'
                    : 'Weet u zeker dat u de betaling wilt annuleren?';

                let description_text: string;

                if (isMultiple) {
                    const intro =
                        'Wanneer u de betalingen annuleert wordt u niet meer uitbetaald voor de volgende reserveringen:';
                    const list = reservations.map((r) => `- ${r.product!.name} voor ${r.amount_locale}`).join('\n');
                    description_text = [intro, list].join('\n\n');
                } else {
                    description_text = 'Wanneer u de betaling annuleert wordt u niet meer uitbetaald.';
                }

                return (
                    <ModalDangerZone
                        modal={modal}
                        title={title}
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
