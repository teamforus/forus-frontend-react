import { useCallback } from 'react';
import { usePhysicalCardTypeService } from '../../../../services/PhysicalCardTypeService';
import PhysicalCardType from '../../../../props/models/PhysicalCardType';
import useOpenModal from '../../../../hooks/useOpenModal';
import React from 'react';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushApiError from '../../../../hooks/usePushApiError';

export const useDeletePhysicalCardType = () => {
    const openModal = useOpenModal();
    const pushApiError = usePushApiError();
    const setProgress = useSetProgress();
    const physicalCardTypeService = usePhysicalCardTypeService();

    return useCallback(
        (physicalCardType: PhysicalCardType, onDone: () => void) => {
            openModal((modal) => (
                <ModalDangerZone
                    title="Delete Physical Card Type"
                    description="This action cannot be undone. This will permanently delete the physical card type and remove all associated data."
                    buttonSubmit={{
                        onClick: () => {
                            modal.close();
                            setProgress(0);

                            physicalCardTypeService
                                .destroy(physicalCardType.organization_id, physicalCardType.id)
                                .then(() => onDone())
                                .catch(pushApiError)
                                .finally(() => setProgress(100));
                        },
                    }}
                    buttonCancel={{ onClick: () => modal.close() }}
                    modal={modal}
                />
            ));
        },
        [openModal, physicalCardTypeService, pushApiError, setProgress],
    );
};
