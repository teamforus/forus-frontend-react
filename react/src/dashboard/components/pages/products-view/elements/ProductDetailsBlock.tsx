import React, { ReactNode } from 'react';
import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';
import Product from '../../../../props/models/Product';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import Markdown from '../../../../../webshop/components/elements/markdown/Markdown';
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
