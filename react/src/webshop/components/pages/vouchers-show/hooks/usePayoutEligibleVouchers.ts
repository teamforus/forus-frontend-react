import { useMemo } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import { ProfileBankAccount } from '../../../../../dashboard/props/models/Sponsor/SponsorIdentity';

export default function usePayoutEligibleVouchers(
    vouchers?: Array<Voucher> | null,
    fundRequestAccounts?: Array<ProfileBankAccount> | null,
): Array<Voucher> {
    return useMemo(() => {
        if (!Array.isArray(vouchers) || vouchers.length === 0) {
            return [];
        }

        if (!Array.isArray(fundRequestAccounts) || fundRequestAccounts.length === 0) {
            return [];
        }

        return vouchers
            .filter((voucher) => voucher?.fund?.allow_voucher_payouts)
            .filter((voucher) => voucher?.type !== 'product')
            .filter((voucher) => !voucher?.product_reservation?.id)
            .filter((voucher) => !voucher?.expired && !voucher?.deactivated && !voucher?.external);
    }, [fundRequestAccounts, vouchers]);
}
