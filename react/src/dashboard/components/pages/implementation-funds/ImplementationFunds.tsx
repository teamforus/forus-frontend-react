import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useImplementationService from '../../../services/ImplementationService';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import { useNavigate, useParams } from 'react-router';
import { hasPermission } from '../../../helpers/utils';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import useSetProgress from '../../../hooks/useSetProgress';
import FundStateLabels from '../../elements/resource-states/FundStateLabels';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';
import TableRowActions from '../../elements/tables/TableRowActions';
import usePushApiError from '../../../hooks/usePushApiError';
import { Permission } from '../../../props/models/Organization';
import TableEntityMain from '../../elements/tables/elements/TableEntityMain';
import { strLimit } from '../../../helpers/string';
import ImplementationsRootBreadcrumbs from '../implementations/elements/ImplementationsRootBreadcrumbs';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function ImplementationFunds() {
    const { id } = useParams();

    const navigate = useNavigate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const implementationService = useImplementationService();

    const [implementation, setImplementation] = useState(null);
    const [funds, setFunds] = useState<PaginationData<Fund>>(null);

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{ q: string }>({ q: '' });

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setImplementation(res.data.data))
            .catch((err: ResponseError) => {
                if (err.status === 403) {
                    navigate(
                        getStateRouteUrl(DashboardRoutes.IMPLEMENTATIONS, { organizationId: activeOrganization.id }),
                    );
                }

                pushApiError(err);
            });
    }, [activeOrganization.id, id, implementationService, navigate, pushApiError]);

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(activeOrganization.id, { implementation_id: parseInt(id), ...filterValuesActive })
            .then((res) => setFunds(res.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization.id, id, filterValuesActive, pushApiError]);

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
                <ImplementationsRootBreadcrumbs implementation={implementation} />
                <div className="breadcrumb-item active">Gekoppelde fondsen</div>
            </div>

            <div className="card card-collapsed">
                <div className="card-header">
                    <div className="card-title flex flex-grow">Gekoppelde fondsen</div>
                    <div className="card-header-filters">
                        <div className="block block-inline-filters">
                            <div className="form">
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
                </div>

                <LoaderTableCard
                    empty={funds?.meta?.total == 0}
                    emptyTitle={'Geen fondsen gekoppeld aan deze implementatie.'}
                    columns={implementationService.getColumns()}>
                    {funds?.data?.map((fund) => (
                        <StateNavLink
                            key={fund.id}
                            name={DashboardRoutes.FUND}
                            className={'tr-clickable'}
                            customElement={'tr'}
                            params={{
                                fundId: fund.id,
                                organizationId: activeOrganization.id,
                            }}>
                            <td>
                                <TableEntityMain
                                    title={strLimit(fund.name, 50)}
                                    subtitle={fund.organization?.name}
                                    mediaPlaceholder={'fund'}
                                    media={fund?.logo}
                                />
                            </td>
                            <td className="text-strong text-muted-dark">
                                {fund?.implementation?.name || <TableEmptyValue />}
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
                                                    name={DashboardRoutes.FUND}
                                                    params={{
                                                        fundId: fund.id,
                                                        organizationId: activeOrganization.id,
                                                    }}
                                                    className="dropdown-item">
                                                    <em className="mdi mdi-eye-outline icon-start" />
                                                    Bekijken
                                                </StateNavLink>

                                                {hasPermission(activeOrganization, Permission.MANAGE_FUNDS) &&
                                                    fund.key && (
                                                        <StateNavLink
                                                            name={DashboardRoutes.FUND_BACKOFFICE_EDIT}
                                                            params={{
                                                                fundId: fund.id,
                                                                organizationId: activeOrganization.id,
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
                </LoaderTableCard>

                <div className="card-section">
                    <div className="table-pagination">
                        <div className="table-pagination-counter">{funds?.meta?.total} resultaten</div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
