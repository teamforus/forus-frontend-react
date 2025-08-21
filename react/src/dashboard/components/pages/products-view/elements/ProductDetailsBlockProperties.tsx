import KeyValueItem from '../../../elements/key-value/KeyValueItem';
import TranslateHtml from '../../../elements/translate-html/TranslateHtml';
import React, { Fragment } from 'react';
import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';
import Product from '../../../../props/models/Product';
import useTranslate from '../../../../hooks/useTranslate';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import classNames from 'classnames';
import FormPane from '../../../elements/forms/elements/FormPane';

export default function ProductDetailsBlockProperties({
    showName,
    product,
    viewType,
    showStockAndReservations = true,
}: {
    showName: boolean;
    product: SponsorProduct | Product;
    viewType: 'sponsor' | 'provider';
    showStockAndReservations?: boolean;
}) {
    const translate = useTranslate();

    return (
        <div className={'form'}>
            <FormPane title={translate('product.labels.details')} large={true}>
                <div className="card-block card-block-keyvalue card-block-keyvalue-md card-block-keyvalue-text-sm">
                    {viewType === 'provider' && showName && (
                        <KeyValueItem label={translate('product.labels.name')}>
                            <StateNavLink
                                name={'products-show'}
                                params={{
                                    organizationId: product?.organization_id,
                                    id: product?.id,
                                }}
                                className={classNames(
                                    'text-primary text-semibold text-inherit',
                                    product?.deleted ? 'text-line-through' : 'text-decoration-link',
                                )}>
                                {product?.name}
                            </StateNavLink>
                        </KeyValueItem>
                    )}

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
                            <KeyValueItem label={translate('product.labels.sold')}>{product.sold_amount}</KeyValueItem>

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
            </FormPane>
        </div>
    );
}
