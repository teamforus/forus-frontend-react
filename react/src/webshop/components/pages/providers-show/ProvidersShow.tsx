import React, { useCallback, useEffect, useState } from 'react';
import { ErrorResponse, useParams } from 'react-router';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useAssetUrl from '../../../hooks/useAssetUrl';
import { GoogleMap } from '../../../../dashboard/components/elements/google-map/GoogleMap';
import Office from '../../../../dashboard/props/models/Office';
import MapMarkerProviderOfficeView from '../../elements/map-markers/MapMarkerProviderOfficeView';
import { useProviderService } from '../../../services/ProviderService';
import Markdown from '../../elements/markdown/Markdown';
import Provider from '../../../props/models/Provider';
import BlockProducts from '../../elements/block-products/BlockProducts';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import Product from '../../../props/models/Product';
import { useProductService } from '../../../services/ProductService';
import { useStateParams } from '../../../modules/state_router/Router';
import useSetTitle from '../../../hooks/useSetTitle';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import BlockLoader from '../../elements/block-loader/BlockLoader';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import Section from '../../elements/sections/Section';
import usePushDanger from '../../../../dashboard/hooks/usePushDanger';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function ProvidersShow() {
    const { id } = useParams();

    const assetUrl = useAssetUrl();
    const setTitle = useSetTitle();
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();

    const appConfigs = useAppConfigs();
    const productService = useProductService();
    const providerService = useProviderService();

    const [provider, setProvider] = useState<Provider>(null);
    const [products, setProducts] = useState<PaginationData<Product>>(null);

    const { showBack } = useStateParams<{ showBack: boolean }>();

    const fetchProvider = useCallback(() => {
        setProgress(0);

        providerService
            .read(parseInt(id))
            .then((res) => setProvider(res.data.data))
            .catch((err: ErrorResponse) => pushDanger(translate('push.error'), err.data.message))
            .finally(() => setProgress(100));
    }, [setProgress, providerService, id, pushDanger, translate]);

    const fetchProducts = useCallback(() => {
        if (!provider) {
            return;
        }

        setProgress(0);

        productService
            .list({ per_page: 6, organization_id: provider?.id })
            .then((res) => setProducts(res.data))
            .catch((err: ErrorResponse) => pushDanger(translate('push.error'), err.data.message))
            .finally(() => setProgress(100));
    }, [provider, setProgress, productService, pushDanger, translate]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        fetchProvider();
    }, [fetchProvider]);

    useEffect(() => {
        if (provider?.name) {
            setTitle(translate('page_state_titles.provider', { provider_name: provider?.name || '' }));
        }
    }, [provider?.name, setTitle, translate]);

    return (
        <BlockShowcase
            breadcrumbItems={
                provider && [
                    showBack && { name: translate('provider.breadcrumbs.back'), back: true },
                    { name: translate('provider.breadcrumbs.home'), state: WebshopRoutes.HOME },
                    { name: translate('provider.breadcrumbs.providers'), state: WebshopRoutes.PROVIDERS },
                    { name: provider.name },
                ]
            }
            loaderElement={<BlockLoader type={'full'} />}>
            {provider && (
                <div className="block block-provider">
                    {appConfigs.show_provider_map && provider.offices && (
                        <div className="provider-map">
                            <div className="block block-google-map">
                                <GoogleMap
                                    appConfigs={appConfigs}
                                    mapPointers={provider.offices}
                                    mapGestureHandling={'greedy'}
                                    mapGestureHandlingMobile={'none'}
                                    zoomLevel={11}
                                    centerType={'avg'}
                                    fullscreenPosition={window.google.maps.ControlPosition.TOP_RIGHT}
                                    openFirstPointer={true}
                                    markerTemplate={(office: Office) => <MapMarkerProviderOfficeView office={office} />}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {provider && (
                <Section type={'default'}>
                    <div className="block block-provider">
                        <div
                            className={`provider-content ${appConfigs.show_provider_map ? '' : 'provider-content-top'}`}>
                            <div className="block block-pane">
                                <div className="pane-head">
                                    <h1 className="sr-only">{provider.name}</h1>
                                    <h2 className="pane-head-title">{translate('provider.details.title')}</h2>
                                </div>
                                <div className="pane-section">
                                    <div className="provider-details">
                                        <div className="provider-description">
                                            <img
                                                className="provider-logo"
                                                src={
                                                    provider.logo?.sizes?.thumbnail ||
                                                    assetUrl('/assets/img/placeholders/organization-thumbnail.png')
                                                }
                                                alt=""
                                            />
                                            <div className="provider-title">{provider.name}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pane-section pane-section-compact-vertical">
                                    <div className="block block-data-list">
                                        {provider.email && (
                                            <div className="data-list-row">
                                                <div className="data-list-key">
                                                    {translate('provider.details.email')}
                                                </div>
                                                <div className="data-list-value">{provider.email}</div>
                                            </div>
                                        )}
                                        {provider.phone && (
                                            <div className="data-list-row">
                                                <div className="data-list-key">
                                                    {translate('provider.details.phone')}
                                                </div>
                                                <div className="data-list-value">{provider.phone}</div>
                                            </div>
                                        )}
                                        {provider && (
                                            <div className="data-list-row">
                                                <div className="data-list-key">
                                                    {translate('provider.details.type')}
                                                </div>
                                                <div className="data-list-value">
                                                    <div className="label label-default label-sm">
                                                        {provider.business_type?.name ||
                                                            translate('provider.details.type_none')}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {provider.description_html && (
                                <div className="block block-pane">
                                    <div className="pane-head">
                                        <h2 className="pane-head-title">{translate('provider.description.title')}</h2>
                                    </div>
                                    <div className="pane-section">
                                        <div className="block block-markdown">
                                            <Markdown content={provider.description_html} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="block block-pane last-child">
                                <h2 className="pane-head">
                                    <div className="flex-grow">{translate('provider.funds.title')}</div>
                                    <div className="pane-head-count">{provider.offices.length}</div>
                                </h2>
                            </div>
                            <div className="block block-organizations">
                                <div className="organization-item">
                                    <div className="organization-offices">
                                        <div className="block block-offices">
                                            {provider.offices?.map((office) => (
                                                <StateNavLink
                                                    key={office.id}
                                                    name={WebshopRoutes.PROVIDER_OFFICE}
                                                    params={{
                                                        organization_id: office.organization_id,
                                                        id: office.id,
                                                    }}
                                                    className="office-item">
                                                    <div className="office-item-map-icon">
                                                        <em
                                                            className="mdi mdi-map-marker"
                                                            role="img"
                                                            aria-label={translate('provider.details.map_icon')}
                                                        />
                                                    </div>
                                                    <div className="office-pane">
                                                        <div className="office-pane-block">
                                                            <div className="office-logo">
                                                                <img
                                                                    className="office-logo-img"
                                                                    src={
                                                                        office.photo?.sizes?.thumbnail ||
                                                                        assetUrl(
                                                                            '/assets/img/placeholders/office-thumbnail.png',
                                                                        )
                                                                    }
                                                                    alt=""
                                                                />
                                                            </div>
                                                            <div className="office-details">
                                                                <div className="office-title">{office.address}</div>
                                                                <div className="office-labels">
                                                                    <div className="label label-default">
                                                                        {provider?.business_type?.name ||
                                                                            translate('provider.details.type_none')}
                                                                    </div>
                                                                </div>
                                                                {(office.phone || provider.phone || provider.email) && (
                                                                    <div>
                                                                        {(office.phone || provider.phone) && (
                                                                            <div className="office-info office-info-inline">
                                                                                <em className="mdi mdi-phone-outline" />
                                                                                {office.phone
                                                                                    ? office.phone
                                                                                    : provider.phone}
                                                                            </div>
                                                                        )}
                                                                        {provider.email && (
                                                                            <div className="office-info office-info-inline">
                                                                                <em className="mdi mdi-email-outline" />
                                                                                {provider.email}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </StateNavLink>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>
            )}

            {products?.data?.length > 0 && (
                <BlockProducts display={'grid'} products={products.data} filters={{ organization_id: provider.id }} />
            )}
        </BlockShowcase>
    );
}
