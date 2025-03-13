import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useImplementationService from '../../../services/ImplementationService';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import { useNavigate, useParams } from 'react-router-dom';
import useAssetUrl from '../../../hooks/useAssetUrl';
import { hasPermission } from '../../../helpers/utils';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useFilter from '../../../hooks/useFilter';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import useSetProgress from '../../../hooks/useSetProgress';
import FundStateLabels from '../../elements/resource-states/FundStateLabels';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import TableRowActions from '../../elements/tables/TableRowActions';
import usePushApiError from '../../../hooks/usePushApiError';

export default function ImplementationsView() {
    const { id } = useParams();

    const navigate = useNavigate();
    const assetUrl = useAssetUrl();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const implementationService = useImplementationService();

    const [implementation, setImplementation] = useState(null);
    const [funds, setFunds] = useState<PaginationData<Fund>>(null);

    const filter = useFilter({ q: '' });

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setImplementation(res.data.data))
            .catch((err: ResponseError) => {
                if (err.status === 403) {
                    navigate(getStateRouteUrl('implementations', { organizationId: activeOrganization.id }));
                }

                pushApiError(err);
            });
    }, [activeOrganization.id, id, implementationService, navigate, pushApiError]);

    const { headElement, configsElement } = useConfigurableTable(implementationService.getColumns());

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(activeOrganization.id, { implementation_id: parseInt(id), ...filter.activeValues })
            .then((res) => setFunds(res.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization.id, id, filter.activeValues, pushApiError]);

    useEffect(() => {
        fetchImplementation();
    }, [fetchImplementation]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    if (!implementation || !funds) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'implementations'}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Webshops
                </StateNavLink>
                <div className="breadcrumb-item active">{implementation.name}</div>
            </div>

            <div className="card card-collapsed">
                <div className="card-section">
                    <div className="card-block card-block-implementation card-block-implementation-collapsed">
                        <div className="card-block-implementation-logo">
                            <img
                                src={
                                    implementation.logo ||
                                    assetUrl('/assets/img/placeholders/organization-thumbnail.png')
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
                                name={'implementations-cookies'}
                                params={{ id: implementation.id, organizationId: implementation.organization_id }}
                                className={`button button-default`}>
                                <em className="mdi mdi-cookie icon-start" />
                                Cookiemelding
                            </StateNavLink>
                        )}

                        {hasPermission(activeOrganization, 'manage_implementation') && (
                            <StateNavLink
                                name={'implementations-email'}
                                params={{ id: implementation.id, organizationId: implementation.organization_id }}
                                className={`button button-default`}>
                                <em className="mdi mdi-cog icon-start" />
                                Email
                            </StateNavLink>
                        )}

                        {hasPermission(activeOrganization, 'manage_implementation') && (
                            <StateNavLink
                                name={'implementations-digid'}
                                params={{ id: implementation.id, organizationId: implementation.organization_id }}
                                className={`button button-default`}>
                                <em className="mdi mdi-cog icon-start" />
                                DigiD
                            </StateNavLink>
                        )}

                        {hasPermission(activeOrganization, ['manage_implementation_cms']) && (
                            <StateNavLink
                                name={'implementations-cms'}
                                params={{ id: implementation.id, organizationId: implementation.organization_id }}
                                className={`button button-primary`}>
                                <em className="mdi mdi-text-box icon-start" />
                                CMS
                            </StateNavLink>
                        )}
                    </div>
                </div>
            </div>

            <div className="card card-collapsed">
                <div className="card-header">
                    <div className="card-title flex flex-grow">Fonds gekoppeld aan webshop</div>
                    <div className="card-header-filters">
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

                {funds.meta.total > 0 ? (
                    <div className="card-section">
                        <div className="card-block card-block-table">
                            {configsElement}

                            <TableTopScroller>
                                <table className="table">
                                    {headElement}

                                    <tbody>
                                        {funds.data.map((fund) => (
                                            <StateNavLink
                                                key={fund.id}
                                                name={'funds-show'}
                                                className={'tr-clickable'}
                                                customElement={'tr'}
                                                params={{ fundId: fund.id, organizationId: activeOrganization.id }}>
                                                <td>
                                                    <div className="flex flex-align-items-center flex-gap">
                                                        <img
                                                            className="td-media td-media-sm"
                                                            src={
                                                                fund?.logo?.sizes?.thumbnail ||
                                                                assetUrl(
                                                                    '/assets/img/placeholders/product-thumbnail.png',
                                                                )
                                                            }
                                                            alt={fund.name}
                                                        />
                                                        {fund.name}
                                                    </div>
                                                </td>
                                                <td>
                                                    <FundStateLabels fund={fund} />
                                                </td>

                                                <td className={'table-td-actions text-right'}>
                                                    {activeOrganization.backoffice_available ? (
                                                        <TableRowActions
                                                            content={() => (
                                                                <div className="dropdown dropdown-actions">
                                                                    <StateNavLink
                                                                        name={'funds-show'}
                                                                        params={{
                                                                            fundId: fund.id,
                                                                            organizationId: activeOrganization.id,
                                                                        }}
                                                                        className="dropdown-item">
                                                                        <em className="mdi mdi-eye-outline icon-start" />
                                                                        Bekijken
                                                                    </StateNavLink>

                                                                    {hasPermission(
                                                                        activeOrganization,
                                                                        'manage_funds',
                                                                    ) &&
                                                                        fund.key && (
                                                                            <StateNavLink
                                                                                name={'fund-backoffice-edit'}
                                                                                params={{
                                                                                    fundId: fund.id,
                                                                                    organizationId:
                                                                                        activeOrganization.id,
                                                                                }}
                                                                                className="dropdown-item">
                                                                                <em className="mdi mdi-cog icon-start" />
                                                                                Backoffice
                                                                            </StateNavLink>
                                                                        )}
                                                                </div>
                                                            )}
                                                        />
                                                    ) : (
                                                        <TableEmptyValue />
                                                    )}
                                                </td>
                                            </StateNavLink>
                                        ))}
                                    </tbody>
                                </table>
                            </TableTopScroller>
                        </div>
                    </div>
                ) : (
                    <EmptyCard type={'card-section'} title={'Geen fondsen gekoppeld aan deze implementatie.'} />
                )}

                <div className="card-section">
                    <div className="table-pagination">
                        <div className="table-pagination-counter">{funds.meta.total} resultaten</div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
