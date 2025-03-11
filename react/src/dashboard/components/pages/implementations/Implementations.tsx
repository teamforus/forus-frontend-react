import React, { useCallback, useEffect, useState } from 'react';
import useImplementationService from '../../../services/ImplementationService';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { PaginationData } from '../../../props/ApiResponses';
import { useNavigateState } from '../../../modules/state_router/Router';
import useFilter from '../../../hooks/useFilter';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useAssetUrl from '../../../hooks/useAssetUrl';
import { hasPermission } from '../../../helpers/utils';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Implementation from '../../../props/models/Implementation';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import usePushApiError from '../../../hooks/usePushApiError';

export default function Implementations() {
    const assetUrl = useAssetUrl();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();

    const paginatorService = usePaginatorService();
    const implementationService = useImplementationService();

    const [paginatorKey] = useState('implementations');
    const [implementations, setImplementations] = useState<PaginationData<Implementation>>(null);

    const filter = useFilter({
        q: '',
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const goToImplementation = useCallback(
        (implementation: Implementation) => {
            return navigateState('implementations-view', {
                id: implementation.id,
                organizationId: implementation.organization_id,
            });
        },
        [navigateState],
    );

    const fetchImplementations = useCallback(() => {
        implementationService
            .list(activeOrganization.id, filter.activeValues)
            .then((res) => setImplementations(res.data))
            .catch(pushApiError);
    }, [activeOrganization.id, filter.activeValues, implementationService, pushApiError]);

    useEffect(() => {
        fetchImplementations();
    }, [fetchImplementations]);

    if (!implementations) {
        return <LoadingCard />;
    }

    return (
        <div className="card card-collapsed">
            <div className="card-header">
                <div className="flex">
                    <div className="flex flex-grow">
                        <div className="card-title">Webshops</div>
                    </div>
                    <div className="flex">
                        <div className="block block-inline-filters">
                            <div className="form">
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
                </div>
            </div>

            {implementations?.data?.map((implementation: Implementation) => (
                <div
                    onClick={() => goToImplementation(implementation)}
                    key={implementation.id}
                    className="card-section">
                    <div className="card-block card-block-implementation">
                        <div className="card-block-implementation-logo">
                            <img
                                src={
                                    implementation.logo ||
                                    assetUrl('./assets/img/placeholders/organization-thumbnail.png')
                                }
                                alt={implementation.name}
                            />
                        </div>
                        <div className="card-block-implementation-details">
                            <div className="card-block-implementation-name">{implementation.name}</div>
                            <div className="card-block-implementation-desc">Website</div>
                            <div className="card-block-implementation-website">
                                <a
                                    href={implementation.url_webshop}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}>
                                    {implementation.url_webshop}
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="card-section-actions">
                        {activeOrganization.allow_translations &&
                            hasPermission(activeOrganization, 'manage_implementation') && (
                                <StateNavLink
                                    name={'implementations-translations'}
                                    params={{ id: implementation.id, organizationId: implementation.organization_id }}
                                    className={`button button-default`}>
                                    <em className="mdi mdi-translate-variant icon-start" />
                                    Vertalingen
                                </StateNavLink>
                            )}

                        {hasPermission(activeOrganization, 'manage_implementation') && (
                            <StateNavLink
                                name={'implementations-email'}
                                params={{ id: implementation.id, organizationId: activeOrganization.id }}
                                className={`button button-default`}>
                                <em className="mdi mdi-cog icon-start" />
                                Email
                            </StateNavLink>
                        )}

                        {hasPermission(activeOrganization, 'manage_implementation') && (
                            <StateNavLink
                                name={'implementations-digid'}
                                params={{ id: implementation.id, organizationId: activeOrganization.id }}
                                className={`button button-default`}>
                                <em className="mdi mdi-cog icon-start" />
                                DigiD
                            </StateNavLink>
                        )}

                        {hasPermission(activeOrganization, ['manage_implementation_cms']) && (
                            <StateNavLink
                                name={'implementations-cms'}
                                params={{ id: implementation.id, organizationId: activeOrganization.id }}
                                className={`button button-primary`}>
                                <em className="mdi mdi-text-box icon-start" />
                                CMS
                            </StateNavLink>
                        )}
                    </div>
                </div>
            ))}

            {implementations.meta.total > 0 ? (
                <div className="card-section">
                    <div className="table-pagination">
                        <div className="table-pagination-counter">{implementations.meta.total} resultaten</div>
                    </div>
                </div>
            ) : (
                <EmptyCard title={'Geen webshops beschikbaar.'} type={'card-section'} />
            )}
        </div>
    );
}
