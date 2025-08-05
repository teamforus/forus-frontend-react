import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useProductService } from '../../../services/ProductService';
import { PaginationData, ResponseError } from '../../../../dashboard/props/ApiResponses';
import Product from '../../../props/models/Product';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import ProductCategory from '../../../../dashboard/props/models/ProductCategory';
import { useOrganizationService } from '../../../../dashboard/services/OrganizationService';
import useProductCategoryService from '../../../../dashboard/services/ProductCategoryService';
import Organization from '../../../../dashboard/props/models/Organization';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import FormError from '../../../../dashboard/components/elements/forms/errors/FormError';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import useAppConfigs from '../../../hooks/useAppConfigs';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import ProductsList from '../../elements/lists/products-list/ProductsList';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import BlockShowcasePage from '../../elements/block-showcase/BlockShowcasePage';
import useFilterNext from '../../../../dashboard/modules/filter_next/useFilterNext';
import { BooleanParam, NumberParam, StringParam } from 'use-query-params';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import useSetTitle from '../../../hooks/useSetTitle';
import UIControlText from '../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import RangeControl from '../../elements/forms/RangeControl';
import useShowProductPaymentOptionsInfoModal from '../../../hooks/useShowProductPaymentOptionsInfoModal';
import ProductsFilterOptions from './elements/ProductsFilterOptions';
import classNames from 'classnames';

