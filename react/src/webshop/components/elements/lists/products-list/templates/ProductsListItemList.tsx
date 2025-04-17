import React, { Fragment } from 'react';
import Product from '../../../../../props/models/Product';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useAuthIdentity from '../../../../../hooks/useAuthIdentity';
import { clickOnKeyEnter } from '../../../../../../dashboard/helpers/wcag';
import { useProductService } from '../../../../../services/ProductService';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import useShowProductPaymentOptionsInfoModal from '../../../../../hooks/useShowProductPaymentOptionsInfoModal';
import useProductFeatures from '../../../../../hooks/useProductFeatures';

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
    const showProductIconsInfoModal = useShowProductPaymentOptionsInfoModal();

    const authIdentity = useAuthIdentity();
    const productFeatures = useProductFeatures(product);

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
                    <div className="product-details-header">
                        <h3 className="product-title" data-dusk="productName">
                            {product.name}
                        </h3>
                        <div className="product-subtitle">{product.organization.name}</div>
                    </div>

                    <div className="product-details-bookmark">
                        {authIdentity && (
                            <div
                                className={`block block-bookmark-toggle ${product.bookmarked ? 'active' : ''}`}
                                onClick={toggleBookmark}
                                onKeyDown={clickOnKeyEnter}
                                role={'button'}
                                tabIndex={0}
                                aria-label={translate('list_blocks.product_item.bookmark')}
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

                <div className="product-actions">
                    <div className="product-price">{price}</div>
                    <div className="product-icons">
                        {productFeatures?.scanning_enabled && (
                            <div
                                className="product-icons-item"
                                role="button"
                                tabIndex={0}
                                aria-label={translate('list_blocks.product_item.payment_option_qr_aria_label')}
                                onClick={(e) => {
                                    e.preventDefault();
                                    showProductIconsInfoModal();
                                }}
                                onKeyDown={(e) => clickOnKeyEnter(e, true)}>
                                <em className="mdi mdi-qrcode-scan" aria-hidden="true" />
                                {translate('list_blocks.product_item.payment_option_qr')}
                            </div>
                        )}
                        {productFeatures?.reservations_enabled && (
                            <div
                                className="product-icons-item"
                                role="button"
                                tabIndex={0}
                                aria-label={translate('list_blocks.product_item.payment_option_reservation_aria_label')}
                                onClick={(e) => {
                                    e.preventDefault();
                                    showProductIconsInfoModal();
                                }}
                                onKeyDown={(e) => clickOnKeyEnter(e, true)}>
                                <em className="mdi mdi-tag-multiple-outline" aria-hidden="true" />
                                {translate('list_blocks.product_item.payment_option_reservation')}
                            </div>
                        )}
                        {productFeatures?.reservation_extra_payments_enabled && (
                            <div
                                className="product-icons-item"
                                role="button"
                                tabIndex={0}
                                aria-label={translate('list_blocks.product_item.payment_option_ideal_aria_label')}
                                onClick={(e) => {
                                    e.preventDefault();
                                    showProductIconsInfoModal();
                                }}
                                onKeyDown={(e) => clickOnKeyEnter(e, true)}>
                                <img src={assetUrl('/assets/img/icon-ideal.svg')} alt="" aria-hidden="true" />
                                {translate('list_blocks.product_item.payment_option_ideal')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
