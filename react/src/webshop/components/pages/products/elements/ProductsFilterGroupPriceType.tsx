import React, { ReactNode, useMemo } from 'react';
import classNames from 'classnames';
import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import { ProductPriceType } from '../../../../../dashboard/props/models/Product';
import useShowProductPriceTypeOptionsInfoModal from '../../../../hooks/useShowProductPriceTypeOptionsInfoModal';
import ProductsFilterGroup from './base-group/ProductsFilterGroup';
import useAppConfigs from '../../../../hooks/useAppConfigs';

type ProductsFilterOptionsValue = {
    [key in ProductPriceType]: boolean;
};

export default function ProductsFilterGroupPriceType({
    value,
    setValue,
    openByDefault = false,
}: {
    value: Partial<ProductsFilterOptionsValue>;
    setValue?: (value: Partial<ProductsFilterOptionsValue>) => void;
    openByDefault?: boolean;
}) {
    const appConfig = useAppConfigs();

    const translate = useTranslate();
    const showProductIconsInfoModal = useShowProductPriceTypeOptionsInfoModal();

    const options = useMemo<Array<{ value: ProductPriceType; icon: ReactNode; dusk?: string }>>(
        () => [
            { value: 'regular', icon: <em className="mdi mdi-cash" aria-hidden="true" /> },
            { value: 'discount_fixed', icon: <em className="mdi mdi-currency-eur" aria-hidden="true" /> },
            {
                value: 'discount_percentage',
                icon: <em className="mdi mdi-percent-circle-outline" aria-hidden="true" />,
            },
            { value: 'free', icon: <em className="mdi mdi-gift-outline" aria-hidden="true" /> },
            { value: 'informational', icon: <em className="mdi mdi-storefront-outline" aria-hidden="true" /> },
            appConfig?.implementation?.voucher_payout_informational_product_id
                ? { value: 'payout', icon: <em className="mdi mdi-bank" aria-hidden="true" /> }
                : null,
        ],
        [appConfig?.implementation?.voucher_payout_informational_product_id],
    );

    return (
        <ProductsFilterGroup
            dusk={'productFilterGroupPriceType'}
            title={translate('products.filters.price_type_options')}
            controls={'price_type_filters'}
            openByDefault={openByDefault}
            content={(isOpen) => (
                <div
                    id="price_type_filters"
                    hidden={!isOpen}
                    role="group"
                    aria-label={translate('products.filters.price_type_options')}
                    className="showcase-aside-group-body">
                    <div className="showcase-aside-group-info">
                        <a
                            className="showcase-aside-group-info-link"
                            role="button"
                            tabIndex={0}
                            aria-label={translate('products.filters.price_type_options_info')}
                            onClick={(e) => {
                                e.preventDefault();
                                showProductIconsInfoModal();
                            }}
                            onKeyDown={(e) => clickOnKeyEnter(e, true)}>
                            <em className="mdi mdi-information-outline" aria-hidden="true" />
                            {translate('products.filters.price_type_options_info')}
                        </a>
                    </div>
                    <div className="showcase-aside-block-options">
                        {options
                            ?.filter((option) => option)
                            ?.map((option) => (
                                <div
                                    key={option.value}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={value[option.value]}
                                    aria-label={translate('products.filters.price_type_option_' + option.value)}
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
                                        {translate('products.filters.price_type_option_' + option.value)}
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
