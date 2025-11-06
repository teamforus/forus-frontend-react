import { useCallback } from 'react';
import { useFundService } from './FundService';
import { useVoucherService } from './VoucherService';
import useEnvData from '../hooks/useEnvData';
import { useNavigateState } from '../modules/state_router/Router';
import { WebshopRoutes } from '../modules/state_router/RouterBuilder';

export function useAuthService() {
    const envData = useEnvData();
    const navigateState = useNavigateState();

    const fundService = useFundService();
    const voucherService = useVoucherService();

    const onAuthRedirect = useCallback(
        async (defaultState: false | WebshopRoutes = WebshopRoutes.HOME, defaultStateParams = {}) => {
            const funds = await fundService.list().then((res) => res.data.data);
            const vouchers = await voucherService.list({ per_page: 100 }).then((res) => res.data.data);

            const takenFundIds = vouchers.filter((voucher) => !voucher.expired).map((voucher) => voucher.fund_id);
            const fundsList = funds.filter((fund) => fund.allow_direct_requests);
            const fundsNoVouchers = fundsList.filter((fund) => takenFundIds.indexOf(fund.id) === -1);
            const fundsWithVouchers = fundsList.filter((fund) => takenFundIds.indexOf(fund.id) !== -1);

            // There are funds without vouchers
            if (fundsNoVouchers.length > 0) {
                // Apply to the first form the list
                if (envData.config.flags.activateFirstFund || (funds.length === 1 && fundsNoVouchers.length == 1)) {
                    return navigateState(WebshopRoutes.FUND_ACTIVATE, { id: fundsNoVouchers[0].id });
                }

                // Go to funds list
                return navigateState(WebshopRoutes.FUNDS);
            }

            // There are funds with vouchers
            if (fundsWithVouchers.length > 0) {
                // Go to the first vouchers
                if (fundsWithVouchers.length === 1) {
                    return navigateState(WebshopRoutes.VOUCHER, {
                        number: vouchers.find((voucher) => voucher.fund_id === fundsWithVouchers[0].id).number,
                    });
                }

                // Go to vouchers list
                return navigateState(WebshopRoutes.VOUCHERS);
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
                if (target[1]) {
                    navigateState(WebshopRoutes.FUND_REQUEST, { id: target[1] });
                } else {
                    navigateState(WebshopRoutes.START, {});
                }
                return true;
            }

            if (target && target[0] == 'voucher') {
                navigateState(WebshopRoutes.VOUCHER, { number: target[1] });
                return true;
            }

            if (target && target[0] == 'requestClarification') {
                if (target[1]) {
                    navigateState(WebshopRoutes.FUND_REQUEST_CLARIFICATION, {
                        fund_id: target[1],
                        request_id: target[2],
                        clarification_id: target[3],
                    });
                } else {
                    navigateState(WebshopRoutes.START, {});
                }

                return true;
            }

            if (target && target[0] == 'productReservation') {
                if (target[1]) {
                    navigateState(WebshopRoutes.PRODUCT, { id: target[1] });
                } else {
                    navigateState(WebshopRoutes.START, {});
                }
                return true;
            }

            return false;
        },
        [navigateState],
    );

    return { onAuthRedirect, handleAuthTarget };
}
