import Transaction from '../../../../props/models/Transaction';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import useEnvData from '../../../../hooks/useEnvData';
import { currencyFormat, strLimit } from '../../../../helpers/string';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useTransactionService from '../../../../services/TransactionService';
import Organization from '../../../../props/models/Organization';
import { PaginationData } from '../../../../props/ApiResponses';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useSetProgress from '../../../../hooks/useSetProgress';
import Label from '../../../elements/label/Label';
import TableRowActions from '../../../elements/tables/TableRowActions';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import { FilterModel } from '../../../../modules/filter_next/types/FilterParams';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';

export default function VoucherTransactionsCard({
    blockTitle,
    organization,
    filters,
    fetchTransactionsRef = null,
}: {
    blockTitle: string;
    organization: Organization;
    filters: FilterModel;
    fetchTransactionsRef?: React.MutableRefObject<() => void>;
}) {
    const envData = useEnvData();
    const setProgress = useSetProgress();
    const transactionService = useTransactionService();

    const [transactions, setTransactions] = useState<PaginationData<Transaction>>(null);
    const [paginatorKey] = useState('voucher_transactions');

    const isSponsor = useMemo(() => {
        return envData.client_type == 'sponsor';
    }, [envData.client_type]);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext(filters);

    const fetchTransactions = useCallback(() => {
        setProgress(100);

        transactionService
            .list(envData.client_type, organization.id, filterValuesActive)
            .then((res) => setTransactions(res.data))
            .finally(() => setProgress(100));
    }, [envData.client_type, filterValuesActive, organization.id, transactionService, setProgress]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    useEffect(() => {
        if (fetchTransactionsRef) {
            fetchTransactionsRef.current = fetchTransactions;
        }
    }, [fetchTransactions, fetchTransactionsRef]);

    if (!transactions) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">
                    {blockTitle || 'Transactions'} ({transactions?.meta?.total})
                </div>
            </div>

            <LoaderTableCard
                empty={transactions?.meta?.total === 0}
                emptyTitle={'Geen transacties gevonden'}
                columns={transactionService.getColumnsForVoucher(isSponsor)}
                tableOptions={{ filter, sortable: true }}
                paginator={{ key: paginatorKey, data: transactions, filterValues, filterUpdate }}>
                {transactions?.data?.map((transaction) => (
                    <tr key={transaction.id}>
                        <td>{transaction.id}</td>
                        <td title={transaction.uid || '-'}>{strLimit(transaction.uid || '-', 25)}</td>
                        <td>
                            <StateNavLink
                                name={DashboardRoutes.TRANSACTION}
                                className="text-primary-light"
                                params={{
                                    organizationId: organization.id,
                                    address: transaction.address,
                                }}>
                                {currencyFormat(parseFloat(transaction.amount))}
                            </StateNavLink>
                        </td>
                        <td>
                            <strong className="text-primary">{transaction.created_at_locale.split(' - ')[0]}</strong>
                            <br />
                            <strong className="text-strong text-md text-muted-dark">
                                {transaction.created_at_locale.split(' - ')[1]}
                            </strong>
                        </td>
                        <td title={transaction.fund.name || ''}>{strLimit(transaction.fund.name, 25)}</td>
                        <td>{transaction.target_locale}</td>
                        {isSponsor && (
                            <td
                                className={classNames(!transaction.organization && 'text-muted')}
                                title={transaction.organization?.name || ''}>
                                {strLimit(transaction.organization?.name || '-', 25)}
                            </td>
                        )}
                        <td title={transaction.product?.name || ''}>
                            {strLimit(transaction.product?.name || '-', 25)}
                        </td>
                        <td>
                            {transaction.state == 'success' ? (
                                <Label type="success">{transaction.state_locale}</Label>
                            ) : (
                                <Label type="default">{transaction.state_locale}</Label>
                            )}
                        </td>

                        <td className={'table-td-actions text-right'}>
                            <TableRowActions
                                content={() => (
                                    <div className="dropdown dropdown-actions">
                                        <StateNavLink
                                            name={DashboardRoutes.TRANSACTION}
                                            className="dropdown-item"
                                            params={{
                                                address: transaction.address,
                                                organizationId: organization.id,
                                            }}>
                                            <em className="mdi mdi-eye-outline icon-start" />
                                            Bekijken
                                        </StateNavLink>
                                    </div>
                                )}
                            />
                        </td>
                    </tr>
                ))}
            </LoaderTableCard>
        </div>
    );
}
