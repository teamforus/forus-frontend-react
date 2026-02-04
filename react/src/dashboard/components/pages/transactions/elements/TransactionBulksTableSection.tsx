import React from 'react';
import { PaginationData } from '../../../../props/ApiResponses';
import TransactionBulk from '../../../../props/models/TransactionBulk';
import Organization from '../../../../props/models/Organization';
import { FilterModel, FilterScope, FilterSetter } from '../../../../modules/filter_next/types/FilterParams';
import { ConfigurableTableColumn } from '../../vouchers/hooks/useConfigurableTable';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import Label from '../../../elements/image_cropper/Label';
import TableRowActions from '../../../elements/tables/TableRowActions';
import Paginator from '../../../../modules/paginator/components/Paginator';

export default function TransactionBulksTableSection({
    bulks,
    organization,
    columns,
    bulkFilter,
    bulkFilterValues,
    bulkFilterUpdate,
    paginatorKey,
}: {
    bulks: PaginationData<TransactionBulk>;
    organization: Organization;
    columns: Array<ConfigurableTableColumn>;
    bulkFilter: FilterScope<FilterModel>;
    bulkFilterValues: FilterModel;
    bulkFilterUpdate: FilterSetter;
    paginatorKey: string;
}) {
    return (
        <div>
            <LoaderTableCard
                empty={bulks?.meta?.total == 0}
                emptyTitle={'Geen bulktransacties gevonden'}
                emptyDescription={[
                    'Bulk betaalopdrachten worden dagelijks om 09:00 gegereneerd en bevatten alle nog niet ' +
                        'uitbetaalde transacties uit de wachtrij.',
                    'Momenteel zijn er geen bulk transacties beschikbaar.',
                ].join('\n')}
                columns={columns}
                tableOptions={{ filter: bulkFilter, sortable: true }}>
                {bulks?.data?.map((transactionBulk) => (
                    <StateNavLink
                        customElement={'tr'}
                        className={'tr-clickable'}
                        name={DashboardRoutes.TRANSACTION_BULK}
                        params={{
                            organizationId: organization.id,
                            id: transactionBulk.id,
                        }}
                        key={transactionBulk.id}
                        dataDusk={`transactionBulkRow${transactionBulk.id}`}>
                        <td>{transactionBulk.id}</td>
                        <td className="text-primary-light">{transactionBulk.voucher_transactions_amount_locale}</td>
                        <td>
                            <div className="text-semibold text-primary">
                                {transactionBulk.created_at_locale.split(' - ')[0]}
                            </div>
                            <div className="text-strong text-md text-muted-dark">
                                {transactionBulk.created_at_locale.split(' - ')[1]}
                            </div>
                        </td>
                        <td>{transactionBulk.voucher_transactions_count}</td>
                        <td>
                            {transactionBulk.state === 'rejected' && (
                                <Label type="danger">{transactionBulk.state_locale}</Label>
                            )}

                            {transactionBulk.state === 'error' && (
                                <Label type="danger">{transactionBulk.state_locale}</Label>
                            )}

                            {transactionBulk.state === 'draft' && (
                                <Label type="default">{transactionBulk.state_locale}</Label>
                            )}

                            {transactionBulk.state === 'accepted' && (
                                <Label type="success">{transactionBulk.state_locale}</Label>
                            )}

                            {transactionBulk.state === 'pending' && (
                                <Label type="default">{transactionBulk.state_locale}</Label>
                            )}
                        </td>

                        <td className={'table-td-actions text-right'}>
                            <TableRowActions
                                content={() => (
                                    <div className="dropdown dropdown-actions">
                                        <StateNavLink
                                            className="dropdown-item"
                                            name={DashboardRoutes.TRANSACTION_BULK}
                                            params={{
                                                organizationId: organization.id,
                                                id: transactionBulk.id,
                                            }}>
                                            <em className={'mdi mdi-eye icon-start'} />
                                            Bekijken
                                        </StateNavLink>
                                    </div>
                                )}
                            />
                        </td>
                    </StateNavLink>
                ))}
            </LoaderTableCard>

            {bulks?.meta && (
                <div className="card-section" hidden={bulks?.meta?.total < 1}>
                    <Paginator
                        meta={bulks.meta}
                        filters={bulkFilterValues}
                        updateFilters={bulkFilterUpdate}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </div>
    );
}
