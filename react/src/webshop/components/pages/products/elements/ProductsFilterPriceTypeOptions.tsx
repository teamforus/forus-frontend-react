import React, { Fragment, ReactNode, useState } from 'react';
import classNames from 'classnames';
import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import { ProductPriceType } from '../../../../../dashboard/props/models/Product';
import useShowProductPriceTypeOptionsInfoModal from '../../../../hooks/useShowProductPriceTypeOptionsInfoModal';

type ProductsFilterOptionsValue = {
    [key in ProductPriceType]: boolean;
};

export default function ProductsFilterPriceTypeOptions({
    value,
    setValue,
}: {
    value: Partial<ProductsFilterOptionsValue>;
    setValue?: (value: Partial<ProductsFilterOptionsValue>) => void;
}) {
    const translate = useTranslate();
    const showProductIconsInfoModal = useShowProductPriceTypeOptionsInfoModal();

    const [options] = useState<Array<{ value: ProductPriceType; icon: ReactNode; dusk?: string }>>([
        { value: 'regular', icon: <em className="mdi mdi-cash" aria-hidden="true" /> },
        { value: 'discount_fixed', icon: <em className="mdi mdi-currency-eur" aria-hidden="true" /> },
        { value: 'discount_percentage', icon: <em className="mdi mdi-percent-circle-outline" aria-hidden="true" /> },
        { value: 'free', icon: <em className="mdi mdi-gift-outline" aria-hidden="true" /> },
        { value: 'informational', icon: <em className="mdi mdi-storefront-outline" aria-hidden="true" /> },
    ]);

    return (
        <Fragment>
            <div className="showcase-aside-block-separator" />
            <div className="showcase-aside-block-title">{translate('products.filters.price_type_options')}</div>

            <div className="showcase-aside-block-info">
                <a
                    className="showcase-aside-block-info-link"
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
                {options?.map((option) => (
                    <div
                        key={option.value}
                        role="button"
                        tabIndex={0}
                        aria-pressed={value[option.value]}
                        aria-label={translate('products.filters.price_type_option_' + option.value)}
                        onClick={() => setValue({ [option.value]: !value[option.value] })}
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
        </Fragment>
    );
}
