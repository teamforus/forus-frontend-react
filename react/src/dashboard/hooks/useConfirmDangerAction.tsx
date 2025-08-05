import React, { ReactNode, useCallback } from 'react';
import ModalDangerZone from '../components/modals/ModalDangerZone';
import useOpenModal from './useOpenModal';

export default function useConfirmDangerAction() {
    const openModal = useOpenModal();

    return useCallback(
        (
            title: string,
            description_text: string | Array<string> | ReactNode,
            confirmButton = 'Bevestigen',
            cancelButton = 'Annuleren',
        ) => {
            return new Promise((resolve) => {
                openModal((modal) => (
                    <ModalDangerZone
                        modal={modal}
                        title={title}
                        description_text={description_text}
                        buttonCancel={{
                            text: cancelButton,
                            onClick: () => {
                                modal.close();
                                resolve(false);
                            },
                        }}
                        buttonSubmit={{
                            text: confirmButton,
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
