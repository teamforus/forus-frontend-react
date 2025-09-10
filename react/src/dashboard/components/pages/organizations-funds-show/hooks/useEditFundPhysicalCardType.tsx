import { useCallback } from 'react';
import useOpenModal from '../../../../hooks/useOpenModal';
import React from 'react';
import ModalEditFundPhysicalCardType from '../../../modals/ModalAssignPhysicalCardToFund';
import Fund from '../../../../props/models/Fund';
import Organization from '../../../../props/models/Organization';
import FundPhysicalCardType from '../../../../props/models/FundPhysicalCardType';

export const useEditFundPhysicalCardType = () => {
    const openModal = useOpenModal();

    return useCallback(
        (
            organization: Organization,
            fund: Fund,
            fundPhysicalCardType: FundPhysicalCardType,
            exclude: number[],
            onDone?: () => void,
        ) => {
            openModal((modal) => (
                <ModalEditFundPhysicalCardType
                    organization={organization}
                    fundPhysicalCardType={fundPhysicalCardType}
                    modal={modal}
                    fund={fund}
                    onDone={onDone}
                    exclude={exclude}
                />
            ));
        },
        [openModal],
    );
};
