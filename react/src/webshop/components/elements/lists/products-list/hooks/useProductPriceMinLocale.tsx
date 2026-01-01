import { useMemo } from 'react';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import Product from '../../../../../props/models/Product';
import useIsPayoutInfoProduct from '../../../../pages/products-show/hooks/useIsPayoutInfoProduct';
import useAppConfigs from '../../../../../hooks/useAppConfigs';

export default function useProductPriceMinLocale(product: Product) {
    const appConfigs = useAppConfigs();
    const translate = useTranslate();
    const isPayoutInfoProduct = useIsPayoutInfoProduct(product, appConfigs);

    return useMemo(() => {
        if (!product) {
            return null;
        }

        if (isPayoutInfoProduct) {
            return translate('product.price.payout');
        }

        if (product.price_type === 'informational') {
            return translate('product.price.informational');
        }

        if (product.price_type !== 'regular') {
            return product.price_locale;
        }

        if (product.price_min == '0.00') {
            return translate('product.price.free');
        }

        return product.price_min_locale;
    }, [isPayoutInfoProduct, product, translate]);
}
