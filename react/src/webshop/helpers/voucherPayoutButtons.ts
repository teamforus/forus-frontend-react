import Voucher from '../../dashboard/props/models/Voucher';

export type VoucherPayoutButtonType = 'vouchers' | 'payouts' | 'products';

export function filterVouchersByVoucherPayoutButton(
    vouchers: Array<Voucher> | null | undefined,
    buttonType: VoucherPayoutButtonType,
): Array<Voucher> {
    return (vouchers || []).filter((voucher) => voucher?.fund?.allow_voucher_payout_buttons?.[buttonType] ?? true);
}
