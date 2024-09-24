import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useOpenModal from '../../../hooks/useOpenModal';
import useSetProgress from '../../../hooks/useSetProgress';
import { PaginationData } from '../../../props/ApiResponses';
import { strLimit } from '../../../helpers/string';
import Paginator from '../../../modules/paginator/components/Paginator';
import ThSortable from '../../elements/tables/ThSortable';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import CardHeaderFilter from '../../elements/tables/elements/CardHeaderFilter';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { dateFormat, dateParse } from '../../../helpers/dates';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import ModalPayoutsEdit from '../../modals/ModalPayoutEdit';
import TableDateTime from '../../elements/tables/elements/TableDateTime';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import TableRowActions from '../../elements/tables/TableRowActions';
import ModalPayoutsUpload from '../../modals/ModalPayoutsUpload';
import SelectControlOptionsFund from '../../elements/select-control/templates/SelectControlOptionsFund';
import usePayoutTransactionService from '../../../services/PayoutTransactionService';
import TransactionStateLabel from '../../elements/resource-states/TransactionStateLabel';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';
import TableDescription from '../../elements/table-empty-value/TableDescription';
import PayoutTransaction from '../../../props/models/PayoutTransaction';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushApiError from '../../../hooks/usePushApiError';

export default function Payouts() {
    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const paginatorService = usePaginatorService();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const payoutTransactionService = usePayoutTransactionService();

    const [loading, setLoading] = useState(false);

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [transactions, setTransactions] = useState<PaginationData<PayoutTransaction>>(null);

    const fundsWithPayouts = useMemo(() => {
        return funds?.filter((fund: Fund) => fund.allow_custom_amounts || fund.allow_preset_amounts);
    }, [funds]);

    const [states] = useState([
        { key: null, name: 'Alle' },
        { key: 'pending', name: 'In afwachting' },
        { key: 'success', name: 'Voltooid' },
    ]);

    const [fundStates] = useState([
        { key: null, name: 'Alle' },
        { key: 'closed', name: 'Gesloten' },
        { key: 'active', name: 'Actief' },
    ]);

    const [paginatorTransactionsKey] = useState('payouts');

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q: string;
        state: string;
        fund_id?: number;
        fund_state?: string;
        from?: string;
        to?: string;
        amount_min?: string;
        amount_max?: string;
        non_cancelable_from?: string;
        non_cancelable_to?: string;
        per_page?: number;
        order_by?: string;
        order_dir?: string;
    }>(
        {
            q: '',
            to: null,
            from: null,
            state: states[0].key,
            fund_id: null,
            fund_state: fundStates[0].key,
            amount_min: null,
            amount_max: null,
            non_cancelable_from: null,
            non_cancelable_to: null,
            per_page: paginatorService.getPerPage(paginatorTransactionsKey),
            order_by: 'created_at',
            order_dir: 'desc',
        },
        {
            throttledValues: ['q', 'amount_min', 'amount_max'],
        },
    );

    const columns = useMemo(() => {
        return payoutTransactionService.getColumns();
    }, [payoutTransactionService]);

    const {
        configsElement,
        showTableTooltip,
        hideTableTooltip,
        tableConfigCategory,
        showTableConfig,
        displayTableConfig,
    } = useConfigurableTable(columns);

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(activeOrganization.id)
            .then((res) => setFunds([{ id: null, name: 'Selecteer fonds' }, ...res.data.data]))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [activeOrganization.id, fundService, setProgress, pushApiError]);

    const fetchTransactions = useCallback(
        (query = {}) => {
            setLoading(true);
            setProgress(0);

            payoutTransactionService
                .list(activeOrganization.id, { ...query })
                .then((res) => setTransactions(res.data))
                .catch(pushApiError)
                .finally(() => {
                    setLoading(false);
                    setProgress(100);
                });
        },
        [activeOrganization.id, setProgress, payoutTransactionService, pushApiError],
    );

    const updatePayment = useCallback(
        (transaction: PayoutTransaction, data: { skip_transfer_delay?: boolean; cancel?: boolean }) => {
            setProgress(0);

            payoutTransactionService
                .update(activeOrganization.id, transaction.address, data)
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
            activeOrganization.id,
            fetchTransactions,
            filter.activeValues,
            pushSuccess,
        ],
    );

    const { resetFilters: resetFilters } = filter;

    const createPayout = useCallback(() => {
        openModal((modal) => (
            <ModalPayoutsEdit
                modal={modal}
                funds={fundsWithPayouts}
                organization={activeOrganization}
                onCreated={() => fetchTransactions(filter.activeValues)}
            />
        ));
    }, [activeOrganization, fetchTransactions, fundsWithPayouts, filter.activeValues, openModal]);

    const editPayout = useCallback(
        (transaction: PayoutTransaction) => {
            openModal((modal) => (
                <ModalPayoutsEdit
                    modal={modal}
                    funds={fundsWithPayouts?.filter((item) => item.id === transaction.fund.id)}
                    transaction={transaction}
                    organization={activeOrganization}
                    onUpdated={() => fetchTransactions(filter.activeValues)}
                />
            ));
        },
        [activeOrganization, fetchTransactions, fundsWithPayouts, filter.activeValues, openModal],
    );

    const uploadPayouts = useCallback(() => {
        openModal((modal) => (
            <ModalPayoutsUpload
                modal={modal}
                fundId={filter.activeValues.fund_id}
                funds={fundsWithPayouts}
                organization={activeOrganization}
                onCompleted={() => fetchTransactions(filter.activeValues)}
            />
        ));
    }, [openModal, filter.activeValues, fundsWithPayouts, activeOrganization, fetchTransactions]);

    useEffect(() => {
        fetchTransactions(filterValuesActive);
    }, [fetchTransactions, filterValuesActive]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    if (!transactions || !funds) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header card-header-next">
                <div className="flex flex-grow">
                    <div className="card-title">
                        {translate('payouts.header.title')} ({transactions.meta.total})
                    </div>
                </div>
                <div className={'card-header-filters'}>
                    <div className="block block-inline-filters">
                        {fundsWithPayouts?.length > 0 && (
                            <button className="button button-primary button-sm" onClick={createPayout}>
                                <em className="mdi mdi-plus-circle icon-start" />
                                Uitbetaling aanmaken
                            </button>
                        )}

                        {fundsWithPayouts?.length > 0 && (
                            <button className="button button-primary button-sm" onClick={uploadPayouts}>
                                <em className="mdi mdi-upload icon-start" />
                                Upload bulkbestand
                            </button>
                        )}

                        <div className="form">
                            <div className="form-group">
                                <SelectControl
                                    className="form-control inline-filter-control"
                                    propKey={'id'}
                                    options={funds}
                                    value={filter.activeValues.fund_id}
                                    placeholder={translate('vouchers.labels.fund')}
                                    allowSearch={false}
                                    onChange={(fund_id: number) => filter.update({ fund_id })}
                                    optionsComponent={SelectControlOptionsFund}
                                />
                            </div>
                        </div>

                        {filter.show && (
                            <div className="button button-text" onClick={() => resetFilters()}>
                                <em className="mdi mdi-close icon-start" />
                                Wis filters
                            </div>
                        )}

                        {!filter.show && (
                            <div className="form">
                                <div className="form-group">
                                    <input
                                        className="form-control"
                                        value={filterValues.q}
                                        onChange={(e) => filterUpdate({ q: e.target.value })}
                                        placeholder={translate('payouts.labels.search')}
                                    />
                                </div>
                            </div>
                        )}

                        <CardHeaderFilter filter={filter}>
                            <FilterItemToggle label={translate('payouts.labels.search')} show={true}>
                                <input
                                    className="form-control"
                                    value={filterValues.q}
                                    onChange={(e) => filterUpdate({ q: e.target.value })}
                                    placeholder={translate('payouts.labels.search')}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('payouts.labels.amount')}>
                                <div className="row">
                                    <div className="col col-lg-6">
                                        <input
                                            className="form-control"
                                            min={0}
                                            type="number"
                                            value={filterValues.amount_min || ''}
                                            onChange={(e) => filterUpdate({ amount_min: e.target.value })}
                                            placeholder={translate('payouts.labels.amount_min')}
                                        />
                                    </div>
                                    <div className="col col-lg-6">
                                        <input
                                            className="form-control"
                                            min={0}
                                            type="number"
                                            value={filterValues.amount_max || ''}
                                            onChange={(e) => filterUpdate({ amount_max: e.target.value })}
                                            placeholder={translate('payouts.labels.amount_max')}
                                        />
                                    </div>
                                </div>
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('payouts.labels.state')}>
                                <SelectControl
                                    className="form-control"
                                    propKey={'key'}
                                    allowSearch={false}
                                    value={filterValues.state}
                                    options={states}
                                    optionsComponent={SelectControlOptions}
                                    onChange={(state: string) => filterUpdate({ state })}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('payouts.labels.fund')}>
                                {funds && (
                                    <SelectControl
                                        className="form-control"
                                        propKey={'id'}
                                        allowSearch={false}
                                        options={funds}
                                        optionsComponent={SelectControlOptions}
                                        onChange={(fund_id: number) => filterUpdate({ fund_id })}
                                    />
                                )}
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('payouts.labels.from')}>
                                <DatePickerControl
                                    value={dateParse(filterValues.from)}
                                    placeholder={translate('jjjj-MM-dd')}
                                    onChange={(from: Date) => {
                                        filterUpdate({ from: dateFormat(from) });
                                    }}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('payouts.labels.to')}>
                                <DatePickerControl
                                    value={dateParse(filterValues.to)}
                                    placeholder={translate('jjjj-MM-dd')}
                                    onChange={(to: Date) => {
                                        filterUpdate({ to: dateFormat(to) });
                                    }}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('payouts.labels.non_cancelable_from')}>
                                <DatePickerControl
                                    value={dateParse(filterValues.non_cancelable_from)}
                                    placeholder={translate('jjjj-MM-dd')}
                                    onChange={(from: Date) => {
                                        filterUpdate({ non_cancelable_from: dateFormat(from) });
                                    }}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('payouts.labels.non_cancelable_to')}>
                                <DatePickerControl
                                    value={dateParse(filterValues.non_cancelable_to)}
                                    placeholder={translate('jjjj-MM-dd')}
                                    onChange={(to: Date) => {
                                        filterUpdate({ non_cancelable_to: dateFormat(to) });
                                    }}
                                />
                            </FilterItemToggle>
                        </CardHeaderFilter>
                    </div>
                </div>
            </div>

            <LoaderTableCard
                loading={loading}
                empty={transactions.meta.total == 0}
                emptyTitle={'Geen uitbetalingen gevonden'}>
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                <thead>
                                    <tr>
                                        {columns.map((column, index: number) => (
                                            <ThSortable
                                                key={index}
                                                label={translate(column.label)}
                                                value={column.value}
                                                filter={filter}
                                                onMouseOver={() => showTableTooltip(column.tooltip?.key)}
                                                onMouseLeave={() => hideTableTooltip()}
                                            />
                                        ))}
                                        <th className="table-th-actions table-th-actions-with-list">
                                            <div className="table-th-actions-list">
                                                <div
                                                    className={`table-th-action ${
                                                        showTableConfig && tableConfigCategory == 'tooltips'
                                                            ? 'active'
                                                            : ''
                                                    }`}
                                                    onClick={() => displayTableConfig('tooltips')}>
                                                    <em className="mdi mdi-information-variant-circle" />
                                                </div>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.data.map((transaction) => (
                                        <StateNavLink
                                            key={transaction.id}
                                            name={'payout'}
                                            params={{
                                                address: transaction.address,
                                                organizationId: activeOrganization.id,
                                            }}
                                            className={'tr-clickable'}
                                            customElement={'tr'}>
                                            <td>{transaction.id}</td>
                                            <td title={transaction.fund.name || ''}>
                                                <StateNavLink
                                                    name={'funds-show'}
                                                    params={{
                                                        organizationId: activeOrganization.id,
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
                                                                relation.type === 'bsn'
                                                                    ? 'text-primary text-medium'
                                                                    : ''
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
                                                                    organizationId: activeOrganization.id,
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
                                                                    {strLimit(
                                                                        'Direct doorzetten naar betaalopdracht',
                                                                        32,
                                                                    )}
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

                {transactions.meta.total > 0 && (
                    <div className="card-section">
                        <Paginator
                            meta={transactions.meta}
                            filters={filterValues}
                            updateFilters={filterUpdate}
                            perPageKey={paginatorTransactionsKey}
                        />
                    </div>
                )}
            </LoaderTableCard>
        </div>
    );
}
