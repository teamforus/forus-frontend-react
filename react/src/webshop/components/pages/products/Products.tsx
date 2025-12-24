import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useProductService } from '../../../services/ProductService';
import { PaginationData, ResponseError } from '../../../../dashboard/props/ApiResponses';
import Product from '../../../props/models/Product';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import useAppConfigs from '../../../hooks/useAppConfigs';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import ProductsList from '../../elements/lists/products-list/ProductsList';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import BlockShowcaseList from '../../elements/block-showcase/BlockShowcaseList';
import useFilterNext from '../../../../dashboard/modules/filter_next/useFilterNext';
import { BooleanParam, NumberParam, StringParam, NumericArrayParam } from 'use-query-params';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import useSetTitle from '../../../hooks/useSetTitle';
import UIControlText from '../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import ProductsFilterGroupReservationOptions from './elements/ProductsFilterGroupReservationOptions';
import classNames from 'classnames';
import ProductsFilterGroupPriceType from './elements/ProductsFilterGroupPriceType';
import FormGroup from '../../elements/forms/FormGroup';
import ProductsFilterGroupProductCategories from './elements/ProductsFilterGroupProductCategories';
import ProductsFilterGroupDistance from './elements/ProductsFilterGroupDistance';
import ProductsFilterGroupPrice from './elements/ProductsFilterGroupPrice';
import ProductsFilterGroupFunds from './elements/ProductsFilterGroupFunds';
import ProductsFilterGroupProviders from './elements/ProductsFilterGroupProviders';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function Products() {
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();

    const productService = useProductService();

    const setTitle = useSetTitle();
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const [sortByOptions] = useState(productService.getSortOptions(translate));

    const [errors, setErrors] = useState<{ [key: string]: string | Array<string> }>({});

    const [toMax, setToMax] = useState(0);

    const defaultSortOption = useMemo(() => {
        return sortByOptions?.find((option) => {
            return (
                `${option.value.order_by}_${option.value.order_dir}` === appConfigs.products_default_sorting ||
                `${option.value.order_by}` === appConfigs.products_default_sorting
            );
        });
    }, [appConfigs?.products_default_sorting, sortByOptions]);

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        q: string;
        page: number;
        fund_ids: number[];
        organization_id: number;
        product_category_ids: number[];
        postcode: string;
        distance: number;
        from: number;
        to: number;
        qr?: boolean;
        reservation?: boolean;
        extra_payment?: boolean;
        bookmarked: boolean;
        display_type: 'list' | 'grid';
        order_by: 'created_at' | 'price' | 'most_popular' | 'name' | 'randomized';
        order_dir: 'asc' | 'desc';
        regular?: boolean;
        discount_fixed?: boolean;
        discount_percentage?: boolean;
        free?: boolean;
        informational?: boolean;
        payout?: boolean;
    }>(
        {
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
        },
        {
            throttledValues: ['q', 'from', 'to', 'qr', 'reservation', 'extra_payment'],
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

    const [products, setProducts] = useState<PaginationData<Product, { price_max: number }>>(null);

    const buildQuery = useCallback(
        (
            values: Partial<{
                q: string;
                page: number;
                fund_ids: number[];
                organization_id: number;
                product_category_id: number;
                product_category_ids: number[];
                postcode: string;
                distance: number;
                from: number;
                to: number;
                bookmarked: boolean;
                qr: boolean;
                reservation: boolean;
                extra_payment: boolean;
                regular: boolean;
                discount_fixed: boolean;
                discount_percentage: boolean;
                free: boolean;
                informational: boolean;
                payout: boolean;
                order_by: 'created_at' | 'price' | 'most_popular' | 'name' | 'randomized';
                order_dir: 'asc' | 'desc';
            }>,
        ) => {
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
        },
        [],
    );

    const fetchProducts = useCallback(
        (query: object) => {
            setErrors(null);
            setProgress(0);

            productService
                .list({ ...query })
                .then((res) => {
                    setProducts(res.data);
                    setToMax((max) => Math.max(res.data?.meta?.price_max, max));
                })
                .catch((e: ResponseError) => setErrors(e.data?.errors))
                .finally(() => setProgress(100));
        },
        [productService, setProgress],
    );

    useEffect(() => {
        fetchProducts(buildQuery(filterValuesActive));
    }, [fetchProducts, buildQuery, filterValuesActive]);

    useEffect(() => {
        setTitle(translate('page_state_titles.products'));
    }, [setTitle, translate]);

    return (
        <BlockShowcaseList
            dusk="listProductsContent"
            countFiltersApplied={countFiltersApplied}
            breadcrumbItems={[
                { name: translate('products.breadcrumbs.home'), state: WebshopRoutes.HOME },
                { name: translate('products.breadcrumbs.products') },
            ]}
            aside={
                <div className="showcase-aside-block">
                    {authIdentity && (
                        <div className="showcase-aside-tabs">
                            <div
                                className={`showcase-aside-tab clickable ${!filterValues?.bookmarked ? 'active' : ''}`}
                                onClick={() => filterUpdate({ bookmarked: false })}
                                onKeyDown={clickOnKeyEnter}
                                tabIndex={0}
                                aria-pressed={!filterValues.bookmarked}
                                role="button">
                                <em className="mdi mdi-tag-multiple-outline" />
                                {translate('products.filters.all_products')}
                            </div>
                            <div
                                className={`showcase-aside-tab clickable ${filterValues?.bookmarked ? 'active' : ''}`}
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

                    <ProductsFilterGroupProductCategories
                        value={filterValues?.product_category_ids}
                        setValue={(product_category_ids) => filterUpdate({ product_category_ids })}
                        openByDefault={true}
                    />

                    <ProductsFilterGroupFunds
                        value={filterValues?.fund_ids}
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
                        filterValues={filterValues}
                        filterUpdate={filterUpdate}
                        errors={errors}
                    />

                    <ProductsFilterGroupDistance values={filterValues} setValues={filterUpdate} errors={errors} />
                    <ProductsFilterGroupReservationOptions value={filterValues} setValue={filterUpdate} />
                    <ProductsFilterGroupPriceType value={filterValues} setValue={filterUpdate} />
                </div>
            }>
            {appConfigs && products && (
                <Fragment>
                    <div className="showcase-content-header">
                        <h1 className="showcase-filters-title">
                            {filterValues.bookmarked
                                ? translate('products.filters.bookmarked')
                                : translate('products.title')}
                            <div className="showcase-filters-title-count" data-nosnippet="true">
                                {products?.meta?.total}
                            </div>
                        </h1>
                        <div className="showcase-filters-block">
                            <div className="block block-label-tabs form">
                                <div className="showcase-filters-item">
                                    <div className="form-label" id={'sort_by_label'}>
                                        {translate('products.filters.sort')}
                                    </div>
                                    <SelectControl
                                        id={'sort_by'}
                                        allowSearch={false}
                                        propKey={'id'}
                                        propValue={'label'}
                                        options={sortByOptions}
                                        ariaLabelledby="sort_by_label"
                                        value={
                                            sortByOptions.find(
                                                (option) =>
                                                    option.value.order_by == filterValues.order_by &&
                                                    option.value.order_dir == filterValues.order_dir,
                                            )?.id
                                        }
                                        onChange={(id: number) => {
                                            filterUpdate(
                                                sortByOptions.find((option) => {
                                                    return option.id == id;
                                                })?.value || {},
                                            );
                                        }}
                                        dusk="selectControlOrderBy"
                                    />
                                </div>
                                <div className="label-tab-set">
                                    <div
                                        className={classNames(
                                            'label-tab',
                                            'label-tab-sm',
                                            filterValues.display_type == 'grid' && 'active',
                                        )}
                                        onClick={() => filterUpdate({ display_type: 'grid' })}
                                        onKeyDown={clickOnKeyEnter}
                                        tabIndex={0}
                                        aria-pressed={filterValues.display_type == 'grid'}
                                        role="button">
                                        <em className="mdi mdi-view-grid-outline icon-start" />
                                        {translate('products.view.grid')}
                                    </div>
                                    <div
                                        className={classNames(
                                            'label-tab',
                                            'label-tab-sm',
                                            filterValues.display_type == 'list' && 'active',
                                        )}
                                        onClick={() => filterUpdate({ display_type: 'list' })}
                                        onKeyDown={clickOnKeyEnter}
                                        tabIndex={0}
                                        aria-pressed={filterValues.display_type == 'list'}
                                        role="button">
                                        <em className="mdi mdi-format-list-text icon-start" />
                                        {translate('products.view.list')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {appConfigs.pages.products && <CmsBlocks page={appConfigs.pages.products} />}

                    {products?.meta?.total > 0 && (
                        <ProductsList display={filterValues.display_type} products={products.data} />
                    )}

                    {products?.meta?.total == 0 && (
                        <EmptyBlock
                            title={translate('block_products.labels.title')}
                            description={translate('block_products.labels.subtitle')}
                            hideLink={true}
                            svgIcon={'reimbursements'}
                        />
                    )}

                    <div className="card" hidden={products?.meta?.last_page < 2}>
                        <div className="card-section">
                            <Paginator
                                meta={products.meta}
                                filters={filterValues}
                                count-buttons={5}
                                updateFilters={filterUpdate}
                            />
                        </div>
                    </div>
                </Fragment>
            )}
        </BlockShowcaseList>
    );
}
