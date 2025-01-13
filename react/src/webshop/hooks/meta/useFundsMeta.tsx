import { useMemo } from 'react';
import Voucher from '../../../dashboard/props/models/Voucher';
import { AppConfigProp } from '../../../dashboard/services/ConfigService';
import useFundMetaBuilder from './useFundMetaBuilder';
import Fund from '../../props/models/Fund';
import PayoutTransaction from '../../../dashboard/props/models/PayoutTransaction';

export default function useFundsMeta(
    funds: Array<Fund>,
    vouchers: Array<Voucher>,
    payoutTransactions: Array<PayoutTransaction>,
    configs: AppConfigProp,
) {
    const fundMetaBuilder = useFundMetaBuilder();

    return useMemo(() => {
        return funds.map((fund) => fundMetaBuilder(fund, vouchers, payoutTransactions, configs));
    }, [funds, fundMetaBuilder, vouchers, payoutTransactions, configs]);
}
