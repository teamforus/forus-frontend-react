import KeyValueItem from '../../../elements/key-value/KeyValueItem';
import TranslateHtml from '../../../elements/translate-html/TranslateHtml';
import React, { Fragment, ReactNode } from 'react';
import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';
import Product from '../../../../props/models/Product';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import useTranslate from '../../../../hooks/useTranslate';
import Markdown from '../../../../../webshop/components/elements/markdown/Markdown';

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

                    <div className="card-block card-block-keyvalue card-block-keyvalue-md">
                        {viewType === 'sponsor' && (
                            <KeyValueItem label={translate('product.labels.provider')}>
                                {product.organization.name}
                            </KeyValueItem>
                        )}

                        <KeyValueItem label={translate('product.labels.expire')}>
                            {product.expire_at ? product.expire_at_locale : 'Onbeperkt'}
                        </KeyValueItem>

                        {showStockAndReservations && (
                            <Fragment>
                                <KeyValueItem label={translate('product.labels.sold')}>
                                    {product.sold_amount}
                                </KeyValueItem>

                                <KeyValueItem label={translate('product.labels.reserved')}>
                                    {product.reserved_amount}
                                </KeyValueItem>
                            </Fragment>
                        )}

                        {viewType === 'provider' && (
                            <KeyValueItem label={translate('product.labels.available_offers')}>
                                {product.unlimited_stock ? translate('product.labels.unlimited') : product.stock_amount}
                            </KeyValueItem>
                        )}

                        <KeyValueItem
                            label={translate('product.labels.ean')}
                            infoBlock={<TranslateHtml i18n={'product.tooltips.ean'} />}>
                            {product.ean}
                        </KeyValueItem>

                        {viewType === 'provider' && (
                            <KeyValueItem
                                label={translate('product.labels.sku')}
                                infoBlock={<TranslateHtml i18n={'product.tooltips.sku'} />}>
                                {product.sku}
                            </KeyValueItem>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
