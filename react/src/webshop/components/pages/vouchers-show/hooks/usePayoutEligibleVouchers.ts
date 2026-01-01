import { useMemo } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';

export default function usePayoutEligibleVouchers(vouchers?: Array<Voucher> | null): Array<Voucher> {
    return useMemo(() => {
        if (!Array.isArray(vouchers)) {
            return [];
        }

        return vouchers
            .filter((voucher) => voucher?.fund?.allow_voucher_payouts)
            .filter((voucher) => voucher?.type !== 'product')
            .filter((voucher) => !voucher?.product_reservation?.id)
            .filter((voucher) => voucher?.fund_request?.iban && voucher?.fund_request?.iban_name)
            .filter((voucher) => !voucher?.expired && !voucher?.deactivated && !voucher?.external);
    }, [vouchers]);
}
