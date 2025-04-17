import Product from '../props/models/Product';
import { useMemo } from 'react';

export default function useProductFeatures(product: Product) {
    return useMemo(
        () => ({
            scanning_enabled: product?.funds?.some((fund) => fund.scanning_enabled),
            reservations_enabled: product?.funds?.some((fund) => fund.reservations_enabled),
            reservation_extra_payments_enabled: product?.funds?.some((fund) => fund.reservation_extra_payments_enabled),
        }),
        [product],
    );
}
