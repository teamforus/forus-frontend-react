import Fund from '../../../../../dashboard/props/models/Fund';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import BlockProducts from '../../../elements/block-products/BlockProducts';
import { PaginationData } from '../../../../../dashboard/props/ApiResponses';
import Product from '../../../../props/models/Product';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import { useProductService } from '../../../../services/ProductService';

export default function FundProductsBlock({ fund }: { fund: Fund }) {
    const [products, setProducts] = useState<PaginationData<Product>>(null);

    const productService = useProductService();

    const setProgress = useSetProgress();

    const fetchProducts = useCallback(() => {
        setProgress(0);

        productService
            .list({ per_page: 6, fund_id: fund?.id })
            .then((res) => setProducts(res.data))
            .finally(() => setProgress(100));
    }, [fund?.id, productService, setProgress]);

    useEffect(() => {
        if (fund) {
            fetchProducts();
        }
    }, [fund, fetchProducts]);

    return (
        <Fragment>
            {products && (!fund.description_html || fund.description_position !== 'replace') && (
                <BlockProducts display={'grid'} products={products.data} filters={{ fund_id: fund.id }} />
            )}
        </Fragment>
    );
}
