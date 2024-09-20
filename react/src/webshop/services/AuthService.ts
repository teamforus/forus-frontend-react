import { useCallback } from 'react';
import { useFundService } from './FundService';
import { useVoucherService } from './VoucherService';
import useEnvData from '../hooks/useEnvData';
import { useNavigateState } from '../modules/state_router/Router';

export function useAuthService() {
    const envData = useEnvData();
    const navigateState = useNavigateState();

    const fundService = useFundService();
    const voucherService = useVoucherService();

    const onAuthRedirect = useCallback(
        async (defaultState: false | string = 'home', defaultStateParams = {}) => {
            const funds = await fundService.list().then((res) => res.data.data);
            const vouchers = await voucherService.list({ per_page: 100 }).then((res) => res.data.data);

            const takenFundIds = vouchers.filter((voucher) => !voucher.expired).map((voucher) => voucher.fund_id);
            const fundsList = funds.filter((fund) => fund.allow_direct_requests);
            const fundsNoVouchers = fundsList.filter((fund) => takenFundIds.indexOf(fund.id) === -1);
            const fundsWithVouchers = fundsList.filter((fund) => takenFundIds.indexOf(fund.id) !== -1);

            // There are funds without vouchers
            if (fundsNoVouchers.length > 0) {
                // Apply to the first form the list
                if (envData.config.flags.activateFirstFund || fundsNoVouchers.length == 1) {
                    return navigateState('fund-activate', { id: fundsNoVouchers[0].id });
                }

                // Go to funds list
                return navigateState('funds');
            }

            // There are funds with vouchers
            if (fundsWithVouchers.length > 0) {
                // Go to the first vouchers
                if (fundsWithVouchers.length === 1) {
                    return navigateState('voucher', {
                        address: vouchers.find((voucher) => voucher.fund_id === fundsWithVouchers[0].id).address,
                    });
                }

                // Go to vouchers list
                return navigateState('vouchers');
            }

            // Otherwise go home
            return defaultState !== false ? navigateState(defaultState, defaultStateParams) : false;
        },
        [envData.config?.flags?.activateFirstFund, fundService, navigateState, voucherService],
    );

    const handleAuthTarget = useCallback(
        (rawTarget: string = null) => {
            const target = rawTarget ? rawTarget.split('-') : null;

            if (target && target[0] == 'fundRequest') {
                target[1] ? navigateState('fund-request', { id: target[1] }) : navigateState('start', {});
                return true;
            }

            if (target && target[0] == 'voucher') {
                navigateState('voucher', { address: target[1] });
                return true;
            }

            if (target && target[0] == 'requestClarification') {
                target[1]
                    ? navigateState('fund-request-clarification', {
                          fund_id: target[1],
                          request_id: target[2],
                          clarification_id: target[3],
                      })
                    : navigateState('start', {});

                return true;
            }

            if (target && target[0] == 'productReservation') {
                target[1] ? navigateState('product', { id: target[1] }) : navigateState('start', {});
                return true;
            }

            return false;
        },
        [navigateState],
    );

    return { onAuthRedirect, handleAuthTarget };
}
