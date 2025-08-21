import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import { mainContext } from '../../../contexts/MainContext';
import { SearchItem, useSearchService } from '../../../services/SearchService';
import { useFundService } from '../../../services/FundService';
import { useOrganizationService } from '../../../../dashboard/services/OrganizationService';
import Fund from '../../../props/models/Fund';
import useProductCategoryService from '../../../../dashboard/services/ProductCategoryService';
import ProductCategory from '../../../../dashboard/props/models/ProductCategory';
import Organization from '../../../../dashboard/props/models/Organization';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import SearchItemsList from './elements/SearchItemsList';
import { useVoucherService } from '../../../services/VoucherService';
import Voucher from '../../../../dashboard/props/models/Voucher';
import BlockShowcasePage from '../../elements/block-showcase/BlockShowcasePage';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import useFilterNext from '../../../../dashboard/modules/filter_next/useFilterNext';
import { BooleanParam, NumberParam, StringParam } from 'use-query-params';
import { clickOnKeyEnter, clickOnKeyEnterOrSpace } from '../../../../dashboard/helpers/wcag';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import PayoutTransaction from '../../../../dashboard/props/models/PayoutTransaction';
import usePayoutTransactionService from '../../../services/PayoutTransactionService';

export default function Search() {
    const authIdentity = useAuthIdentity();

    const translate = useTranslate();
    const setProgress = useSetProgress();

    const fundService = useFundService();
    const searchService = useSearchService();
    const voucherService = useVoucherService();
    const organizationService = useOrganizationService();
    const productCategoryService = useProductCategoryService();
    const payoutTransactionService = usePayoutTransactionService();

    const { searchFilter } = useContext(mainContext);

    const [displayType, setDisplayType] = useState<'list' | 'grid'>('list');
    const [searchItems, setSearchItems] = useState<PaginationData<SearchItem & { stateParams?: object }>>(null);

    const globalQuery = useMemo(() => searchFilter?.values?.q, [searchFilter?.values?.q]);
    const [globalInitialized, setGlobalInitialized] = useState(false);

    // Search direction
    const [sortByOptions] = useState<
        Array<{
            id: number;
            label: string;
            value: { order_by: 'created_at'; order_dir: 'asc' | 'desc' };
        }>
    >([
        {
            id: 1,
            label: translate('search.sort_by.created_at_asc'),
            value: { order_by: 'created_at', order_dir: 'asc' },
        },
        {
            id: 2,
            label: translate('search.sort_by.created_at_desc'),
            value: { order_by: 'created_at', order_dir: 'desc' },
        },
    ]);

    // Search by resource type
    const [searchItemTypes] = useState<Array<{ label: string; key: 'funds' | 'products' | 'providers' }>>([
        { label: translate('search.entities.funds'), key: 'funds' },
        { label: translate('search.entities.products'), key: 'products' },
        { label: translate('search.entities.providers'), key: 'providers' },
    ]);

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [payouts, setPayouts] = useState<Array<PayoutTransaction>>(null);
    const [vouchers, setVouchers] = useState<Array<Voucher>>(null);
    const [organizations, setOrganizations] = useState<Array<Partial<Organization>>>(null);
    const [productCategories, setProductCategories] = useState<Array<Partial<ProductCategory>>>(null);

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        q: string;
        page: number;
        fund_id: number;
        organization_id: number;
        product_category_id: number;
        funds: boolean;
        products: boolean;
        providers: boolean;
        order_by: 'created_at';
        order_dir: 'asc' | 'desc';
    }>(
        {
            q: '',
            page: 1,
            fund_id: null,
            organization_id: null,
            product_category_id: null,
            funds: false,
            products: false,
            providers: false,
            order_by: sortByOptions[1]?.value.order_by,
            order_dir: sortByOptions[1]?.value.order_dir,
        },
        {
            queryParams: {
                q: StringParam,
                page: NumberParam,
                fund_id: NumberParam,
                organization_id: NumberParam,
                product_category_id: NumberParam,
                funds: BooleanParam,
                products: BooleanParam,
                providers: BooleanParam,
                order_by: StringParam,
                order_dir: StringParam,
            },
            throttledValues: ['q', 'funds', 'products', 'providers'],
        },
    );

    const transformItems = useCallback(function (items: PaginationData<SearchItem>, stateParams: object) {
        return {
            ...items,
            ...{ data: items.data.map((item: SearchItem) => ({ ...item, stateParams })) },
        };
    }, []);

    const doSearch = useCallback(
        (query: object, stateParams?: object) => {
            setProgress(0);

            searchService
                .search(query)
                .then((res) => setSearchItems(transformItems(res.data, stateParams)))
                .finally(() => setProgress(100));
        },
        [searchService, transformItems, setProgress],
    );

    const countFiltersApplied = useMemo(() => {
        return (
            Object.keys(filterValuesActive)
                .filter((key) => key !== 'q')
                .reduce((count: number, key) => {
                    const filter = filterValuesActive[key];
                    const item = filter
                        ? typeof filter == 'object'
                            ? filter['id'] || (Array.isArray(filter) ? filter.length : 0)
                            : 1
                        : 0;

                    return count + item;
                }, 0) - 3
        );
    }, [filterValuesActive]);

    const fetchVouchers = useCallback(() => {
        setProgress(0);

        voucherService
            .list()
            .then((res) => setVouchers(res.data.data))
            .finally(() => setProgress(100));
    }, [setProgress, voucherService]);

    const fetchPayouts = useCallback(() => {
        setProgress(0);

        payoutTransactionService
            .list()
            .then((res) => setPayouts(res.data.data))
            .finally(() => setProgress(100));
    }, [setProgress, payoutTransactionService]);

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list({ with_external: 1 })
            .then((res) => setFunds([{ id: null, name: translate('search.filters.all_funds') }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [fundService, setProgress, translate]);

    const fetchOrganizations = useCallback(() => {
        setProgress(0);

        organizationService
            .list({ type: 'provider', per_page: 500, order_by: 'name' })
            .then((res) =>
                setOrganizations([{ id: null, name: translate('search.filters.all_providers') }, ...res.data.data]),
            )
            .finally(() => setProgress(100));
    }, [organizationService, setProgress, translate]);

    const fetchProductCategories = useCallback(() => {
        setProgress(0);

        productCategoryService
            .list({ parent_id: 'null', used: 1, per_page: 1000 })
            .then((res) =>
                setProductCategories([
                    { id: null, name: translate('search.filters.all_categories') },
                    ...res.data.data,
                ]),
            )
            .finally(() => setProgress(100));
    }, [productCategoryService, setProgress, translate]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        if (authIdentity) {
            fetchVouchers();
            fetchPayouts();
        } else {
            setVouchers([]);
            setPayouts([]);
        }
    }, [authIdentity, fetchPayouts, fetchVouchers]);

    useEffect(() => {
        fetchOrganizations();
    }, [fetchOrganizations]);

    useEffect(() => {
        fetchProductCategories();
    }, [fetchProductCategories]);

    useEffect(() => {
        doSearch(
            {
                ...filterValuesActive,
                overview: 0,
                with_external: 1,
                funds: undefined,
                products: undefined,
                providers: undefined,
                search_item_types: [
                    filterValuesActive.funds ? 'funds' : null,
                    filterValuesActive.providers ? 'providers' : null,
                    filterValuesActive.products ? 'products' : null,
                ].filter((type) => type),
            },
            { showBack: true },
        );
    }, [doSearch, filterValuesActive, sortByOptions]);

    useEffect(() => {
        setGlobalInitialized(true);

        if (!globalInitialized && filterValues?.q) {
            setTimeout(() => searchFilter.update({ q: filterValues.q }), 150);
        }
    }, [filterValues.q, globalInitialized, searchFilter]);

    useEffect(() => {
        filterUpdate({ q: globalQuery });
    }, [filterUpdate, globalQuery]);

    return (
        <BlockShowcasePage
            countFiltersApplied={countFiltersApplied}
            breadcrumbItems={[
                { name: translate('search.breadcrumbs.home'), state: 'home' },
                { name: translate('search.breadcrumbs.search') },
            ]}
            dusk="searchListContent"
            aside={
                funds &&
                organizations &&
                productCategories && (
                    <div className="showcase-aside-block">
                        <div className="form-label">{translate('search.filters.highlighted')}</div>
                        {searchItemTypes?.map((itemType) => (
                            <div key={itemType.key} className="form-group">
                                <div className="checkbox" role="checkbox" aria-checked={filterValues?.[itemType.key]}>
                                    <input
                                        tabIndex={-1}
                                        aria-hidden="true"
                                        type="checkbox"
                                        id={`type_${itemType.key}`}
                                        checked={filterValues?.[itemType.key]}
                                        onChange={() => filterUpdate({ [itemType.key]: !filterValues?.[itemType.key] })}
                                    />
                                    <label
                                        className="checkbox-label"
                                        htmlFor={`type_${itemType.key}`}
                                        data-dusk={`searchType_${itemType.key}`}>
                                        <div className="checkbox-box" tabIndex={0} onKeyDown={clickOnKeyEnterOrSpace}>
                                            <em className="mdi mdi-check" />
                                        </div>
                                        {itemType.label}
                                    </label>
                                </div>
                            </div>
                        ))}

                        {productCategories && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="category_id">
                                    {translate('search.filters.category')}
                                </label>
                                <SelectControl
                                    id="category_id"
                                    propKey="id"
                                    multiline={true}
                                    allowSearch={true}
                                    value={filterValues.product_category_id}
                                    onChange={(id?: number) => filterUpdate({ product_category_id: id })}
                                    options={productCategories}
                                    dusk="selectControlCategories"
                                />
                            </div>
                        )}

                        {funds && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="fund_id">
                                    {translate('search.filters.funds')}
                                </label>
                                <SelectControl
                                    id="fund_id"
                                    propKey="id"
                                    multiline={true}
                                    allowSearch={true}
                                    value={filterValues.fund_id}
                                    onChange={(id?: number) => filterUpdate({ fund_id: id })}
                                    options={funds}
                                    dusk="selectControlFunds"
                                />
                            </div>
                        )}

                        {organizations && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="organizatie_id">
                                    {translate('search.filters.providers')}
                                </label>
                                <SelectControl
                                    id="organizations_id"
                                    propKey="id"
                                    multiline={true}
                                    allowSearch={true}
                                    value={filterValues.organization_id}
                                    onChange={(id?: number) => filterUpdate({ organization_id: id })}
                                    options={organizations}
                                    dusk="selectControlOrganizations"
                                />
                            </div>
                        )}
                    </div>
                )
            }>
            {searchItems && (
                <Fragment>
                    <div className="showcase-content-header">
                        <div className="showcase-filters-title">
                            {translate('search.title')}
                            {filterValuesActive.q && (
                                <Fragment>
                                    {' ' + translate('search.filters.found_for', { query: filterValuesActive.q })}
                                </Fragment>
                            )}
                            <div className="showcase-filters-title-count" data-nosnippet="true">
                                {searchItems?.meta?.total}
                            </div>
                        </div>
                        <div className="showcase-filters-block">
                            <div className="block block-label-tabs form">
                                <div className="showcase-filters-item">
                                    <label className="form-label">{translate('search.filters.sort')}</label>
                                    <SelectControl
                                        id="sort_by"
                                        propKey={'id'}
                                        propValue={'label'}
                                        allowSearch={false}
                                        options={sortByOptions}
                                        value={
                                            sortByOptions.find(
                                                (option) =>
                                                    option.value.order_by == filterValues.order_by &&
                                                    option.value.order_dir == filterValues.order_dir,
                                            )?.id
                                        }
                                        onChange={(id: number) => {
                                            filterUpdate(sortByOptions.find((option) => option.id == id)?.value || {});
                                        }}
                                        dusk="selectControlOrderBy"
                                    />
                                </div>

                                <div className="label-tab-set">
                                    <div
                                        className={`label-tab label-tab-sm ${displayType == 'list' ? 'active' : ''}`}
                                        onClick={() => setDisplayType('list')}
                                        onKeyDown={clickOnKeyEnter}
                                        tabIndex={0}
                                        aria-pressed={displayType == 'list'}
                                        role="button">
                                        <em className="mdi mdi-format-list-text icon-start" />
                                        {translate('search.view.list')}
                                    </div>
                                    <div
                                        className={`label-tab label-tab-sm ${displayType == 'grid' ? 'active' : ''}`}
                                        onClick={() => setDisplayType('grid')}
                                        onKeyDown={clickOnKeyEnter}
                                        tabIndex={0}
                                        aria-pressed={displayType == 'grid'}
                                        role="button">
                                        <em className="mdi mdi-view-grid-outline icon-start" />
                                        {translate('search.view.photos')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {searchItems?.data?.length > 0 && (
                        <SearchItemsList
                            items={searchItems.data}
                            vouchers={vouchers}
                            payouts={payouts}
                            display={displayType}
                        />
                    )}

                    {searchItems?.data?.length == 0 && (
                        <EmptyBlock
                            title={translate('block_products.labels.title')}
                            svgIcon="reimbursements"
                            description={translate('block_products.labels.subtitle')}
                            hideLink={true}
                        />
                    )}

                    <div className="card" hidden={searchItems?.meta?.last_page < 2}>
                        <div className="card-section">
                            <Paginator meta={searchItems.meta} filters={filterValues} updateFilters={filterUpdate} />
                        </div>
                    </div>
                </Fragment>
            )}
        </BlockShowcasePage>
    );
}
