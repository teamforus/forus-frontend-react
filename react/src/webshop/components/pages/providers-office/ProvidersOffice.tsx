import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useParams } from 'react-router';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useAssetUrl from '../../../hooks/useAssetUrl';
import { GoogleMap } from '../../../../dashboard/components/elements/google-map/GoogleMap';
import Office from '../../../../dashboard/props/models/Office';
import MapMarkerProviderOfficeView from '../../elements/map-markers/MapMarkerProviderOfficeView';
import { useProviderService } from '../../../services/ProviderService';
import Provider from '../../../props/models/Provider';
import BlockProducts from '../../elements/block-products/BlockProducts';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import Product from '../../../props/models/Product';
import { useProductService } from '../../../services/ProductService';
import { useOfficeService } from '../../../services/OfficeService';
import BlockLoader from '../../elements/block-loader/BlockLoader';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function ProvidersOffice() {
    const { organization_id, id } = useParams();

    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const appConfigs = useAppConfigs();
    const officeService = useOfficeService();
    const productService = useProductService();
    const providerService = useProviderService();

    const [office, setOffice] = useState<Office>(null);
    const [provider, setProvider] = useState<Provider>(null);
    const [products, setProducts] = useState<PaginationData<Product>>(null);
    const [showOffices, setShowOffices] = useState(false);

    const weekDays = useMemo(() => {
        return officeService.scheduleWeekFullDays(translate);
    }, [officeService, translate]);

    const schedules = useMemo(() => {
        return office?.schedule?.reduce((obj, schedule) => ({ ...obj, [schedule.week_day]: schedule }), {});
    }, [office?.schedule]);

    const fetchProvider = useCallback(() => {
        setProgress(0);

        providerService
            .read(parseInt(organization_id))
            .then((res) => setProvider(res.data.data))
            .finally(() => setProgress(100));
    }, [organization_id, providerService, setProgress]);

    const fetchOffice = useCallback(() => {
        setProgress(0);

        officeService
            .read(parseInt(id))
            .then((res) => setOffice(res.data.data))
            .finally(() => setProgress(100));
    }, [id, officeService, setProgress]);

    const fetchProducts = useCallback(() => {
        if (!provider) {
            return;
        }

        setProgress(0);

        productService
            .list({ per_page: 3, organization_id: provider?.id })
            .then((res) => setProducts(res.data))
            .catch(console.error)
            .finally(() => setProgress(100));
    }, [provider, productService, setProgress]);

    useEffect(() => {
        fetchOffice();
    }, [fetchOffice]);

    useEffect(() => {
        fetchProvider();
    }, [fetchProvider]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <BlockShowcase
            breadcrumbItems={
                provider && [
                    { name: translate('providers_office.breadcrumbs.home'), state: WebshopRoutes.HOME },
                    { name: translate('providers_office.breadcrumbs.providers'), state: WebshopRoutes.PROVIDERS },
                    { name: provider.name, state: WebshopRoutes.PROVIDER, stateParams: { id: provider.id } },
                    { name: office?.address },
                ]
            }
            loaderElement={<BlockLoader type={'full'} />}>
            {provider && office && (
                <div className="block block-office">
                    {appConfigs?.show_office_map && (
                        <div className="office-map">
                            <div className="block block-google-map">
                                <GoogleMap
                                    mapPointers={[office]}
                                    markerTemplate={(office: Office) => <MapMarkerProviderOfficeView office={office} />}
                                    mapGestureHandling={'greedy'}
                                    mapGestureHandlingMobile={'none'}
                                    openFirstPointer={true}
                                    fullscreenPosition={window.google.maps.ControlPosition.TOP_RIGHT}
                                    appConfigs={appConfigs}
                                />
                            </div>
                        </div>
                    )}

                    <div className={classNames('office-content', !appConfigs.show_office_map && 'office-content-top')}>
                        <div className="block block-pane">
                            <div className="pane-head">
                                <h1 className="sr-only">{office.address}</h1>
                                <h2 className="pane-head-title">{translate('providers_office.details.title')}</h2>
                            </div>
                            <div className="pane-section pane-section-compact-vertical">
                                <div className="block block-data-list">
                                    {office.address && (
                                        <div className="data-list-row">
                                            <div className="data-list-key">
                                                {translate('providers_office.details.address')}:
                                            </div>
                                            <div className="data-list-value">{office.address}</div>
                                        </div>
                                    )}

                                    {provider.email && (
                                        <div className="data-list-row">
                                            <div className="data-list-key">
                                                {translate('providers_office.details.email')}:
                                            </div>
                                            <div className="data-list-value">{provider.email}</div>
                                        </div>
                                    )}

                                    {(office.phone || provider.phone) && (
                                        <div className="data-list-row">
                                            <div className="data-list-key">
                                                {translate('providers_office.details.phone')}:
                                            </div>
                                            <div className="data-list-value">{office.phone || provider.phone}</div>
                                        </div>
                                    )}

                                    {provider.business_type?.name && (
                                        <div className="data-list-row">
                                            <div className="data-list-key">
                                                {translate('providers_office.details.type')}:
                                            </div>
                                            <div className="data-list-value">
                                                <div className="label label-default label-sm">
                                                    {provider.business_type.name ||
                                                        translate('providers_office.details.type_none')}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="block block-pane">
                            <div className="pane-head">
                                <h2 className="pane-head-title">{translate('providers_office.working_hours.title')}</h2>
                            </div>
                            {office.schedule?.length > 0 ? (
                                <div className="pane-section pane-section-compact-vertical">
                                    <div className="block block-schedule-list">
                                        {Object.keys(weekDays)?.map((dayIndex) => (
                                            <div key={dayIndex} className="schedule-item">
                                                <div className="schedule-day">{weekDays[dayIndex]}</div>
                                                <div className="schedule-hours">
                                                    {[
                                                        schedules?.[dayIndex]?.start_time,
                                                        '-',
                                                        schedules?.[dayIndex]?.end_time,
                                                    ]
                                                        .join(' ')
                                                        .trim()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="pane-section">
                                    {translate('providers_office.working_hours.not_set')}
                                </div>
                            )}
                        </div>

                        <div className="block block-pane last-child">
                            <div className="pane-head">
                                <h2 className="pane-head-title">{translate('providers_office.providers.title')}</h2>
                            </div>
                            <div className="pane-section">
                                <div className="office-organization" onClick={() => setShowOffices(!showOffices)}>
                                    <StateNavLink
                                        name={WebshopRoutes.PROVIDER}
                                        params={{ id: provider.id }}
                                        className="organization-photo"
                                        onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                        <img
                                            className="organization-photo-img"
                                            src={
                                                office.photo?.sizes?.thumbnail ||
                                                office.organization.logo?.sizes?.thumbnail ||
                                                assetUrl('assets/img/placeholders/office-thumbnail.png')
                                            }
                                            alt={office.organization.name}
                                        />
                                    </StateNavLink>

                                    <StateNavLink
                                        name={WebshopRoutes.PROVIDER}
                                        params={{ id: provider.id }}
                                        className="organization-title"
                                        onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                        <div className="organization-title-value">{provider.name}</div>
                                        <div className="organization-title-count">{provider.offices?.length}</div>
                                    </StateNavLink>

                                    <div className="organization-chevron">
                                        <div
                                            className={classNames(
                                                'mdi',
                                                showOffices ? 'mdi-chevron-up' : 'mdi-chevron-right',
                                            )}
                                            role="button"
                                            aria-expanded={showOffices}
                                            aria-label={translate('providers_office.providers.show_more')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="block block-organizations">
                            <div className="organization-item">
                                {showOffices && (
                                    <div className="organization-offices">
                                        <div className="block block-offices">
                                            {provider.offices.map((office) => (
                                                <StateNavLink
                                                    key={office.id}
                                                    name={WebshopRoutes.PROVIDER_OFFICE}
                                                    params={{
                                                        organization_id: office.organization_id,
                                                        id: office.id,
                                                    }}
                                                    className="office-item">
                                                    <div className="office-item-map-icon">
                                                        <div className="mdi mdi-map-marker"></div>
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
                                                                    alt={translate(
                                                                        'providers_office.providers.office_thumbnail_alt',
                                                                    )}
                                                                />
                                                            </div>

                                                            <div className="office-details">
                                                                <div className="office-title">{office.address}</div>
                                                                <div className="office-labels">
                                                                    <div className="label label-default">
                                                                        {provider.business_type?.name ||
                                                                            translate(
                                                                                'providers_office.providers.type_none',
                                                                            )}
                                                                    </div>
                                                                </div>
                                                                {(office.phone || provider.phone || provider.email) && (
                                                                    <div>
                                                                        {(office.phone || provider.phone) && (
                                                                            <div className="office-info office-info-inline">
                                                                                <div className="mdi mdi-phone-outline" />
                                                                                {office.phone
                                                                                    ? office.phone
                                                                                    : provider.phone}
                                                                            </div>
                                                                        )}

                                                                        {provider.email && (
                                                                            <div className="office-info office-info-inline">
                                                                                <div className="mdi mdi-email-outline"></div>
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
                                )}
                            </div>
                        </div>

                        {products?.data.length > 0 && (
                            <BlockProducts
                                display="grid"
                                products={products.data}
                                filters={{ organization_id: provider.id }}
                            />
                        )}
                    </div>
                </div>
            )}
        </BlockShowcase>
    );
}
