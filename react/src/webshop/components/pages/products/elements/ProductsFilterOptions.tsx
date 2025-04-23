import React from 'react';
import classNames from 'classnames';
import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';

type ProductsFilterOptionsValue = {
    qr?: boolean;
    reservation?: boolean;
    extra_payment?: boolean;
};

export default function ProductsFilterOptions({
    value,
    setValue,
}: {
    value: ProductsFilterOptionsValue;
    setValue?: (value: ProductsFilterOptionsValue) => void;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    return (
        <div className="showcase-aside-block-options">
            <div
                role="button"
                tabIndex={0}
                aria-pressed={Boolean(value.qr)}
                aria-label={translate('products.filters.payment_option_qr')}
                onClick={() => setValue({ qr: !value.qr })}
                onKeyDown={(e) => clickOnKeyEnter(e, true)}
                className={classNames('showcase-aside-block-option', value.qr && 'showcase-aside-block-option-active')}>
                <div className="showcase-aside-block-option-check">
                    <em className="mdi mdi-check" aria-hidden="true" />
                </div>
                <div className="showcase-aside-block-option-name">
                    {translate('products.filters.payment_option_qr')}
                </div>
                <div className="showcase-aside-block-option-icon">
                    <em className="mdi mdi-qrcode-scan" aria-hidden="true" />
                </div>
            </div>
            <div
                role="button"
                tabIndex={0}
                aria-pressed={Boolean(value.reservation)}
                aria-label={translate('products.filters.payment_option_reservation')}
                onClick={() => setValue({ reservation: !value.reservation })}
                onKeyDown={(e) => clickOnKeyEnter(e, true)}
                className={classNames(
                    'showcase-aside-block-option',
                    value.reservation && 'showcase-aside-block-option-active',
                )}>
                <div className="showcase-aside-block-option-check">
                    <em className="mdi mdi-check" aria-hidden="true" />
                </div>
                <div className="showcase-aside-block-option-name">
                    {translate('products.filters.payment_option_reservation')}
                </div>
                <div className="showcase-aside-block-option-icon">
                    <em className="mdi mdi-tag-multiple-outline" aria-hidden="true" />
                </div>
            </div>
            <div
                role="button"
                tabIndex={0}
                aria-pressed={Boolean(value.extra_payment)}
                aria-label={translate('products.filters.payment_option_ideal')}
                onClick={() => setValue({ extra_payment: !value.extra_payment })}
                onKeyDown={(e) => clickOnKeyEnter(e, true)}
                className={classNames(
                    'showcase-aside-block-option',
                    value.extra_payment && 'showcase-aside-block-option-active',
                )}>
                <div className="showcase-aside-block-option-check">
                    <em className="mdi mdi-check" aria-hidden="true" />
                </div>
                <div className="showcase-aside-block-option-name">
                    {translate('products.filters.payment_option_ideal')}
                </div>
                <div className="showcase-aside-block-option-icon">
                    <img src={assetUrl('/assets/img/icon-ideal.svg')} alt="" aria-hidden="true" />
                </div>
            </div>
        </div>
    );
}
