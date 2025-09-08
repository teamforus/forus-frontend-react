import { useCallback } from 'react';
import useOpenModal from '../../../../hooks/useOpenModal';
import React from 'react';
import ModalAssignPhysicalCardToFund from '../../../modals/ModalAssignPhysicalCardToFund';
import Fund from '../../../../props/models/Fund';

export const useAssignPhysicalCardTypeToFund = () => {
    const openModal = useOpenModal();

    return useCallback(
        (fund: Fund, exclude: number[], onDone?: () => void) => {
            openModal((modal) => (
                <ModalAssignPhysicalCardToFund modal={modal} fund={fund} onDone={onDone} exclude={exclude} />
            ));
        },
        [openModal],
    );
};