export default function Products() {
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();

    const fundService = useFundService();
    const productService = useProductService();
    const organizationService = useOrganizationService();
    const productCategoryService = useProductCategoryService();

    const setTitle = useSetTitle();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const showProductIconsInfoModal = useShowProductPaymentOptionsInfoModal();

    const [sortByOptions] = useState(productService.getSortOptions(translate));

    const [errors, setErrors] = useState<{ [key: string]: string | Array<string> }>({});

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [toMax, setToMax] = useState(0);
    const [organizations, setOrganizations] = useState<Array<Partial<Organization>>>(null);
    const [productCategories, setProductCategories] = useState<Array<Partial<ProductCategory>>>(null);
    const [productSubCategories, setProductSubCategories] = useState<Array<Partial<ProductCategory>>>(null);

    const distances = useMemo(() => {
        return [
            { id: null, name: translate('products.distances.everywhere') },
            { id: 3, name: translate('products.distances.3') },
            { id: 5, name: translate('products.distances.5') },
            { id: 10, name: translate('products.distances.10') },
            { id: 15, name: translate('products.distances.15') },
            { id: 25, name: translate('products.distances.25') },
            { id: 50, name: translate('products.distances.50') },
            { id: 75, name: translate('products.distances.75') },
        ];
    }, [translate]);

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        q: string;
        page: number;
        fund_id: number;
        organization_id: number;
        product_category_id: number;
        product_sub_category_id: number;
        postcode: string;
        distance: number;
        from: number;
        to: number;
        qr?: boolean;
        reservation?: boolean;
        extra_payment?: boolean;
        bookmarked: boolean;
        display_type: 'list' | 'grid';
        order_by: 'created_at' | 'price' | 'most_popular' | 'name';
        order_dir: 'asc' | 'desc';
    }>(
        {
            q: '',
            page: 1,
            fund_id: null,
            organization_id: null,
            product_category_id: null,
            product_sub_category_id: null,
            postcode: '',
            distance: null,
            from: 0,
            to: null,
            qr: false,
            reservation: false,
            extra_payment: false,
            bookmarked: false,
            display_type: 'grid',
            order_by: sortByOptions[0]?.value.order_by,
            order_dir: sortByOptions[0]?.value.order_dir,
        },
        {
            throttledValues: ['q', 'from', 'to', 'qr', 'reservation', 'extra_payment'],
            queryParams: {
                q: StringParam,
                page: NumberParam,
                fund_id: NumberParam,
                organization_id: NumberParam,
                product_category_id: NumberParam,
                product_sub_category_id: NumberParam,
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

    const fundFiltered = useMemo(() => {
        return filterValuesActive?.fund_id && funds?.find((item) => item.id === filterValuesActive?.fund_id);
    }, [filterValuesActive?.fund_id, funds]);

    const [products, setProducts] = useState<PaginationData<Product, { price_max: number }>>(null);

    const buildQuery = useCallback(
        (
            values: Partial<{
                q: string;
                page: number;
                fund_id: number;
                organization_id: number;
                product_category_id: number;
                product_sub_category_id: number;
                postcode: string;
                distance: number;
                from: number;
                to: number;
                bookmarked: boolean;
                qr: boolean;
                reservation: boolean;
                extra_payment: boolean;
                order_by: 'created_at' | 'price' | 'most_popular' | 'name';
                order_dir: 'asc' | 'desc';
            }>,
        ) => {
            const hasFilters = values.qr || values.extra_payment || values.reservation;

            return {
                q: values.q,
                page: values.page,
                fund_id: values.fund_id,
                organization_id: values.organization_id,
                product_category_id: values.product_sub_category_id || values.product_category_id,
                postcode: values.postcode || '',
                distance: values.distance || null,
                from: values.from || null,
                to: values.to || null,
                qr: hasFilters ? (values.qr ? 1 : 0) : 0,
                reservation: hasFilters ? (values.reservation ? 1 : 0) : 0,
                extra_payment: hasFilters ? (values.extra_payment ? 1 : 0) : 0,
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

    const fetchFunds = useCallback(() => {
        fundService
            .list({ has_products: 1 })
            .then((res) => setFunds([{ id: null, name: translate('products.filters.all_funds') }, ...res.data.data]));
    }, [fundService, translate]);

    const fetchOrganizations = useCallback(() => {
        organizationService
            .list({ type: 'provider', per_page: 300, order_by: 'name' })
            .then((res) =>
                setOrganizations([{ id: null, name: translate('products.filters.all_providers') }, ...res.data.data]),
            );
    }, [organizationService, translate]);

    const fetchProductCategories = useCallback(() => {
        productCategoryService
            .list({ per_page: 1000, used: 1, parent_id: 'null' })
            .then((res) =>
                setProductCategories([
                    { id: null, name: translate('products.filters.all_categories') },
                    ...res.data.data,
                ]),
            );
    }, [productCategoryService, translate]);

    useEffect(() => {
        fetchFunds();
        fetchOrganizations();
        fetchProductCategories();
    }, [fetchFunds, fetchOrganizations, fetchProductCategories]);

    useEffect(() => {
        fetchProducts(buildQuery(filterValuesActive));
    }, [fetchProducts, buildQuery, filterValuesActive]);

    useEffect(() => {
        if (filterValues.product_category_id) {
            productCategoryService
                .list({
                    parent_id: filterValues.product_category_id,
                    per_page: 1000,
                    used: 1,
                })
                .then((res) => {
                    filterUpdate((values) => {
                        if (!res.data.data?.map((item) => item.id).includes(values.product_sub_category_id)) {
                            return { ...values, product_sub_category_id: null };
                        }

                        return values;
                    });

                    setProductSubCategories(
                        res.data.meta.total
                            ? [{ name: translate('products.filters.all_sub_categories'), id: null }, ...res.data.data]
                            : null,
                    );
                });
        } else {
            filterUpdate({ product_sub_category_id: null });
            setProductSubCategories(null);
        }
    }, [filterUpdate, filterValues.product_category_id, productCategoryService, translate]);

    useEffect(() => {
        setTitle(translate('page_state_titles.products', { fund_name: fundFiltered ? ` ${fundFiltered.name}` : '' }));
    }, [fundFiltered, setTitle, translate]);

    return (
        <BlockShowcasePage
            dusk="listProductsContent"
            countFiltersApplied={countFiltersApplied}
            breadcrumbItems={[
                { name: translate('products.breadcrumbs.home'), state: 'home' },
                { name: translate('products.breadcrumbs.products') },
            ]}
            aside={
                organizations &&
                productCategories &&
                funds &&
                distances && (
                    <div className="showcase-aside-block">
                        {authIdentity && (
                            <div className="showcase-aside-tabs">
                                <div
                                    className={`showcase-aside-tab clickable ${
                                        !filterValues?.bookmarked ? 'active' : ''
                                    }`}
                                    onClick={() => filterUpdate({ bookmarked: false })}
                                    onKeyDown={clickOnKeyEnter}
                                    tabIndex={0}
                                    aria-pressed={!filterValues.bookmarked}
                                    role="button">
                                    <em className="mdi mdi-tag-multiple-outline" />
                                    {translate('products.filters.all_products')}
                                </div>
                                <div
                                    className={`showcase-aside-tab clickable ${
                                        filterValues?.bookmarked ? 'active' : ''
                                    }`}
                                    onClick={() => filterUpdate({ bookmarked: true })}
                                    onKeyDown={clickOnKeyEnter}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={translate('product.buttons.bookmark')}
                                    aria-pressed={!!filterValues.bookmarked}>
                                    <em className="mdi mdi-cards-heart-outline" />

                                    {translate('products.filters.bookmarked')}
                                </div>
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label" htmlFor="products_search">
                                {translate('products.filters.search')}
                            </label>
                            <UIControlText
                                value={filterValues.q}
                                onChangeValue={(q: string) => filterUpdate({ q })}
                                ariaLabel={translate('products.filters.search')}
                                id="products_search"
                                dataDusk="listProductsSearch"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="select_provider">
                                {translate('products.filters.providers')}
                            </label>
                            <SelectControl
                                id={'select_provider'}
                                value={filterValues.organization_id}
                                propKey={'id'}
                                multiline={true}
                                allowSearch={true}
                                onChange={(organization_id: number) => filterUpdate({ organization_id })}
                                options={organizations || []}
                                dusk="selectControlOrganizations"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="select_category">
                                {translate('products.filters.category')}
                            </label>

                            <SelectControl
                                id={'select_category'}
                                propKey={'id'}
                                multiline={true}
                                allowSearch={true}
                                value={filterValues.product_category_id}
                                onChange={(id: number) => filterUpdate({ product_category_id: id })}
                                options={productCategories || []}
                                dusk="selectControlCategories"
                            />
                        </div>

                        {productSubCategories?.length > 1 && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="select_sub_category">
                                    {translate('products.filters.sub_category')}
                                </label>

                                <SelectControl
                                    id={'select_sub_category'}
                                    propKey={'id'}
                                    value={filterValues.product_sub_category_id}
                                    onChange={(id: number) => filterUpdate({ product_sub_category_id: id })}
                                    multiline={true}
                                    allowSearch={true}
                                    options={productSubCategories || []}
                                    dusk="selectControlSubCategories"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="select_fund">
                                {translate('products.filters.fund')}
                            </label>
                            {funds && (
                                <SelectControl
                                    id={'select_fund'}
                                    propKey={'id'}
                                    value={filterValues.fund_id}
                                    multiline={true}
                                    allowSearch={true}
                                    onChange={(fund_id: number) => filterUpdate({ fund_id })}
                                    options={funds || []}
                                    dusk="selectControlFunds"
                                />
                            )}
                        </div>
                        <div className="row">
                            <div className="col col-md-6">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="postcode">
                                        {translate('products.filters.postcode')}
                                    </label>
                                    <input
                                        className="form-control"
                                        id="postcode"
                                        value={filterValues.postcode}
                                        onChange={(e) => filterUpdate({ postcode: e.target.value })}
                                        type="text"
                                        aria-label={translate('products.filters.postcode')}
                                        data-dusk="inputPostcode"
                                    />
                                    <FormError error={errors?.postcode} />
                                </div>
                            </div>
                            <div className="col col-md-6">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="distance">
                                        {translate('products.filters.distance')}
                                    </label>
                                    <SelectControl
                                        id={'distance'}
                                        propKey={'id'}
                                        value={filterValues.distance}
                                        multiline={true}
                                        allowSearch={true}
                                        onChange={(distance: number) => filterUpdate({ distance })}
                                        options={distances || []}
                                        dusk="selectControlDistances"
                                    />
                                    <FormError error={errors?.distance} />
                                </div>
                            </div>
                        </div>

                        <div className="showcase-aside-block-separator" />
                        <div className="showcase-aside-block-title">{translate('products.filters.price')}</div>
                        <div className="row">
                            <div className="col col-md-5">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="from">
                                        {translate('products.filters.price_from')}
                                    </label>
                                    <input
                                        className="form-control"
                                        id="from"
                                        min={0}
                                        max={toMax}
                                        value={filterValues.from || ''}
                                        onChange={(e) =>
                                            filterUpdate({
                                                from: Math.min(Math.max(parseFloat(e.target.value) || 0, 0), toMax),
                                            })
                                        }
                                        type="number"
                                        aria-label={translate('products.filters.price_from')}
                                        data-dusk="inputPriceFrom"
                                    />
                                    <FormError error={errors?.from} />
                                </div>
                            </div>
                            <div className="col col-md-2" />
                            <div className="col col-md-5">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="to">
                                        {translate('products.filters.price_to')}
                                    </label>
                                    <input
                                        className="form-control"
                                        id="to"
                                        min={0}
                                        max={toMax}
                                        value={filterValues.to || toMax}
                                        placeholder={translate('products.filters.price_to')}
                                        onChange={(e) =>
                                            filterUpdate({
                                                to: Math.min(Math.max(parseFloat(e.target.value) || toMax, 0), toMax),
                                            })
                                        }
                                        type="number"
                                        aria-label={translate('products.filters.price_to')}
                                        data-dusk="inputPriceTo"
                                    />
                                    <FormError error={errors?.to} />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <RangeControl
                                min={0}
                                max={toMax}
                                from={filterValues.from || 0}
                                to={filterValues.to || toMax}
                                setFrom={(from) => filterUpdate({ from })}
                                setTo={(to) => filterUpdate({ to })}
                                prefix={'€ '}
                            />
                        </div>

                        <div className="showcase-aside-block-separator" />
                        <div className="showcase-aside-block-title">
                            {translate('products.filters.payment_options')}
                        </div>
                        <div className="showcase-aside-block-info">
                            <a
                                className="showcase-aside-block-info-link"
                                role="button"
                                tabIndex={0}
                                aria-label={translate('products.filters.payment_options_info')}
                                onClick={(e) => {
                                    e.preventDefault();
                                    showProductIconsInfoModal();
                                }}
                                onKeyDown={(e) => clickOnKeyEnter(e, true)}>
                                <em className="mdi mdi-information-outline" aria-hidden="true" />
                                {translate('products.filters.payment_options_info')}
                            </a>
                        </div>

                        <ProductsFilterOptions value={filterValues} setValue={(value) => filterUpdate(value)} />
                    </div>
                )
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
                                        aria-labelledby="sort_by_label"
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
        </BlockShowcasePage>
    );
}
