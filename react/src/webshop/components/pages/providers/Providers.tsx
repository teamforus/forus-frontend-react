import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { PaginationData, ResponseError } from '../../../../dashboard/props/ApiResponses';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import ProductCategory from '../../../../dashboard/props/models/ProductCategory';
import useProductCategoryService from '../../../../dashboard/services/ProductCategoryService';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import FormError from '../../../../dashboard/components/elements/forms/errors/FormError';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import useAppConfigs from '../../../hooks/useAppConfigs';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import { useBusinessTypeService } from '../../../../dashboard/services/BusinessTypeService';
import BusinessType from '../../../../dashboard/props/models/BusinessType';
import { useProviderService } from '../../../services/ProviderService';
import Office from '../../../../dashboard/props/models/Office';
import ProvidersListItem from '../../elements/lists/providers-list/ProvidersListItem';
import { GoogleMap } from '../../../../dashboard/components/elements/google-map/GoogleMap';
import MapMarkerProviderOffice from '../../elements/map-markers/MapMarkerProviderOffice';
import Provider from '../../../props/models/Provider';
import BlockShowcasePage from '../../elements/block-showcase/BlockShowcasePage';
import useFilterNext from '../../../../dashboard/modules/filter_next/useFilterNext';
import { BooleanParam, NumberParam, StringParam } from 'use-query-params';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import UIControlText from '../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import TranslateHtml from '../../../../dashboard/components/elements/translate-html/TranslateHtml';
import classNames from 'classnames';

