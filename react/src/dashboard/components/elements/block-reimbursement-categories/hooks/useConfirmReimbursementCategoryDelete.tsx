import React, { useCallback } from 'react';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import useOpenModal from '../../../../hooks/useOpenModal';
import { useTranslation } from 'react-i18next';

export default function useConfirmReimbursementCategoryDelete() {
    const { t } = useTranslation();
    const openModal = useOpenModal();

    return useCallback((): Promise<boolean> => {
        return new Promise((resolve) =>
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={t('modals.danger_zone.remove_reimbursement_category.title')}
                    description={t('modals.danger_zone.remove_reimbursement_category.description')}
                    buttonCancel={{
                        text: t('modals.danger_zone.remove_reimbursement_category.buttons.cancel'),
                        onClick: () => {
                            modal.close();
                            resolve(false);
                        },
                    }}
                    buttonSubmit={{
                        text: t('modals.danger_zone.remove_reimbursement_category.buttons.confirm'),
                        onClick: () => {
                            modal.close();
                            resolve(true);
                        },
                    }}
                />
            )),
        );
    }, [openModal, t]);
}
