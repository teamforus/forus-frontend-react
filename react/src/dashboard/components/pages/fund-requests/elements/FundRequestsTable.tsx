import React from 'react';
import Organization from '../../../../props/models/Organization';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import Paginator from '../../../../modules/paginator/components/Paginator';
import { PaginationData } from '../../../../props/ApiResponses';
import { FilterModel, FilterScope, FilterSetter } from '../../../../modules/filter_next/types/FilterParams';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { strLimit } from '../../../../helpers/string';
import TableRowActions from '../../../elements/tables/TableRowActions';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import FundRequestStateLabel from '../../../elements/resource-states/FundRequestStateLabel';
import FundRequest from '../../../../props/models/FundRequest';
import useTranslate from '../../../../hooks/useTranslate';
import { useFundRequestValidatorService } from '../../../../services/FundRequestValidatorService';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function FundRequestsTable({
    filter,
    loading,
    paginatorKey,
    fundRequests,
    organization,
    filterValues,
    filterUpdate,
}: {
    filter: FilterScope<FilterModel>;
    loading: boolean;
    paginatorKey: string;
    fundRequests: PaginationData<FundRequest>;
    organization: Organization;
    filterValues: FilterModel;
    filterUpdate: FilterSetter;
}) {
    const translate = useTranslate();

    const fundRequestService = useFundRequestValidatorService();

    const { headElement, configsElement } = useConfigurableTable(fundRequestService.getColumns(), {
        sortable: true,
        filter,
    });

    return (
        <LoaderTableCard
            loading={loading}
            empty={fundRequests.meta.total == 0}
            emptyTitle={translate('validation_requests.labels.empty_table')}>
            <div className="card-section">
                <div className="card-block card-block-table">
                    {configsElement}

                    <TableTopScroller>
                        <table className="table">
                            {headElement}

                            <tbody>
                                {fundRequests?.data.map((fundRequest) => (
                                    <StateNavLink
                                        customElement={'tr'}
                                        className={'tr-clickable'}
                                        key={fundRequest.id}
                                        name={DashboardRoutes.FUND_REQUEST}
                                        dataDusk={`tableFundRequestRow${fundRequest.id}`}
                                        params={{ organizationId: organization.id, id: fundRequest.id }}>
                                        <td className={'text-strong'}>
                                            <span className="text-muted-dark">#</span>
                                            {fundRequest.id}
                                        </td>
                                        <td>
                                            <div className="relative">
                                                <div className="block block-tooltip-details block-tooltip-hover flex flex-inline">
                                                    <strong className="text-primary">
                                                        {strLimit(fundRequest.email || 'Geen E-mail', 40)}
                                                    </strong>
                                                    {fundRequest.email?.length > 40 && (
                                                        <div className="tooltip-content tooltip-content-fit tooltip-content-bottom tooltip-content-compact">
                                                            <em className="triangle" />
                                                            <div className="nowrap">
                                                                {fundRequest.email || 'Geen E-mail'}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-strong text-md text-muted-dark">
                                                {fundRequest.bsn ? `BSN: ${fundRequest.bsn}` : 'Geen BSN'}
                                            </div>
                                        </td>
                                        <td>{fundRequest.fund.name}</td>
                                        <td>
                                            <strong className="text-primary">
                                                {fundRequest.created_at_locale?.split(' - ')[0]}
                                            </strong>
                                            <br />
                                            <strong className="text-strong text-md text-muted-dark">
                                                {fundRequest.created_at_locale?.split(' - ')[1]}
                                            </strong>
                                        </td>
                                        <td>
                                            {fundRequest.employee ? (
                                                <div className="text-primary">
                                                    <strong>{fundRequest.employee.email}</strong>
                                                </div>
                                            ) : (
                                                <span className="text-muted">Niet toegewezen</span>
                                            )}
                                        </td>
                                        <td>
                                            <FundRequestStateLabel fundRequest={fundRequest} />
                                        </td>

                                        <td className={'table-td-actions text-right'}>
                                            <TableRowActions
                                                content={() => (
                                                    <div className="dropdown dropdown-actions">
                                                        <StateNavLink
                                                            name={DashboardRoutes.FUND_REQUEST}
                                                            params={{
                                                                organizationId: organization.id,
                                                                id: fundRequest.id,
                                                            }}
                                                            className="dropdown-item">
                                                            <em className="mdi mdi-eye-outline icon-start" />
                                                            {translate('validation_requests.buttons.view')}
                                                        </StateNavLink>
                                                    </div>
                                                )}
                                            />
                                        </td>
                                    </StateNavLink>
                                ))}
                            </tbody>
                        </table>
                    </TableTopScroller>
                </div>
            </div>

            {fundRequests?.meta && (
                <div className="card-section">
                    <Paginator
                        meta={fundRequests.meta}
                        filters={filterValues}
                        updateFilters={filterUpdate}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </LoaderTableCard>
    );
}
