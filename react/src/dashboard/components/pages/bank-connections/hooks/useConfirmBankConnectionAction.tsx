import React, { useCallback } from 'react';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalDangerZone from '../../../modals/ModalDangerZone';

export default function useConfirmBankConnectionAction() {
    const openModal = useOpenModal();

    return useCallback(
        (header: string, description_text: string): Promise<boolean> => {
            return new Promise<boolean>((resolve) => {
                openModal((modal) => (
                    <ModalDangerZone
                        modal={modal}
                        title={header}
                        description_text={description_text}
                        buttonCancel={{
                            text: 'Annuleren',
                            onClick: () => {
                                modal.close();
                                resolve(false);
                            },
                        }}
                        buttonSubmit={{
                            text: 'Bevestigen',
                            onClick: () => {
                                modal.close();
                                resolve(true);
                            },
                        }}
                    />
                ));
            });
        },
        [openModal],
    );
}
