import { useMemo } from 'react';
import Voucher from '../../../dashboard/props/models/Voucher';
import useComposeVoucherCardData from './useComposeVoucherCardData';

export default function useVoucherData(voucher?: Voucher) {
    const composeVoucherCardData = useComposeVoucherCardData();

    return useMemo(() => {
        return voucher ? composeVoucherCardData(voucher) : null;
    }, [voucher, composeVoucherCardData]);
}
