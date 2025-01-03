import React, { useCallback } from 'react';
import useOpenModal from '../../../dashboard/hooks/useOpenModal';
import ModalNotification from '../../components/modals/ModalNotification';
import useTranslate from '../../../dashboard/hooks/useTranslate';

export default function useConfirmReimbursementDestroy() {
    const openModal = useOpenModal();
    const translate = useTranslate();

    return useCallback((): Promise<boolean> => {
        return new Promise((resolve) => {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    type={'confirm'}
                    title={translate('confirm_reimbursement_destroy.title')}
                    description={translate('confirm_reimbursement_destroy.description')}
                    mdiIconType={'warning'}
                    mdiIconClass="alert-outline"
                    confirmBtnText={translate('confirm_reimbursement_destroy.confirm_btn')}
                    onConfirm={() => resolve(true)}
                    onCancel={() => resolve(false)}
                />
            ));
        });
    }, [openModal, translate]);
}
