import BlockProducts from '../../../elements/block-products/BlockProducts';
import React, { useCallback, useEffect, useState } from 'react';
import { PaginationData } from '../../../../../dashboard/props/ApiResponses';
import Product from '../../../../../dashboard/props/models/Product';
import { useProductService } from '../../../../services/ProductService';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';

export default function RandomProductsBlock({
    count,
    title,
    showCustomDescription = false,
}: {
    count: number;
    title?: string;
    showCustomDescription?: boolean;
}) {
    const setProgress = useSetProgress();
    const productService = useProductService();

    const [products, setProducts] = useState<PaginationData<Product>>(null);

    const fetchProducts = useCallback(() => {
        setProgress(0);

        productService
            .sample(count)
            .then((res) => setProducts(res.data))
            .catch((e) => console.error(e))
            .finally(() => setProgress(100));
    }, [productService, setProgress, count]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return products?.data.length > 0 ? (
        <BlockProducts
            title={title}
            products={products.data}
            setProducts={(list) => setProducts({ ...products, data: list })}
            display="grid"
            showCustomDescription={showCustomDescription}
        />
    ) : null;
}
