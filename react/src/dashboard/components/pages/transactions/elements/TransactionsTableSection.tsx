import React, { Fragment } from 'react';
import classNames from 'classnames';
import { PaginationData } from '../../../../props/ApiResponses';
import Transaction from '../../../../props/models/Transaction';
import Organization from '../../../../props/models/Organization';
import { FilterModel, FilterScope, FilterSetter } from '../../../../modules/filter_next/types/FilterParams';
import { ConfigurableTableColumn } from '../../vouchers/hooks/useConfigurableTable';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import { strLimit } from '../../../../helpers/string';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TableRowActions from '../../../elements/tables/TableRowActions';
import TransactionStateLabel from '../../../elements/resource-states/TransactionStateLabel';
import Label from '../../../elements/image_cropper/Label';
import TranslateHtml from '../../../elements/translate-html/TranslateHtml';
import Paginator from '../../../../modules/paginator/components/Paginator';

export default function TransactionsTableSection({
    transactions,
    organization,
    isSponsor,
    isProvider,
    columns,
    filter,
    filterValues,
    filterUpdate,
    paginatorKey,
    pendingBulkingMeta,
    canManageBulks,
    buildingBulks,
    onBulkPendingNow,
}: {
    transactions: PaginationData<Transaction>;
    organization: Organization;
    isSponsor: boolean;
    isProvider: boolean;
    columns: Array<ConfigurableTableColumn>;
    filter: FilterScope<FilterModel>;
    filterValues: FilterModel;
    filterUpdate: FilterSetter;
    paginatorKey: string;
    pendingBulkingMeta?: {
        total_amount_locale?: string;
        total_amount?: string;
        total: number;
    };
    canManageBulks: boolean;
    buildingBulks: boolean;
    onBulkPendingNow: () => void;
}) {
    return (
        <Fragment>
            <LoaderTableCard
                empty={transactions?.meta?.total == 0}
                emptyTitle={isSponsor ? 'Geen betaalopdrachten gevonden' : 'Geen transacties gevonden'}
                columns={columns}
                tableOptions={{
                    filter,
                    sortable: true,
                    sortableExclude: ['method', 'branch_name', 'branch_number', 'amount_extra'],
                }}>
                {transactions?.data?.map((transaction) => (
                    <StateNavLink
                        customElement={'tr'}
                        className={'tr-clickable'}
                        key={transaction.id}
                        name={DashboardRoutes.TRANSACTION}
                        params={{
                            organizationId: organization.id,
                            address: transaction.address,
                        }}
                        dataDusk={`tableTransactionRow${transaction.id}`}>
                        <td>{transaction.id}</td>

                        {isSponsor && <td title={transaction.uid || '-'}>{strLimit(transaction.uid || '-', 32)}</td>}
                        <td>
                            <StateNavLink
                                name={DashboardRoutes.TRANSACTION}
                                params={{
                                    address: transaction.address,
                                    organizationId: organization.id,
                                }}
                                className="text-primary-light">
                                {transaction.amount_locale}
                            </StateNavLink>
                        </td>
                        {isProvider && (
                            <td>{transaction?.reservation?.amount_extra > 0 ? 'iDeal + Tegoed' : 'Tegoed'}</td>
                        )}
                        {isProvider && (
                            <td>
                                {transaction?.branch_name && (
                                    <div className="text-primary">{transaction?.branch_name}</div>
                                )}

                                {transaction?.branch_id && (
                                    <div>
                                        ID <strong>{transaction?.branch_id}</strong>
                                    </div>
                                )}

                                {!transaction.branch_id && !transaction.branch_name && (
                                    <div className={'text-muted'}>Geen...</div>
                                )}
                            </td>
                        )}
                        {isProvider && (
                            <td>
                                <div className={classNames(!transaction?.branch_number && 'text-muted')}>
                                    {strLimit(transaction.branch_number?.toString(), 32) || 'Geen...'}
                                </div>
                            </td>
                        )}
                        {isProvider && (
                            <td>
                                {transaction?.reservation?.amount_extra > 0
                                    ? transaction?.reservation?.amount_extra_locale
                                    : '-'}
                            </td>
                        )}
                        <td>
                            <div className={'text-semibold text-primary'}>
                                {transaction.created_at_locale.split(' - ')[0]}
                            </div>
                            <div className={'text-strong text-md text-muted-dark'}>
                                {transaction.created_at_locale.split(' - ')[1]}
                            </div>
                        </td>
                        <td title={transaction.fund.name || ''}>{strLimit(transaction.fund.name, 25)}</td>
                        {isProvider && (
                            <td title={transaction.product?.name || '-'}>
                                {transaction.product?.name ? (
                                    strLimit(transaction.product?.name || '', 25)
                                ) : (
                                    <TableEmptyValue />
                                )}
                            </td>
                        )}
                        {isSponsor && (
                            <td>
                                <div className="text-semibold text-primary">
                                    {transaction.payment_type_locale.title}
                                </div>
                                <div
                                    className="text-strong text-md text-muted-dark"
                                    title={transaction.payment_type_locale.subtitle || ''}>
                                    {strLimit(transaction.payment_type_locale.subtitle)}
                                </div>
                            </td>
                        )}
                        {isSponsor && (
                            <Fragment>
                                {transaction.organization ? (
                                    <td title={transaction.organization.name}>
                                        {strLimit(transaction.organization.name, 25)}
                                    </td>
                                ) : (
                                    <td>
                                        <TableEmptyValue />
                                    </td>
                                )}
                            </Fragment>
                        )}

                        {isSponsor && (
                            <td>
                                {transaction.non_cancelable_at_locale ? (
                                    <div className={'text-semibold text-primary'}>
                                        {transaction.non_cancelable_at_locale}
                                    </div>
                                ) : (
                                    <TableEmptyValue />
                                )}
                            </td>
                        )}

                        {isSponsor && (
                            <td>
                                {transaction.execution_date_locale ? (
                                    <div className={'text-semibold text-primary'}>
                                        {transaction.execution_date_locale}
                                    </div>
                                ) : (
                                    <TableEmptyValue />
                                )}
                            </td>
                        )}

                        {isSponsor && transaction.voucher_transaction_bulk_id && (
                            <td>
                                <StateNavLink
                                    name={DashboardRoutes.TRANSACTION_BULK}
                                    params={{
                                        organizationId: organization.id,
                                        id: transaction.voucher_transaction_bulk_id,
                                    }}
                                    className="text-primary-light">
                                    {`#${transaction.voucher_transaction_bulk_id}`}
                                </StateNavLink>
                            </td>
                        )}
                        {isSponsor && !transaction.voucher_transaction_bulk_id && (
                            <td>
                                {transaction.transfer_in > 0 &&
                                transaction.state == 'pending' &&
                                transaction.attempts < 3 ? (
                                    <div>In afwachting</div>
                                ) : (
                                    <TableEmptyValue />
                                )}
                            </td>
                        )}
                        {isSponsor && (
                            <td>
                                {(transaction.bulk_state == 'rejected' || transaction.bulk_state == 'error') && (
                                    <Label type="danger">{transaction.bulk_state_locale}</Label>
                                )}

                                {(transaction.bulk_state == 'draft' || transaction.bulk_state == 'pending') && (
                                    <Label type="default">{transaction.bulk_state_locale}</Label>
                                )}

                                {transaction.bulk_state == 'accepted' && (
                                    <Label type="success">{transaction.bulk_state_locale}</Label>
                                )}

                                {!transaction.bulk_state && <TableEmptyValue />}
                            </td>
                        )}
                        <td data-dusk="transactionState">
                            <TransactionStateLabel transaction={transaction} />
                        </td>
                        <td>
                            {transaction.transfer_in > 0 && transaction.state == 'pending' ? (
                                <div className="text-muted-dark">
                                    <em className="mdi mdi-clock-outline"> </em>
                                    {transaction.transfer_in} dagen resterend
                                </div>
                            ) : (
                                <TableEmptyValue />
                            )}
                        </td>
                        <td className={'table-td-actions text-right'}>
                            <TableRowActions
                                content={() => (
                                    <div className="dropdown dropdown-actions">
                                        <StateNavLink
                                            className="dropdown-item"
                                            name={DashboardRoutes.TRANSACTION}
                                            params={{
                                                organizationId: organization.id,
                                                address: transaction.address,
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

            {!isSponsor && transactions.meta?.total > 0 && (
                <div className="card-section">
                    <div className="flex flex-horizontal">
                        <div className="flex flex-grow">
                            <div className="flex flex-vertical flex-center">
                                <TranslateHtml
                                    i18n={'transactions.labels.total_amount'}
                                    values={{ total_amount: transactions?.meta?.total_amount_locale }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {pendingBulkingMeta?.total > 0 && canManageBulks && (
                <div className="card-section">
                    <div className="flex flex-vertical">
                        <div className="card-text" data-dusk="pendingBulkingMetaText">
                            <TranslateHtml
                                i18n={'transactions.labels.bulk_total_amount'}
                                values={{
                                    total: pendingBulkingMeta.total,
                                    total_amount: pendingBulkingMeta.total_amount_locale,
                                }}
                            />
                        </div>
                        <button
                            className="button button-primary"
                            data-dusk="bulkPendingNow"
                            onClick={onBulkPendingNow}
                            disabled={buildingBulks}>
                            {buildingBulks ? (
                                <em className="mdi mdi-spin mdi-loading icon-start" />
                            ) : (
                                <em className="mdi mdi-cube-send icon-start" />
                            )}
                            Maak nu een bulk betaalopdrachten
                        </button>
                    </div>
                </div>
            )}

            {transactions?.meta && (
                <div className="card-section" hidden={transactions?.meta?.total < 1}>
                    <Paginator
                        meta={transactions.meta}
                        filters={filterValues}
                        updateFilters={filterUpdate}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </Fragment>
    );
}
