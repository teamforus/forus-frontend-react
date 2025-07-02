import { useCallback } from 'react';
import FundProvider from '../../../../props/models/FundProvider';
import useConfirmFundProviderUpdateState from './useConfirmFundProviderUpdateState';
import useConfirmAcceptBudgetFundProvider from './useConfirmAcceptBudgetFundProvider';

export default function useConfirmFundProviderUpdate() {
    const confirmFundProviderUpdateState = useConfirmFundProviderUpdateState();
    const confirmAcceptBudgetFundProvider = useConfirmAcceptBudgetFundProvider();

    return useCallback(
        (
            fundProvider: FundProvider,
            state: 'accepted' | 'rejected',
        ): Promise<{
            state: string;
            allow_budget?: boolean;
            allow_products?: boolean;
        }> => {
            if (state === 'rejected') {
                return confirmFundProviderUpdateState(state);
            }

            return confirmAcceptBudgetFundProvider(fundProvider);
        },
        [confirmAcceptBudgetFundProvider, confirmFundProviderUpdateState],
    );
}
