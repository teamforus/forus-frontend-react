import { useMemo } from 'react';
import Voucher from '../../../dashboard/props/models/Voucher';
import { AppConfigProp } from '../../../dashboard/services/ConfigService';
import useFundMetaBuilder from './useFundMetaBuilder';
import Fund from '../../props/models/Fund';
import PayoutTransaction from '../../../dashboard/props/models/PayoutTransaction';

export default function useFundMeta(
    fund: Fund,
    payouts: Array<PayoutTransaction>,
    vouchers: Array<Voucher>,
    configs: AppConfigProp,
) {
    const fundMetaBuilder = useFundMetaBuilder();

    return useMemo(() => {
        return fundMetaBuilder(fund, payouts, vouchers, configs);
    }, [fundMetaBuilder, fund, vouchers, payouts, configs]);
}
