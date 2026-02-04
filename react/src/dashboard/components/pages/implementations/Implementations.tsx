import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useImplementationService from '../../../services/ImplementationService';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { PaginationData } from '../../../props/ApiResponses';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import { hasPermission } from '../../../helpers/utils';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Implementation from '../../../props/models/Implementation';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushApiError from '../../../hooks/usePushApiError';
import { Permission } from '../../../props/models/Organization';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import TableRowActions from '../../elements/tables/TableRowActions';
import TableEntityMain from '../../elements/tables/elements/TableEntityMain';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';
import Media from '../../../props/models/Media';
import ImplementationsRootBreadcrumbs from './elements/ImplementationsRootBreadcrumbs';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { NumberParam, StringParam } from 'use-query-params';
import useSetProgress from '../../../hooks/useSetProgress';
import { ConfigurableTableColumn } from '../vouchers/hooks/useConfigurableTable';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function Implementations() {
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();

    const paginatorService = usePaginatorService();
    const implementationService = useImplementationService();

    const [paginatorKey] = useState('implementations');
    const [implementations, setImplementations] = useState<PaginationData<Implementation>>(null);
    const columns: Array<ConfigurableTableColumn> = [
        { key: 'name', label: 'Webshop' },
        { key: 'url', label: 'Website url' },
        { key: 'actions', label: 'Acties' },
    ];

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        q: string;
        per_page?: number;
        page?: number;
    }>(
        {
            q: '',
            per_page: paginatorService.getPerPage(paginatorKey),
        },
        {
            queryParams: {
                q: StringParam,
                per_page: NumberParam,
                page: NumberParam,
            },
        },
    );

    const fetchImplementations = useCallback(() => {
        setProgress(0);

        implementationService
            .list(activeOrganization.id, filterValuesActive)
            .then((res) => setImplementations(res.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [activeOrganization.id, filterValuesActive, implementationService, pushApiError, setProgress]);

    useEffect(() => {
        fetchImplementations();
    }, [fetchImplementations]);

    if (!implementations) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <ImplementationsRootBreadcrumbs implementation={null} />
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title flex flex-grow">Websites ({implementations?.meta?.total || 0})</div>
                    <div className="card-header-filters">
                        <div className="block block-inline-filters form">
                            <div className="form-group">
                                <input
                                    type="text"
                                    value={filterValues.q}
                                    placeholder="Zoeken"
                                    className="form-control"
                                    onChange={(e) => filterUpdate({ q: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <LoaderTableCard
                    loading={!implementations}
                    empty={implementations?.meta?.total === 0}
                    emptyTitle={'Geen webshops'}
                    emptyDescription={'Geen webshops gevonden.'}
                    columns={columns}
                    tableOptions={{ hasTooltips: false }}
                    paginator={{ key: paginatorKey, data: implementations, filterValues, filterUpdate }}>
                    {implementations?.data?.map((implementation: Implementation) => {
                        const organizationId = implementation.organization_id || activeOrganization.id;

                        const implementationLogo: Media = {
                            identity_address: '',
                            original_name: '',
                            type: '',
                            ext: '',
                            uid: `implementation-logo-${implementation.id}`,
                            sizes: {
                                thumbnail: implementation.logo || '',
                            },
                        };

                        return (
                            <StateNavLink
                                key={implementation.id}
                                name={DashboardRoutes.IMPLEMENTATION}
                                params={{ id: implementation.id, organizationId }}
                                customElement={'tr'}
                                className={'tr-clickable'}>
                                <td>
                                    <TableEntityMain
                                        media={implementationLogo}
                                        mediaPlaceholder="organization"
                                        title={implementation.name}
                                        subtitle={implementation.key}
                                    />
                                </td>
                                <td>
                                    {implementation.url_webshop ? (
                                        <a
                                            className="text-primary text-semibold text-underline"
                                            href={implementation.url_webshop}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}>
                                            {implementation.url_webshop}
                                        </a>
                                    ) : (
                                        <TableEmptyValue />
                                    )}
                                </td>
                                <td className="table-td-actions text-right">
                                    <TableRowActions
                                        content={(e) => (
                                            <div className="dropdown dropdown-actions">
                                                <StateNavLink
                                                    name={DashboardRoutes.IMPLEMENTATION}
                                                    params={{
                                                        id: implementation.id,
                                                        organizationId,
                                                    }}
                                                    className="dropdown-item"
                                                    onClick={e.close}>
                                                    <em className="mdi mdi-eye icon-start" /> Bekijken
                                                </StateNavLink>

                                                {activeOrganization.allow_translations &&
                                                    hasPermission(
                                                        activeOrganization,
                                                        Permission.MANAGE_IMPLEMENTATION,
                                                    ) && (
                                                        <StateNavLink
                                                            name={DashboardRoutes.IMPLEMENTATION_TRANSLATIONS}
                                                            params={{
                                                                id: implementation.id,
                                                                organizationId: implementation.organization_id,
                                                            }}
                                                            className="dropdown-item"
                                                            onClick={e.close}>
                                                            <em className="mdi mdi-translate-variant icon-start" />
                                                            Vertalingen beheren
                                                        </StateNavLink>
                                                    )}

                                                {hasPermission(
                                                    activeOrganization,
                                                    Permission.MANAGE_IMPLEMENTATION,
                                                ) && (
                                                    <StateNavLink
                                                        name={DashboardRoutes.IMPLEMENTATION_COOKIES}
                                                        params={{
                                                            id: implementation.id,
                                                            organizationId: implementation.organization_id,
                                                        }}
                                                        className="dropdown-item"
                                                        onClick={e.close}>
                                                        <em className="mdi mdi-cookie icon-start" />
                                                        Cookiemelding beheren
                                                    </StateNavLink>
                                                )}

                                                {hasPermission(
                                                    activeOrganization,
                                                    Permission.MANAGE_IMPLEMENTATION,
                                                ) && (
                                                    <StateNavLink
                                                        name={DashboardRoutes.IMPLEMENTATION_EMAIL}
                                                        params={{
                                                            id: implementation.id,
                                                            organizationId: activeOrganization.id,
                                                        }}
                                                        className="dropdown-item"
                                                        onClick={e.close}>
                                                        <em className="mdi mdi-email-outline icon-start" />
                                                        E-mailinstellingen
                                                    </StateNavLink>
                                                )}

                                                {hasPermission(
                                                    activeOrganization,
                                                    Permission.MANAGE_IMPLEMENTATION,
                                                ) && (
                                                    <StateNavLink
                                                        name={DashboardRoutes.IMPLEMENTATION_DIGID}
                                                        params={{
                                                            id: implementation.id,
                                                            organizationId: activeOrganization.id,
                                                        }}
                                                        className="dropdown-item"
                                                        onClick={e.close}>
                                                        <em className="mdi mdi-shield-key-outline icon-start" />
                                                        DigiD-instellingen
                                                    </StateNavLink>
                                                )}
                                            </div>
                                        )}
                                    />
                                </td>
                            </StateNavLink>
                        );
                    })}
                </LoaderTableCard>
            </div>
        </Fragment>
    );
}
