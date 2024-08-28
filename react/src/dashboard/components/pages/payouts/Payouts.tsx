import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import Transaction from '../../../props/models/Transaction';
import useOpenModal from '../../../hooks/useOpenModal';
import useTransactionService from '../../../services/TransactionService';
import useSetProgress from '../../../hooks/useSetProgress';
import useEnvData from '../../../hooks/useEnvData';
import { PaginationData } from '../../../props/ApiResponses';
import { strLimit } from '../../../helpers/string';
import useTransactionExportService from '../../../services/exports/useTransactionExportService';
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
import classNames from 'classnames';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import ModalPayoutsEdit from '../../modals/ModalPayoutEdit';
import TableDateTime from '../../elements/tables/elements/TableDateTime';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import TableRowActions from '../../elements/tables/TableRowActions';
import ModalPayoutsUpload from '../../modals/ModalPayoutsUpload';
import SelectControlOptionsFund from '../../elements/select-control/templates/SelectControlOptionsFund';

export default function Payouts() {
    const envData = useEnvData();

    const openModal = useOpenModal();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const paginatorService = usePaginatorService();
    const activeOrganization = useActiveOrganization();

    const transactionService = useTransactionService();

    const fundService = useFundService();
    const transactionsExportService = useTransactionExportService();

    const [loading, setLoading] = useState(false);

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [transactions, setTransactions] = useState<PaginationData<Transaction>>(null);
    const [shownVoucherMenuId, setShownVoucherMenuId] = useState<number>(null);

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

    const [paginatorTransactionsKey] = useState('transactions');

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q: string;
        state: string;
        fund_id?: number;
        fund_state?: string;
        from?: string;
        to?: string;
        amount_min?: string;
        amount_max?: string;
        transfer_in_min?: string;
        transfer_in_max?: string;
        non_cancelable_from?: string;
        non_cancelable_to?: string;
        per_page?: number;
        order_by?: string;
        order_dir?: string;
    }>(
        {
            q: '',
            state: states[0].key,
            fund_id: null,
            fund_state: fundStates[0].key,
            from: null,
            to: null,
            amount_min: null,
            amount_max: null,
            transfer_in_min: null,
            transfer_in_max: null,
            non_cancelable_from: null,
            non_cancelable_to: null,
            per_page: paginatorService.getPerPage(paginatorTransactionsKey),
            order_by: 'created_at',
            order_dir: 'desc',
        },
        {
            throttledValues: ['q', 'amount_min', 'amount_max', 'transfer_in_min', 'transfer_in_max'],
        },
    );

    const columns = useMemo(() => {
        return transactionService.getPayoutColumns();
    }, [transactionService]);

    const {
        configsElement,
        showTableTooltip,
        hideTableTooltip,
        tableConfigCategory,
        showTableConfig,
        displayTableConfig,
    } = useConfigurableTable(columns);

    const fetchFunds = useCallback(
        async (query: object): Promise<Array<Fund>> => {
            setProgress(0);

            return fundService
                .list(activeOrganization.id, query)
                .then((res) => res.data.data)
                .finally(() => setProgress(100));
        },
        [activeOrganization.id, fundService, setProgress],
    );

    const fetchTransactions = useCallback(
        async (query: object) => {
            setLoading(true);
            setProgress(0);

            return transactionService
                .list(envData.client_type, activeOrganization.id, { ...query, targets: ['payout'] })
                .finally(() => {
                    setLoading(false);
                    setProgress(100);
                });
        },
        [activeOrganization.id, envData.client_type, setProgress, transactionService],
    );

    const updatePayment = useCallback(
        (transaction: Transaction, data: { skip_transfer_delay?: boolean; cancel?: boolean }) => {
            setProgress(0);

            transactionService
                .updatePayout(activeOrganization.id, transaction.address, data)
                .then(() => fetchTransactions(filter.activeValues).then((res) => setTransactions(res.data)))
                .finally(() => setProgress(100));
        },
        [setProgress, transactionService, activeOrganization.id, fetchTransactions, filter.activeValues],
    );

    const { resetFilters: resetFilters, setShow } = filter;

    const exportTransactions = useCallback(() => {
        setShow(false);

        transactionsExportService.exportData(activeOrganization.id, {
            ...filter.activeValues,
            per_page: null,
        });
    }, [activeOrganization.id, filter.activeValues, setShow, transactionsExportService]);

    const createPayout = useCallback(() => {
        openModal((modal) => (
            <ModalPayoutsEdit
                modal={modal}
                funds={fundsWithPayouts}
                organization={activeOrganization}
                onCreated={() => {
                    fetchTransactions(filter.activeValues).then((res) => setTransactions(res.data));
                }}
            />
        ));
    }, [activeOrganization, fetchTransactions, fundsWithPayouts, filter.activeValues, openModal]);

    const editPayout = useCallback(
        (transaction: Transaction) => {
            openModal((modal) => (
                <ModalPayoutsEdit
                    modal={modal}
                    funds={fundsWithPayouts?.filter((item) => item.id === transaction.fund.id)}
                    transaction={transaction}
                    organization={activeOrganization}
                    onUpdated={() => {
                        fetchTransactions(filter.activeValues).then((res) => setTransactions(res.data));
                    }}
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
                onCompleted={() => {
                    fetchTransactions(filter.activeValues).then((res) => setTransactions(res.data));
                }}
            />
        ));
    }, [openModal, filter.activeValues, fundsWithPayouts, activeOrganization, fetchTransactions]);

    useEffect(() => {
        fetchTransactions(filterValuesActive).then((res) => setTransactions(res.data));
    }, [fetchTransactions, filterValuesActive, activeOrganization?.has_bank_connection]);

    useEffect(() => {
        fetchFunds({}).then((funds) => setFunds([{ id: null, name: 'Selecteer fond' }, ...funds]));
    }, [fetchFunds]);

    if (!transactions || !funds) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header card-header-next">
                <div className="flex flex-grow">
                    <div className="card-title">Uitbetalingen ({transactions.meta.total})</div>
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

                            <FilterItemToggle label={translate('payouts.labels.transfer_in')}>
                                <div className="row">
                                    <div className="col col-lg-6">
                                        <input
                                            className="form-control"
                                            min={0}
                                            type="number"
                                            value={filterValues.transfer_in_min || ''}
                                            onChange={(e) => {
                                                if (!e.target.value || parseInt(e.target.value) >= 0) {
                                                    filterUpdate({ transfer_in_min: e.target.value });
                                                }
                                            }}
                                            placeholder={translate('payouts.labels.transfer_in_min')}
                                        />
                                    </div>
                                    <div className="col col-lg-6">
                                        <input
                                            className="form-control"
                                            min={0}
                                            type="number"
                                            value={filterValues.transfer_in_max || ''}
                                            onChange={(e) => {
                                                if (!e.target.value || parseInt(e.target.value) <= 14) {
                                                    filterUpdate({ transfer_in_max: e.target.value });
                                                }
                                            }}
                                            placeholder={translate('payouts.labels.transfer_in_max')}
                                        />
                                    </div>
                                </div>
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

                            <FilterItemToggle label={translate('payouts.labels.fund_state')}>
                                <SelectControl
                                    className="form-control"
                                    propKey={'key'}
                                    allowSearch={false}
                                    value={filterValues.fund_state}
                                    options={fundStates}
                                    optionsComponent={SelectControlOptions}
                                    onChange={(fund_state: string) => filterUpdate({ fund_state })}
                                />
                            </FilterItemToggle>

                            <div className="form-actions">
                                <button
                                    className="button button-primary button-wide"
                                    onClick={() => exportTransactions()}
                                    disabled={transactions.meta.total == 0}>
                                    <em className="mdi mdi-download icon-start" />
                                    {translate('components.dropdown.export', {
                                        total: transactions.meta.total,
                                    })}
                                </button>
                            </div>
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
                                            name={'transaction'}
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
                                            {transaction.employee ? (
                                                <td>
                                                    {transaction.upload_batch_id
                                                        ? 'Handmatig Bulk'
                                                        : 'Handmatig Individueel'}
                                                </td>
                                            ) : (
                                                <td>Beoordelaar</td>
                                            )}
                                            <td>
                                                <div
                                                    className={classNames(
                                                        'label',
                                                        transaction.state == 'success'
                                                            ? 'label-success'
                                                            : 'label-default',
                                                    )}>
                                                    {transaction.state_locale}
                                                </div>
                                            </td>
                                            <td>{transaction.bulk_status_locale || <TableEmptyValue />}</td>
                                            <td>{transaction.employee.email}</td>
                                            <td>
                                                {transaction.iban_to}
                                                <div className={'text-small text-muted-dark'}>
                                                    {transaction.iban_to_name}
                                                </div>
                                            </td>

                                            <td
                                                className={'table-td-actions'}
                                                style={{ zIndex: shownVoucherMenuId === transaction.id ? 1 : 0 }}>
                                                <div
                                                    className={`actions ${shownVoucherMenuId == transaction.id ? 'active' : ''}`}>
                                                    <TableRowActions
                                                        id={transaction.id}
                                                        activeId={shownVoucherMenuId}
                                                        setActiveId={setShownVoucherMenuId}>
                                                        <div className="dropdown dropdown-actions">
                                                            <StateNavLink
                                                                name={'transaction'}
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
                                                                        setShownVoucherMenuId(null);
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
                                                                        setShownVoucherMenuId(null);
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
                                                                        setShownVoucherMenuId(null);
                                                                    }}>
                                                                    <em className="mdi mdi-clock-fast icon-start" />{' '}
                                                                    {/*Direct doorzetten naar betaalopdracht*/}
                                                                    Direct doorzetten naar betaa...
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableRowActions>
                                                </div>
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
