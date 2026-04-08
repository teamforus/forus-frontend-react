import React, { Fragment } from 'react';
import FormGroup from '../../../elements/forms/FormGroup';
import UIControlText from '../../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import ActiveFilterLabels from '../../../elements/active-filter-labels/ActiveFilterLabels';
import ProductsFilterGroupProductCategories from '../../products/elements/ProductsFilterGroupProductCategories';
import ProductsFilterGroupFunds from '../../products/elements/ProductsFilterGroupFunds';
import ProvidersFilterGroupBusinessTypes from '../../products/elements/ProvidersFilterGroupBusinessTypes';
import ProductsFilterGroupDistance from '../../products/elements/ProductsFilterGroupDistance';
import TranslateHtml from '../../../../../dashboard/components/elements/translate-html/TranslateHtml';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import { FilterScope, FilterSetter } from '../../../../../dashboard/modules/filter_next/types/FilterParams';
import { ProviderFilters } from '../hooks/useProvidersPageFilters';
import ProductCategory from '../../../../../dashboard/props/models/ProductCategory';
import Fund from '../../../../props/models/Fund';
import BusinessType from '../../../../../dashboard/props/models/BusinessType';
import { ResponseErrorData } from '../../../../../dashboard/props/ApiResponses';

export default function ProvidersSidebarFilters({
    errors,
    filter,
    filterValues,
    filterUpdate,
    funds,
    productCategories,
    productCategoriesIconMap,
    businessTypes,
    providersTotal,
}: {
    errors: ResponseErrorData;
    filter: FilterScope<ProviderFilters>;
    filterValues: Partial<ProviderFilters>;
    filterUpdate: FilterSetter<Partial<ProviderFilters>>;
    funds: Array<Fund>;
    productCategories: Array<ProductCategory>;
    productCategoriesIconMap?: object;
    businessTypes: Array<BusinessType>;
    providersTotal?: number;
}) {
    const translate = useTranslate();

    return (
        <Fragment>
            <div className="showcase-aside-block">
                {filterValues.show_map && (
                    <div className="showcase-subtitle">{translate('providers.filters.map_title')}</div>
                )}

                <FormGroup
                    id={'providers_search'}
                    label={translate('providers.filters.search')}
                    error={errors?.q}
                    input={(id) => (
                        <UIControlText
                            id={id}
                            value={filterValues.q}
                            onChangeValue={(q) => filterUpdate({ q })}
                            ariaLabel={translate('providers.filters.search')}
                            dataDusk="listProvidersSearch"
                        />
                    )}
                />

                <ActiveFilterLabels
                    filter={filter}
                    categories={productCategories}
                    funds={funds}
                    businessTypes={businessTypes}
                />

                <ProductsFilterGroupProductCategories
                    value={filterValues?.product_category_ids}
                    setValue={(ids) => filterUpdate({ product_category_ids: ids })}
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

                <ProvidersFilterGroupBusinessTypes
                    value={filterValues?.business_type_id}
                    businessTypes={businessTypes}
                    setValue={(value) => filterUpdate({ business_type_id: value })}
                    error={errors?.business_type_id}
                />

                <ProductsFilterGroupDistance values={filterValues} setValues={filterUpdate} errors={errors} />

                {filterValues.show_map && (
                    <TranslateHtml
                        component={<div />}
                        className={'showcase-result'}
                        i18n={'providers.filters.result'}
                        values={{ total: providersTotal }}
                    />
                )}
            </div>
        </Fragment>
    );
}
