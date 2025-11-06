import React, { useCallback } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import { useVoucherService } from '../../../../services/VoucherService';
import useOpenModal from '../../../../../dashboard/hooks/useOpenModal';
import ModalNotification from '../../../modals/ModalNotification';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import { useHelperService } from '../../../../../dashboard/services/HelperService';
import useAuthIdentity from '../../../../hooks/useAuthIdentity';
import { useNavigateState } from '../../../../modules/state_router/Router';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function useSendVoucherEmail() {
    const authIdentity = useAuthIdentity();

    const translate = useTranslate();
    const openModal = useOpenModal();
    const navigateState = useNavigateState();

    const helperService = useHelperService();
    const voucherService = useVoucherService();

    return useCallback(
        function (voucher: Voucher) {
            if (!authIdentity.email) {
                return navigateState(WebshopRoutes.IDENTITY_EMAILS);
            }

            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    type={'confirm'}
                    title={translate('modal.email_voucher_to_me.title')}
                    mdiIconType="primary"
                    mdiIconClass={'email-open-outline'}
                    description={translate('modal.email_voucher_to_me.description')}
                    onConfirm={() => {
                        voucherService.sendToEmail(voucher.number).then(() => {
                            const emailServiceUrl = helperService.getEmailServiceProviderUrl(authIdentity?.email);

                            openModal((modal) => (
                                <ModalNotification
                                    modal={modal}
                                    type="action-result"
                                    title={translate('modal.email_voucher_to_me.title')}
                                    header={translate('popup_auth.notifications.confirmation')}
                                    mdiIconType="success"
                                    mdiIconClass="check-circle-outline"
                                    description={translate('popup_auth.notifications.voucher_email')}
                                    confirmBtnText={translate(
                                        emailServiceUrl ? 'email_service_switch.confirm' : 'buttons.close',
                                    )}
                                    onConfirm={() => helperService.openInNewTab(emailServiceUrl)}
                                />
                            ));
                        });
                    }}
                />
            ));
        },
        [authIdentity?.email, helperService, navigateState, openModal, translate, voucherService],
    );
}
