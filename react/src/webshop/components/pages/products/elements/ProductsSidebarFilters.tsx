import React from 'react';
import classNames from 'classnames';
import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';
import FormGroup from '../../../elements/forms/FormGroup';
import UIControlText from '../../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import ActiveFilterLabels from '../../../elements/active-filter-labels/ActiveFilterLabels';
import ProductsFilterGroupProductCategories from './ProductsFilterGroupProductCategories';
import ProductsFilterGroupFunds from './ProductsFilterGroupFunds';
import ProductsFilterGroupPrice from './ProductsFilterGroupPrice';
import ProductsFilterGroupProviders from './ProductsFilterGroupProviders';
import ProductsFilterGroupDistance from './ProductsFilterGroupDistance';
import ProductsFilterGroupReservationOptions from './ProductsFilterGroupReservationOptions';
import ProductsFilterGroupPriceType from './ProductsFilterGroupPriceType';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import { FilterScope, FilterSetter } from '../../../../../dashboard/modules/filter_next/types/FilterParams';
import { ProductsPageFilters } from '../hooks/useProductsPageFilters';
import ProductCategory from '../../../../../dashboard/props/models/ProductCategory';
import Fund from '../../../../props/models/Fund';
import Organization from '../../../../../dashboard/props/models/Organization';
import { ResponseErrorData } from '../../../../../dashboard/props/ApiResponses';

export default function ProductsSidebarFilters({
    errors,
    filter,
    filterValues,
    filterUpdate,
    funds,
    productCategories,
    productCategoriesIconMap,
    providers,
    showBookmarkTabs = false,
    toMax,
}: {
    errors: ResponseErrorData;
    filter: FilterScope<ProductsPageFilters>;
    filterValues: Partial<ProductsPageFilters>;
    filterUpdate: FilterSetter<Partial<ProductsPageFilters>>;
    funds: Array<Fund>;
    productCategories: Array<ProductCategory>;
    productCategoriesIconMap?: object;
    providers: Array<Organization>;
    showBookmarkTabs?: boolean;
    toMax: number;
}) {
    const translate = useTranslate();

    return (
        <div className="showcase-aside-block">
            {showBookmarkTabs && (
                <div className="showcase-aside-tabs">
                    <div
                        className={classNames('showcase-aside-tab', 'clickable', !filterValues?.bookmarked && 'active')}
                        onClick={() => filterUpdate({ bookmarked: false })}
                        onKeyDown={clickOnKeyEnter}
                        tabIndex={0}
                        aria-pressed={!filterValues.bookmarked}
                        role="button">
                        <em className="mdi mdi-tag-multiple-outline" />
                        {translate('products.filters.all_products')}
                    </div>
                    <div
                        className={classNames('showcase-aside-tab', 'clickable', filterValues?.bookmarked && 'active')}
                        onClick={() => filterUpdate({ bookmarked: true })}
                        onKeyDown={clickOnKeyEnter}
                        role="button"
                        tabIndex={0}
                        aria-label={translate('products.filters.bookmarked')}
                        aria-pressed={!!filterValues.bookmarked}>
                        <em className="mdi mdi-cards-heart-outline" />

                        {translate('products.filters.bookmarked')}
                    </div>
                </div>
            )}

            <FormGroup
                id={'products_search'}
                label={translate('products.filters.search')}
                error={errors?.q}
                input={(id) => (
                    <UIControlText
                        value={filterValues.q}
                        onChangeValue={(q: string) => filterUpdate({ q })}
                        ariaLabel={translate('products.filters.search')}
                        id={id}
                        dataDusk="listProductsSearch"
                    />
                )}
            />

            <ActiveFilterLabels
                filter={filter}
                categories={productCategories}
                funds={funds}
                organizations={providers}
                priceMax={toMax}
            />

            <ProductsFilterGroupProductCategories
                value={filterValues?.product_category_ids}
                setValue={(product_category_ids) => filterUpdate({ product_category_ids })}
                openByDefault={true}
                productCategories={productCategories}
                productCategoriesIconMap={productCategoriesIconMap}
            />

            <ProductsFilterGroupFunds
                value={filterValues?.fund_ids}
                funds={funds}
                setValue={(fund_ids) => filterUpdate({ fund_ids })}
                openByDefault={true}
                error={errors?.fund_ids}
            />

            <ProductsFilterGroupPrice
                filterValues={filterValues}
                filterUpdate={filterUpdate}
                errors={errors}
                toMax={toMax}
                openByDefault={true}
            />

            <ProductsFilterGroupProviders
                organizations={providers}
                filterValues={filterValues}
                filterUpdate={filterUpdate}
                errors={errors}
            />

            <ProductsFilterGroupDistance values={filterValues} setValues={filterUpdate} errors={errors} />
            <ProductsFilterGroupReservationOptions value={filterValues} setValue={filterUpdate} />
            <ProductsFilterGroupPriceType value={filterValues} setValue={filterUpdate} />
        </div>
    );
}
