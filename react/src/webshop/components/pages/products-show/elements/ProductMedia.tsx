import React, { useState } from 'react';
import Product from '../../../../props/models/Product';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import classNames from 'classnames';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import { useProductService } from '../../../../services/ProductService';

export default function ProductMedia({ product }: { product: Product }) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const productService = useProductService();

    const photos = product?.photos || [];
    const previewId = `product-media-img-${product.id}`;
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="product-overview-media">
            <div
                className="product-overview-media-preview"
                role={photos.length > 1 ? 'group' : undefined}
                aria-label={photos.length > 1 ? translate('product.labels.product_images') : undefined}
                aria-live={photos.length > 1 ? 'polite' : undefined}
                aria-atomic={photos.length > 1 ? 'true' : undefined}
                tabIndex={photos.length > 1 ? 0 : undefined}
                onKeyDown={(e) => {
                    if (photos.length > 1) {
                        if (e.key === 'ArrowLeft') setActiveIndex((i) => Math.max(0, i - 1));
                        if (e.key === 'ArrowRight') setActiveIndex((i) => Math.min(photos.length - 1, i + 1));
                    }
                }}>
                <img
                    className="product-overview-media-img"
                    id={previewId}
                    alt={productService.transformProductAlternativeText(product)}
                    src={photos[activeIndex]?.sizes?.large || assetUrl('/assets/img/placeholders/product-large.png')}
                />
            </div>

            {photos?.length > 1 && (
                <div className="product-overview-media-list">
                    <button
                        type="button"
                        className="product-overview-media-prev"
                        aria-label={translate('product.labels.previous_image')}
                        aria-controls={previewId}
                        onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                        disabled={activeIndex === 0}>
                        <em className="mdi mdi-chevron-left" aria-hidden="true" />
                    </button>
                    <div className="product-overview-media-items">
                        <div className="product-overview-media-items-list">
                            {photos.map((media, i) => (
                                <div
                                    className={classNames('product-overview-media-item', i === activeIndex && 'active')}
                                    key={media.uid}
                                    role="button"
                                    tabIndex={0}
                                    aria-current={i === activeIndex ? 'true' : undefined}
                                    aria-label={translate('product.labels.show_image_of_total', {
                                        current: i + 1,
                                        total: photos.length,
                                    })}
                                    onClick={() => setActiveIndex(i)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setActiveIndex(i);
                                        }
                                    }}>
                                    <img src={media.sizes.small} alt={''} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        type="button"
                        className="product-overview-media-next"
                        aria-label={translate('product.labels.next_image')}
                        aria-controls={previewId}
                        onClick={() => setActiveIndex((i) => Math.min(photos.length - 1, i + 1))}
                        disabled={activeIndex === photos.length - 1}>
                        <em className="mdi mdi-chevron-right" aria-hidden="true" />
                    </button>
                </div>
            )}
        </div>
    );
}
