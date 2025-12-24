import React, { useMemo } from 'react';
import Product from '../../../../props/models/Product';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import useShowProductPaymentOptionsInfoModal from '../../../../hooks/useShowProductPaymentOptionsInfoModal';
import useProductFeatures from '../../../../hooks/useProductFeatures';

export default function ProductProps({
    product,
    isPayoutInfoProduct = false,
}: {
    product: Product;
    isPayoutInfoProduct?: boolean;
}) {
    const translate = useTranslate();
    const assetUrl = useAssetUrl();
    const showProductIconsInfoModal = useShowProductPaymentOptionsInfoModal();
    const productFeatures = useProductFeatures(product);

    const showProductProps = useMemo(() => {
        return Boolean(
            product?.info_duration ||
                product?.info_when ||
                product?.info_more_info ||
                product?.info_where ||
                product?.info_attention ||
                !isPayoutInfoProduct,
        );
    }, [
        isPayoutInfoProduct,
        product?.info_attention,
        product?.info_duration,
        product?.info_more_info,
        product?.info_when,
        product?.info_where,
    ]);

    if (!product || !showProductProps) {
        return null;
    }

    return (
        <div className="product-props">
            {product.info_duration && (
                <div className="product-prop-item">
                    <div className="product-prop-item-icon">
                        <em className="mdi mdi-calendar-start-outline" aria-hidden="true" />
                    </div>
                    <div className="product-prop-item-details">
                        <h2 className="product-prop-item-title">{translate('product.labels.duration_of_promotion')}</h2>
                        <div className="product-prop-item-description">{product.info_duration}</div>
                    </div>
                </div>
            )}

            {!isPayoutInfoProduct && (
                <div className="product-prop-item">
                    <div className="product-prop-item-icon">
                        <em className="mdi mdi-wallet-bifold-outline" aria-hidden="true" />
                    </div>
                    <div className="product-prop-item-details">
                        <h2 className="product-prop-item-title">{translate('product.labels.payment_options_title')}</h2>
                        <div className="product-prop-item-description">
                            <div className="product-prop-item-payment-options">
                                {productFeatures.feature_scanning_enabled && (
                                    <div
                                        className="product-prop-item-payment-option"
                                        title={translate('product.labels.payment_option_qr')}
                                        role="img"
                                        aria-label={translate('product.labels.payment_option_qr')}>
                                        <em className="mdi mdi-qrcode" aria-hidden="true" />
                                    </div>
                                )}

                                {productFeatures.feature_reservations_enabled && (
                                    <div
                                        className="product-prop-item-payment-option"
                                        title={translate('product.labels.payment_option_reservation')}
                                        role="img"
                                        aria-label={translate('product.labels.payment_option_reservation')}>
                                        <em className="mdi mdi-tag-multiple-outline" aria-hidden="true" />
                                    </div>
                                )}

                                {productFeatures.feature_reservation_extra_payments_enabled && (
                                    <div
                                        className="product-prop-item-payment-option"
                                        title={translate('product.labels.payment_option_ideal')}
                                        role="img"
                                        aria-label={translate('product.labels.payment_option_ideal')}>
                                        <img
                                            src={assetUrl('/assets/img/icon-ideal.svg')}
                                            alt={translate('product.labels.ideal_logo_alt')}
                                        />
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={showProductIconsInfoModal}
                                className="product-prop-item-payment-info"
                                aria-label={translate('product.labels.how_can_i_pay')}>
                                {translate('product.labels.how_can_i_pay')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {product.info_when && (
                <div className="product-prop-item">
                    <div className="product-prop-item-icon">
                        <em className="mdi mdi-calendar-month-outline" aria-hidden="true" />
                    </div>
                    <div className="product-prop-item-details">
                        <h2 className="product-prop-item-title">{translate('product.labels.when')}</h2>
                        <div className="product-prop-item-description">{product.info_when}</div>
                    </div>
                </div>
            )}

            {product.info_more_info && (
                <div className="product-prop-item">
                    <div className="product-prop-item-icon">
                        <em className="mdi mdi-information-outline" aria-hidden="true" />
                    </div>
                    <div className="product-prop-item-details">
                        <h2 className="product-prop-item-title">{translate('product.labels.more_info')}</h2>
                        <div className="product-prop-item-description">{product.info_more_info}</div>
                    </div>
                </div>
            )}

            {product.info_where && (
                <div className="product-prop-item">
                    <div className="product-prop-item-icon">
                        <em className="mdi mdi-store-marker-outline" aria-hidden="true" />
                    </div>
                    <div className="product-prop-item-details">
                        <h2 className="product-prop-item-title">{translate('product.labels.where')}</h2>
                        <div className="product-prop-item-description">{product.info_where}</div>
                    </div>
                </div>
            )}

            {product.info_attention && (
                <div className="product-prop-item">
                    <div className="product-prop-item-icon">
                        <em className="mdi mdi-alert-outline" aria-hidden="true" />
                    </div>
                    <div className="product-prop-item-details">
                        <h2 className="product-prop-item-title">{translate('product.labels.attention')}</h2>
                        <div className="product-prop-item-description">{product.info_attention}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
