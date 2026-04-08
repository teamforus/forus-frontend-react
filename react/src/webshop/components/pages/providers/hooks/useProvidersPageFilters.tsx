import { useCallback, useEffect, useMemo, useState } from 'react';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import useFilterNext from '../../../../../dashboard/modules/filter_next/useFilterNext';
import { BooleanParam, NumberParam, NumericArrayParam, StringParam } from 'use-query-params';
import useRootProductCategories from '../../products/hooks/useRootProductCategories';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import Fund from '../../../../props/models/Fund';
import { useFundService } from '../../../../services/FundService';
import BusinessType from '../../../../../dashboard/props/models/BusinessType';
import { useBusinessTypeService } from '../../../../../dashboard/services/BusinessTypeService';
import { BaseTypeFilterProviders } from '../../../elements/active-filter-labels/ActiveFilterLabels';

export type ProviderFilters = BaseTypeFilterProviders & {
    q?: string;
    page?: number;
    show_map?: boolean;
    order_by?: 'name';
    order_dir?: 'asc' | 'desc';
};

export default function useProvidersPageFilters() {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const fundService = useFundService();
    const businessTypeService = useBusinessTypeService();

    const [sortByOptions] = useState<
        Array<{
            id: number;
            label: string;
            value: { order_by: 'name'; order_dir: 'asc' | 'desc' };
        }>
    >([
        { id: 1, label: translate('providers.sort.name_asc'), value: { order_by: 'name', order_dir: 'asc' } },
        { id: 2, label: translate('providers.sort.name_desc'), value: { order_by: 'name', order_dir: 'desc' } },
    ]);

    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [businessTypes, setBusinessTypes] = useState<Array<BusinessType>>(null);
    const { productCategoriesIconMap, productCategories } = useRootProductCategories();

    const [filterValues, filterActiveValues, filterUpdate, filter] = useFilterNext<ProviderFilters>(
        {
            q: '',
            page: 1,
            fund_ids: [],
            business_type_id: null,
            product_category_ids: [],
            postcode: '',
            distance: null,
            show_map: false,
            order_by: sortByOptions[0]?.value.order_by,
            order_dir: sortByOptions[0]?.value.order_dir,
        },
        {
            queryParams: {
                q: StringParam,
                page: NumberParam,
                fund_ids: NumericArrayParam,
                business_type_id: NumberParam,
                product_category_ids: NumericArrayParam,
                postcode: StringParam,
                distance: NumberParam,
                show_map: BooleanParam,
                order_by: StringParam,
                order_dir: StringParam,
            },
            filterParams: ['show_map'],
        },
    );

    const buildProvidersQuery = useCallback((values: ProviderFilters) => {
        return {
            q: values.q,
            page: values.page,
            fund_ids: values.fund_ids?.length > 0 ? values.fund_ids : null,
            business_type_id: values.business_type_id || null,
            product_category_ids: values.product_category_ids?.length > 0 ? values.product_category_ids : null,
            postcode: values.postcode || '',
            distance: values.distance || null,
            order_by: values.order_by || null,
            order_dir: values.order_dir || null,
        };
    }, []);

    const countFiltersApplied = useMemo(() => {
        return [filterActiveValues.q, filterActiveValues.fund_id, filterActiveValues.business_type_id].filter(
            (value) => value,
        ).length;
    }, [filterActiveValues]);

    const showProviderSignUp = useMemo(() => {
        return funds?.some((fund) => fund.allow_provider_sign_up) || false;
    }, [funds]);

    const providersQuery = useMemo(() => {
        return buildProvidersQuery(filterActiveValues);
    }, [buildProvidersQuery, filterActiveValues]);

    useEffect(() => {
        setProgress(0);

        fundService
            .list({ has_providers: 1 })
            .then((res) => setFunds(res.data.data))
            .finally(() => setProgress(100));
    }, [fundService, setProgress]);

    useEffect(() => {
        setProgress(0);

        businessTypeService
            .list({ parent_id: 'null', per_page: 9999, used: 1 })
            .then((res) => setBusinessTypes(res.data.data))
            .finally(() => setProgress(100));
    }, [businessTypeService, setProgress]);

    return {
        businessTypes,
        countFiltersApplied,
        filter,
        filterUpdate,
        filterValues,
        funds,
        productCategories,
        productCategoriesIconMap,
        providersQuery,
        showProviderSignUp,
        sortByOptions,
    };
}
