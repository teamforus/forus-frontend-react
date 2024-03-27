import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import useImplementationService from '../../../services/ImplementationService';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { ResponseError } from '../../../props/ApiResponses';
import usePushDanger from '../../../hooks/usePushDanger';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { useNavigate } from 'react-router-dom';
import useFilter from '../../../hooks/useFilter';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useAssetUrl from '../../../hooks/useAssetUrl';
import { hasPermission } from '../../../helpers/utils';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Implementation from '../../../props/models/Implementation';
import LoadingCard from '../../elements/loading-card/LoadingCard';

export default function Implementations() {
    const navigate = useNavigate();
    const assetUrl = useAssetUrl();
    const pushDanger = usePushDanger();
    const activeOrganization = useActiveOrganization();

    const paginatorService = usePaginatorService();
    const implementationService = useImplementationService();

    const [paginatorKey] = useState('implementations');
    const [implementations, setImplementations] = useState(null);
    const prevImplementations = useRef(null);

    const filter = useFilter({
        q: '',
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const goToImplementation = useCallback(
        (id) => {
            return navigate(
                getStateRouteUrl('implementations-view', { organizationId: activeOrganization.id, id: id }),
            );
        },
        [activeOrganization.id, navigate],
    );

    const fetchImplementations = useCallback(() => {
        implementationService
            .list(activeOrganization.id, filter.activeValues)
            .then((res) => setImplementations(res.data))
            .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message));
    }, [activeOrganization.id, filter.activeValues, implementationService, pushDanger]);

    useEffect(() => fetchImplementations(), [fetchImplementations]);

    useEffect(() => {
        // if it's first fetch and there is only one implementation - redirect to it
        if (!prevImplementations.current && implementations?.meta?.total === 1) {
            return goToImplementation(implementations.data[0].id);
        }

        prevImplementations.current = implementations;
    }, [goToImplementation, implementations]);

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

            {implementations.meta.total > 0 && (
                <Fragment>
                    {implementations.data.map((implementation: Implementation) => (
                        <div
                            key={implementation.id}
                            className="card-section"
                            onClick={() => goToImplementation(implementation.id)}>
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
                                        <a href={implementation.url_webshop} target="_blank" rel="noreferrer">
                                            {implementation.url_webshop}
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="card-section-actions">
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

                                {hasPermission(activeOrganization, [
                                    'manage_implementation',
                                    'manage_implementation_cms',
                                ]) && (
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
                </Fragment>
            )}

            <div className="card-section">
                <div className="table-pagination">
                    {implementations.meta.total != 0 ? (
                        <div className="table-pagination-counter">{implementations.meta.total} resultaten</div>
                    ) : (
                        <div className="text-center">Geen webshops beschikbaar.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
