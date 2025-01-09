import React from 'react';
import useOpenModal from '../../../dashboard/hooks/useOpenModal';
import { useCallback } from 'react';
import ModalNotification from '../../components/modals/ModalNotification';
import useTranslate from '../../../dashboard/hooks/useTranslate';

export default function useShowTakenByPartnerModal() {
    const openModal = useOpenModal();
    const translate = useTranslate();

    return useCallback(() => {
        openModal((modal) => (
            <ModalNotification
                modal={modal}
                type="info"
                title={translate('confirm_taken_by_partner.title')}
                header={translate('confirm_taken_by_partner.header')}
                mdiIconType="warning"
                mdiIconClass="alert-outline"
                closeBtnText={translate('confirm_taken_by_partner.close_btn')}
                description={translate('confirm_taken_by_partner.description')}
            />
        ));
    }, [openModal, translate]);
}
