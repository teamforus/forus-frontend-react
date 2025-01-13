import { useCallback } from 'react';
import Voucher from '../../../dashboard/props/models/Voucher';
import { AppConfigProp } from '../../../dashboard/services/ConfigService';
import Fund from '../../props/models/Fund';
import PayoutTransaction from '../../../dashboard/props/models/PayoutTransaction';

export default function useFundMetaBuilder() {
    return useCallback(
        (
            fund: Fund,
            vouchers: Array<Voucher>,
            payoutTransactions: Array<PayoutTransaction>,
            configs: AppConfigProp,
        ) => {
            if (!fund || !vouchers) {
                return null;
            }

            const vouchersList = vouchers.filter((voucher) => voucher.fund_id == fund.id && !voucher.expired);
            const payoutsList = payoutTransactions.filter((payout) => payout.fund.id == fund.id);

            const isApplicable =
                !fund.received &&
                fund.criteria.length > 0 &&
                fund.criteria.filter((criterion) => !criterion.is_valid).length == 0;

            const alreadyReceived = vouchersList.length !== 0 || fund.received;
            const canApply = !fund.is_external && !alreadyReceived && isApplicable && !fund.has_pending_fund_requests;

            const showRequestButton =
                !alreadyReceived &&
                !fund.has_pending_fund_requests &&
                !isApplicable &&
                fund.allow_direct_requests &&
                configs.funds.fund_requests;

            const hasVouchers = vouchersList.length > 0;
            const hasPayouts = payoutsList.length > 0;

            const showPendingButton = !alreadyReceived && fund.has_pending_fund_requests;
            const showActivateButton = !alreadyReceived && isApplicable;

            const linkPrimaryButton =
                [showRequestButton, showPendingButton, showActivateButton, alreadyReceived].filter((flag) => flag)
                    .length === 0;

            return {
                ...fund,
                vouchers: vouchersList,
                payouts: payoutsList,
                canApply,
                hasPayouts,
                hasVouchers,
                isApplicable,
                alreadyReceived,
                linkPrimaryButton,
                showRequestButton,
                showPendingButton,
                showActivateButton,
            };
        },
        [],
    );
}
