import { useMemo } from 'react';
import Voucher from '../../dashboard/props/models/Voucher';
import { ProfileBankAccount } from '../../dashboard/props/models/Sponsor/SponsorIdentity';
import usePayoutEligibleVouchers from '../components/pages/vouchers-show/hooks/usePayoutEligibleVouchers';
import { filterVouchersByVoucherPayoutButton, VoucherPayoutButtonType } from '../helpers/voucherPayoutButtons';

export default function usePayoutButtonVouchers(
    vouchers: Array<Voucher> | null | undefined,
    bankAccounts: Array<ProfileBankAccount> | null | undefined,
    buttonType: VoucherPayoutButtonType,
): Array<Voucher> {
    const payoutEligibleVouchers = usePayoutEligibleVouchers(vouchers?.filter(Boolean), bankAccounts);

    return useMemo(() => {
        return filterVouchersByVoucherPayoutButton(payoutEligibleVouchers, buttonType);
    }, [buttonType, payoutEligibleVouchers]);
}
