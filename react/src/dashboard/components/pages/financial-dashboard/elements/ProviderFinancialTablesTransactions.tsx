import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { strLimit } from '../../../../helpers/string';
import Transaction from '../../../../props/models/Transaction';
import { PaginationData } from '../../../../props/ApiResponses';
import Paginator from '../../../../modules/paginator/components/Paginator';
import { useNavigateState } from '../../../../modules/state_router/Router';
import useEnvData from '../../../../hooks/useEnvData';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import Organization from '../../../../props/models/Organization';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useTransactionService from '../../../../services/TransactionService';
import useSetProgress from '../../../../hooks/useSetProgress';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import usePushApiError from '../../../../hooks/usePushApiError';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';

export default function ProviderFinancialTablesTransactions({
    provider,
    organization,
    externalFilters,
}: {
    provider: Organization;
    organization: Organization;
    externalFilters?: object;
}) {
    const envData = useEnvData();

    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();

    const paginatorService = usePaginatorService();
    const transactionService = useTransactionService();

    const panelType = useMemo(() => envData.client_type, [envData?.client_type]);
    const isSponsor = useMemo(() => envData.client_type == 'sponsor', [envData?.client_type]);

    const [paginatorKey] = useState('provider_finances_transactions');
    const [transactions, setTransactions] = useState<PaginationData<Transaction>>(null);

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext({
        provider_ids: [provider.id],
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const { headElement, configsElement } = useConfigurableTable(
        transactionService.getProviderFinancialTransactionsColumns(),
    );

    const showTransaction = useCallback(
        (transaction: Transaction) => {
            navigateState(
                'transaction',
                isSponsor
                    ? { address: transaction.address, organizationId: transaction.fund.organization_id }
                    : transaction,
            );
        },
        [isSponsor, navigateState],
    );

    const fetchTransactions = useCallback(() => {
        setProgress(0);

        transactionService
            .list(panelType, organization.id, { ...externalFilters, ...filterValuesActive })
            .then((res) => setTransactions(res.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [
        setProgress,
        transactionService,
        panelType,
        organization.id,
        filterValuesActive,
        externalFilters,
        pushApiError,
    ]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    if (!transactions) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            {configsElement}

            <TableTopScroller>
                {transactions.meta.total > 0 ? (
                    <table className="table">
                        {headElement}

                        <tbody>
                            {transactions.data.map((transaction) => (
                                <tr key={transaction.id} onClick={() => showTransaction(transaction)}>
                                    <td title={transaction.organization.name}>
                                        {strLimit(transaction.organization.name, 50)}
                                    </td>
                                    <td>
                                        <a className="text-primary-light">{transaction.amount_locale}</a>
                                    </td>
                                    <td title={transaction.product?.name}>
                                        {strLimit(transaction.product?.name || '-', 50)}
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
                                    <td>{{ pending: 'In afwachting', success: 'Voltooid' }[transaction.state]}</td>
                                    <td className={'table-td-actions text-right'}>
                                        <TableEmptyValue />
                                    </td>
                                </tr>
                            ))}

                            <tr>
                                <td colSpan={5}>
                                    {transactions?.meta && (
                                        <Paginator
                                            meta={transactions.meta}
                                            filters={filterValues}
                                            updateFilters={filterUpdate}
                                            perPageKey={paginatorKey}
                                        />
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <EmptyCard title={'Geen transacties.'} />
                )}
            </TableTopScroller>
        </Fragment>
    );
}
