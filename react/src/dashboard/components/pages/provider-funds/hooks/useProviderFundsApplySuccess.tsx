import React, { useCallback } from 'react';
import ModalNotification from '../../../modals/ModalNotification';
import useOpenModal from '../../../../hooks/useOpenModal';
import useTranslate from '../../../../hooks/useTranslate';

export default function useProviderFundsApplySuccess() {
    const openModal = useOpenModal();
    const translate = useTranslate();

    return useCallback(() => {
        openModal((modal) => (
            <ModalNotification
                modal={modal}
                title={translate('provider_funds.available.applied_for_fund.title')}
                description={translate('provider_funds.available.applied_for_fund.description')}
                icon={'fund_applied'}
                buttonSubmit={{
                    text: translate('modal.buttons.confirm'),
                    onClick: modal.close,
                }}
            />
        ));
    }, [openModal, translate]);
}
