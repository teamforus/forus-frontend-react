import React, { useCallback } from 'react';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushApiError from '../../../../hooks/usePushApiError';
import Organization from '../../../../props/models/Organization';
import useSponsorIdentitiesService from '../../../../services/SponsorIdentitesService';
import SponsorProfileRelation from '../../../../props/models/Sponsor/SponsorProfileRelation';

export default function useIdentityRelationDelete(organization: Organization) {
    const openModal = useOpenModal();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const identityService = useSponsorIdentitiesService();

    return useCallback(
        (relation: SponsorProfileRelation, onDelete?: () => void) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={'Verwijder relatie'}
                    description={'Weet u zeker dat u de relatie wilt verwijderen?'}
                    buttonCancel={{
                        text: 'Annuleren',
                        onClick: () => {
                            modal.close();
                        },
                    }}
                    buttonSubmit={{
                        text: 'Verwijder',
                        onClick: () => {
                            modal.close();
                            setProgress(0);

                            identityService
                                .deleteRelation(organization.id, relation.identity_id, relation.id)
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
        [openModal, setProgress, identityService, organization.id, pushApiError],
    );
}
