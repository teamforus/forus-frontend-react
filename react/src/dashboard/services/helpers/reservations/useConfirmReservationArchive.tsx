import Reservation from '../../../props/models/Reservation';
import useOpenModal from '../../../hooks/useOpenModal';
import { useCallback } from 'react';
import ModalDangerZone from '../../../components/modals/ModalDangerZone';
import React from 'react';

export default function useConfirmReservationArchive() {
    const openModal = useOpenModal();

    return useCallback(
        (reservations: Reservation[], onConfirm: () => void) => {
            openModal((modal) => {
                const isMultiple = reservations.length > 1;
                const description_title = isMultiple ? 'Reserveringen archiveren' : 'Reservering archiveren';
                let description_text: string;

                if (isMultiple) {
                    const intro = 'De volgende reserveringen worden gearchiveerd:';
                    const list = reservations.map((r) => `- ${r.product!.name} voor ${r.amount_locale}`).join('\n');
                    description_text = [intro, list].join('\n\n');
                } else {
                    const r = reservations[0];
                    description_text = `De reservering voor het aanbod ${r.product!.name} wordt gearchiveerd.`;
                }

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
