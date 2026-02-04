import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useNavigateState } from '../../../modules/state_router/Router';
import Transaction from '../../../props/models/Transaction';
import useOpenModal from '../../../hooks/useOpenModal';
import useTransactionService from '../../../services/TransactionService';
import useSetProgress from '../../../hooks/useSetProgress';
import useEnvData from '../../../hooks/useEnvData';
import useTransactionBulkService from '../../../services/TransactionBulkService';
import { PaginationData } from '../../../props/ApiResponses';
import usePushSuccess from '../../../hooks/usePushSuccess';
import TransactionBulk from '../../../props/models/TransactionBulk';
import useTransactionExporter from '../../../services/exporters/useTransactionExporter';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../services/FundService';
import useProviderFundService from '../../../services/ProviderFundService';
import Fund from '../../../props/models/Fund';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../elements/select-control/SelectControl';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import CardHeaderFilter from '../../elements/tables/elements/CardHeaderFilter';
import { hasPermission } from '../../../helpers/utils';
import useTransactionBulkExporter from '../../../services/exporters/useTransactionBulkExporter';
import { dateFormat, dateParse } from '../../../helpers/dates';
import ModalVoucherTransactionsUpload from '../../modals/ModalVoucherTransactionsUpload';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import useConfirmDangerAction from '../../../hooks/useConfirmDangerAction';
import { Permission } from '../../../props/models/Organization';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { createEnumParam, NumberParam, StringParam } from 'use-query-params';
import BlockLabelTabs from '../../elements/block-label-tabs/BlockLabelTabs';
import TransactionsTableSection from './elements/TransactionsTableSection';
import TransactionBulksTableSection from './elements/TransactionBulksTableSection';
import StateNavLink from '../../../modules/state_router/StateNavLink';

