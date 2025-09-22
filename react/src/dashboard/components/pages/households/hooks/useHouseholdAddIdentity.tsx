import React, { useCallback } from 'react';
import useOpenModal from '../../../../hooks/useOpenModal';
import Organization from '../../../../props/models/Organization';
import Household from '../../../../props/models/Sponsor/Household';
import ModalSelectOrMakeSponsorIdentity from '../modals/ModalSelectOrMakeSponsorIdentity';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import useHouseholdProfilesService from '../../../../services/HouseholdProfilesService';
import usePushApiError from '../../../../hooks/usePushApiError';
import useSetProgress from '../../../../hooks/useSetProgress';

export default function useHouseholdAddIdentity(organization: Organization) {
    const openModal = useOpenModal();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const householdProfilesService = useHouseholdProfilesService();

    const addMember = useCallback(
        (organizationId: number, householdId: number, identityId: number) => {
            return householdProfilesService.store(organizationId, householdId, { identity_id: identityId });
        },
        [householdProfilesService],
    );

    return useCallback(
        (household: Household, onChange: () => void) => {
            openModal((modal) => (
                <ModalSelectOrMakeSponsorIdentity
                    modal={modal}
                    onDone={(identities) => {
                        modal.close();

                        const profilesPromise = identities
                            .map((identity) => identity.id)
                            .map((id) => addMember(organization?.id, household?.id, id));

                        setProgress(0);

                        Promise.all(profilesPromise)
                            .then(() => {
                                onChange?.();
                                pushSuccess('Gelukt!', 'Person succesvol toegevoegd.');
                            })
                            .catch(pushApiError)
                            .finally(() => setProgress(100));
                    }}
                    organization={organization}
                    excludeHousehold={household}
                    multiselect={true}
                />
            ));
        },
        [addMember, openModal, organization, pushApiError, pushSuccess, setProgress],
    );
}
