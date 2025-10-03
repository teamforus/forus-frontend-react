import React, { useCallback } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import ModalPhysicalCardUnlink from '../../../modals/ModalPhysicalCardUnlink';
import { useVoucherService } from '../../../../services/VoucherService';
import useOpenModal from '../../../../../dashboard/hooks/useOpenModal';
import useLinkVoucherPhysicalCard from './useLinkVoucherPhysicalCard';

export default function useUnlinkVoucherPhysicalCard() {
    const openModal = useOpenModal();
    const voucherService = useVoucherService();
    const linkPhysicalCard = useLinkVoucherPhysicalCard();

    return useCallback(
        (voucher: Voucher, fetchVoucher: () => void, setVoucher: React.Dispatch<React.SetStateAction<Voucher>>) => {
            const cardType = voucher?.fund?.fund_physical_card_types?.find(
                (type) => type.physical_card_type_id === voucher.physical_card?.physical_card_type_id,
            );

            openModal((modal) => (
                <ModalPhysicalCardUnlink
                    modal={modal}
                    voucher={voucher}
                    onPhysicalCardUnlinked={() => fetchVoucher()}
                    cardType={cardType}
                    onClose={(requestNew) => {
                        voucherService.get(voucher.number).then((res) => {
                            setVoucher(res.data.data);

                            if (requestNew && cardType) {
                                linkPhysicalCard(res.data.data, cardType, 'select_type', fetchVoucher);
                            }
                        });
                    }}
                />
            ));
        },
        [linkPhysicalCard, openModal, voucherService],
    );
}
