import React, { useCallback, useMemo } from 'react';
import Product from '../../../../props/models/Product';
import useBookmarkProductToggle from '../../../../services/helpers/useBookmarkProductToggle';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import ProductsListItemGrid from './templates/ProductsListItemGrid';
import ProductsListItemList from './templates/ProductsListItemList';
import ProductsListItemSearch from './templates/ProductsListItemSearch';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import classNames from 'classnames';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function ProductsListItem({
    display,
    product,
    stateParams = null,
    onToggleBookmark = null,
}: {
    display: 'grid' | 'list' | 'search';
    product: Product;
    stateParams?: object;
    onToggleBookmark?: (product: Product) => void;
}) {
    const translate = useTranslate();
    const bookmarkProductToggle = useBookmarkProductToggle();

    const price = useMemo(() => {
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

    const toggleBookmark = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            product.bookmarked = await bookmarkProductToggle(product);
            onToggleBookmark?.(product);
        },
        [onToggleBookmark, product, bookmarkProductToggle],
    );

    return (
        <StateNavLink
            name={WebshopRoutes.PRODUCT}
            params={{ id: product.id }}
            state={stateParams || null}
            className={classNames(display === 'search' ? 'search-item' : 'product-item')}
            dataDusk={`listProductsRow${product.id}`}
            dataAttributes={{ 'data-search-item': 1 }}>
            {display === 'grid' && (
                <ProductsListItemGrid price={price} toggleBookmark={toggleBookmark} product={product} />
            )}

            {display === 'list' && (
                <ProductsListItemList price={price} toggleBookmark={toggleBookmark} product={product} />
            )}

            {display === 'search' && <ProductsListItemSearch product={product} />}
        </StateNavLink>
    );
}
