import { useCallback } from 'react';
import useOpenModal from '../../../../hooks/useOpenModal';
import React from 'react';
import Fund from '../../../../props/models/Fund';
import PhysicalCardType from '../../../../props/models/PhysicalCardType';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import { useFundService } from '../../../../services/FundService';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushApiError from '../../../../hooks/usePushApiError';

export const useRemovePhysicalCardTypeFromFund = () => {
    const openModal = useOpenModal();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const fundService = useFundService();

    return useCallback(
        (fund: Fund, physicalCardType: PhysicalCardType, onDone?: () => void) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={'Verwijderen'}
                    description={'Weet u zeker dat u deze type van de fysieke kaart wilt verwijderen?'}
                    buttonSubmit={{
                        onClick: () => {
                            setProgress(0);

                            fundService
                                .update(fund.organization_id, fund.id, {
                                    disable_physical_card_types: [physicalCardType.id],
                                })
                                .then(() => {
                                    modal.close();
                                    onDone?.();
                                })
                                .catch(pushApiError)
                                .finally(() => setProgress(100));
                        },
                    }}
                    buttonCancel={{ onClick: modal.close }}
                />
            ));
        },
        [fundService, openModal, pushApiError, setProgress],
    );
};
