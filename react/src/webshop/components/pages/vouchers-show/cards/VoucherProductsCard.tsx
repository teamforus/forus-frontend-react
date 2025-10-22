import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import BlockProducts from '../../../elements/block-products/BlockProducts';
import { PaginationData } from '../../../../../dashboard/props/ApiResponses';
import Product from '../../../../props/models/Product';
import { useProductService } from '../../../../services/ProductService';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import useAppConfigs from '../../../../hooks/useAppConfigs';

export default function VoucherProductsCard({ voucher }: { voucher: Voucher }) {
    const appConfigs = useAppConfigs();
    const setProgress = useSetProgress();
    const productService = useProductService();

    const [products, setProducts] = useState<PaginationData<Product>>(null);

    const showProducts = useMemo(
        () =>
            !voucher?.expired &&
            !voucher?.deactivated &&
            !voucher?.product &&
            !voucher?.external &&
            appConfigs?.products.list,
        [appConfigs, voucher],
    );

    const fetchProducts = useCallback(
        (voucher: Voucher) => {
            setProgress(0);

            productService
                .list({ sample: 1, per_page: 6, fund_id: voucher.fund_id })
                .then((res) => setProducts(res.data))
                .finally(() => setProgress(100));
        },
        [setProgress, productService],
    );

    useEffect(() => {
        if (voucher && !voucher.product && !voucher?.fund?.external) {
            fetchProducts(voucher);
        }
    }, [fetchProducts, voucher]);

    return (
        <Fragment>
            {showProducts && products && (
                <BlockProducts products={products.data} filters={{ fund_id: voucher.fund_id }} />
            )}
        </Fragment>
    );
}
