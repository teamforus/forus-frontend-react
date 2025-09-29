import React, { ReactNode, useState } from 'react';
import classNames from 'classnames';
import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import useShowProductPaymentOptionsInfoModal from '../../../../hooks/useShowProductPaymentOptionsInfoModal';
import ProductsFilterGroup from './base-group/ProductsFilterGroup';

type ProductsFilterOptionType = 'qr' | 'reservation' | 'extra_payment';

type ProductsFilterOptionsValue = {
    [key in ProductsFilterOptionType]: boolean;
};

export default function ProductsFilterGroupReservationOptions({
    value,
    setValue,
    openByDefault = false,
}: {
    value: Partial<ProductsFilterOptionsValue>;
    setValue?: (value: Partial<ProductsFilterOptionsValue>) => void;
    openByDefault?: boolean;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const showProductIconsInfoModal = useShowProductPaymentOptionsInfoModal();

    const [options] = useState<Array<{ value: ProductsFilterOptionType; icon: ReactNode; dusk: string }>>([
        {
            value: 'qr',
            icon: <em className="mdi mdi-qrcode-scan" aria-hidden="true" />,
            dusk: 'paymentOptionQr',
        },
        {
            value: 'reservation',
            icon: <em className="mdi mdi-tag-multiple-outline" aria-hidden="true" />,
            dusk: 'paymentOptionReservation',
        },
        {
            value: 'extra_payment',
            icon: <img src={assetUrl('/assets/img/icon-ideal.svg')} alt="" aria-hidden="true" />,
            dusk: 'paymentOptionIdeal',
        },
    ]);

    return (
        <ProductsFilterGroup
            dusk={'productFiltersGroupReservationOptions'}
            title={translate('products.filters.payment_options')}
            controls={'payment_options_filters'}
            openByDefault={openByDefault}
            content={(isOpen) => (
                <div
                    id="payment_options_filters"
                    hidden={!isOpen}
                    role="group"
                    className="showcase-aside-group-body"
                    aria-label={translate('products.filters.payment_options')}>
                    <div className="showcase-aside-group-info">
                        <a
                            className="showcase-aside-group-info-link"
                            role="button"
                            tabIndex={0}
                            aria-label={translate('products.filters.payment_options_info')}
                            onClick={(e) => {
                                e.preventDefault();
                                showProductIconsInfoModal();
                            }}
                            onKeyDown={(e) => clickOnKeyEnter(e, true)}>
                            <em className="mdi mdi-information-outline" aria-hidden="true" />
                            {translate('products.filters.payment_options_info')}
                        </a>
                    </div>
                    <div className="showcase-aside-block-options">
                        {options?.map((option) => (
                            <div
                                key={option.value}
                                role="button"
                                tabIndex={0}
                                aria-pressed={value[option.value]}
                                aria-label={translate('products.filters.payment_option_' + option.value)}
                                onClick={() => setValue?.({ [option.value]: !value[option.value] })}
                                onKeyDown={(e) => clickOnKeyEnter(e, true)}
                                className={classNames(
                                    'showcase-aside-block-option',
                                    value[option.value] && 'showcase-aside-block-option-active',
                                )}
                                data-dusk={option.dusk}>
                                <div className="showcase-aside-block-option-check">
                                    <em className="mdi mdi-check" aria-hidden="true" />
                                </div>
                                <div className="showcase-aside-block-option-name">
                                    {translate('products.filters.payment_option_' + option.value)}
                                </div>
                                <div className="showcase-aside-block-option-icon">{option.icon}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        />
    );
}
