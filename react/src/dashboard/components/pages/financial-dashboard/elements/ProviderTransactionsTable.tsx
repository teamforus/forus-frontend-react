import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ThSortable from '../../../elements/tables/ThSortable';
import { strLimit } from '../../../../helpers/string';
import Transaction from '../../../../props/models/Transaction';
import { PaginationData } from '../../../../props/ApiResponses';
import Paginator from '../../../../modules/paginator/components/Paginator';
import { useNavigateState } from '../../../../modules/state_router/Router';
import useEnvData from '../../../../hooks/useEnvData';
import useFilter from '../../../../hooks/useFilter';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import Organization from '../../../../props/models/Organization';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useTransactionService from '../../../../services/TransactionService';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushDanger from '../../../../hooks/usePushDanger';

export default function ProviderTransactionsTable({
    provider,
    organization,
    externalFilters,
}: {
    provider: Organization;
    organization: Organization;
    externalFilters?: object;
}) {
    const { t } = useTranslation();

    const envData = useEnvData();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const paginatorService = usePaginatorService();
    const transactionService = useTransactionService();

    const panelType = useMemo(() => envData.client_type, [envData?.client_type]);
    const isSponsor = useMemo(() => envData.client_type == 'sponsor', [envData?.client_type]);

    const [paginatorKey] = useState('provider_finances_transactions');
    const [transactions, setTransactions] = useState<PaginationData<Transaction>>(null);

    const filter = useFilter({
        page: 1,
        provider_ids: [provider.id],
        per_page: paginatorService.getPerPage(paginatorKey),
    });

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
            .list(panelType, organization.id, { ...externalFilters, ...filter.activeValues })
            .then((res) => setTransactions(res.data))
            .catch((res) => pushDanger('Mislukt!', res.data.message))
            .finally(() => setProgress(100));
    }, [
        setProgress,
        transactionService,
        panelType,
        organization.id,
        filter?.activeValues,
        externalFilters,
        pushDanger,
    ]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    if (!transactions) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            {transactions.meta.total > 0 ? (
                <table className="table">
                    <tbody>
                        <tr>
                            <ThSortable label="Aanbieder" />
                            <ThSortable label={t('fund_card_provider_finances.labels.price')} />
                            <ThSortable label={t('fund_card_provider_finances.labels.product_name')} />
                            <ThSortable label={t('fund_card_provider_finances.labels.date')} />
                            <ThSortable className="text-right" label={t('fund_card_provider_finances.labels.status')} />
                        </tr>

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
                                <td className="text-right">
                                    {{ pending: 'In afwachting', success: 'Voltooid' }[transaction.state]}
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan={5}>
                                {transactions?.meta && (
                                    <Paginator
                                        meta={transactions.meta}
                                        filters={filter.values}
                                        updateFilters={filter.update}
                                        perPageKey={paginatorKey}
                                    />
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            ) : (
                <div className="card">
                    <div className="card-section">
                        <div className="block block-empty text-center">
                            <div className="empty-details">Geen transacties.</div>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
