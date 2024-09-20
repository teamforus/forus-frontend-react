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
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import SelectControlOptions from '../../../../dashboard/components/elements/select-control/templates/SelectControlOptions';
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

export default function Products({ fundType = 'budget' }: { fundType: 'budget' | 'subsidies' }) {
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();

    const fundService = useFundService();
    const productService = useProductService();
    const organizationService = useOrganizationService();
    const productCategoryService = useProductCategoryService();

    const setTitle = useSetTitle();
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const [sortByOptions] = useState(productService.getSortOptions());

    const [errors, setErrors] = useState<{ [key: string]: string | Array<string> }>({});

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [organizations, setOrganizations] = useState<Array<Partial<Organization>>>(null);
    const [productCategories, setProductCategories] = useState<Array<Partial<ProductCategory>>>(null);
    const [productSubCategories, setProductSubCategories] = useState<Array<Partial<ProductCategory>>>(null);

    const [distances] = useState([
        { id: null, name: 'Overal' },
        { id: 3, name: '< 3 km' },
        { id: 5, name: '< 5 km' },
        { id: 10, name: '< 10 km' },
        { id: 15, name: '< 15 km' },
        { id: 25, name: '< 25 km' },
        { id: 50, name: '< 50 km' },
        { id: 75, name: '< 75 km' },
    ]);

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        q: string;
        page: number;
        fund_id: number;
        organization_id: number;
        product_category_id: number;
        product_sub_category_id: number;
        postcode: string;
        distance: number;
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
            bookmarked: false,
            display_type: 'list',
            order_by: sortByOptions[0]?.value.order_by,
            order_dir: sortByOptions[0]?.value.order_dir,
        },
        {
            throttledValues: ['q'],
            queryParams: {
                q: StringParam,
                page: NumberParam,
                fund_id: NumberParam,
                organization_id: NumberParam,
                product_category_id: NumberParam,
                product_sub_category_id: NumberParam,
                postcode: StringParam,
                distance: NumberParam,
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

    const [products, setProducts] = useState<PaginationData<Product>>(null);

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
                bookmarked: boolean;
                display_type: 'list' | 'grid';
                order_by: 'created_at' | 'price' | 'most_popular' | 'name';
                order_dir: 'asc' | 'desc';
            }>,
        ) => {
            const isSortingByPrice = values.order_by === 'price';

            return {
                q: values.q,
                page: values.page,
                fund_id: values.fund_id,
                organization_id: values.organization_id,
                product_category_id: values.product_category_id,
                fund_type: fundType,
                postcode: values.postcode || '',
                distance: values.distance || null,
                bookmarked: values.bookmarked ? 1 : 0,
                order_by: isSortingByPrice ? (fundType === 'budget' ? 'price' : 'price_min') : values.order_by,
                order_dir: values.order_dir,
            };
        },
        [fundType],
    );

    const fetchProducts = useCallback(
        (query: object) => {
            setErrors(null);
            setProgress(0);

            productService
                .list({ fund_type: fundType, ...query })
                .then((res) => setProducts(res.data))
                .catch((e: ResponseError) => setErrors(e.data.errors))
                .finally(() => setProgress(100));
        },
        [fundType, productService, setProgress],
    );

    const fetchFunds = useCallback(() => {
        fundService
            .list(fundType === 'budget' ? { has_products: 1 } : { has_subsidies: 1 })
            .then((res) => setFunds([{ id: null, name: 'Alle tegoeden...' }, ...res.data.data]));
    }, [fundService, fundType]);

    const fetchOrganizations = useCallback(() => {
        organizationService
            .list({ is_employee: 0, has_products: 1, per_page: 300, fund_type: fundType })
            .then((res) => setOrganizations([{ id: null, name: 'Selecteer aanbieder...' }, ...res.data.data]));
    }, [organizationService, fundType]);

    const fetchProductCategories = useCallback(() => {
        productCategoryService
            .list({ per_page: 1000, used: 1, used_type: fundType, parent_id: 'null' })
            .then((res) => setProductCategories([{ id: null, name: 'Selecteer categorie...' }, ...res.data.data]));
    }, [productCategoryService, fundType]);

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
                    used_type: fundType,
                })
                .then((res) => {
                    filterUpdate({ product_sub_category_id: null });
                    setProductSubCategories(
                        res.data.meta.total
                            ? [{ name: 'Selecteer subcategorie...', id: null }, ...res.data.data]
                            : null,
                    );
                });
        } else {
            filterUpdate({ product_sub_category_id: null });
            setProductSubCategories(null);
        }
    }, [filterUpdate, fundType, filterValues.product_category_id, productCategoryService]);

    useEffect(() => {
        setTitle(translate('page_state_titles.products', { fund_name: fundFiltered ? ` ${fundFiltered.name}` : '' }));
    }, [fundFiltered, setTitle, translate]);

    return (
        <BlockShowcasePage
            countFiltersApplied={countFiltersApplied}
            breadcrumbs={
                <div className="block block-breadcrumbs">
                    <StateNavLink name={'home'} className="breadcrumb-item">
                        Home
                    </StateNavLink>
                    <div className="breadcrumb-item active" aria-current="location">
                        Aanbod
                    </div>
                </div>
            }
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
                                    Volledig aanbod
                                </div>
                                <div
                                    className={`showcase-aside-tab clickable ${
                                        filterValues?.bookmarked ? 'active' : ''
                                    }`}
                                    onClick={() => filterUpdate({ bookmarked: true })}
                                    onKeyDown={clickOnKeyEnter}
                                    role="button"
                                    tabIndex={0}
                                    aria-label="Toevoegen aan verlanglijstje"
                                    aria-pressed={!!filterValues.bookmarked}>
                                    <em className="mdi mdi-cards-heart-outline" />
                                    Mijn verlanglijstje
                                </div>
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label" htmlFor="products_search">
                                Zoek aanbod
                            </label>
                            <UIControlText
                                value={filterValues.q}
                                onChangeValue={(q: string) => filterUpdate({ q })}
                                ariaLabel="Zoeken"
                                id="products_search"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="select_provider">
                                Aanbieders
                            </label>
                            <SelectControl
                                id={'select_provider'}
                                value={filterValues.organization_id}
                                propKey={'id'}
                                allowSearch={true}
                                onChange={(organization_id: number) => filterUpdate({ organization_id })}
                                options={organizations || []}
                                optionsComponent={SelectControlOptions}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="select_category">
                                Categorie
                            </label>

                            <SelectControl
                                id={'select_category'}
                                propKey={'id'}
                                allowSearch={true}
                                value={filterValues.product_category_id}
                                onChange={(id: number) => filterUpdate({ product_category_id: id })}
                                options={productCategories || []}
                                optionsComponent={SelectControlOptions}
                            />
                        </div>

                        {productSubCategories?.length > 1 && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="select_sub_category">
                                    Subcategorie
                                </label>

                                <SelectControl
                                    id={'select_sub_category'}
                                    propKey={'id'}
                                    value={filterValues.product_sub_category_id}
                                    onChange={(id: number) => filterUpdate({ product_sub_category_id: id })}
                                    allowSearch={true}
                                    options={productSubCategories || []}
                                    optionsComponent={SelectControlOptions}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="select_fund">
                                Tegoeden
                            </label>
                            {funds && (
                                <SelectControl
                                    id={'select_fund'}
                                    propKey={'id'}
                                    value={filterValues.fund_id}
                                    allowSearch={true}
                                    onChange={(fund_id: number) => filterUpdate({ fund_id })}
                                    options={funds || []}
                                    optionsComponent={SelectControlOptions}
                                />
                            )}
                        </div>
                        <div className="row">
                            <div className="col col-md-6">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="postcode">
                                        Postcode
                                    </label>
                                    <input
                                        className="form-control"
                                        id="postcode"
                                        value={filterValues.postcode}
                                        onChange={(e) => filterUpdate({ postcode: e.target.value })}
                                        type="text"
                                        aria-label="Postcode"
                                    />
                                    <FormError error={errors?.postcode} />
                                </div>
                            </div>
                            <div className="col col-md-6">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="distance">
                                        Afstand
                                    </label>

                                    <SelectControl
                                        id={'select_fund'}
                                        propKey={'id'}
                                        value={filterValues.distance}
                                        allowSearch={true}
                                        onChange={(distance: number) => filterUpdate({ distance })}
                                        options={distances || []}
                                        optionsComponent={SelectControlOptions}
                                    />
                                    <FormError error={errors?.distance} />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }>
            {appConfigs && products && (
                <Fragment>
                    <div className="showcase-content-header">
                        <h1 className="showcase-filters-title">
                            {filterValues.bookmarked ? 'Mijn verlanglijstje' : 'Aanbod'}
                            <div className="showcase-filters-title-count">{products?.meta?.total}</div>
                        </h1>
                        <div className="showcase-filters-block">
                            <div className="block block-label-tabs form">
                                <div className="showcase-filters-item">
                                    <div className="form-label" id={'sort_by_label'}>
                                        Sorteer
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
                                        optionsComponent={SelectControlOptions}
                                    />
                                </div>
                                <div className="label-tab-set">
                                    <div
                                        className={`label-tab label-tab-sm ${
                                            filterValues.display_type == 'list' ? 'active' : ''
                                        }`}
                                        onClick={() => filterUpdate({ display_type: 'list' })}
                                        onKeyDown={clickOnKeyEnter}
                                        tabIndex={0}
                                        aria-pressed={filterValues.display_type == 'list'}
                                        role="button">
                                        <em className="mdi mdi-format-list-text icon-start" />
                                        Lijst
                                    </div>
                                    <div
                                        className={`label-tab label-tab-sm ${
                                            filterValues.display_type == 'grid' ? 'active' : ''
                                        }`}
                                        onClick={() => filterUpdate({ display_type: 'grid' })}
                                        onKeyDown={clickOnKeyEnter}
                                        tabIndex={0}
                                        aria-pressed={filterValues.display_type == 'grid'}
                                        role="button">
                                        <em className="mdi mdi-view-grid-outline icon-start" />
                                        {"Foto's"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {appConfigs.pages.products && <CmsBlocks page={appConfigs.pages.products} />}

                    {products?.meta?.total > 0 && (
                        <ProductsList
                            type={fundType}
                            large={false}
                            display={filterValues.display_type}
                            products={products.data}
                        />
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
