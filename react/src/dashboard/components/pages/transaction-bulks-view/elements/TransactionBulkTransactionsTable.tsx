import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { strLimit } from '../../../../helpers/string';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import Transaction from '../../../../props/models/Transaction';
import { PaginationData } from '../../../../props/ApiResponses';
import useTransactionExporter from '../../../../services/exporters/useTransactionExporter';
import Organization from '../../../../props/models/Organization';
import TransactionBulk from '../../../../props/models/TransactionBulk';
import useTransactionService from '../../../../services/TransactionService';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import useSetProgress from '../../../../hooks/useSetProgress';
import useEnvData from '../../../../hooks/useEnvData';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useTranslate from '../../../../hooks/useTranslate';
import usePushApiError from '../../../../hooks/usePushApiError';
import Label from '../../../elements/image_cropper/Label';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import { NumberParam, StringParam } from 'use-query-params';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';

export default function TransactionBulkTransactionsTable({
    organization,
    transactionBulk,
}: {
    organization: Organization;
    transactionBulk: TransactionBulk;
}) {
    const envData = useEnvData();

    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const transactionExporter = useTransactionExporter();

    const paginationService = usePaginatorService();
    const transactionService = useTransactionService();

    const [transactions, setTransactions] = useState<PaginationData<Transaction>>(null);
    const [perPageKey] = useState('transaction_bulks_transactions');

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        page?: number;
        per_page?: number;
        order_by: string;
        order_dir: string;
    }>(
        {
            per_page: paginationService.getPerPage(perPageKey),
            order_by: 'created_at',
            order_dir: 'desc',
        },
        {
            queryParams: {
                page: NumberParam,
                per_page: NumberParam,
                order_by: StringParam,
                order_dir: StringParam,
            },
        },
    );

    const exportTransactions = useCallback(() => {
        transactionExporter.exportData(organization.id, {
            ...filterValuesActive,
            voucher_transaction_bulk_id: transactionBulk.id,
            per_page: null,
        });
    }, [organization.id, filterValuesActive, transactionBulk?.id, transactionExporter]);

    const fetchTransactions = useCallback(
        (id: number) => {
            setProgress(0);

            transactionService
                .list(envData.client_type, organization.id, {
                    ...filterValuesActive,
                    voucher_transaction_bulk_id: id,
                })
                .then((res) => setTransactions(res.data))
                .catch(pushApiError)
                .finally(() => setProgress(100));
        },
        [setProgress, transactionService, envData.client_type, organization.id, filterValuesActive, pushApiError],
    );

    useEffect(() => {
        if (transactionBulk?.id) {
            fetchTransactions(transactionBulk.id);
        }
    }, [fetchTransactions, transactionBulk]);

    if (!transactions) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex flex-grow card-title">
                    {`${translate('transactions.header.title')} (${transactions?.meta?.total})`}
                </div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <button className="button button-primary button-sm" onClick={() => exportTransactions()}>
                            <em className="mdi mdi-download icon-start" />
                            Exporteren
                        </button>
                    </div>
                </div>
            </div>
            <LoaderTableCard
                empty={transactions?.meta?.total == 0}
                emptyTitle={'Geen transacties gevonden'}
                columns={transactionService.getBulkTransactionsColumns()}
                tableOptions={{ filter, sortable: true }}
                paginator={{ key: perPageKey, data: transactions, filterValues, filterUpdate }}>
                {transactions?.data?.map((transaction) => (
                    <tr key={transaction.id}>
                        <td>{transaction.id}</td>

                        <td title={transaction.uid || '-'}>{strLimit(transaction.uid || '-', 25)}</td>

                        <td>
                            <StateNavLink
                                name={DashboardRoutes.TRANSACTION}
                                params={{
                                    organizationId: organization.id,
                                    address: transaction.address,
                                }}
                                className="text-primary-light">
                                {transaction.amount_locale}
                            </StateNavLink>
                        </td>

                        <td>
                            <div className="text-primary text-semibold">
                                {transaction.created_at_locale.split(' - ')[0]}
                            </div>
                            <div className="text-strong text-md text-muted-dark">
                                {transaction.created_at_locale.split(' - ')[1]}
                            </div>
                        </td>

                        <td>{strLimit(transaction.fund.name, 25)}</td>

                        <td className={classNames(!transaction.organization && 'text-muted')}>
                            {strLimit(transaction.organization?.name || '-', 25) || '-'}
                        </td>

                        <td>{strLimit(transaction.product?.name || '-', 25) || '-'}</td>

                        <td>
                            <Label type={transaction.state == 'success' ? 'success' : 'default'}>
                                {transaction.state_locale}
                            </Label>
                        </td>
                        <td>
                            <StateNavLink
                                name={DashboardRoutes.TRANSACTION}
                                params={{
                                    organizationId: organization.id,
                                    address: transaction.address,
                                }}
                                className="button button-sm button-primary button-icon pull-right">
                                <em className="mdi mdi-eye-outline icon-start" />
                            </StateNavLink>
                        </td>
                    </tr>
                ))}
            </LoaderTableCard>
        </div>
    );
}
