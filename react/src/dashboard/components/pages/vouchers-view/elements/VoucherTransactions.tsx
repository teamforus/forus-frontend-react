import Transaction from '../../../../props/models/Transaction';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useEnvData from '../../../../hooks/useEnvData';
import Paginator from '../../../../modules/paginator/components/Paginator';
import useFilter from '../../../../hooks/useFilter';
import ThSortable from '../../../elements/tables/ThSortable';
import { currencyFormat, strLimit } from '../../../../helpers/string';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import FilterModel from '../../../../types/FilterModel';
import useTransactionService from '../../../../services/TransactionService';
import Organization from '../../../../props/models/Organization';
import { PaginationData } from '../../../../props/ApiResponses';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useTranslate from '../../../../hooks/useTranslate';
import useSetProgress from '../../../../hooks/useSetProgress';
import EmptyCard from '../../../elements/empty-card/EmptyCard';

export default function VoucherTransactions({
    blockTitle,
    organization,
    filterValues,
    fetchTransactionsRef = null,
}: {
    blockTitle: string;
    organization: Organization;
    filterValues: FilterModel;
    fetchTransactionsRef?: React.MutableRefObject<() => void>;
}) {
    const envData = useEnvData();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const transactionService = useTransactionService();

    const [transactions, setTransactions] = useState<PaginationData<Transaction>>(null);

    const isSponsor = useMemo(() => {
        return envData.client_type == 'sponsor';
    }, [envData.client_type]);

    const filter = useFilter(filterValues);

    const fetchTransactions = useCallback(() => {
        setProgress(100);

        transactionService
            .list(envData.client_type, organization.id, filter.activeValues)
            .then((res) => setTransactions(res.data))
            .finally(() => setProgress(100));
    }, [envData.client_type, filter.activeValues, organization.id, transactionService, setProgress]);

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
            <div className="card-header card-header-next">
                <div className="card-title">
                    {blockTitle || 'Transactions'} ({transactions.meta.total})
                </div>
            </div>

            {transactions.data.length > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <ThSortable
                                            filter={filter}
                                            label={translate('transactions.labels.id')}
                                            value="id"
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={translate('transactions.labels.uid')}
                                            value="id"
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={translate('transactions.labels.amount')}
                                            value="amount"
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={translate('transactions.labels.created_at')}
                                            value="created_at"
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={translate('transactions.labels.fund_name')}
                                            value="fund_name"
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={translate('transactions.labels.target')}
                                            value="target"
                                        />
                                        {isSponsor && (
                                            <ThSortable
                                                filter={filter}
                                                label={translate('transactions.labels.provider_name')}
                                                value="provider_name"
                                            />
                                        )}
                                        <ThSortable
                                            filter={filter}
                                            label={translate('transactions.labels.product_name')}
                                            value="product_name"
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={translate('transactions.labels.state')}
                                            value="state"
                                        />
                                        <ThSortable
                                            className="th-narrow text-right"
                                            filter={filter}
                                            label={translate('transactions.labels.action')}
                                        />
                                    </tr>

                                    {transactions.data.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td>{transaction.id}</td>
                                            <td title={transaction.uid || '-'}>
                                                {strLimit(transaction.uid || '-', 25)}
                                            </td>
                                            <td>
                                                <StateNavLink
                                                    name={'transaction'}
                                                    className="text-primary-light"
                                                    params={{
                                                        organizationId: organization.id,
                                                        address: transaction.address,
                                                    }}>
                                                    {currencyFormat(parseFloat(transaction.amount))}
                                                </StateNavLink>
                                            </td>
                                            <td>
                                                <strong className="text-primary">
                                                    {transaction.created_at_locale.split(' - ')[0]}
                                                </strong>
                                                <br />
                                                <strong className="text-strong text-md text-muted-dark">
                                                    {transaction.created_at_locale.split(' - ')[1]}
                                                </strong>
                                            </td>
                                            <td title={transaction.fund.name || ''}>
                                                {strLimit(transaction.fund.name, 25)}
                                            </td>
                                            <td>{transaction.target_locale}</td>
                                            {isSponsor && (
                                                <td
                                                    className={transaction.organization ? '' : 'text-muted'}
                                                    title={transaction.organization?.name || ''}>
                                                    {strLimit(transaction.organization?.name || '-', 25)}
                                                </td>
                                            )}
                                            <td title={transaction.product?.name || ''}>
                                                {strLimit(transaction.product?.name || '-', 25)}
                                            </td>
                                            <td>
                                                {transaction.state == 'success' ? (
                                                    <div className="label label-success">
                                                        {transaction.state_locale}
                                                    </div>
                                                ) : (
                                                    <div className="label label-default">
                                                        {transaction.state_locale}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="td-narrow text-right">
                                                <StateNavLink
                                                    name={'transaction'}
                                                    className="button button-sm button-primary button-icon pull-right"
                                                    params={{
                                                        address: transaction.address,
                                                        organizationId: organization.id,
                                                    }}>
                                                    <em className="mdi mdi-eye-outline icon-start" />
                                                </StateNavLink>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {transactions.meta.total === 0 ? (
                <EmptyCard title={'Geen transacties gevonden'} type={'card-section'} />
            ) : (
                <div className="card-section">
                    <Paginator meta={transactions.meta} filters={filter.activeValues} updateFilters={filter.update} />
                </div>
            )}
        </div>
    );
}
