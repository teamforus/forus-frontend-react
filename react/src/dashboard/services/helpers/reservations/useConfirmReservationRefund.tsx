import Reservation from '../../../props/models/Reservation';
import useOpenModal from '../../../hooks/useOpenModal';
import { useCallback } from 'react';
import ModalDangerZone from '../../../components/modals/ModalDangerZone';
import React from 'react';

export default function useConfirmReservationUnarchive() {
    const openModal = useOpenModal();

    return useCallback(
        (reservation: Reservation, onConfirm: () => void) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={'Weet u zeker dat u de bijbetaling wilt annuleren?'}
                    description_text={'Wanneer u de bijbetaling annuleert wordt u niet meer uitbetaald.'}
                    buttonCancel={{ text: 'Annuleren', onClick: modal.close }}
                    buttonSubmit={{
                        text: 'Bevestigen',
                        onClick: () => {
                            onConfirm();
                            modal.close();
                        },
                    }}
                />
            ));
        },
        [openModal],
    );
}
