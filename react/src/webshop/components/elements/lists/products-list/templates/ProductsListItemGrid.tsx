import React from 'react';
import Product from '../../../../../props/models/Product';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useAuthIdentity from '../../../../../hooks/useAuthIdentity';
import { clickOnKeyEnter } from '../../../../../../dashboard/helpers/wcag';
import { useProductService } from '../../../../../services/ProductService';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import useProductFeatures from '../../../../../hooks/useProductFeatures';

export default function ProductsListItemGrid({
    price,
    product,
    toggleBookmark,
}: {
    price: string;
    product?: Product;
    toggleBookmark: (e: React.MouseEvent) => void;
}) {
    const authIdentity = useAuthIdentity();
    const productFeatures = useProductFeatures(product);

    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    const productService = useProductService();

    return (
        <div className="product-content">
            {authIdentity && (
                <div
                    onClick={toggleBookmark}
                    onKeyDown={clickOnKeyEnter}
                    role={'button'}
                    tabIndex={0}
                    className={`block block-bookmark-toggle ${product.bookmarked ? 'active' : ''}`}
                    aria-label={translate('list_blocks.product_item.bookmark')}
                    aria-pressed={product.bookmarked}>
                    {product.bookmarked ? (
                        <em className="mdi mdi-cards-heart" />
                    ) : (
                        <em className="mdi mdi-cards-heart-outline" />
                    )}
                </div>
            )}
            <div className="product-photo">
                <img
                    src={product.photos[0]?.sizes?.small || assetUrl('/assets/img/placeholders/product-small.png')}
                    alt={productService.transformProductAlternativeText(product)}
                />
            </div>
            <div className="product-details">
                <h3 className="product-title" data-dusk="productName">
                    {product.name}
                </h3>
                <div className="product-subtitle">{product.organization.name}</div>
            </div>
            <div className="product-actions">
                <div className="product-price">
                    {product?.price_type === 'informational' && <em className="mdi mdi-storefront-outline" />}
                    {price}
                </div>
                <div className="product-icons">
                    {productFeatures?.feature_scanning_enabled && (
                        <div className="product-icons-item">
                            <em className="mdi mdi-qrcode-scan" aria-hidden="true" />
                            <span className="sr-only">
                                {translate('list_blocks.product_item.payment_option_qr_aria_label')}
                            </span>
                        </div>
                    )}
                    {productFeatures?.feature_reservations_enabled && (
                        <div className="product-icons-item">
                            <em className="mdi mdi-tag-multiple-outline" aria-hidden="true" />
                            <span className="sr-only">
                                {translate('list_blocks.product_item.payment_option_reservation_aria_label')}
                            </span>
                        </div>
                    )}
                    {productFeatures?.feature_reservation_extra_payments_enabled && (
                        <div className="product-icons-item">
                            <img src={assetUrl('/assets/img/icon-ideal.svg')} alt="" aria-hidden="true" />
                            <span className="sr-only">
                                {translate('list_blocks.product_item.payment_option_ideal_aria_label')}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
