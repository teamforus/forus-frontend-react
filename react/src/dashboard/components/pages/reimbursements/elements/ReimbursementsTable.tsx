import React, { useState } from 'react';
import Organization from '../../../../props/models/Organization';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import Paginator from '../../../../modules/paginator/components/Paginator';
import { PaginationData } from '../../../../props/ApiResponses';
import { FilterModel, FilterSetter } from '../../../../modules/filter_next/types/FilterParams';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import classNames from 'classnames';
import { strLimit } from '../../../../helpers/string';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TableRowActions from '../../../elements/tables/TableRowActions';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import { useReimbursementsService } from '../../../../services/ReimbursementService';
import Reimbursement from '../../../../props/models/Reimbursement';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';

export default function ReimbursementsTable({
    loading,
    paginatorKey,
    reimbursements,
    organization,
    filterValues,
    filterUpdate,
}: {
    loading: boolean;
    paginatorKey: string;
    reimbursements: PaginationData<Reimbursement>;
    organization: Organization;
    filterValues: FilterModel;
    filterUpdate: FilterSetter;
}) {
    const reimbursementService = useReimbursementsService();

    const [stateLabels] = useState({
        pending: 'label-default',
        approved: 'label-success',
        declined: 'label-danger',
    });

    const { headElement, configsElement } = useConfigurableTable(reimbursementService.getColumns());

    return (
        <LoaderTableCard
            loading={loading}
            empty={reimbursements.meta.total == 0}
            emptyTitle={'Geen declaraties gevonden'}>
            <div className="card-section" data-dusk="reimbursementsList">
                <div className="card-block card-block-table">
                    {configsElement}

                    <TableTopScroller>
                        <table className="table">
                            {headElement}

                            <tbody>
                                {reimbursements.data.map((reimbursement) => (
                                    <StateNavLink
                                        customElement={'tr'}
                                        name={'reimbursements-view'}
                                        params={{ id: reimbursement.id, organizationId: organization.id }}
                                        key={reimbursement.id}
                                        dataDusk={`reimbursement${reimbursement.id}`}
                                        className={classNames('tr-clickable', reimbursement.expired && 'tr-warning')}>
                                        <td>
                                            {/* Email */}
                                            <div
                                                className="text-primary text-medium"
                                                data-dusk={`reimbursementIdentityEmail${reimbursement.id}`}>
                                                {strLimit(reimbursement.identity_email, 25) || 'Geen E-mail'}
                                            </div>

                                            {/* BSN */}
                                            {organization.bsn_enabled && (
                                                <div className="text-strong text-md text-muted-dark">
                                                    {reimbursement.identity_bsn
                                                        ? 'BSN: ' + reimbursement.identity_bsn
                                                        : 'Geen BSN'}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div className="text-primary text-medium">
                                                {strLimit(reimbursement.fund.name, 25)}
                                            </div>
                                            <div className="text-strong text-md text-muted-dark">
                                                {strLimit(reimbursement.implementation_name, 25)}
                                            </div>
                                        </td>

                                        {/* Amount */}
                                        <td className="nowrap" data-dusk={'reimbursementAmount' + reimbursement.id}>
                                            {reimbursement.amount_locale}
                                        </td>

                                        <td>
                                            <div className="text-primary text-medium">
                                                {reimbursement.created_at_locale.split(' - ')[0]}
                                            </div>
                                            <div className="text-strong text-md text-muted-dark">
                                                {reimbursement.created_at_locale.split(' - ')[1]}
                                            </div>
                                        </td>

                                        <td>{reimbursement.lead_time_locale}</td>

                                        <td className={reimbursement.employee ? 'text-primary' : 'text-muted-dark'}>
                                            {strLimit(reimbursement.employee?.email || 'Niet toegewezen', 25)}
                                        </td>

                                        <td className={reimbursement.expired ? 'text-primary' : 'text-muted-dark'}>
                                            {reimbursement.expired ? 'Ja' : 'Nee'}
                                        </td>

                                        <td>
                                            <span
                                                className={`label ${stateLabels[reimbursement.state] || ''}`}
                                                data-dusk={`reimbursementState${reimbursement.id}`}>
                                                {reimbursement.state_locale}
                                            </span>
                                        </td>

                                        <td>
                                            {reimbursement.voucher_transaction?.state == 'pending' && (
                                                <span className="label label-default">
                                                    {reimbursement.voucher_transaction.state_locale}
                                                </span>
                                            )}

                                            {reimbursement.voucher_transaction?.state == 'success' && (
                                                <span className="label label-success">
                                                    {reimbursement.voucher_transaction.state_locale}
                                                </span>
                                            )}

                                            {reimbursement.voucher_transaction?.state == 'canceled' && (
                                                <span className="label label-danger">
                                                    {reimbursement.voucher_transaction.state_locale}
                                                </span>
                                            )}

                                            {!reimbursement.voucher_transaction && <TableEmptyValue />}
                                        </td>

                                        <td className={'table-td-actions'}>
                                            <TableRowActions
                                                content={() => (
                                                    <div className="dropdown dropdown-actions">
                                                        <StateNavLink
                                                            name={'reimbursements-view'}
                                                            className="dropdown-item"
                                                            params={{
                                                                id: reimbursement.id,
                                                                organizationId: organization.id,
                                                            }}>
                                                            <em className="mdi mdi-eye icon-start" /> Bekijken
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

            {reimbursements.meta && (
                <div className="card-section">
                    <Paginator
                        meta={reimbursements.meta}
                        filters={filterValues}
                        updateFilters={filterUpdate}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </LoaderTableCard>
    );
}
