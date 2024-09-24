import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { PaginationData, ResponseError } from '../../../../dashboard/props/ApiResponses';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import ProductCategory from '../../../../dashboard/props/models/ProductCategory';
import useProductCategoryService from '../../../../dashboard/services/ProductCategoryService';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import SelectControlOptions from '../../../../dashboard/components/elements/select-control/templates/SelectControlOptions';
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
        { id: 1, label: 'Naam (oplopend)', value: { order_by: 'name', order_dir: 'asc' } },
        { id: 2, label: 'Naam (aflopend)', value: { order_by: 'name', order_dir: 'desc' } },
    ]);

    const [errors, setErrors] = useState<{ [key: string]: string | Array<string> }>({});

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [businessTypes, setBusinessTypes] = useState<Array<Partial<BusinessType>>>(null);

    const [offices, setOffices] = useState<Array<Office>>(null);
    const [providers, setProviders] = useState<PaginationData<Provider>>(null);

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
            product_category_id: values.product_category_id || null,
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

            console.log('fetchProviders', query);

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
            .then((res) => setFunds([{ id: null, name: 'Alle tegoeden...' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [fundService, setProgress]);

    const fetchBusinessTypes = useCallback(() => {
        setProgress(0);

        businessTypeService
            .list({ parent_id: 'null', per_page: 9999, used: 1 })
            .then((res) => setBusinessTypes([{ id: null, name: 'Alle typen...' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [businessTypeService, setProgress]);

    const fetchProductCategories = useCallback(() => {
        setProgress(0);

        productCategoryService
            .list({ parent_id: 'null', used: 1, per_page: 1000 })
            .then((res) => setProductCategories([{ id: null, name: 'Selecteer categorie...' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [productCategoryService, setProgress]);

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
    }, [filterUpdate, filterValues.product_category_id, productCategoryService]);

    useEffect(() => {
        console.log('show_map', filterValues.show_map);
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
            breadcrumbs={
                <div className="block block-breadcrumbs">
                    <StateNavLink name={'home'} className="breadcrumb-item">
                        Home
                    </StateNavLink>
                    <div className="breadcrumb-item active" aria-current="location">
                        Aanbieders
                    </div>
                </div>
            }
            aside={
                funds &&
                appConfigs &&
                businessTypes &&
                productCategories && (
                    <Fragment>
                        <div className="showcase-aside-block">
                            {filterValues.show_map && (
                                <div className="showcase-subtitle">Selecteer een aanbieder voor meer informatie</div>
                            )}
                            <div className="form-group">
                                <label className="form-label" htmlFor="business_type_id">
                                    {translate('providers.labels.search')}
                                </label>
                                <UIControlText
                                    value={filterValues.q}
                                    onChangeValue={(q) => filterUpdate({ q })}
                                    ariaLabel={translate('providers.labels.search_aria_label')}
                                />

                                <FormError error={errors?.q} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="business_type_id">
                                    Type aanbieder
                                </label>
                                <SelectControl
                                    propKey={'id'}
                                    options={businessTypes}
                                    value={filterValues.business_type_id}
                                    onChange={(business_type_id?: number) => filterUpdate({ business_type_id })}
                                    id="business_type_id"
                                    optionsComponent={SelectControlOptions}
                                />
                                <FormError error={errors?.business_type_id} />
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
                            {filterValues.show_map && (
                                <div className="showcase-result">
                                    Er zijn <div className="showcase-result-count">{providers?.meta?.total}</div>{' '}
                                    aanbieders gevonden
                                </div>
                            )}
                        </div>

                        {!filterValues.show_map && appConfigs.pages.provider && (
                            <StateNavLink name={'sign-up'} className="button button-primary hide-sm">
                                <em className="mdi mdi-store-outline" aria-hidden="true" />
                                Aanmelden als aanbieder
                                <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                            </StateNavLink>
                        )}
                    </Fragment>
                )
            }>
            {appConfigs && (providers || offices) && (
                <Fragment>
                    <div className="showcase-content-header showcase-content-header-compact">
                        <h1 className="showcase-filters-title">
                            <span>Aanbieders</span>
                            <div className="showcase-filters-title-count">{providers?.meta.total}</div>
                        </h1>
                        <div className="showcase-filters-block">
                            <div className="block block-label-tabs form">
                                <div className={`showcase-filters-item ${filterValues.show_map ? 'hide-sm' : ''}`}>
                                    <label className="form-label">Sorteer</label>
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
                                                sortByOptions.find((option) => {
                                                    return option.id == id;
                                                })?.value || {},
                                            );
                                        }}
                                        optionsComponent={SelectControlOptions}
                                    />
                                </div>
                                {appConfigs?.show_providers_map && (
                                    <div
                                        className={`block block-label-tabs pull-right ${
                                            filterValues.show_map ? 'block-label-tabs-sm' : ''
                                        }`}>
                                        <button
                                            className={`label-tab label-tab-sm ${
                                                filterValues.show_map ? '' : 'active'
                                            }`}
                                            onClick={() => filterUpdate({ show_map: false })}
                                            onKeyDown={clickOnKeyEnter}
                                            tabIndex={0}
                                            aria-pressed={!filterValues.show_map}>
                                            <em className="mdi mdi-format-list-text icon-start" />
                                            Lijst
                                        </button>
                                        <button
                                            className={`label-tab label-tab-sm ${
                                                filterValues.show_map ? 'active' : ''
                                            }`}
                                            onClick={() => filterUpdate({ show_map: true })}
                                            onKeyDown={clickOnKeyEnter}
                                            tabIndex={0}
                                            aria-pressed={!!filterValues.show_map}>
                                            <em className="mdi mdi-map-marker-radius icon-start" />
                                            Kaart
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
