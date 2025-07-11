import Product from '../props/models/Product';
import { useMemo } from 'react';

export default function useProductFeatures(product: Product) {
    return useMemo(
        () => ({
            feature_scanning_enabled: product?.funds?.some((fund) => fund.feature_scanning_enabled),
            feature_reservations_enabled: product?.funds?.some((fund) => fund.feature_reservations_enabled),
            feature_reservation_extra_payments_enabled: product?.funds?.some(
                (fund) => fund.feature_reservation_extra_payments_enabled,
            ),
        }),
        [product],
    );
}
