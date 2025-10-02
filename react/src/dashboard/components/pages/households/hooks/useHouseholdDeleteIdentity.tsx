import React, { useCallback } from 'react';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushApiError from '../../../../hooks/usePushApiError';
import Organization from '../../../../props/models/Organization';
import useHouseholdProfilesService from '../../../../services/HouseholdProfilesService';
import HouseholdProfile from '../../../../props/models/Sponsor/HouseholdProfile';

export default function useHouseholdDeleteIdentity(organization: Organization) {
    const openModal = useOpenModal();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const householdProfilesService = useHouseholdProfilesService();

    return useCallback(
        (member: HouseholdProfile, onDelete?: () => void) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={'Verwijder huishouden persoon'}
                    description={'Weet u het zeker dat u de persoon uit het huishouden wilt verwijderen?'}
                    buttonCancel={{
                        text: 'Annuleren',
                        onClick: () => modal.close(),
                    }}
                    buttonSubmit={{
                        text: 'Verwijder',
                        onClick: () => {
                            modal.close();
                            setProgress(0);

                            householdProfilesService
                                .delete(organization.id, member.household_id, member?.id)
                                .then(() => onDelete?.())
                                .catch(pushApiError)
                                .finally(() => setProgress(100));
                        },
                    }}
                />
            ));
        },
        [openModal, setProgress, householdProfilesService, organization.id, pushApiError],
    );
}
