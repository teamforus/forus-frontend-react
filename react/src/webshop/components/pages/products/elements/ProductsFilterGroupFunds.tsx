import React, { Dispatch, SetStateAction, useEffect } from 'react';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import classNames from 'classnames';
import Fund from '../../../../props/models/Fund';
import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';
import FormError from '../../../../../dashboard/components/elements/forms/errors/FormError';
import ProductsFilterGroup from './base-group/ProductsFilterGroup';

export default function ProductsFilterGroupFunds({
    value,
    funds,
    setValue,
    openByDefault = false,
    setShowProviderSignUp = null,
    error = null,
}: {
    value: number[];
    funds: Array<Fund>;
    setValue: (ids: number[]) => void;
    openByDefault?: boolean;
    setShowProviderSignUp?: Dispatch<SetStateAction<boolean>>;
    error?: string | string[];
}) {
    const translate = useTranslate();

    useEffect(() => {
        setShowProviderSignUp?.(funds?.filter((fund) => fund.allow_provider_sign_up).length > 0);
    }, [funds, setShowProviderSignUp]);

    return (
        <ProductsFilterGroup
            dusk={'productFilterGroupFunds'}
            title={translate('products.filters.fund')}
            controls={'funds_filters'}
            openByDefault={openByDefault}
            content={(isOpen) => (
                <div
                    id="funds_filters"
                    hidden={!isOpen}
                    className="showcase-aside-group-body"
                    role="group"
                    aria-label={translate('products.filters.fund')}>
                    <div className="showcase-aside-block-options">
                        {funds?.map((fund) => {
                            const isActive = value?.includes(fund.id);

                            return (
                                <div
                                    key={fund.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={isActive}
                                    aria-label={fund.name}
                                    onClick={() => {
                                        setValue(
                                            value?.includes(fund.id)
                                                ? value?.filter((id) => id !== fund.id)
                                                : [...value, fund.id],
                                        );
                                    }}
                                    onKeyDown={(e) => clickOnKeyEnter(e, true)}
                                    className={classNames(
                                        'showcase-aside-block-option',
                                        isActive && 'showcase-aside-block-option-active',
                                    )}
                                    data-dusk={'productFilterFundItem' + fund.id}>
                                    <div className="showcase-aside-block-option-check">
                                        <em className="mdi mdi-check" aria-hidden="true" />
                                    </div>
                                    <div className="showcase-aside-block-option-name">{fund.name}</div>
                                </div>
                            );
                        })}
                    </div>

                    <FormError error={error} />
                </div>
            )}
        />
    );
}
