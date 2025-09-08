import React, { useCallback } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import useOpenModal from '../../../../../dashboard/hooks/useOpenModal';
import PhysicalCardType from '../../../../../dashboard/props/models/PhysicalCardType';
import ModalPhysicalCardType from '../../../modals/ModalPhysicalCardType';
import useSendVoucherEmail from './useSendVoucherEmail';
import useOpenVoucherInMeModal from './useOpenVoucherInMeModal';
import usePrintVoucherQrCodeModal from './usePrintVoucherQrCodeModal';

export default function useLinkVoucherPhysicalCard() {
    const openModal = useOpenModal();

    const sendVoucherEmail = useSendVoucherEmail();
    const openVoucherInMeModal = useOpenVoucherInMeModal();
    const printVoucherQrCodeModal = usePrintVoucherQrCodeModal();

    return useCallback(
        (
            voucher: Voucher,
            typeCard: PhysicalCardType,
            state: 'select_type' | 'card_code',
            fetchVoucher: () => void,
        ) => {
            openModal((modal) => (
                <ModalPhysicalCardType
                    modal={modal}
                    voucher={voucher}
                    typeCard={typeCard}
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