export default function Transactions() {
    const envData = useEnvData();

    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const confirmDangerAction = useConfirmDangerAction();

    const activeOrganization = useActiveOrganization();
    const transactionExporter = useTransactionExporter();
    const transactionBulkExporter = useTransactionBulkExporter();

    const paginatorService = usePaginatorService();
    const transactionService = useTransactionService();
    const transactionBulkService = useTransactionBulkService();

    const fundService = useFundService();
    const providerFundsService = useProviderFundService();

    const isSponsor = useMemo(() => envData.client_type == 'sponsor', [envData.client_type]);
    const isProvider = useMemo(() => envData.client_type == 'provider', [envData.client_type]);

    const [buildingBulks, setBuildingBulks] = useState(false);
    const [pendingBulkingMeta, setPendingBulkingMeta] = useState<{
        total_amount_locale?: string;
        total_amount?: string;
        total: number;
    }>(null);

    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [transactions, setTransactions] = useState<PaginationData<Transaction>>(null);
    const [transactionBulks, setTransactionBulks] = useState<PaginationData<TransactionBulk>>(null);

    const hasDirectPayments = useMemo(() => {
        return funds?.filter((fund: Fund) => fund.allow_direct_payments).length > 0;
    }, [funds]);

    const [viewTypes] = useState<Array<{ key: 'transactions' | 'bulks'; label: string }>>([
        { key: 'transactions', label: 'Individueel' },
        { key: 'bulks', label: 'Bulk' },
    ]);

    const [states] = useState([
        { key: null, name: 'Alle' },
        { key: 'pending', name: 'In afwachting' },
        { key: 'success', name: 'Voltooid' },
    ]);

    const [bulkStates] = useState([
        { key: null, name: 'Alle' },
        { key: 'draft', name: 'In afwachting' },
        { key: 'error', name: 'Mislukt' },
        { key: 'pending', name: 'In behandeling' },
        { key: 'accepted', name: 'Geaccepteerd' },
        { key: 'rejected', name: 'Geweigerd' },
    ]);

    const [fundStates] = useState([
        { key: null, name: 'Alle' },
        { key: 'closed', name: 'Gesloten' },
        { key: 'active', name: 'Actief' },
    ]);

    const [viewType, setViewType] = useState(viewTypes[0]);
    const prevViewType = useRef<string>(null);
    const [paginatorTransactionsKey] = useState('transactions');
    const [paginatorTransactionBulkKey] = useState('transaction_bulks');

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
        execution_date_from?: string;
        execution_date_to?: string;
        bulk_state?: string;
        per_page?: number;
        order_by?: string;
        order_dir?: string;
        page?: number;
    }>(
        {
            q: '',
            state: states[0].key,
            fund_id: null,
            fund_state: fundStates[0].key,
            from: null,
            to: null,
            page: 1,
            amount_min: null,
            amount_max: null,
            transfer_in_min: null,
            transfer_in_max: null,
            non_cancelable_from: null,
            non_cancelable_to: null,
            execution_date_from: null,
            execution_date_to: null,
            bulk_state: bulkStates[0].key,
            per_page: paginatorService.getPerPage(paginatorTransactionsKey),
            order_by: 'created_at',
            order_dir: 'desc',
        },
        {
            queryParams: {
                q: StringParam,
                to: StringParam,
                from: StringParam,
                state: createEnumParam(['pending', 'success']),
                fund_id: NumberParam,
                fund_state: createEnumParam(['closed', 'active']),
                amount_min: NumberParam,
                amount_max: NumberParam,
                transfer_in_min: NumberParam,
                transfer_in_max: NumberParam,
                non_cancelable_from: StringParam,
                non_cancelable_to: StringParam,
                execution_date_from: StringParam,
                execution_date_to: StringParam,
                bulk_state: createEnumParam(['draft', 'error', 'pending', 'accepted', 'rejected']),
                order_by: StringParam,
                order_dir: StringParam,
                per_page: NumberParam,
                page: NumberParam,
            },
            throttledValues: ['q', 'amount_min', 'amount_max', 'transfer_in_min', 'transfer_in_max'],
        },
    );

    const [bulkFilterValues, bulkFilterValuesActive, bulkFilterUpdate, bulkFilter] = useFilterNext<{
        from?: string;
        to?: string;
        amount_min?: string;
        amount_max?: string;
        quantity_min?: string;
        quantity_max?: string;
        state?: string;
        page?: number;
        per_page?: number;
        order_by?: string;
        order_dir?: string;
    }>(
        {
            from: null,
            to: null,
            page: 1,
            amount_min: null,
            amount_max: null,
            quantity_min: null,
            quantity_max: null,
            state: bulkStates[0].key,
            per_page: paginatorService.getPerPage(paginatorTransactionBulkKey),
            order_by: 'created_at',
            order_dir: 'desc',
        },
        {
            queryParams: {
                to: StringParam,
                from: StringParam,
                state: createEnumParam(['pending', 'success']),
                amount_min: NumberParam,
                amount_max: NumberParam,
                quantity_min: NumberParam,
                quantity_max: NumberParam,
                order_by: StringParam,
                order_dir: StringParam,
                per_page: NumberParam,
                page: NumberParam,
            },
            throttledValues: ['amount_min', 'amount_max', 'quantity_min', 'quantity_max'],
        },
    );

    const fetchFunds = useCallback(
        async (query: object): Promise<Array<Fund>> => {
            setProgress(0);

            if (envData.client_type == 'sponsor') {
                return fundService
                    .list(activeOrganization.id, query)
                    .then((res) => res.data.data)
                    .finally(() => setProgress(100));
            }

            return providerFundsService
                .listFunds(activeOrganization.id, query)
                .then((res) => res.data.data.map((item) => item.fund))
                .finally(() => setProgress(100));
        },
        [activeOrganization.id, envData.client_type, fundService, providerFundsService, setProgress],
    );

    const fetchTransactions = useCallback(
        async (query: object) => {
            setProgress(0);

            return transactionService
                .list(envData.client_type, activeOrganization.id, query)
                .finally(() => setProgress(100));
        },
        [activeOrganization.id, envData.client_type, setProgress, transactionService],
    );

    const fetchTransactionBulks = useCallback(
        async (query: object) => {
            setProgress(0);

            return transactionBulkService.list(activeOrganization.id, query).finally(() => setProgress(100));
        },
        [activeOrganization.id, setProgress, transactionBulkService],
    );

    const { resetFilters: resetFilters, setShow } = filter;
    const { resetFilters: resetBulkFilters, setShow: setShowBulk } = bulkFilter;

    const exportTransactions = useCallback(() => {
        setShow(false);

        transactionExporter.exportData(activeOrganization.id, {
            ...filterValuesActive,
            per_page: null,
        });
    }, [activeOrganization.id, filterValuesActive, setShow, transactionExporter]);

    const exportTransactionBulks = useCallback(() => {
        setShowBulk(false);

        transactionBulkExporter.exportData(activeOrganization.id, {
            ...bulkFilterValuesActive,
            per_page: null,
        });
    }, [activeOrganization.id, bulkFilterValuesActive, setShowBulk, transactionBulkExporter]);

    const updateHasPendingBulking = useCallback(() => {
        fetchTransactions({
            ...filterValuesActive,
            pending_bulking: 1,
            per_page: 1,
        }).then((res) => setPendingBulkingMeta(res.data.meta));
    }, [fetchTransactions, filterValuesActive]);

    const uploadTransactions = useCallback(() => {
        openModal((modal) => (
            <ModalVoucherTransactionsUpload
                modal={modal}
                organization={activeOrganization}
                onCreated={() => {
                    fetchTransactions(filterValuesActive).then((res) => setTransactions(res.data));

                    if (isSponsor && activeOrganization?.has_bank_connection) {
                        updateHasPendingBulking();
                    }
                }}
            />
        ));
    }, [activeOrganization, fetchTransactions, filterValuesActive, isSponsor, openModal, updateHasPendingBulking]);

    const confirmBulkNow = useCallback(() => {
        const total = pendingBulkingMeta.total;
        const totalAmount = pendingBulkingMeta.total_amount_locale;

        return confirmDangerAction(
            'Nu een bulk betaalopdrachten maken',
            [
                'U staat op het punt om een bulk betaalopdrachten aan te maken. De nog niet uitbetaalde transacties worden gebundeld tot één bulktransactie.',
                `De ${total} individuele betaalopdrachten hebben een totaal waarde van ${totalAmount}.`,
                'Weet u zeker dat u wilt verdergaan?',
            ].join('\n'),
        );
    }, [confirmDangerAction, pendingBulkingMeta]);

    const bulkPendingNow = useCallback(() => {
        confirmBulkNow().then((confirmed) => {
            if (!confirmed) {
                return;
            }

            setBuildingBulks(true);
            setProgress(0);

            transactionBulkService
                .bulkNow(activeOrganization.id, filterValuesActive)
                .then((res) => {
                    const bulks = res.data.data;

                    if (bulks.length > 1) {
                        setViewType(viewTypes.find((viewType) => viewType.key == 'bulks'));

                        pushSuccess(
                            'Gelukt!',
                            `${bulks.length} bulk betaalopdrachten aangemaakt. Accepteer de transactie in uw bankomgeving.`,
                        );
                    } else if (bulks.length == 1) {
                        navigateState(DashboardRoutes.TRANSACTION_BULK, {
                            organizationId: activeOrganization.id,
                            id: bulks[0].id,
                        });

                        pushSuccess(`Gelukt!`, `Accepteer de transactie in uw bankomgeving.`);
                    }
                })
                .catch(pushApiError)
                .finally(() => {
                    setBuildingBulks(false);
                    updateHasPendingBulking();
                    setProgress(100);
                });
        });
    }, [
        activeOrganization.id,
        confirmBulkNow,
        filterValuesActive,
        navigateState,
        pushApiError,
        pushSuccess,
        setProgress,
        transactionBulkService,
        updateHasPendingBulking,
        viewTypes,
    ]);

    useEffect(() => {
        if (viewType.key === 'bulks') {
            fetchTransactionBulks(bulkFilterValuesActive).then((res) => setTransactionBulks(res.data));
        } else {
            fetchTransactions(filterValuesActive).then((res) => setTransactions(res.data));

            if (isSponsor && activeOrganization?.has_bank_connection) {
                updateHasPendingBulking();
            }
        }
    }, [
        isSponsor,
        fetchTransactionBulks,
        fetchTransactions,
        bulkFilterValuesActive,
        filterValuesActive,
        viewType.key,
        activeOrganization?.has_bank_connection,
        updateHasPendingBulking,
    ]);

    useEffect(() => {
        fetchFunds({ per_page: 100 }).then((funds) => setFunds(funds));
    }, [fetchFunds]);

    useEffect(() => {
        if (prevViewType.current === 'bulks') {
            resetBulkFilters();
        }

        if (prevViewType.current === 'transactions') {
            resetFilters();
        }

        prevViewType.current = viewType?.key;
    }, [resetFilters, resetBulkFilters, viewType?.key]);

    if (
        (viewType.key === 'transactions' && !transactions) ||
        (viewType.key === 'bulks' && !transactionBulks) ||
        !funds
    ) {
        return <LoadingCard />;
    }

    return (
        <div className="card" data-dusk="tableTransactionContent">
            <div className="card-header">
                {viewType.key == 'transactions' ? (
                    <div className="card-title flex flex-grow">
                        {isSponsor
                            ? translate('transactions.header.title')
                            : translate('transactions.header.title_provider')}{' '}
                        ({transactions.meta.total})
                    </div>
                ) : (
                    <div className="card-title flex flex-grow">
                        {translate('transactions.header.titleBulks')} ({transactionBulks.meta.total})
                    </div>
                )}

                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        {hasDirectPayments && viewType.key == 'transactions' && (
                            <button
                                type="button"
                                className="button button-primary button-sm"
                                onClick={() => uploadTransactions()}
                                data-dusk="uploadTransactionsBatchButton">
                                <em className="mdi mdi-upload icon-start" />
                                Upload bulkbestand
                            </button>
                        )}

                        {isSponsor && (
                            <div className="flex form">
                                <div>
                                    <BlockLabelTabs
                                        value={viewType.key}
                                        setValue={(key) =>
                                            setViewType(viewTypes.find((type) => type.key === key) || viewType)
                                        }
                                        tabs={viewTypes?.map((type) => ({
                                            value: type.key,
                                            dusk: `transaction_view_${type.key}`,
                                            label: type.label,
                                        }))}
                                    />
                                </div>
                            </div>
                        )}

                        {viewType.key == 'transactions' && filter.show && (
                            <div className="button button-text" onClick={() => resetFilters()}>
                                <em className="mdi mdi-close icon-start" />
                                Wis filters
                            </div>
                        )}

                        {viewType.key == 'bulks' && bulkFilter.show && (
                            <div className="button button-text" onClick={() => resetBulkFilters()}>
                                <em className="mdi mdi-close icon-start" />
                                Wis filters
                            </div>
                        )}

                        {viewType.key == 'transactions' && isProvider && (
                            <StateNavLink
                                name={DashboardRoutes.TRANSACTION_SETTINGS}
                                params={{ organizationId: activeOrganization.id }}
                                className="button button-primary button-sm">
                                <em className="mdi mdi-cog icon-start" />
                                Instellingen
                            </StateNavLink>
                        )}

                        {!filter.show && viewType.key == 'transactions' && (
                            <div className="form">
                                <div className="form-group">
                                    <input
                                        className="form-control"
                                        value={filterValues.q}
                                        onChange={(e) => filterUpdate({ q: e.target.value })}
                                        data-dusk="tableTransactionSearch"
                                        placeholder={translate('transactions.labels.search')}
                                    />
                                </div>
                            </div>
                        )}

                        {viewType.key == 'transactions' && (
                            <CardHeaderFilter filter={filter}>
                                <FilterItemToggle label={translate('transactions.labels.search')} show={true}>
                                    <input
                                        className="form-control"
                                        value={filterValues.q}
                                        onChange={(e) => filterUpdate({ q: e.target.value })}
                                        placeholder={translate('transactions.labels.search')}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('transactions.labels.amount')}>
                                    <div className="row">
                                        <div className="col col-lg-6">
                                            <input
                                                className="form-control"
                                                min={0}
                                                type="number"
                                                value={filterValues.amount_min || ''}
                                                onChange={(e) =>
                                                    filterUpdate({
                                                        amount_min: e.target.value,
                                                    })
                                                }
                                                placeholder={translate('transactions.labels.amount_min')}
                                            />
                                        </div>
                                        <div className="col col-lg-6">
                                            <input
                                                className="form-control"
                                                min={0}
                                                type="number"
                                                value={filterValues.amount_max || ''}
                                                onChange={(e) =>
                                                    filterUpdate({
                                                        amount_max: e.target.value,
                                                    })
                                                }
                                                placeholder={translate('transactions.labels.amount_max')}
                                            />
                                        </div>
                                    </div>
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('transactions.labels.state')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'key'}
                                        allowSearch={false}
                                        value={filterValues.state}
                                        options={states}
                                        onChange={(state: string) => filterUpdate({ state })}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle
                                    dusk="fundSelectToggle"
                                    label={translate('transactions.labels.fund_name')}>
                                    {funds && (
                                        <SelectControl
                                            className="form-control"
                                            propKey={'id'}
                                            allowSearch={false}
                                            options={[{ id: null, name: 'Selecteer fonds' }, ...funds]}
                                            dusk="fundSelect"
                                            value={filterValues.fund_id}
                                            onChange={(fund_id: number) => filterUpdate({ fund_id })}
                                        />
                                    )}
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('transactions.labels.from')}>
                                    <DatePickerControl
                                        value={dateParse(filterValues.from)}
                                        placeholder={translate('jjjj-MM-dd')}
                                        onChange={(from: Date) => {
                                            filterUpdate({ from: dateFormat(from) });
                                        }}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('transactions.labels.to')}>
                                    <DatePickerControl
                                        value={dateParse(filterValues.to)}
                                        placeholder={translate('jjjj-MM-dd')}
                                        onChange={(to: Date) => {
                                            filterUpdate({ to: dateFormat(to) });
                                        }}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('transactions.labels.transfer_in')}>
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
                                                placeholder={translate('transactions.labels.transfer_in_min')}
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
                                                placeholder={translate('transactions.labels.transfer_in_max')}
                                            />
                                        </div>
                                    </div>
                                </FilterItemToggle>

                                {isSponsor && (
                                    <Fragment>
                                        <FilterItemToggle label={translate('transactions.labels.non_cancelable_from')}>
                                            <DatePickerControl
                                                value={dateParse(filterValues.non_cancelable_from)}
                                                placeholder={translate('jjjj-MM-dd')}
                                                onChange={(from: Date) => {
                                                    filterUpdate({ non_cancelable_from: dateFormat(from) });
                                                }}
                                            />
                                        </FilterItemToggle>

                                        <FilterItemToggle label={translate('transactions.labels.non_cancelable_to')}>
                                            <DatePickerControl
                                                value={dateParse(filterValues.non_cancelable_to)}
                                                placeholder={translate('jjjj-MM-dd')}
                                                onChange={(to: Date) => {
                                                    filterUpdate({ non_cancelable_to: dateFormat(to) });
                                                }}
                                            />
                                        </FilterItemToggle>

                                        <FilterItemToggle label={translate('transactions.labels.execution_date_from')}>
                                            <DatePickerControl
                                                value={dateParse(filterValues.execution_date_from)}
                                                placeholder={translate('jjjj-MM-dd')}
                                                onChange={(from: Date) => {
                                                    filterUpdate({ execution_date_from: dateFormat(from) });
                                                }}
                                            />
                                        </FilterItemToggle>

                                        <FilterItemToggle label={translate('transactions.labels.execution_date_to')}>
                                            <DatePickerControl
                                                value={dateParse(filterValues.execution_date_to)}
                                                placeholder={translate('jjjj-MM-dd')}
                                                onChange={(to: Date) => {
                                                    filterUpdate({ execution_date_to: dateFormat(to) });
                                                }}
                                            />
                                        </FilterItemToggle>

                                        <FilterItemToggle label={translate('transactions.labels.bulk_state')}>
                                            <SelectControl
                                                className="form-control"
                                                propKey={'key'}
                                                allowSearch={false}
                                                value={filterValues.bulk_state}
                                                options={bulkStates}
                                                onChange={(bulk_state: string) => filterUpdate({ bulk_state })}
                                            />
                                        </FilterItemToggle>
                                    </Fragment>
                                )}

                                <FilterItemToggle label={translate('transactions.labels.fund_state')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'key'}
                                        allowSearch={false}
                                        value={filterValues.fund_state}
                                        options={fundStates}
                                        onChange={(fund_state: string) => filterUpdate({ fund_state })}
                                    />
                                </FilterItemToggle>

                                <div className="form-actions">
                                    <button
                                        className="button button-primary button-wide"
                                        onClick={() => exportTransactions()}
                                        data-dusk="export"
                                        disabled={transactions.meta.total == 0}>
                                        <em className="mdi mdi-download icon-start"> </em>
                                        {translate('components.dropdown.export', {
                                            total: transactions.meta.total,
                                        })}
                                    </button>
                                </div>
                            </CardHeaderFilter>
                        )}
                        {viewType.key == 'bulks' && (
                            <CardHeaderFilter filter={bulkFilter}>
                                <FilterItemToggle label={translate('transactions.labels.amount')}>
                                    <div className="row">
                                        <div className="col col-lg-6">
                                            <input
                                                className="form-control"
                                                min={0}
                                                type="number"
                                                value={bulkFilterValues.amount_min || ''}
                                                onChange={(e) =>
                                                    bulkFilterUpdate({
                                                        amount_min: e.target.value,
                                                    })
                                                }
                                                placeholder={translate('transactions.labels.amount_min')}
                                            />
                                        </div>
                                        <div className="col col-lg-6">
                                            <input
                                                className="form-control"
                                                min={0}
                                                type="number"
                                                value={bulkFilterValues.amount_max || ''}
                                                onChange={(e) =>
                                                    bulkFilterUpdate({
                                                        amount_max: e.target.value,
                                                    })
                                                }
                                                placeholder={translate('transactions.labels.amount_max')}
                                            />
                                        </div>
                                    </div>
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('transactions.labels.quantity')}>
                                    <div className="row">
                                        <div className="col col-lg-6">
                                            <input
                                                className="form-control"
                                                min={0}
                                                type="number"
                                                value={bulkFilterValues.quantity_min || ''}
                                                onChange={(e) =>
                                                    bulkFilterUpdate({
                                                        quantity_min: e.target.value,
                                                    })
                                                }
                                                placeholder={translate('transactions.labels.quantity_min')}
                                            />
                                        </div>
                                        <div className="col col-lg-6">
                                            <input
                                                className="form-control"
                                                min={0}
                                                type="number"
                                                value={bulkFilterValues.quantity_max || ''}
                                                onChange={(e) =>
                                                    bulkFilterUpdate({
                                                        quantity_max: e.target.value,
                                                    })
                                                }
                                                placeholder={translate('transactions.labels.quantity_max')}
                                            />
                                        </div>
                                    </div>
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('transactions.labels.state')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'key'}
                                        allowSearch={false}
                                        value={bulkFilterValues.state}
                                        options={bulkStates}
                                        onChange={(state: string) => bulkFilterUpdate({ state })}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('transactions.labels.from')}>
                                    <DatePickerControl
                                        value={dateParse(bulkFilterValues.from)}
                                        placeholder={translate('jjjj-MM-dd')}
                                        onChange={(from: Date) => {
                                            bulkFilterUpdate({ from: dateFormat(from) });
                                        }}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('transactions.labels.to')}>
                                    <DatePickerControl
                                        value={dateParse(bulkFilterValues.to)}
                                        placeholder={translate('jjjj-MM-dd')}
                                        onChange={(to: Date) => {
                                            bulkFilterUpdate({ to: dateFormat(to) });
                                        }}
                                    />
                                </FilterItemToggle>

                                <div className="form-actions">
                                    <button
                                        className="button button-primary button-wide"
                                        onClick={() => exportTransactionBulks()}
                                        data-dusk="export"
                                        disabled={transactionBulks.meta.total == 0}>
                                        <em className="mdi mdi-download icon-start"> </em>
                                        {translate('components.dropdown.export', {
                                            total: transactionBulks.meta.total,
                                        })}
                                    </button>
                                </div>
                            </CardHeaderFilter>
                        )}
                    </div>
                </div>
            </div>

            {viewType.key == 'transactions' && (
                <TransactionsTableSection
                    transactions={transactions}
                    organization={activeOrganization}
                    isSponsor={isSponsor}
                    isProvider={isProvider}
                    columns={transactionService.getColumns(isSponsor, isProvider)}
                    filter={filter}
                    filterValues={filterValues}
                    filterUpdate={filterUpdate}
                    paginatorKey={paginatorTransactionsKey}
                    pendingBulkingMeta={pendingBulkingMeta}
                    canManageBulks={isSponsor && hasPermission(activeOrganization, Permission.MANAGE_TRANSACTION_BULKS)}
                    buildingBulks={buildingBulks}
                    onBulkPendingNow={bulkPendingNow}
                />
            )}

            {viewType.key === 'bulks' && (
                <TransactionBulksTableSection
                    bulks={transactionBulks}
                    organization={activeOrganization}
                    columns={transactionBulkService.getColumns()}
                    bulkFilter={bulkFilter}
                    bulkFilterValues={bulkFilterValues}
                    bulkFilterUpdate={bulkFilterUpdate}
                    paginatorKey={paginatorTransactionBulkKey}
                />
            )}
        </div>
    );
}
