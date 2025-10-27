import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useImplementationService from '../../../services/ImplementationService';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import { useNavigate, useParams } from 'react-router';
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
import { Permission } from '../../../props/models/Organization';
import TableEntityMain from '../../elements/tables/elements/TableEntityMain';
import { strLimit } from '../../../helpers/string';
import ImplementationsRootBreadcrumbs from '../implementations/elements/ImplementationsRootBreadcrumbs';

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
                                                                        Permission.MANAGE_FUNDS,
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
