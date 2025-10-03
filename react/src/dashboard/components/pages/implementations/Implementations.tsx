import React, { useCallback, useEffect, useState } from 'react';
import useImplementationService from '../../../services/ImplementationService';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { PaginationData } from '../../../props/ApiResponses';
import { useNavigateState } from '../../../modules/state_router/Router';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useAssetUrl from '../../../hooks/useAssetUrl';
import { hasPermission } from '../../../helpers/utils';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Implementation from '../../../props/models/Implementation';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import usePushApiError from '../../../hooks/usePushApiError';
import { Permission } from '../../../props/models/Organization';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { NumberParam, StringParam } from 'use-query-params';
import useSetProgress from '../../../hooks/useSetProgress';

export default function Implementations() {
    const assetUrl = useAssetUrl();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();

    const paginatorService = usePaginatorService();
    const implementationService = useImplementationService();

    const [paginatorKey] = useState('implementations');
    const [implementations, setImplementations] = useState<PaginationData<Implementation>>(null);

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
        setProgress(0);

        implementationService
            .list(activeOrganization.id, filterValuesActive)
            .then((res) => setImplementations(res.data))
            .finally(() => setProgress(100))
            .catch(pushApiError);
    }, [activeOrganization.id, filterValuesActive, implementationService, pushApiError, setProgress]);

    useEffect(() => {
        fetchImplementations();
    }, [fetchImplementations]);

    if (!implementations) {
        return <LoadingCard />;
    }

    return (
        <div className="card card-collapsed">
            <div className="card-header">
                <div className="flex flex-grow card-title">Webshops</div>
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
                            hasPermission(activeOrganization, Permission.MANAGE_IMPLEMENTATION) && (
                                <StateNavLink
                                    name={'implementations-translations'}
                                    params={{ id: implementation.id, organizationId: implementation.organization_id }}
                                    className={`button button-default`}>
                                    <em className="mdi mdi-translate-variant icon-start" />
                                    Vertalingen
                                </StateNavLink>
                            )}

                        {hasPermission(activeOrganization, Permission.MANAGE_IMPLEMENTATION) && (
                            <StateNavLink
                                name={'implementations-email'}
                                params={{ id: implementation.id, organizationId: activeOrganization.id }}
                                className={`button button-default`}>
                                <em className="mdi mdi-cog icon-start" />
                                Email
                            </StateNavLink>
                        )}

                        {hasPermission(activeOrganization, Permission.MANAGE_IMPLEMENTATION) && (
                            <StateNavLink
                                name={'implementations-digid'}
                                params={{ id: implementation.id, organizationId: activeOrganization.id }}
                                className={`button button-default`}>
                                <em className="mdi mdi-cog icon-start" />
                                DigiD
                            </StateNavLink>
                        )}

                        {hasPermission(activeOrganization, Permission.MANAGE_IMPLEMENTATION_CMS) && (
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
