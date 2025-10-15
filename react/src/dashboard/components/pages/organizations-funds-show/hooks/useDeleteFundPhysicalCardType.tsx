import { useCallback } from 'react';
import useOpenModal from '../../../../hooks/useOpenModal';
import React from 'react';
import Fund from '../../../../props/models/Fund';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushApiError from '../../../../hooks/usePushApiError';
import FundPhysicalCardType from '../../../../props/models/FundPhysicalCardType';
import { useFundPhysicalCardTypeService } from '../../../../services/FundPhysicalCardTypeService';

export const useDeleteFundPhysicalCardType = () => {
    const openModal = useOpenModal();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const fundPhysicalCardTypeService = useFundPhysicalCardTypeService();

    return useCallback(
        (fund: Fund, fundPhysicalCardType: FundPhysicalCardType, onDone?: () => void) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={'Verwijderen'}
                    description={'Weet u zeker dat u deze fysieke pas wilt verwijderen?'}
                    buttonSubmit={{
                        onClick: (_, setDisabledByClick) => {
                            setProgress(0);

                            fundPhysicalCardTypeService
                                .delete(fund.organization_id, fundPhysicalCardType.id)
                                .then(() => {
                                    modal.close();
                                    onDone?.();
                                })
                                .catch(pushApiError)
                                .finally(() => {
                                    setProgress(100);
                                    setDisabledByClick(false);
                                });
                        },
                    }}
                    buttonCancel={{ onClick: modal.close }}
                />
            ));
        },
        [fundPhysicalCardTypeService, openModal, pushApiError, setProgress],
    );
};
