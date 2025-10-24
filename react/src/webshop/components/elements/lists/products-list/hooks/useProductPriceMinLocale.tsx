import { useMemo } from 'react';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import Product from '../../../../../props/models/Product';

export default function useProductPriceMinLocale(product: Product) {
    const translate = useTranslate();

    return useMemo(() => {
        if (!product) {
            return null;
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
    }, [product, translate]);
}
