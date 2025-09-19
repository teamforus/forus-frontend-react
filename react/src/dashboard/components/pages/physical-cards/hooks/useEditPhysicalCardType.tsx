import { useCallback } from 'react';
import PhysicalCardType from '../../../../props/models/PhysicalCardType';
import useOpenModal from '../../../../hooks/useOpenModal';
import React from 'react';
import ModalMakePhysicalCardTypeEdit from '../../../modals/ModalMakePhysicalCardTypeEdit';
import Organization from '../../../../props/models/Organization';

export const useEditPhysicalCardType = () => {
    const openModal = useOpenModal();

    return useCallback(
        (organization: Organization, physicalCardType?: PhysicalCardType, onPhysicalCardType?: () => void) => {
            openModal((modal) => (
                <ModalMakePhysicalCardTypeEdit
                    title={physicalCardType ? 'Passen type aanmaken' : 'Passen type bewerken'}
                    modal={modal}
                    physicalCardType={physicalCardType}
                    organization={organization}
                    onPhysicalCardType={() => onPhysicalCardType()}
                />
            ));
        },
        [openModal],
    );
};
