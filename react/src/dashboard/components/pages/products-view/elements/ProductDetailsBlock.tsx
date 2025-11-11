import React, { ReactNode, useState } from 'react';
import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';
import Product from '../../../../props/models/Product';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import Markdown from '../../../../../webshop/components/elements/markdown/Markdown';
import classNames from 'classnames';
import ProductDetailsBlockPropertiesPane from './panes/ProductDetailsBlockPropertiesPane';

export default function ProductDetailsBlock({
    product,
    viewType,
    showStockAndReservations = true,
    children = null,
}: {
    product: SponsorProduct | Product;
    viewType: 'sponsor' | 'provider';
    showStockAndReservations?: boolean;
    children?: ReactNode | ReactNode[];
}) {
    const assetUrl = useAssetUrl();
    const media = product?.photos || [];
    const [mediaIndex, setMediaIndex] = useState(0);

    const handlePrev = () => {
        setMediaIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setMediaIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
    };

    const handleDotClick = (index: number) => {
        setMediaIndex(index);
    };

    return (
        <div className="block block-product">
            <div className="block-product-media">
                <img
                    src={media[mediaIndex]?.sizes?.small || assetUrl('/assets/img/placeholders/product-small.png')}
                    alt={product.name}
                />

                {media?.length > 1 && (
                    <div className="block-product-media-list">
                        <button
                            type="button"
                            className="block-product-media-list-prev"
                            onClick={handlePrev}
                            aria-label="Previous image">
                            <em className="mdi mdi-chevron-left" aria-hidden="true" />
                        </button>

                        <div className="block-product-media-list-dots" role="tablist" aria-label="Product images">
                            {media?.map((item, index) => (
                                <button
                                    type="button"
                                    className={classNames(
                                        'block-product-media-list-dot',
                                        mediaIndex === index && 'block-product-media-list-dot-active',
                                    )}
                                    key={item.uid}
                                    onClick={() => handleDotClick(index)}
                                    aria-label={`Show image ${index + 1}`}
                                    aria-current={mediaIndex === index}
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            className="block-product-media-list-next"
                            onClick={handleNext}
                            aria-label="Next image">
                            <em className="mdi mdi-chevron-right" aria-hidden="true" />
                        </button>
                    </div>
                )}
            </div>

            <div className="block-product-content flex-grow">
                <div className="flex flex-gap">
                    <div className="block-product-details flex-grow">
                        <div className="block-product-name">{product.name}</div>
                        <div className="block-product-price">{product.price_locale}</div>
                    </div>
                </div>

                <Markdown content={product.description_html} className={'block-product-description'} />

                <div className="block-product-separator" />

                <ProductDetailsBlockPropertiesPane
                    product={product}
                    viewType={viewType}
                    showStockAndReservations={showStockAndReservations}
                    showName={false}
                />

                {children}
            </div>
        </div>
    );
}
