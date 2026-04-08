import { useCallback, useEffect, useMemo, useState } from 'react';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import { useProductService } from '../../../../services/ProductService';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import useFilterNext from '../../../../../dashboard/modules/filter_next/useFilterNext';
import { BooleanParam, NumberParam, NumericArrayParam, StringParam } from 'use-query-params';
import useRootProductCategories from './useRootProductCategories';
import Organization from '../../../../../dashboard/props/models/Organization';
import { useOrganizationService } from '../../../../../dashboard/services/OrganizationService';
import { useFundService } from '../../../../services/FundService';
import Fund from '../../../../props/models/Fund';
import { BaseTypeFilterProducts } from '../../../elements/active-filter-labels/ActiveFilterLabels';

export type ProductsPageFilters = BaseTypeFilterProducts & {
    q: string;
    page: number;
    bookmarked: boolean;
    display_type: 'list' | 'grid';
    order_by: 'created_at' | 'price' | 'most_popular' | 'name' | 'randomized';
    order_dir: 'asc' | 'desc';
};

export default function useProductsPageFilters() {
    const appConfigs = useAppConfigs();
    const fundService = useFundService();
    const productService = useProductService();
    const organizationService = useOrganizationService();
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const [sortByOptions] = useState(productService.getSortOptions(translate));
    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [providers, setProviders] = useState<Array<Organization>>(null);

    const { productCategoriesIconMap, productCategories } = useRootProductCategories();

    const defaultSortOption = useMemo(() => {
        return sortByOptions?.find((option) => {
            return (
                `${option.value.order_by}_${option.value.order_dir}` === appConfigs.products_default_sorting ||
                `${option.value.order_by}` === appConfigs.products_default_sorting
            );
        });
    }, [appConfigs?.products_default_sorting, sortByOptions]);

    const initialFilterValues = useMemo<ProductsPageFilters>(() => {
        return {
            q: '',
            page: 1,
            fund_ids: [],
            organization_id: null,
            product_category_ids: [],
            postcode: '',
            distance: null,
            from: 0,
            to: null,
            qr: false,
            reservation: false,
            extra_payment: false,
            bookmarked: false,
            regular: false,
            discount_fixed: false,
            discount_percentage: false,
            free: false,
            informational: false,
            payout: false,
            display_type: 'grid',
            order_by: (defaultSortOption || sortByOptions[0])?.value.order_by,
            order_dir: (defaultSortOption || sortByOptions[0])?.value.order_dir,
        };
    }, [defaultSortOption, sortByOptions]);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<ProductsPageFilters>(
        initialFilterValues,
        {
            throttledValues: ['q', 'from', 'to', 'qr', 'reservation', 'extra_payment', 'postcode'],
            queryParams: {
                q: StringParam,
                page: NumberParam,
                fund_ids: NumericArrayParam,
                organization_id: NumberParam,
                product_category_ids: NumericArrayParam,
                postcode: StringParam,
                distance: NumberParam,
                from: NumberParam,
                to: NumberParam,
                qr: BooleanParam,
                reservation: BooleanParam,
                extra_payment: BooleanParam,
                bookmarked: BooleanParam,
                display_type: StringParam,
                order_by: StringParam,
                order_dir: StringParam,
                regular: BooleanParam,
                discount_fixed: BooleanParam,
                discount_percentage: BooleanParam,
                free: BooleanParam,
                informational: BooleanParam,
                payout: BooleanParam,
            },
            filterParams: ['display_type'],
        },
    );

    const countFiltersApplied = useMemo(() => {
        return [
            filterValues.q,
            filterValues.fund_id,
            filterValues.organization_id,
            filterValues.product_category_id,
        ].filter((value) => value).length;
    }, [filterValues]);

    const buildProductsQuery = useCallback((values: Partial<ProductsPageFilters>) => {
        const hasFilters =
            values.qr ||
            values.extra_payment ||
            values.reservation ||
            values.regular ||
            values.discount_fixed ||
            values.discount_percentage ||
            values.free ||
            values.informational ||
            values.payout;

        return {
            q: values.q,
            page: values.page,
            fund_ids: values.fund_ids?.length > 0 ? values.fund_ids : null,
            organization_id: values.organization_id,
            product_category_ids: values.product_category_ids?.length > 0 ? values.product_category_ids : null,
            postcode: values.postcode || '',
            distance: values.distance || null,
            from: values.from || null,
            to: values.to || null,
            qr: hasFilters ? (values.qr ? 1 : 0) : 0,
            reservation: hasFilters ? (values.reservation ? 1 : 0) : 0,
            extra_payment: hasFilters ? (values.extra_payment ? 1 : 0) : 0,
            regular: hasFilters ? (values.regular ? 1 : 0) : 0,
            discount_fixed: hasFilters ? (values.discount_fixed ? 1 : 0) : 0,
            discount_percentage: hasFilters ? (values.discount_percentage ? 1 : 0) : 0,
            free: hasFilters ? (values.free ? 1 : 0) : 0,
            informational: hasFilters ? (values.informational ? 1 : 0) : 0,
            payout: hasFilters ? (values.payout ? 1 : 0) : 0,
            bookmarked: values.bookmarked ? 1 : 0,
            order_by: values.order_by,
            order_dir: values.order_dir,
        };
    }, []);

    const fetchProviders = useCallback(() => {
        setProgress(0);

        organizationService
            .list({ type: 'provider', per_page: 300, order_by: 'name' })
            .then((res) => setProviders(res.data.data))
            .then(() => setProgress(100));
    }, [organizationService, setProgress]);

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list({ has_providers: 1 })
            .then((res) => setFunds(res.data.data))
            .finally(() => setProgress(100));
    }, [fundService, setProgress]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const productsQuery = useMemo(() => {
        return buildProductsQuery(filterValuesActive);
    }, [buildProductsQuery, filterValuesActive]);

    return {
        countFiltersApplied,
        filter,
        filterUpdate,
        filterValues,
        funds,
        initialFilterValues,
        productCategories,
        productCategoriesIconMap,
        productsQuery,
        providers,
        sortByOptions,
    };
}
