import React, { useCallback } from 'react';
import useOpenModal from '../../../../../dashboard/hooks/useOpenModal';
import ModalOpenInMe from '../../../modals/ModalOpenInMe';

export default function useOpenVoucherInMeModal() {
    const openModal = useOpenModal();

    return useCallback(() => {
        openModal((modal) => <ModalOpenInMe modal={modal} />);
    }, [openModal]);
}
