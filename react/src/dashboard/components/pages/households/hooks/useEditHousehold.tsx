import React, { useCallback } from 'react';
import ModalEditHousehold from '../modals/ModalEditHousehold';
import useOpenModal from '../../../../hooks/useOpenModal';
import Organization from '../../../../props/models/Organization';
import Household from '../../../../props/models/Sponsor/Household';

export default function useEditHousehold(organization: Organization) {
    const openModal = useOpenModal();

    return useCallback(
        (household: Household = null, onChange: () => void = () => {}, controls?: 'members' | 'address') => {
            openModal((modal) => (
                <ModalEditHousehold
                    modal={modal}
                    controls={controls}
                    household={household}
                    organization={organization}
                    onChange={onChange}
                />
            ));
        },
        [openModal, organization],
    );
}
