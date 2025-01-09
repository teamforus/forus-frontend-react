import React, { Fragment } from 'react';
import Product from '../../../../../props/models/Product';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useAuthIdentity from '../../../../../hooks/useAuthIdentity';
import { clickOnKeyEnter } from '../../../../../../dashboard/helpers/wcag';
import { useProductService } from '../../../../../services/ProductService';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';

export default function ProductsListItemList({
    price,
    product,
    toggleBookmark,
}: {
    price: string;
    product?: Product;
    toggleBookmark: (e: React.MouseEvent) => void;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    const authIdentity = useAuthIdentity();
    const productService = useProductService();

    return (
        <Fragment>
            <div className="product-photo">
                <img
                    src={product.photo?.sizes?.thumbnail || assetUrl('/assets/img/placeholders/product-thumbnail.png')}
                    alt={productService.transformProductAlternativeText(product)}
                />
            </div>
            <div className="product-content">
                <div className="product-details">
                    <h3 className="product-title" data-dusk="productName">
                        {product.name}
                    </h3>
                    <div className="product-subtitle">{product.organization.name}</div>
                    <div className="product-price">{price}</div>
                </div>
                <div className="product-actions">
                    {authIdentity && (
                        <div
                            className={`block block-bookmark-toggle ${product.bookmarked ? 'active' : ''}`}
                            onClick={toggleBookmark}
                            onKeyDown={clickOnKeyEnter}
                            role={'button'}
                            tabIndex={0}
                            aria-label={translate('list_blocks.product_item_list.bookmark')}
                            aria-pressed={product.bookmarked}>
                            {product.bookmarked ? (
                                <em className="mdi mdi-cards-heart" />
                            ) : (
                                <em className="mdi mdi-cards-heart-outline" />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    );
}
