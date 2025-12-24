import { useMemo } from 'react';
import Product from '../../../../props/models/Product';
import { AppConfigProp } from '../../../../../dashboard/services/ConfigService';

export default function useIsPayoutInfoProduct(product: Product, appConfigs: AppConfigProp) {
    return useMemo(() => {
        return appConfigs?.implementation?.voucher_payout_informational_product_id === product?.id;
    }, [appConfigs?.implementation?.voucher_payout_informational_product_id, product?.id]);
}
