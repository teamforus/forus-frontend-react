import React from 'react';
import classNames from 'classnames';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import ProductsFilterGroup from './base-group/ProductsFilterGroup';
import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';
import useRootProductCategories from '../hooks/useRootProductCategories';

export default function ProductsFilterGroupProductCategories({
    value,
    setValue,
    openByDefault = false,
}: {
    value: number[];
    setValue: (selected: number[]) => void;
    openByDefault?: boolean;
}) {
    const translate = useTranslate();
    const { productCategoriesIconMap, productCategories } = useRootProductCategories();

    if (productCategoriesIconMap === null) {
        return (
            <ProductsFilterGroup
                dusk={'productFilterGroupProductCategories'}
                title={translate('products.filters.category')}
                controls={'product_categories'}
                openByDefault={openByDefault}
                content={(isOpen) => (
                    <div
                        id="product_categories"
                        className="showcase-aside-group-body"
                        role="group"
                        aria-label={translate('products.filters.category')}
                        hidden={!isOpen}>
                        <div className="showcase-aside-block-options">
                            {productCategories?.map((category) => {
                                const isActive = value?.includes(category.id);

                                return (
                                    <div
                                        key={category.id}
                                        role="button"
                                        tabIndex={0}
                                        aria-pressed={isActive}
                                        aria-label={category.name}
                                        onClick={() => {
                                            setValue(
                                                value?.includes(category.id)
                                                    ? value?.filter((id) => id !== category.id)
                                                    : [...value, category.id],
                                            );
                                        }}
                                        onKeyDown={(e) => clickOnKeyEnter(e, true)}
                                        className={classNames(
                                            'showcase-aside-block-option',
                                            isActive && 'showcase-aside-block-option-active',
                                        )}
                                        data-dusk={'productCategoryFilterOption' + category.id}>
                                        <div className="showcase-aside-block-option-check">
                                            <em className="mdi mdi-check" aria-hidden="true" />
                                        </div>
                                        <div className="showcase-aside-block-option-name">{category.name}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            />
        );
    }

    return (
        <ProductsFilterGroup
            dusk={'productFilterGroupProductCategories'}
            title={translate('products.filters.category')}
            controls={'product_categories'}
            openByDefault={openByDefault}
            content={(isOpen) => (
                <div
                    id="product_categories"
                    className="showcase-aside-group-body"
                    role="group"
                    aria-label={translate('products.filters.category')}
                    hidden={!isOpen}>
                    <div className="block block-product-category-filter">
                        {productCategories?.map((category) => {
                            const isActive = value.includes(category.id);

                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={classNames(
                                        'category-filter-item',
                                        isActive && 'category-filter-item-active',
                                    )}
                                    data-dusk={'productCategoryFilterOption' + category.id}
                                    aria-pressed={isActive}
                                    aria-label={category.name}
                                    onClick={() =>
                                        setValue(
                                            isActive
                                                ? value.filter((id) => id !== category.id)
                                                : [...value, category.id],
                                        )
                                    }>
                                    <span aria-hidden="true" className="category-filter-item-icon">
                                        {productCategoriesIconMap[category.key]}
                                    </span>
                                    <span className="category-filter-item-name">{category.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        />
    );
}
