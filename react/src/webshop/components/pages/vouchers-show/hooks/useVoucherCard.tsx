import { useMemo } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import useComposeVoucherCardData from '../../../../services/helpers/useComposeVoucherCardData';

export default function useVoucherCard(voucher: Voucher) {
    const composeVoucherCardData = useComposeVoucherCardData();

    return useMemo(() => {
        return voucher ? composeVoucherCardData(voucher) : null;
    }, [voucher, composeVoucherCardData]);
}