export default function Providers() {
    const translate = useTranslate();
    const appConfigs = useAppConfigs();
    const setProgress = useSetProgress();

    const fundService = useFundService();
    const providersService = useProviderService();
    const businessTypeService = useBusinessTypeService();
    const productCategoryService = useProductCategoryService();

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

    const [errors, setErrors] = useState<{ [key: string]: string | Array<string> }>({});

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [businessTypes, setBusinessTypes] = useState<Array<Partial<BusinessType>>>(null);

    const [offices, setOffices] = useState<Array<Office>>(null);
    const [providers, setProviders] = useState<PaginationData<Provider>>(null);

    const [productCategories, setProductCategories] = useState<Array<Partial<ProductCategory>>>(null);
    const [productSubCategories, setProductSubCategories] = useState<Array<Partial<ProductCategory>>>(null);

    const showProviderSignUp = useMemo(() => {
        return funds?.filter((fund) => fund.allow_provider_sign_up).length > 0;
    }, [funds]);

    const distances = useMemo(() => {
        return [
            { id: null, name: translate('providers.distances.everywhere') },
            { id: 3, name: translate('providers.distances.3') },
            { id: 5, name: translate('providers.distances.5') },
            { id: 10, name: translate('providers.distances.10') },
            { id: 15, name: translate('providers.distances.15') },
            { id: 25, name: translate('providers.distances.25') },
            { id: 50, name: translate('providers.distances.50') },
            { id: 75, name: translate('providers.distances.75') },
        ];
    }, [translate]);

    type ProviderFilters = {
        q?: string;
        page?: number;
        fund_id?: number;
        business_type_id?: number;
        product_category_id?: number;
        product_sub_category_id?: number;
        postcode?: string;
        distance?: number;
        show_map?: boolean;
        order_by?: 'name';
        order_dir?: 'asc' | 'desc';
    };

    const [filterValues, filterActiveValues, filterUpdate] = useFilterNext<ProviderFilters>(
        {
            q: '',
            page: 1,
            fund_id: null,
            business_type_id: null,
            product_category_id: null,
            product_sub_category_id: null,
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
                fund_id: NumberParam,
                business_type_id: NumberParam,
                product_category_id: NumberParam,
                product_sub_category_id: NumberParam,
                postcode: StringParam,
                distance: NumberParam,
                show_map: BooleanParam,
                order_by: StringParam,
                order_dir: StringParam,
            },
            filterParams: ['show_map'],
        },
    );

    const buildQuery = useCallback(
        (values: ProviderFilters): ProviderFilters => ({
            q: values.q,
            page: values.page,
            fund_id: values.fund_id || null,
            business_type_id: values.business_type_id || null,
            product_category_id: values.product_sub_category_id || values.product_category_id,
            postcode: values.postcode || '',
            distance: values.distance || null,
            order_by: values.order_by || null,
            order_dir: values.order_dir || null,
        }),
        [],
    );

    const countFiltersApplied = useMemo(() => {
        return [filterActiveValues.q, filterActiveValues.fund_id, filterActiveValues.business_type_id].filter(
            (value) => value,
        ).length;
    }, [filterActiveValues]);

    const fetchProviders = useCallback(
        (query: ProviderFilters) => {
            setErrors(null);
            setProgress(0);

            providersService
                .search(query)
                .then((res) => setProviders(res.data))
                .catch((err: ResponseError) => setErrors(err.data.errors))
                .finally(() => setProgress(100));
        },
        [providersService, setProgress],
    );

    const fetchProvidersMap = useCallback(
        (query: object) => {
            setErrors(null);
            setProgress(0);

            providersService
                .search({ ...query, per_page: 1000 })
                .then((res) => {
                    setProviders(res.data);
                    setOffices(res.data.data.reduce((arr, provider) => arr.concat(provider.offices), []));
                })
                .catch((err: ResponseError) => setErrors(err.data.errors))
                .finally(() => setProgress(100));
        },
        [providersService, setProgress],
    );

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list({ has_providers: 1 })
            .then((res) => setFunds([{ id: null, name: translate('providers.filters.all_funds') }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [fundService, setProgress, translate]);

    const fetchBusinessTypes = useCallback(() => {
        setProgress(0);

        businessTypeService
            .list({ parent_id: 'null', per_page: 9999, used: 1 })
            .then((res) =>
                setBusinessTypes([{ id: null, name: translate('providers.filters.all_types') }, ...res.data.data]),
            )
            .finally(() => setProgress(100));
    }, [businessTypeService, setProgress, translate]);

    const fetchProductCategories = useCallback(() => {
        setProgress(0);

        productCategoryService
            .list({ parent_id: 'null', used: 1, per_page: 1000 })
            .then((res) =>
                setProductCategories([
                    { id: null, name: translate('providers.filters.all_categories') },
                    ...res.data.data,
                ]),
            )
            .finally(() => setProgress(100));
    }, [productCategoryService, setProgress, translate]);

    useEffect(() => {
        fetchFunds();
        fetchBusinessTypes();
        fetchProductCategories();
    }, [fetchFunds, fetchBusinessTypes, fetchProductCategories]);

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
                            ? [{ name: translate('providers.filters.all_sub_categories'), id: null }, ...res.data.data]
                            : null,
                    );
                });
        } else {
            filterUpdate({ product_sub_category_id: null });
            setProductSubCategories(null);
        }
    }, [filterUpdate, filterValues.product_category_id, productCategoryService, translate]);

    useEffect(() => {
        if (filterValues.show_map) {
            fetchProvidersMap(buildQuery(filterActiveValues));
        } else {
            fetchProviders(buildQuery(filterActiveValues));
        }
    }, [filterActiveValues, fetchProvidersMap, fetchProviders, buildQuery, filterValues?.show_map]);

    return (
        <BlockShowcasePage
            contentStyles={filterValues?.show_map ? { background: '#fff' } : undefined}
            showCaseClassName={filterValues.show_map ? 'block-showcase-fullscreen' : ''}
            countFiltersApplied={countFiltersApplied}
            breadcrumbItems={
                !filterValues.show_map && [
                    { name: translate('providers.breadcrumbs.home'), state: 'home' },
                    { name: translate('providers.breadcrumbs.providers') },
                ]
            }
            aside={
                funds &&
                appConfigs &&
                businessTypes &&
                productCategories && (
                    <Fragment>
                        <div className="showcase-aside-block">
                            {filterValues.show_map && (
                                <div className="showcase-subtitle">{translate('providers.filters.map_title')}</div>
                            )}
                            <div className="form-group">
                                <label className="form-label" htmlFor="business_type_id">
                                    {translate('providers.filters.search')}
                                </label>
                                <UIControlText
                                    value={filterValues.q}
                                    onChangeValue={(q) => filterUpdate({ q })}
                                    ariaLabel={translate('providers.filters.search')}
                                />
                                <FormError error={errors?.q} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="business_type_id">
                                    {translate('providers.filters.provider_type')}
                                </label>
                                <SelectControl
                                    propKey={'id'}
                                    options={businessTypes}
                                    value={filterValues.business_type_id}
                                    onChange={(business_type_id?: number) => filterUpdate({ business_type_id })}
                                    id="business_type_id"
                                    multiline={true}
                                    allowSearch={false}
                                />
                                <FormError error={errors?.business_type_id} />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="select_category">
                                    {translate('providers.filters.category')}
                                </label>

                                <SelectControl
                                    id={'select_category'}
                                    propKey={'id'}
                                    multiline={true}
                                    allowSearch={true}
                                    value={filterValues.product_category_id}
                                    onChange={(id: number) => filterUpdate({ product_category_id: id })}
                                    options={productCategories || []}
                                />
                            </div>

                            {productSubCategories?.length > 1 && (
                                <div className="form-group">
                                    <label className="form-label" htmlFor="select_sub_category">
                                        {translate('providers.filters.sub_category')}
                                    </label>

                                    <SelectControl
                                        id={'select_sub_category'}
                                        propKey={'id'}
                                        value={filterValues.product_sub_category_id}
                                        onChange={(id: number) => filterUpdate({ product_sub_category_id: id })}
                                        multiline={true}
                                        allowSearch={true}
                                        options={productSubCategories || []}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label" htmlFor="select_fund">
                                    {translate('providers.filters.fund')}
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
                                            {translate('providers.filters.postcode')}
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
                                            {translate('providers.filters.distance')}
                                        </label>

                                        <SelectControl
                                            id={'distance'}
                                            propKey={'id'}
                                            value={filterValues.distance}
                                            multiline={true}
                                            allowSearch={true}
                                            onChange={(distance: number) => filterUpdate({ distance })}
                                            options={distances || []}
                                        />
                                        <FormError error={errors?.distance} />
                                    </div>
                                </div>
                            </div>

                            {filterValues.show_map && (
                                <TranslateHtml
                                    component={<div />}
                                    className={'showcase-result'}
                                    i18n={'providers.filters.result'}
                                    values={{ total: providers?.meta?.total }}
                                />
                            )}
                        </div>

                        {!filterValues.show_map && appConfigs.pages.provider && showProviderSignUp && (
                            <StateNavLink
                                name={'sign-up'}
                                className="button button-primary hide-sm"
                                dataDusk="providerSignUpLink">
                                <em className="mdi mdi-store-outline" aria-hidden="true" />
                                {translate('profile_menu.buttons.provider_sign_up')}
                                <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                            </StateNavLink>
                        )}
                    </Fragment>
                )
            }>
            {appConfigs && (providers || offices) && (
                <Fragment>
                    <div className="showcase-content-header showcase-content-header-compact" style={{ zIndex: 4 }}>
                        <h1 className="showcase-filters-title">
                            {translate('providers.title')}
                            <div className="showcase-filters-title-count" data-nosnippet="true">
                                {providers?.meta.total}
                            </div>
                        </h1>
                        <div className="showcase-filters-block">
                            <div className="block block-label-tabs form">
                                {!filterValues.show_map && (
                                    <div className={classNames('showcase-filters-item')}>
                                        <label className="form-label">{translate('providers.filters.sort')}</label>
                                        <SelectControl
                                            id={'sort_by'}
                                            allowSearch={false}
                                            propKey={'id'}
                                            propValue={'label'}
                                            options={sortByOptions}
                                            value={
                                                sortByOptions.find(
                                                    (option) =>
                                                        option.value.order_by == filterValues.order_by &&
                                                        option.value.order_dir == filterValues.order_dir,
                                                )?.id
                                            }
                                            onChange={(id: number) => {
                                                filterUpdate(
                                                    sortByOptions.find((option) => option.id == id)?.value || {},
                                                );
                                            }}
                                        />
                                    </div>
                                )}
                                {appConfigs?.show_providers_map && (
                                    <div
                                        className={classNames(
                                            'block',
                                            'block-label-tabs',
                                            'pull-right',
                                            filterValues.show_map && 'block-label-tabs-sm',
                                        )}>
                                        <button
                                            className={classNames(
                                                'label-tab',
                                                'label-tab-sm',
                                                !filterValues.show_map && 'active',
                                            )}
                                            onClick={() => filterUpdate({ show_map: false })}
                                            onKeyDown={clickOnKeyEnter}
                                            tabIndex={0}
                                            aria-pressed={!filterValues.show_map}>
                                            <em className="mdi mdi-format-list-text icon-start" />
                                            {translate('providers.view.list')}
                                        </button>
                                        <button
                                            className={classNames(
                                                'label-tab',
                                                'label-tab-sm',
                                                filterValues.show_map && 'active',
                                            )}
                                            onClick={() => filterUpdate({ show_map: true })}
                                            onKeyDown={clickOnKeyEnter}
                                            tabIndex={0}
                                            aria-pressed={!!filterValues.show_map}>
                                            <em className="mdi mdi-map-marker-radius icon-start" />
                                            {translate('providers.view.map')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {appConfigs.pages.providers && <CmsBlocks page={appConfigs.pages.providers} />}

                    {!filterValues.show_map && (
                        <div
                            className="block block-organizations"
                            id="providers_list"
                            hidden={providers?.data.length == 0}>
                            {providers.data.map((provider) => (
                                <ProvidersListItem key={provider.id} provider={provider} display={'list'} />
                            ))}

                            <div className="card" hidden={providers?.meta?.last_page < 2}>
                                <div className="card-section">
                                    <Paginator
                                        meta={providers.meta}
                                        filters={filterValues}
                                        updateFilters={filterUpdate}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {providers?.data?.length == 0 && !filterValues.show_map && (
                        <EmptyBlock
                            title={translate('block_providers.empty.title')}
                            description={translate('block_providers.empty.subtitle')}
                            hideLink={true}
                            svgIcon={'reimbursements'}
                        />
                    )}

                    {!!filterValues.show_map && (
                        <div className="block block-google-map">
                            {offices && (
                                <GoogleMap
                                    appConfigs={appConfigs}
                                    mapPointers={offices}
                                    mapGestureHandling={'greedy'}
                                    mapGestureHandlingMobile={'greedy'}
                                    markerTemplate={(office: Office) => <MapMarkerProviderOffice office={office} />}
                                />
                            )}
                        </div>
                    )}
                </Fragment>
            )}
        </BlockShowcasePage>
    );
}
