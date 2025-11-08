import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { PaginationData, ResponseError } from '../../../../dashboard/props/ApiResponses';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import useAppConfigs from '../../../hooks/useAppConfigs';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import { useProviderService } from '../../../services/ProviderService';
import Office from '../../../../dashboard/props/models/Office';
import ProvidersListItem from '../../elements/lists/providers-list/ProvidersListItem';
import { GoogleMap } from '../../../../dashboard/components/elements/google-map/GoogleMap';
import MapMarkerProviderOffice from '../../elements/map-markers/MapMarkerProviderOffice';
import Provider from '../../../props/models/Provider';
import BlockShowcaseList from '../../elements/block-showcase/BlockShowcaseList';
import useFilterNext from '../../../../dashboard/modules/filter_next/useFilterNext';
import { BooleanParam, NumberParam, NumericArrayParam, StringParam } from 'use-query-params';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import UIControlText from '../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import TranslateHtml from '../../../../dashboard/components/elements/translate-html/TranslateHtml';
import classNames from 'classnames';
import ProductsFilterGroupProductCategories from '../products/elements/ProductsFilterGroupProductCategories';
import ProductsFilterGroupDistance from '../products/elements/ProductsFilterGroupDistance';
import FormGroup from '../../elements/forms/FormGroup';
import ProductsFilterGroupFunds from '../products/elements/ProductsFilterGroupFunds';
import ProvidersFilterGroupBusinessTypes from '../products/elements/ProvidersFilterGroupBusinessTypes';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function Providers() {
    const translate = useTranslate();
    const appConfigs = useAppConfigs();
    const setProgress = useSetProgress();

    const providersService = useProviderService();

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

    const [offices, setOffices] = useState<Array<Office>>(null);
    const [providers, setProviders] = useState<PaginationData<Provider>>(null);

    const [showProviderSignUp, setShowProviderSignUp] = useState(false);

    type ProviderFilters = {
        q?: string;
        page?: number;
        fund_ids?: number[];
        business_type_id?: number;
        product_category_ids?: number[];
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

    const buildQuery = useCallback(
        (values: ProviderFilters) => ({
            q: values.q,
            page: values.page,
            fund_ids: values.fund_ids?.length > 0 ? values.fund_ids : null,
            business_type_id: values.business_type_id || null,
            product_category_ids: values.product_category_ids?.length > 0 ? values.product_category_ids : null,
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

    useEffect(() => {
        if (filterValues.show_map) {
            fetchProvidersMap(buildQuery(filterActiveValues));
        } else {
            fetchProviders(buildQuery(filterActiveValues));
        }
    }, [filterActiveValues, fetchProvidersMap, fetchProviders, buildQuery, filterValues?.show_map]);

    return (
        <BlockShowcaseList
            dusk="listProvidersContent"
            contentStyles={filterValues?.show_map ? { background: '#fff' } : undefined}
            showCaseClassName={filterValues.show_map ? 'block-showcase-fullscreen' : ''}
            countFiltersApplied={countFiltersApplied}
            breadcrumbItems={
                !filterValues.show_map && [
                    { name: translate('providers.breadcrumbs.home'), state: WebshopRoutes.HOME },
                    { name: translate('providers.breadcrumbs.providers') },
                ]
            }
            aside={
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

                        <ProductsFilterGroupProductCategories
                            value={filterValues?.product_category_ids}
                            setValue={(ids) => filterUpdate({ product_category_ids: ids })}
                            openByDefault={true}
                        />

                        <ProductsFilterGroupFunds
                            value={filterValues?.fund_ids}
                            setValue={(fund_ids) => filterUpdate({ fund_ids })}
                            openByDefault={true}
                            error={errors?.fund_ids}
                            setShowProviderSignUp={setShowProviderSignUp}
                        />

                        <ProvidersFilterGroupBusinessTypes
                            value={filterValues?.business_type_id}
                            setValue={(value) => filterUpdate({ business_type_id: value })}
                            error={errors?.business_type_id}
                        />

                        <ProductsFilterGroupDistance values={filterValues} setValues={filterUpdate} errors={errors} />

                        {filterValues.show_map && (
                            <TranslateHtml
                                component={<div />}
                                className={'showcase-result'}
                                i18n={'providers.filters.result'}
                                values={{ total: providers?.meta?.total }}
                            />
                        )}
                    </div>

                    {!filterValues.show_map && appConfigs?.pages?.provider && showProviderSignUp && (
                        <StateNavLink
                            name={WebshopRoutes.SIGN_UP}
                            className="button button-primary hide-sm"
                            dataDusk="providerSignUpLink">
                            <em className="mdi mdi-store-outline" aria-hidden="true" />
                            {translate('profile_menu.buttons.provider_sign_up')}
                            <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                        </StateNavLink>
                    )}
                </Fragment>
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
                                        <label className="form-label" id={'sort_by_label'}>
                                            {translate('providers.filters.sort')}
                                        </label>
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
                                                    sortByOptions.find((option) => option.id == id)?.value || {},
                                                );
                                            }}
                                            dusk="selectControlOrderBy"
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
        </BlockShowcaseList>
    );
}
