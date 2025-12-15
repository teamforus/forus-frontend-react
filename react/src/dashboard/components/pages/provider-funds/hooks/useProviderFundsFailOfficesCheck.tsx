import React, { useCallback } from 'react';
import ModalNotification from '../../../modals/ModalNotification';
import useOpenModal from '../../../../hooks/useOpenModal';
import useTranslate from '../../../../hooks/useTranslate';

export default function useProviderFundsFailOfficesCheck() {
    const openModal = useOpenModal();
    const translate = useTranslate();

    return useCallback(() => {
        openModal((modal) => (
            <ModalNotification
                modal={modal}
                title={translate('provider_funds.available.error_apply.title')}
                description={translate('provider_funds.available.error_apply.description')}
                buttonCancel={{
                    text: translate('modal.buttons.cancel'),
                    onClick: modal.close,
                }}
            />
        ));
    }, [openModal, translate]);
}
