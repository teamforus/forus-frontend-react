import React, { useCallback } from 'react';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import useHouseholdsService from '../../../../services/HouseholdsService';
import Household from '../../../../props/models/Sponsor/Household';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushApiError from '../../../../hooks/usePushApiError';

export default function useDeleteHousehold() {
    const openModal = useOpenModal();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const householdService = useHouseholdsService();

    return useCallback(
        (household: Household, onDelete?: () => void) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={'Delete'}
                    description={'Are you sure you want to delete this household?'}
                    buttonCancel={{
                        text: 'Cancel',
                        onClick: () => {
                            modal.close();
                        },
                    }}
                    buttonSubmit={{
                        text: 'Delete',
                        onClick: () => {
                            modal.close();
                            setProgress(0);

                            householdService
                                .delete(household.organization_id, household.id)
                                .then(() => {
                                    onDelete?.();
                                })
                                .catch(pushApiError)
                                .finally(() => {
                                    setProgress(100);
                                });
                        },
                    }}
                />
            ));
        },
        [openModal, householdService, setProgress, pushApiError],
    );
}
