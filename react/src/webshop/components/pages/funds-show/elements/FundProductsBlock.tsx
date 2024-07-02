import Fund from '../../../../../dashboard/props/models/Fund';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import BlockProducts from '../../../elements/block-products/BlockProducts';
import { PaginationData } from '../../../../../dashboard/props/ApiResponses';
import Product from '../../../../props/models/Product';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import { useProductService } from '../../../../services/ProductService';

export default function FundProductsBlock({ fund }: { fund: Fund }) {
    const [products, setProducts] = useState<PaginationData<Product>>(null);
    const [subsidies, setSubsidies] = useState<PaginationData<Product>>(null);

    const productService = useProductService();

    const setProgress = useSetProgress();

    const fetchProducts = useCallback(() => {
        setProgress(0);

        if (fund?.type === 'budget') {
            productService
                .list({ fund_type: 'budget', sample: 1, per_page: 6, fund_id: fund?.id })
                .then((res) => setProducts(res.data))
                .finally(() => setProgress(100));
        }

        if (fund?.type === 'subsidies') {
            productService
                .list({ fund_type: 'subsidies', sample: 1, per_page: 6, fund_id: fund?.id })
                .then((res) => setSubsidies(res.data))
                .finally(() => setProgress(100));
        }
    }, [fund?.id, fund?.type, productService, setProgress]);

    useEffect(() => {
        if (fund) {
            fetchProducts();
        }
    }, [fund, fetchProducts]);

    return (
        <Fragment>
            {products && (!fund.description_html || fund.description_position !== 'replace') && (
                <BlockProducts
                    type={'budget'}
                    display={'grid'}
                    large={false}
                    products={products.data}
                    filters={{ fund_id: fund.id }}
                />
            )}

            {subsidies && (!fund.description_html || fund.description_position !== 'replace') && (
                <BlockProducts
                    type={'subsidies'}
                    display={'grid'}
                    large={false}
                    products={subsidies.data}
                    filters={{ fund_id: fund.id }}
                />
            )}
        </Fragment>
    );
}
