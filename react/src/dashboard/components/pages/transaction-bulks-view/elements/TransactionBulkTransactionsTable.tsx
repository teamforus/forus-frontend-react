import React, { useCallback, useEffect, useState } from 'react';
import ThSortable from '../../../elements/tables/ThSortable';
import { strLimit } from '../../../../helpers/string';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import Paginator from '../../../../modules/paginator/components/Paginator';
import Transaction from '../../../../props/models/Transaction';
import { PaginationData } from '../../../../props/ApiResponses';
import useTransactionExporter from '../../../../services/exporters/useTransactionExporter';
import Organization from '../../../../props/models/Organization';
import TransactionBulk from '../../../../props/models/TransactionBulk';
import useTransactionService from '../../../../services/TransactionService';
import useFilter from '../../../../hooks/useFilter';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import useSetProgress from '../../../../hooks/useSetProgress';
import useEnvData from '../../../../hooks/useEnvData';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useTranslate from '../../../../hooks/useTranslate';
import usePushApiError from '../../../../hooks/usePushApiError';
import Label from '../../../elements/image_cropper/Label';

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

    const filter = useFilter({
        per_page: paginationService.getPerPage(perPageKey),
        order_by: 'created_at',
        order_dir: 'desc',
    });

    const exportTransactions = useCallback(() => {
        transactionExporter.exportData(organization.id, {
            ...filter.activeValues,
            voucher_transaction_bulk_id: transactionBulk.id,
            per_page: null,
        });
    }, [organization.id, filter.activeValues, transactionBulk?.id, transactionExporter]);

    const fetchTransactions = useCallback(
        (id: number) => {
            setProgress(0);

            transactionService
                .list(envData.client_type, organization.id, {
                    ...filter.activeValues,
                    voucher_transaction_bulk_id: id,
                })
                .then((res) => setTransactions(res.data))
                .catch(pushApiError)
                .finally(() => setProgress(100));
        },
        [setProgress, transactionService, envData.client_type, organization.id, filter.activeValues, pushApiError],
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
                    {`${translate('transactions.header.title')} (${transactions.meta.total})`}
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
            <div className="card-section">
                <div className="card-block card-block-table">
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <ThSortable
                                        filter={filter}
                                        label={translate('transactions.labels.id')}
                                        value="id"
                                    />

                                    <ThSortable
                                        filter={filter}
                                        label={translate('transactions.labels.uid')}
                                        value="uid"
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
                                        label={translate('transactions.labels.provider_name')}
                                        value="provider_name"
                                    />

                                    <ThSortable
                                        filter={filter}
                                        label={translate('transactions.labels.product_name')}
                                        value="product_name"
                                    />

                                    <ThSortable
                                        filter={filter}
                                        label={translate('transactions.labels.state')}
                                        value="status"
                                    />

                                    <ThSortable
                                        className={'th-narrow text-right'}
                                        filter={filter}
                                        label={translate('transactions.labels.action')}
                                    />
                                </tr>
                            </thead>
                            <tbody>
                                {transactions?.data.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td>{transaction.id}</td>

                                        <td title={transaction.uid || '-'}>{strLimit(transaction.uid || '-', 25)}</td>

                                        <td>
                                            <StateNavLink
                                                name={'transaction'}
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

                                        <td className={transaction.organization ? '' : 'text-muted'}>
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
                                                name={'transaction'}
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
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {transactions?.meta.last_page > 1 && (
                <div className="card-section">
                    <Paginator
                        meta={transactions.meta}
                        filters={filter.values}
                        updateFilters={filter.update}
                        perPageKey={perPageKey}
                    />
                </div>
            )}
        </div>
    );
}
