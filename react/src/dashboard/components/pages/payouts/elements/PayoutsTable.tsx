import React, { useCallback } from 'react';
import Organization from '../../../../props/models/Organization';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import Paginator from '../../../../modules/paginator/components/Paginator';
import { PaginationData } from '../../../../props/ApiResponses';
import { FilterModel, FilterSetter } from '../../../../modules/filter_next/types/FilterParams';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { strLimit } from '../../../../helpers/string';
import TableRowActions from '../../../elements/tables/TableRowActions';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import FilterScope from '../../../../types/FilterScope';
import TableDateTime from '../../../elements/tables/elements/TableDateTime';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TransactionStateLabel from '../../../elements/resource-states/TransactionStateLabel';
import TableDescription from '../../../elements/table-empty-value/TableDescription';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import PayoutTransaction from '../../../../props/models/PayoutTransaction';
import ModalPayoutsEdit from '../../../modals/ModalPayoutEdit';
import usePayoutTransactionService from '../../../../services/PayoutTransactionService';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import useOpenModal from '../../../../hooks/useOpenModal';
import usePushApiError from '../../../../hooks/usePushApiError';
import Fund from '../../../../props/models/Fund';

export default function PayoutsTable({
    filter,
    loading,
    paginatorKey,
    transactions,
    organization,
    filterValues,
    filterUpdate,
    fetchTransactions,
    fundsWithPayouts,
}: {
    filter: FilterScope<FilterModel>;
    loading: boolean;
    paginatorKey: string;
    transactions: PaginationData<PayoutTransaction>;
    organization: Organization;
    filterValues: FilterModel;
    filterUpdate: FilterSetter;
    fetchTransactions: (filters: object) => void;
    fundsWithPayouts: Array<Partial<Fund>>;
}) {
    const openModal = useOpenModal();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const pushSuccess = usePushSuccess();

    const payoutTransactionService = usePayoutTransactionService();

    const { headElement, configsElement } = useConfigurableTable(payoutTransactionService.getColumns(), {
        filter: filter,
        sortable: true,
        hasTooltips: true,
    });

    const updatePayment = useCallback(
        (
            transaction: PayoutTransaction,
            data: {
                skip_transfer_delay?: boolean;
                cancel?: boolean;
            },
        ) => {
            setProgress(0);

            payoutTransactionService
                .update(organization.id, transaction.address, data)
                .then(() => {
                    fetchTransactions(filter.activeValues);
                    pushSuccess('Opgeslagen!');
                })
                .catch(pushApiError)
                .finally(() => setProgress(100));
        },
        [
            setProgress,
            pushApiError,
            payoutTransactionService,
            organization.id,
            fetchTransactions,
            filter.activeValues,
            pushSuccess,
        ],
    );

    const editPayout = useCallback(
        (transaction: PayoutTransaction) => {
            openModal((modal) => (
                <ModalPayoutsEdit
                    modal={modal}
                    funds={fundsWithPayouts?.filter((item) => item.id === transaction.fund.id)}
                    transaction={transaction}
                    organization={organization}
                    onUpdated={() => fetchTransactions(filter.activeValues)}
                />
            ));
        },
        [organization, fetchTransactions, fundsWithPayouts, filter.activeValues, openModal],
    );

    return (
        <LoaderTableCard
            loading={loading}
            empty={transactions.meta.total == 0}
            emptyTitle={'Geen uitbetalingen gevonden'}>
            <div className="card-section">
                <div className="card-block card-block-table">
                    {configsElement}

                    <TableTopScroller>
                        <table className="table">
                            {headElement}

                            <tbody>
                                {transactions.data.map((transaction) => (
                                    <StateNavLink
                                        key={transaction.id}
                                        name={'payout'}
                                        params={{
                                            address: transaction.address,
                                            organizationId: organization.id,
                                        }}
                                        className={'tr-clickable'}
                                        customElement={'tr'}>
                                        <td>{transaction.id}</td>
                                        <td title={transaction.fund.name || ''}>
                                            <StateNavLink
                                                name={'funds-show'}
                                                params={{
                                                    organizationId: organization.id,
                                                    fundId: transaction?.fund?.id,
                                                }}
                                                className="text-primary-light">
                                                {strLimit(transaction.fund.name, 25)}
                                            </StateNavLink>
                                        </td>
                                        <td>{transaction.amount_locale}</td>
                                        <td>
                                            <TableDateTime value={transaction.created_at_locale} />
                                        </td>
                                        <td>
                                            <TableDateTime value={transaction.transfer_at_locale} />
                                        </td>
                                        <td>
                                            <div className="text-medium text-primary">
                                                {transaction.payment_type_locale.title}
                                            </div>
                                            <div
                                                className="text-strong text-md text-muted-dark"
                                                title={transaction.payment_type_locale.subtitle || ''}>
                                                {strLimit(transaction.payment_type_locale.subtitle)}
                                            </div>
                                        </td>
                                        <td>
                                            {transaction.payout_relations?.length > 0 ? (
                                                transaction.payout_relations.map((relation) => (
                                                    <div
                                                        title={relation.value}
                                                        className={
                                                            relation.type === 'bsn' ? 'text-primary text-medium' : ''
                                                        }
                                                        key={relation.id}>
                                                        {strLimit(relation.value)}
                                                    </div>
                                                ))
                                            ) : (
                                                <TableEmptyValue />
                                            )}
                                        </td>
                                        <td>
                                            <TransactionStateLabel transaction={transaction} />
                                        </td>
                                        <td>{transaction?.employee?.email || <TableEmptyValue />}</td>
                                        <td>
                                            {transaction.iban_to}
                                            <div className={'text-small text-muted-dark'}>
                                                {transaction.iban_to_name}
                                            </div>
                                        </td>
                                        <td>
                                            {transaction.description ? (
                                                <TableDescription description={transaction.description} />
                                            ) : (
                                                <TableEmptyValue />
                                            )}
                                        </td>

                                        <td className={'table-td-actions'}>
                                            <TableRowActions
                                                content={({ close }) => (
                                                    <div className="dropdown dropdown-actions">
                                                        <StateNavLink
                                                            name={'payout'}
                                                            className="dropdown-item"
                                                            params={{
                                                                organizationId: organization.id,
                                                                address: transaction.address,
                                                            }}>
                                                            <em className="mdi mdi-eye icon-start" /> Bekijken
                                                        </StateNavLink>
                                                        {transaction.is_editable && (
                                                            <div
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    editPayout(transaction);
                                                                    close();
                                                                }}>
                                                                <em className="mdi mdi-pencil-outline icon-start" />{' '}
                                                                Bewerken
                                                            </div>
                                                        )}
                                                        {transaction.is_cancelable && (
                                                            <div
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    updatePayment(transaction, {
                                                                        cancel: true,
                                                                    });
                                                                    close();
                                                                }}>
                                                                <em className="mdi mdi-close-circle icon-start" />{' '}
                                                                Annuleren
                                                            </div>
                                                        )}
                                                        {transaction.transfer_in_pending && (
                                                            <div
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    updatePayment(transaction, {
                                                                        skip_transfer_delay: true,
                                                                    });
                                                                }}>
                                                                <em className="mdi mdi-clock-fast icon-start" />{' '}
                                                                {strLimit('Direct doorzetten naar betaalopdracht', 32)}
                                                            </div>
                                                        )}
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

            {transactions.meta && (
                <div className="card-section">
                    <Paginator
                        meta={transactions.meta}
                        filters={filterValues}
                        updateFilters={filterUpdate}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </LoaderTableCard>
    );
}
