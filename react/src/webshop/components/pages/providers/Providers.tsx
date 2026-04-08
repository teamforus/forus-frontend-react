import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { PaginationData, ResponseError, ResponseErrorData } from '../../../../dashboard/props/ApiResponses';
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
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import classNames from 'classnames';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';
import useProvidersPageFilters from './hooks/useProvidersPageFilters';
import ProvidersSidebarFilters from './elements/ProvidersSidebarFilters';

export default function Providers() {
    const appConfigs = useAppConfigs();
    const setProgress = useSetProgress();
    const translate = useTranslate();
    const providersService = useProviderService();
    const [errors, setErrors] = useState<ResponseErrorData>({});

    const [offices, setOffices] = useState<Array<Office>>(null);
    const [providers, setProviders] = useState<PaginationData<Provider>>(null);
    const {
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
    } = useProvidersPageFilters();

    const fetchProviders = useCallback(
        (query: object) => {
            setErrors({});
            setProgress(0);

            providersService
                .search(query)
                .then((res) => setProviders(res.data))
                .catch((err: ResponseError) => setErrors(err.data.errors || {}))
                .finally(() => setProgress(100));
        },
        [providersService, setProgress],
    );

    const fetchProvidersMap = useCallback(
        (query: object) => {
            setErrors({});
            setProgress(0);

            providersService
                .search({ ...query, per_page: 1000 })
                .then((res) => {
                    setProviders(res.data);
                    setOffices(res.data.data.reduce((arr, provider) => arr.concat(provider.offices), []));
                })
                .catch((err: ResponseError) => setErrors(err.data.errors || {}))
                .finally(() => setProgress(100));
        },
        [providersService, setProgress],
    );

    useEffect(() => {
        if (filterValues.show_map) {
            fetchProvidersMap(providersQuery);
        } else {
            fetchProviders(providersQuery);
        }
    }, [fetchProvidersMap, fetchProviders, filterValues?.show_map, providersQuery]);

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
                    <ProvidersSidebarFilters
                        errors={errors}
                        filter={filter}
                        filterValues={filterValues}
                        filterUpdate={filterUpdate}
                        funds={funds}
                        productCategories={productCategories}
                        productCategoriesIconMap={productCategoriesIconMap}
                        businessTypes={businessTypes}
                        providersTotal={providers?.meta?.total}
                    />

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
