import React, { useCallback } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import useOpenModal from '../../../../../dashboard/hooks/useOpenModal';
import ModalPhysicalCardType from '../../../modals/ModalPhysicalCardType';
import useSendVoucherEmail from './useSendVoucherEmail';
import useOpenVoucherInMeModal from './useOpenVoucherInMeModal';
import usePrintVoucherQrCodeModal from './usePrintVoucherQrCodeModal';
import { InlineFundPhysicalCardType } from '../../../../../dashboard/props/models/Fund';

export default function useLinkVoucherPhysicalCard() {
    const openModal = useOpenModal();

    const sendVoucherEmail = useSendVoucherEmail();
    const openVoucherInMeModal = useOpenVoucherInMeModal();
    const printVoucherQrCodeModal = usePrintVoucherQrCodeModal();

    return useCallback(
        (
            voucher: Voucher,
            fundCardType: InlineFundPhysicalCardType,
            state: 'select_type' | 'card_code',
            fetchVoucher: () => void,
        ) => {
            openModal((modal) => (
                <ModalPhysicalCardType
                    modal={modal}
                    voucher={voucher}
                    fundCardType={fundCardType}
                    initialState={state}
                    onSendVoucherEmail={(voucher) => sendVoucherEmail(voucher)}
                    onOpenInMeModal={openVoucherInMeModal}
                    onPrintQrCode={printVoucherQrCodeModal}
                    onAttached={() => fetchVoucher()}
                />
            ));
        },
        [openVoucherInMeModal, openModal, printVoucherQrCodeModal, sendVoucherEmail],
    );
}
