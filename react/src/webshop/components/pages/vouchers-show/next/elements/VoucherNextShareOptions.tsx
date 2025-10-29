import React from 'react';
import Voucher from '../../../../../../dashboard/props/models/Voucher';
import { clickOnKeyEnter } from '../../../../../../dashboard/helpers/wcag';
import useEnvData from '../../../../../hooks/useEnvData';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import useSendVoucherEmail from '../../hooks/useSendVoucherEmail';
import useOpenVoucherInMeModal from '../../hooks/useOpenVoucherInMeModal';
import usePrintVoucherQrCodeModal from '../../hooks/usePrintVoucherQrCodeModal';
import { ModalState } from '../../../../../../dashboard/modules/modals/context/ModalContext';

export default function VoucherNextShareOptions({
    voucher,
    callerModal,
}: {
    voucher: Voucher;
    callerModal: ModalState;
}) {
    const envData = useEnvData();
    const translate = useTranslate();

    const sendVoucherEmail = useSendVoucherEmail();
    const openVoucherInMeModal = useOpenVoucherInMeModal();
    const printVoucherQrCodeModal = usePrintVoucherQrCodeModal();

    return (
        <div className="block block-voucher-share-options">
            <button
                type={'button'}
                className="share-option"
                onKeyDown={clickOnKeyEnter}
                onClick={() => {
                    callerModal?.close();
                    sendVoucherEmail(voucher);
                }}>
                <div className="share-option-icon">
                    <em className="mdi mdi-email-outline" aria-hidden="true" />
                </div>
                {translate('modal_physical_card.modal_section.request_new_card.email_to_me')}
            </button>
            <button
                type={'button'}
                className="share-option"
                onKeyDown={clickOnKeyEnter}
                onClick={() => {
                    callerModal?.close();
                    openVoucherInMeModal();
                }}>
                <div className="share-option-icon">
                    <em className="mdi mdi-cellphone" aria-hidden="true" />
                </div>
                {translate('modal_physical_card.modal_section.request_new_card.open_in_app')}
            </button>

            {!envData.config?.flags?.noPrintOption && (
                <button
                    type={'button'}
                    className="share-option"
                    onKeyDown={clickOnKeyEnter}
                    onClick={() => {
                        callerModal?.close();
                        printVoucherQrCodeModal(voucher);
                    }}>
                    <div className="share-option-icon">
                        <em className="mdi mdi-printer" aria-hidden="true" />
                    </div>
                    {translate('modal_physical_card.modal_section.request_new_card.print_pass')}
                </button>
            )}
        </div>
    );
}
