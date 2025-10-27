import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useImplementationService from '../../../services/ImplementationService';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { PaginationData } from '../../../props/ApiResponses';
import useFilter from '../../../hooks/useFilter';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import { hasPermission } from '../../../helpers/utils';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Implementation from '../../../props/models/Implementation';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushApiError from '../../../hooks/usePushApiError';
import { Permission } from '../../../props/models/Organization';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import TableRowActions from '../../elements/tables/TableRowActions';
import TableEntityMain from '../../elements/tables/elements/TableEntityMain';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';
import Media from '../../../props/models/Media';
import ImplementationsRootBreadcrumbs from './elements/ImplementationsRootBreadcrumbs';

export default function Implementations() {
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();

    const paginatorService = usePaginatorService();
    const implementationService = useImplementationService();

    const [paginatorKey] = useState('implementations');
    const [implementations, setImplementations] = useState<PaginationData<Implementation>>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const filter = useFilter({
        q: '',
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const fetchImplementations = useCallback(() => {
        setLoading(true);

        implementationService
            .list(activeOrganization.id, filter.activeValues)
            .then((res) => setImplementations(res.data))
            .catch(pushApiError)
            .finally(() => setLoading(false));
    }, [activeOrganization.id, filter.activeValues, implementationService, pushApiError]);

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
                                    value={filter.values.q}
                                    placeholder="Zoeken"
                                    className="form-control"
                                    onChange={(e) => filter.update({ q: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <LoaderTableCard
                    loading={loading}
                    empty={implementations?.meta?.total === 0}
                    emptyTitle={'Geen webshops'}
                    emptyDescription={'Geen webshops gevonden.'}>
                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <TableTopScroller>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Webshop</th>
                                            <th>Website url</th>
                                            <th className="table-th-actions text-right">Acties</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {implementations.data.map((implementation: Implementation) => {
                                            const organizationId =
                                                implementation.organization_id || activeOrganization.id;
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
                                                    name={'implementation-view'}
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
                                                                        name={'implementation-view'}
                                                                        params={{
                                                                            id: implementation.id,
                                                                            organizationId,
                                                                        }}
                                                                        className="dropdown-item"
                                                                        onClick={e.close}>
                                                                        <em className="mdi mdi-eye icon-start" />{' '}
                                                                        Bekijken
                                                                    </StateNavLink>

                                                                    {activeOrganization.allow_translations &&
                                                                        hasPermission(
                                                                            activeOrganization,
                                                                            Permission.MANAGE_IMPLEMENTATION,
                                                                        ) && (
                                                                            <StateNavLink
                                                                                name={'implementations-translations'}
                                                                                params={{
                                                                                    id: implementation.id,
                                                                                    organizationId:
                                                                                        implementation.organization_id,
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
                                                                            name={'implementations-cookies'}
                                                                            params={{
                                                                                id: implementation.id,
                                                                                organizationId:
                                                                                    implementation.organization_id,
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
                                                                            name={'implementations-email'}
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
                                                                            name={'implementations-digid'}
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
                                    </tbody>
                                </table>
                            </TableTopScroller>
                        </div>
                    </div>

                    {implementations?.meta?.total > 0 && (
                        <div className="card-section">
                            <div className="table-pagination">
                                <div className="table-pagination-counter">
                                    {implementations?.meta?.total || 0} resultaten
                                </div>
                            </div>
                        </div>
                    )}
                </LoaderTableCard>
            </div>
        </Fragment>
    );
}
