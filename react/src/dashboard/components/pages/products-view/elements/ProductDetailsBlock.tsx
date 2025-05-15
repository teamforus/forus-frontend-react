import React, { ReactNode } from 'react';
import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';
import Product from '../../../../props/models/Product';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import useTranslate from '../../../../hooks/useTranslate';
import Markdown from '../../../../../webshop/components/elements/markdown/Markdown';
import ProductDetailsBlockProperties from './ProductDetailsBlockProperties';

export default function ProductDetailsBlock({
    product,
    viewType,
    toggleElement,
    showStockAndReservations = true,
}: {
    product: SponsorProduct | Product;
    viewType: 'sponsor' | 'provider';
    toggleElement?: ReactNode;
    showStockAndReservations?: boolean;
}) {
    const translate = useTranslate();
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-product">
            <div className="block-product-media">
                <img
                    src={product.photo?.sizes?.small || assetUrl('/assets/img/placeholders/product-small.png')}
                    alt={product.name}
                />
            </div>

            <div className="block-product-content flex-grow">
                <div className="flex flex-gap">
                    <div className="block-product-details flex-grow">
                        <div className="block-product-name">{product.name}</div>
                        <div className="block-product-price">{product.price_locale}</div>
                    </div>
                    <div className="flex flex-align-items-start">{toggleElement}</div>
                </div>

                <Markdown content={product.description_html} className={'block-product-description'} />

                <div className="block-product-separator" />

                <div className="flex flex-vertical">
                    <div className="card-heading">{translate('product.labels.details')}</div>

                    <ProductDetailsBlockProperties
                        product={product}
                        viewType={viewType}
                        showStockAndReservations={showStockAndReservations}
                        showName={false}
                    />
                </div>
            </div>
        </div>
    );
}
