import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import { getStateRouteUrl, useNavigateState } from '../../../modules/state_router/Router';
import Transaction from '../../../props/models/Transaction';
import useOpenModal from '../../../hooks/useOpenModal';
import useTransactionService from '../../../services/TransactionService';
import useSetProgress from '../../../hooks/useSetProgress';
import useEnvData from '../../../hooks/useEnvData';
import useFilter from '../../../hooks/useFilter';
import useTransactionBulkService from '../../../services/TransactionBulkService';
import { PaginationData } from '../../../props/ApiResponses';
import ModalDangerZone from '../../modals/ModalDangerZone';
import { strLimit } from '../../../helpers/string';
import usePushDanger from '../../../hooks/usePushDanger';
import usePushSuccess from '../../../hooks/usePushSuccess';
import TransactionBulk from '../../../props/models/TransactionBulk';
import useTransactionExportService from '../../../services/exports/useTransactionExportService';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import Paginator from '../../../modules/paginator/components/Paginator';
import ThSortable from '../../elements/tables/ThSortable';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../services/FundService';
import useProviderFundService from '../../../services/ProviderFundService';
import Fund from '../../../props/models/Fund';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import CardHeaderFilter from '../../elements/tables/elements/CardHeaderFilter';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import TranslateHtml from '../../elements/translate-html/TranslateHtml';
import { hasPermission } from '../../../helpers/utils';
import useTransactionBulkExportService from '../../../services/exports/useTransactionBulkExportService';
import { dateFormat, dateParse } from '../../../helpers/dates';
import ModalVoucherTransactionsUpload from '../../modals/ModalVoucherTransactionsUpload';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import ClickOutside from '../../elements/click-outside/ClickOutside';

export default function Transactions() {
    const { t } = useTranslation();

    const envData = useEnvData();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();
    const paginatorService = usePaginatorService();
    const activeOrganization = useActiveOrganization();

    const transactionService = useTransactionService();
    const transactionBulkService = useTransactionBulkService();

    const fundService = useFundService();
    const providerFundsService = useProviderFundService();
    const transactionsExportService = useTransactionExportService();
    const transactionBulksExportService = useTransactionBulkExportService();

    const isSponsor = useMemo(() => envData.client_type == 'sponsor', [envData.client_type]);
    const isProvider = useMemo(() => envData.client_type == 'provider', [envData.client_type]);

    const [buildingBulks, setBuildingBulks] = useState(false);
    const [pendingBulkingMeta, setPendingBulkingMeta] = useState<{
        total_amount_locale?: string;
        total_amount?: string;
        total: number;
    }>(null);

    const [funds, setFunds] = useState(null);
    const [transactions, setTransactions] = useState<PaginationData<Transaction>>(null);
    const [transactionBulks, setTransactionBulks] = useState<PaginationData<TransactionBulk>>(null);
    const [showActionMenu, setShowActionMenu] = useState(null);

    const hasDirectPayments = useMemo(() => {
        return funds?.filter((fund: Fund) => fund.allow_direct_payments).length > 0;
    }, [funds]);

    const [viewTypes] = useState<Array<{ key: string; label: string }>>([
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
    const [paginatorTransactionsKey] = useState('transactions');
    const [paginatorTransactionBulkKey] = useState('transaction_bulks');

    const filter = useFilter(
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
            bulk_state: bulkStates[0].key,
            per_page: paginatorService.getPerPage(paginatorTransactionsKey),
            order_by: 'created_at',
            order_dir: 'desc',
        },
        ['q', 'amount_min', 'amount_max', 'quantity_min', 'quantity_max'],
    );

    const bulkFilter = useFilter(
        {
            from: null,
            to: null,
            amount_min: null,
            amount_max: null,
            quantity_min: null,
            quantity_max: null,
            state: bulkStates[0].key,
            per_page: paginatorService.getPerPage(paginatorTransactionBulkKey),
            order_by: 'created_at',
            order_dir: 'desc',
        },
        ['q', 'amount_min', 'amount_max', 'quantity_min', 'quantity_max'],
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

        transactionsExportService.exportData(activeOrganization.id, {
            ...filter.activeValues,
            per_page: null,
        });
    }, [activeOrganization.id, filter.activeValues, setShow, transactionsExportService]);

    const exportTransactionBulks = useCallback(() => {
        setShowBulk(false);

        transactionBulksExportService.exportData(activeOrganization.id, {
            ...bulkFilter.activeValues,
            per_page: null,
        });
    }, [activeOrganization.id, bulkFilter.activeValues, setShowBulk, transactionBulksExportService]);

    const updateHasPendingBulking = useCallback(() => {
        fetchTransactions({
            ...filter.activeValues,
            pending_bulking: 1,
            per_page: 1,
        }).then((res) => setPendingBulkingMeta(res.data.meta));
    }, [fetchTransactions, filter.activeValues]);

    const uploadTransactions = useCallback(() => {
        openModal((modal) => (
            <ModalVoucherTransactionsUpload
                modal={modal}
                organization={activeOrganization}
                onCreated={() => {
                    fetchTransactions(filter.activeValues).then((res) => setTransactions(res.data));
                }}
            />
        ));
    }, [activeOrganization, fetchTransactions, filter.activeValues, openModal]);

    const confirmDangerAction = useCallback(
        (title, description_text, cancelButton = 'Annuleren', confirmButton = 'Bevestigen') => {
            return new Promise((resolve) => {
                openModal((modal) => (
                    <ModalDangerZone
                        modal={modal}
                        title={title}
                        description={description_text}
                        buttonCancel={{
                            text: cancelButton,
                            onClick: () => {
                                modal.close();
                                resolve(false);
                            },
                        }}
                        buttonSubmit={{
                            text: confirmButton,
                            onClick: () => {
                                modal.close();
                                resolve(true);
                            },
                        }}
                    />
                ));
            });
        },
        [openModal],
    );

    const confirmBulkNow = useCallback(() => {
        const total = pendingBulkingMeta.total;
        const totalAmount = pendingBulkingMeta.total_amount_locale;

        return confirmDangerAction(
            'Nu een bulktransactie maken',
            [
                'U staat op het punt om een bulktransactie aan te maken. De nog niet uitbetaalde transacties worden gebundeld tot één bulktransactie.',
                `De ${total} individuele transacties hebben een totaal waarde van ${totalAmount}.`,
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
                .bulkNow(activeOrganization.id, filter.activeValues)
                .then((res) => {
                    const bulks = res.data.data;

                    if (bulks.length > 1) {
                        setViewType(viewTypes.find((viewType) => viewType.key == 'bulks'));

                        pushSuccess(
                            'Succes!',
                            `${bulks.length} bulktransactie(s) aangemaakt. Accepteer de transactie in uw mobiele app van bunq.`,
                        );
                    } else if (bulks.length == 1) {
                        navigateState('transaction-bulk', {
                            organizationId: activeOrganization.id,
                            id: bulks[0].id,
                        });

                        pushSuccess(`Succes!`, `Accepteer de transactie in uw mobiele app van bunq.`);
                    }
                })
                .catch((res) => pushDanger('Mislukt!', res.data.message || 'Er ging iets mis!'))
                .finally(() => {
                    setBuildingBulks(false);
                    updateHasPendingBulking();
                    setProgress(100);
                });
        });
    }, [
        activeOrganization.id,
        confirmBulkNow,
        filter.activeValues,
        navigateState,
        pushDanger,
        pushSuccess,
        setProgress,
        transactionBulkService,
        updateHasPendingBulking,
        viewTypes,
    ]);

    const hideActionMenu = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setShowActionMenu(null);
    }, []);

    useEffect(() => {
        if (viewType.key === 'bulks') {
            fetchTransactionBulks(bulkFilter.activeValues).then((res) => setTransactionBulks(res.data));
        } else {
            fetchTransactions(filter.activeValues).then((res) => setTransactions(res.data));

            if (isSponsor) {
                updateHasPendingBulking();
            }
        }
    }, [
        isSponsor,
        fetchTransactionBulks,
        fetchTransactions,
        bulkFilter.activeValues,
        filter.activeValues,
        viewType.key,
        updateHasPendingBulking,
    ]);

    useEffect(() => {
        fetchFunds({}).then((funds) => setFunds([{ id: null, name: 'Selecteer fond' }, ...funds]));
    }, [fetchFunds]);

    if ((viewType.key === 'transactions' && !transactions) || (viewType.key === 'bulks' && !transactionBulks)) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex-row">
                    <div className="flex-col flex-grow">
                        {viewType.key == 'transactions' ? (
                            <div className="card-title">
                                {t('transactions.header.title')} ({transactions.meta.total})
                            </div>
                        ) : (
                            <div className="card-title">
                                {t('transactions.header.titleBulks')} ({transactionBulks.meta.total})
                            </div>
                        )}
                    </div>
                    <div className="flex">
                        <div className="block block-inline-filters">
                            {hasDirectPayments && (
                                <div
                                    className="button button-primary button-sm"
                                    onClick={() => uploadTransactions()}
                                    data-dusk="uploadTransactionsBatchButton">
                                    <em className="mdi mdi-upload icon-start" />
                                    Upload bulkbestand
                                </div>
                            )}
                            {isSponsor && (
                                <div className="flex form">
                                    <div>
                                        <div className="block block-label-tabs">
                                            <div className="label-tab-set">
                                                {viewTypes?.map((viewTypeItem) => (
                                                    <div
                                                        key={viewTypeItem.key}
                                                        onClick={() => setViewType(viewTypeItem)}
                                                        className={`label-tab label-tab-sm ${
                                                            viewType.key === viewTypeItem.key ? 'active' : ''
                                                        }`}>
                                                        {viewTypeItem.label}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
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

                            {viewType.key == 'transactions' && (
                                <StateNavLink
                                    name={'transaction-settings'}
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
                                            value={filter.values.q}
                                            onChange={(e) => filter.update({ q: e.target.value })}
                                            data-dusk="searchTransaction"
                                            placeholder={t('transactions.labels.search')}
                                        />
                                    </div>
                                </div>
                            )}

                            {viewType.key == 'transactions' && (
                                <CardHeaderFilter filter={filter}>
                                    <FilterItemToggle label={t('transactions.labels.search')} show={true}>
                                        <input
                                            className="form-control"
                                            value={filter.values.q}
                                            onChange={(e) => filter.update({ q: e.target.value })}
                                            placeholder={t('transactions.labels.search')}
                                        />
                                    </FilterItemToggle>

                                    <FilterItemToggle label={t('transactions.labels.amount')}>
                                        <div className="row">
                                            <div className="col col-lg-6">
                                                <input
                                                    className="form-control"
                                                    min={0}
                                                    type="number"
                                                    value={filter.values.amount_min || ''}
                                                    onChange={(e) =>
                                                        filter.update({
                                                            amount_min: e.target.value,
                                                        })
                                                    }
                                                    placeholder={t('transactions.labels.amount_min')}
                                                />
                                            </div>
                                            <div className="col col-lg-6">
                                                <input
                                                    className="form-control"
                                                    min={0}
                                                    type="number"
                                                    value={filter.values.amount_max || ''}
                                                    onChange={(e) =>
                                                        filter.update({
                                                            amount_max: e.target.value,
                                                        })
                                                    }
                                                    placeholder={t('transactions.labels.amount_max')}
                                                />
                                            </div>
                                        </div>
                                    </FilterItemToggle>

                                    <FilterItemToggle label={t('transactions.labels.state')}>
                                        <SelectControl
                                            className="form-control"
                                            propKey={'key'}
                                            allowSearch={false}
                                            value={filter.values.state}
                                            options={states}
                                            optionsComponent={SelectControlOptions}
                                            onChange={(state: string) => filter.update({ state })}
                                        />
                                    </FilterItemToggle>

                                    <FilterItemToggle label={t('transactions.labels.fund')}>
                                        {funds && (
                                            <SelectControl
                                                className="form-control"
                                                propKey={'id'}
                                                allowSearch={false}
                                                options={funds}
                                                optionsComponent={SelectControlOptions}
                                                onChange={(fund_id: number) => filter.update({ fund_id })}
                                            />
                                        )}
                                    </FilterItemToggle>

                                    <FilterItemToggle label={t('transactions.labels.from')}>
                                        <DatePickerControl
                                            value={dateParse(filter.values.from)}
                                            placeholder={t('jjjj-MM-dd')}
                                            onChange={(from: Date) => {
                                                filter.update({ from: dateFormat(from) });
                                            }}
                                        />
                                    </FilterItemToggle>

                                    <FilterItemToggle label={t('transactions.labels.to')}>
                                        <DatePickerControl
                                            value={dateParse(filter.values.to)}
                                            placeholder={t('jjjj-MM-dd')}
                                            onChange={(to: Date) => {
                                                filter.update({ to: dateFormat(to) });
                                            }}
                                        />
                                    </FilterItemToggle>

                                    <FilterItemToggle label={t('transactions.labels.transfer_in')}>
                                        <div className="row">
                                            <div className="col col-lg-6">
                                                <input
                                                    className="form-control"
                                                    min={0}
                                                    type="number"
                                                    value={filter.values.transfer_in_min || ''}
                                                    onChange={(e) =>
                                                        filter.update({
                                                            transfer_in_min: e.target.value,
                                                        })
                                                    }
                                                    placeholder={t('transactions.labels.transfer_in_min')}
                                                />
                                            </div>
                                            <div className="col col-lg-6">
                                                <input
                                                    className="form-control"
                                                    min={0}
                                                    type="number"
                                                    value={filter.values.transfer_in_max || ''}
                                                    onChange={(e) =>
                                                        filter.update({
                                                            transfer_in_max: e.target.value,
                                                        })
                                                    }
                                                    placeholder={t('transactions.labels.transfer_in_max')}
                                                />
                                            </div>
                                        </div>
                                    </FilterItemToggle>

                                    {isSponsor && (
                                        <Fragment>
                                            <FilterItemToggle label={t('transactions.labels.non_cancelable_from')}>
                                                <DatePickerControl
                                                    value={dateParse(filter.values.non_cancelable_from)}
                                                    placeholder={t('jjjj-MM-dd')}
                                                    onChange={(from: Date) => {
                                                        filter.update({ non_cancelable_from: dateFormat(from) });
                                                    }}
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle label={t('transactions.labels.non_cancelable_to')}>
                                                <DatePickerControl
                                                    value={dateParse(filter.values.non_cancelable_to)}
                                                    placeholder={t('jjjj-MM-dd')}
                                                    onChange={(to: Date) => {
                                                        filter.update({ non_cancelable_to: dateFormat(to) });
                                                    }}
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle label={t('transactions.labels.bulk_state')}>
                                                <SelectControl
                                                    className="form-control"
                                                    propKey={'key'}
                                                    allowSearch={false}
                                                    value={filter.values.bulk_state}
                                                    options={bulkStates}
                                                    optionsComponent={SelectControlOptions}
                                                    onChange={(bulk_state: string) => filter.update({ bulk_state })}
                                                />
                                            </FilterItemToggle>
                                        </Fragment>
                                    )}

                                    <FilterItemToggle label={t('transactions.labels.fund_state')}>
                                        <SelectControl
                                            className="form-control"
                                            propKey={'key'}
                                            allowSearch={false}
                                            value={filter.values.fund_state}
                                            options={fundStates}
                                            optionsComponent={SelectControlOptions}
                                            onChange={(fund_state: string) => filter.update({ fund_state })}
                                        />
                                    </FilterItemToggle>

                                    <div className="form-actions">
                                        <button
                                            className="button button-primary button-wide"
                                            onClick={() => exportTransactions()}
                                            disabled={transactions.meta.total == 0}>
                                            <em className="mdi mdi-download icon-start"> </em>
                                            {t('components.dropdown.export', {
                                                total: transactions.meta.total,
                                            })}
                                        </button>
                                    </div>
                                </CardHeaderFilter>
                            )}
                            {viewType.key == 'bulks' && (
                                <CardHeaderFilter filter={bulkFilter}>
                                    <FilterItemToggle label={t('transactions.labels.amount')}>
                                        <div className="row">
                                            <div className="col col-lg-6">
                                                <input
                                                    className="form-control"
                                                    min={0}
                                                    type="number"
                                                    value={bulkFilter.values.amount_min || ''}
                                                    onChange={(e) =>
                                                        bulkFilter.update({
                                                            amount_min: e.target.value,
                                                        })
                                                    }
                                                    placeholder={t('transactions.labels.amount_min')}
                                                />
                                            </div>
                                            <div className="col col-lg-6">
                                                <input
                                                    className="form-control"
                                                    min={0}
                                                    type="number"
                                                    value={bulkFilter.values.amount_max || ''}
                                                    onChange={(e) =>
                                                        bulkFilter.update({
                                                            amount_max: e.target.value,
                                                        })
                                                    }
                                                    placeholder={t('transactions.labels.amount_max')}
                                                />
                                            </div>
                                        </div>
                                    </FilterItemToggle>

                                    <FilterItemToggle label={t('transactions.labels.quantity')}>
                                        <div className="row">
                                            <div className="col col-lg-6">
                                                <input
                                                    className="form-control"
                                                    min={0}
                                                    type="number"
                                                    value={bulkFilter.values.quantity_min || ''}
                                                    onChange={(e) =>
                                                        bulkFilter.update({
                                                            quantity_min: e.target.value,
                                                        })
                                                    }
                                                    placeholder={t('transactions.labels.quantity_min')}
                                                />
                                            </div>
                                            <div className="col col-lg-6">
                                                <input
                                                    className="form-control"
                                                    min={0}
                                                    type="number"
                                                    value={bulkFilter.values.quantity_max || ''}
                                                    onChange={(e) =>
                                                        bulkFilter.update({
                                                            quantity_max: e.target.value,
                                                        })
                                                    }
                                                    placeholder={t('transactions.labels.quantity_max')}
                                                />
                                            </div>
                                        </div>
                                    </FilterItemToggle>

                                    <FilterItemToggle label={t('transactions.labels.state')}>
                                        <SelectControl
                                            className="form-control"
                                            propKey={'key'}
                                            allowSearch={false}
                                            value={bulkFilter.values.state}
                                            options={bulkStates}
                                            optionsComponent={SelectControlOptions}
                                            onChange={(state: string) => bulkFilter.update({ state })}
                                        />
                                    </FilterItemToggle>

                                    <FilterItemToggle label={t('transactions.labels.from')}>
                                        <DatePickerControl
                                            value={dateParse(bulkFilter.values.from)}
                                            placeholder={t('jjjj-MM-dd')}
                                            onChange={(from: Date) => {
                                                bulkFilter.update({ from: dateFormat(from) });
                                            }}
                                        />
                                    </FilterItemToggle>

                                    <FilterItemToggle label={t('transactions.labels.to')}>
                                        <DatePickerControl
                                            value={dateParse(bulkFilter.values.to)}
                                            placeholder={t('jjjj-MM-dd')}
                                            onChange={(to: Date) => {
                                                bulkFilter.update({ to: dateFormat(to) });
                                            }}
                                        />
                                    </FilterItemToggle>

                                    <div className="form-actions">
                                        <button
                                            className="button button-primary button-wide"
                                            onClick={() => exportTransactionBulks()}
                                            disabled={transactionBulks.meta.total == 0}>
                                            <em className="mdi mdi-download icon-start"> </em>
                                            {t('components.dropdown.export', {
                                                total: transactionBulks.meta.total,
                                            })}
                                        </button>
                                    </div>
                                </CardHeaderFilter>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {viewType.key == 'transactions' && transactions.meta.total > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <div className="table-container table-container-2">
                                <div className="table-scroll">
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <ThSortable label={'ID'} value={'id'} filter={filter} />
                                                {isSponsor && (
                                                    <ThSortable label={'UID'} value={'uid'} filter={filter} />
                                                )}
                                                <ThSortable
                                                    label={t('transactions.labels.price')}
                                                    value={'amount'}
                                                    filter={filter}
                                                />
                                                {isProvider && (
                                                    <ThSortable
                                                        className={'nowrap'}
                                                        label={t('transactions.labels.method')}
                                                        filter={filter}
                                                    />
                                                )}
                                                {isProvider && (
                                                    <ThSortable
                                                        className={'nowrap'}
                                                        label={t('transactions.labels.branch_name')}
                                                        filter={filter}
                                                    />
                                                )}
                                                {isProvider && (
                                                    <ThSortable
                                                        className={'nowrap'}
                                                        label={t('transactions.labels.branch_number')}
                                                        filter={filter}
                                                    />
                                                )}
                                                {isProvider && (
                                                    <ThSortable
                                                        className={'nowrap'}
                                                        label={t('transactions.labels.amount_extra')}
                                                        filter={filter}
                                                    />
                                                )}
                                                <ThSortable
                                                    label={t('transactions.labels.date')}
                                                    value={'created_at'}
                                                    filter={filter}
                                                />
                                                <ThSortable
                                                    label={t('transactions.labels.fund')}
                                                    value={'fund_name'}
                                                    filter={filter}
                                                />
                                                <ThSortable
                                                    label={t('transactions.labels.product_name')}
                                                    value={'product_name'}
                                                    filter={filter}
                                                />
                                                {isSponsor && (
                                                    <ThSortable
                                                        label={t('transactions.labels.provider')}
                                                        value={'provider_name'}
                                                        filter={filter}
                                                    />
                                                )}
                                                {isSponsor && (
                                                    <ThSortable
                                                        className="nowrap"
                                                        label={t('transactions.labels.date_non_cancelable')}
                                                        value={'date_non_cancelable'}
                                                        filter={filter}
                                                    />
                                                )}
                                                {isSponsor && (
                                                    <ThSortable
                                                        label={t('transactions.labels.bulk')}
                                                        value={'transaction_in'}
                                                        filter={filter}
                                                    />
                                                )}
                                                {isSponsor && (
                                                    <ThSortable
                                                        label={t('transactions.labels.bulk_state')}
                                                        value={'bulk_state'}
                                                        filter={filter}
                                                    />
                                                )}
                                                <ThSortable
                                                    label={t('transactions.labels.status')}
                                                    value={'state'}
                                                    filter={filter}
                                                />

                                                <ThSortable label="" />
                                            </tr>
                                            {transactions.data.map((transaction) => (
                                                <tr key={transaction.id} data-dusk="transactionItem">
                                                    <td>{transaction.id}</td>

                                                    {isSponsor && (
                                                        <td title={transaction.uid || '-'}>
                                                            {strLimit(transaction.uid || '-', 32)}
                                                        </td>
                                                    )}
                                                    <td>
                                                        <StateNavLink
                                                            name={'transaction'}
                                                            params={{
                                                                organizationId: activeOrganization.id,
                                                                address: transaction.address,
                                                            }}
                                                            className="text-primary-light">
                                                            {transaction.amount_locale}
                                                        </StateNavLink>
                                                    </td>
                                                    {isProvider && (
                                                        <td>
                                                            {transaction?.reservation?.amount_extra > 0
                                                                ? 'iDeal + Tegoed'
                                                                : 'Tegoed'}
                                                        </td>
                                                    )}
                                                    {isProvider && (
                                                        <td>
                                                            {transaction?.branch_name && (
                                                                <div className="text-primary">
                                                                    {transaction?.branch_name}
                                                                </div>
                                                            )}

                                                            {transaction?.branch_id && (
                                                                <div>
                                                                    ID <strong>{transaction?.branch_id}</strong>
                                                                </div>
                                                            )}

                                                            {!transaction.branch_id && !transaction.branch_name && (
                                                                <div className={'text-muted'}>Geen...</div>
                                                            )}
                                                        </td>
                                                    )}
                                                    {isProvider && (
                                                        <td>
                                                            <div
                                                                className={
                                                                    transaction?.branch_number ? '' : 'text-muted'
                                                                }>
                                                                {strLimit(transaction.branch_number?.toString(), 32) ||
                                                                    'Geen...'}
                                                            </div>
                                                        </td>
                                                    )}
                                                    {isProvider && (
                                                        <td>
                                                            {transaction?.reservation?.amount_extra > 0
                                                                ? transaction?.reservation?.amount_extra_locale
                                                                : '-'}
                                                        </td>
                                                    )}
                                                    <td>
                                                        <div className={'text-medium text-primary'}>
                                                            {transaction.created_at_locale.split(' - ')[0]}
                                                        </div>
                                                        <div className={'text-strong text-md text-muted-dark'}>
                                                            {transaction.created_at_locale.split(' - ')[1]}
                                                        </div>
                                                    </td>
                                                    <td title={transaction.fund.name || ''}>
                                                        {strLimit(transaction.fund.name, 25)}
                                                    </td>
                                                    <td title={transaction.product?.name || '-'}>
                                                        {strLimit(transaction.product?.name || '-', 25)}
                                                    </td>
                                                    {isSponsor && (
                                                        <td
                                                            title={transaction.organization?.name || '-'}
                                                            className={transaction?.organization ? '' : 'text-muted'}>
                                                            {strLimit(transaction.organization?.name || '-', 25)}
                                                        </td>
                                                    )}

                                                    {isSponsor && (
                                                        <Fragment>
                                                            {transaction.non_cancelable_at_locale ? (
                                                                <td>
                                                                    <div className={'text-medium text-primary'}>
                                                                        {transaction.non_cancelable_at_locale}
                                                                    </div>
                                                                </td>
                                                            ) : (
                                                                <td>-</td>
                                                            )}
                                                        </Fragment>
                                                    )}

                                                    {isSponsor && transaction.voucher_transaction_bulk_id && (
                                                        <td>
                                                            <StateNavLink
                                                                name={'transaction-bulk'}
                                                                params={{
                                                                    organizationId: activeOrganization.id,
                                                                    id: transaction.voucher_transaction_bulk_id,
                                                                }}
                                                                className="text-primary-light">
                                                                {'#' + transaction.voucher_transaction_bulk_id}
                                                            </StateNavLink>
                                                        </td>
                                                    )}
                                                    {isSponsor && !transaction.voucher_transaction_bulk_id && (
                                                        <td>
                                                            {transaction.transaction_in > 0 &&
                                                            transaction.state == 'pending' &&
                                                            transaction.attempts < 3 ? (
                                                                <div>
                                                                    <div>In afwachting</div>
                                                                    <div className="text-sm text-muted-dark">
                                                                        <em className="mdi mdi-clock-outline"> </em>
                                                                        {transaction.transaction_in} dagen resterend
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span>-</span>
                                                            )}
                                                        </td>
                                                    )}
                                                    {isSponsor && (
                                                        <td data-dusk="transactionState">
                                                            {(transaction.bulk_state == 'rejected' ||
                                                                transaction.bulk_state == 'error') && (
                                                                <div className="label label-danger">
                                                                    {transaction.bulk_state_locale}
                                                                </div>
                                                            )}

                                                            {(transaction.bulk_state == 'draft' ||
                                                                transaction.bulk_state == 'pending') && (
                                                                <div className="label label-default">
                                                                    {transaction.bulk_state_locale}
                                                                </div>
                                                            )}

                                                            {transaction.bulk_state == 'accepted' && (
                                                                <div className="label label-success">
                                                                    {transaction.bulk_state_locale}
                                                                </div>
                                                            )}
                                                        </td>
                                                    )}
                                                    <td data-dusk="transactionState">
                                                        <div
                                                            className={`label ${
                                                                transaction.state == 'success'
                                                                    ? 'label-success'
                                                                    : 'label-default'
                                                            }`}>
                                                            {transaction.state_locale}
                                                        </div>
                                                    </td>
                                                    <td />
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="table-scroll-actions">
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <th />
                                            </tr>
                                            {transactions.data.map((transaction) => (
                                                <tr key={transaction.id}>
                                                    <td>
                                                        <div
                                                            className={`actions ${
                                                                showActionMenu === transaction.id ? 'active' : ''
                                                            }`}>
                                                            <button
                                                                className="button button-text button-menu"
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setShowActionMenu(transaction.id);
                                                                }}>
                                                                <em className="mdi mdi-dots-horizontal" />

                                                                {showActionMenu === transaction.id && (
                                                                    <ClickOutside onClickOutside={hideActionMenu}>
                                                                        <div className="menu-dropdown">
                                                                            <div className="menu-dropdown-arrow" />
                                                                            <div className="dropdown dropdown-actions">
                                                                                <StateNavLink
                                                                                    name={'transaction'}
                                                                                    className="dropdown-item"
                                                                                    params={{
                                                                                        organizationId:
                                                                                            activeOrganization.id,
                                                                                        address: transaction.address,
                                                                                    }}>
                                                                                    <em className="mdi mdi-eye icon-start" />{' '}
                                                                                    Bekijken
                                                                                </StateNavLink>
                                                                            </div>
                                                                        </div>
                                                                    </ClickOutside>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!isSponsor && transactions.meta?.total > 0 && viewType.key == 'transactions' && (
                <div className="card-section">
                    <div className="flex flex-horizontal">
                        <div className="flex flex-grow">
                            <div className="flex flex-vertical flex-center">
                                <TranslateHtml
                                    i18n={'transactions.labels.total_amount'}
                                    values={{ total_amount: transactions.meta.total_amount_locale }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isSponsor &&
                pendingBulkingMeta?.total > 0 &&
                hasPermission(activeOrganization, 'manage_transaction_bulks') && (
                    <div className="card-section" hidden={viewType.key !== 'transactions'}>
                        <div className="flex flex-vertical">
                            <div className="card-text">
                                <TranslateHtml
                                    i18n={'transactions.labels.bulk_total_amount'}
                                    values={{
                                        total: pendingBulkingMeta.total,
                                        total_amount: pendingBulkingMeta.total_amount_locale,
                                    }}
                                />
                            </div>
                            <button
                                className="button button-primary"
                                onClick={() => bulkPendingNow()}
                                disabled={buildingBulks}>
                                {buildingBulks ? (
                                    <em className="mdi mdi-spin mdi-loading icon-start" />
                                ) : (
                                    <em className="mdi mdi-cube-send icon-start" />
                                )}
                                Maak nu een bulktransactie
                            </button>
                        </div>
                    </div>
                )}

            {viewType.key == 'transactions' && transactions.meta.total == 0 && (
                <div className="card-section">
                    <div className="block block-empty text-center">
                        <div className="empty-title">Geen transacties gevonden</div>
                    </div>
                </div>
            )}

            {viewType.key == 'transactions' && transactions?.meta && (
                <div className="card-section">
                    <Paginator
                        meta={transactions.meta}
                        filters={filter.values}
                        updateFilters={filter.update}
                        perPageKey={paginatorTransactionsKey}
                    />
                </div>
            )}

            {viewType.key == 'bulks' && transactionBulks.meta.total > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <ThSortable label={'ID'} value={'id'} filter={bulkFilter} />
                                        <ThSortable label={'Bedrag'} value={'amount'} filter={bulkFilter} />
                                        <ThSortable label={'Datum'} value={'created_at'} filter={bulkFilter} />
                                        <ThSortable
                                            label={'Aantal'}
                                            value={'voucher_transactions_count'}
                                            filter={bulkFilter}
                                        />
                                        <ThSortable label={'Status'} value={'state'} filter={bulkFilter} />
                                        <ThSortable label={'Acties'} className="th-narrow text-right" />
                                    </tr>

                                    {transactionBulks.data?.map((transactionBulk) => (
                                        <tr key={transactionBulk.id}>
                                            <td>{transactionBulk.id}</td>
                                            <td className="text-primary-light">
                                                {transactionBulk.voucher_transactions_amount_locale}
                                            </td>
                                            <td>
                                                <div className="text-medium text-primary">
                                                    {transactionBulk.created_at_locale.split(' - ')[0]}
                                                </div>
                                                <div className="text-strong text-md text-muted-dark">
                                                    {transactionBulk.created_at_locale.split(' - ')[1]}
                                                </div>
                                            </td>
                                            <td>{transactionBulk.voucher_transactions_count}</td>
                                            <td>
                                                {transactionBulk.state === 'rejected' && (
                                                    <div className="label label-danger">
                                                        {transactionBulk.state_locale}
                                                    </div>
                                                )}
                                                {transactionBulk.state === 'error' && (
                                                    <div className="label label-danger">
                                                        {transactionBulk.state_locale}
                                                    </div>
                                                )}

                                                {transactionBulk.state === 'draft' && (
                                                    <div className="label label-default">
                                                        {transactionBulk.state_locale}
                                                    </div>
                                                )}

                                                {transactionBulk.state === 'accepted' && (
                                                    <div className="label label-success">
                                                        {transactionBulk.state_locale}
                                                    </div>
                                                )}

                                                {transactionBulk.state === 'pending' && (
                                                    <div className="label label-default">
                                                        {transactionBulk.state_locale}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="td-narrow text-right">
                                                <StateNavLink
                                                    name={'transaction-bulk'}
                                                    className="button button-sm button-primary button-icon pull-right"
                                                    params={{
                                                        organizationId: activeOrganization.id,
                                                        id: transactionBulk.id,
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

            {viewType.key === 'bulks' && transactionBulks.meta.total == 0 && (
                <EmptyCard
                    title={'Geen bulktransacties gevonden'}
                    description={[
                        'Bulktransacties worden dagelijks om 09:00 gegereneerd en bevatten alle nog niet uitbetaalde transacties uit de wachtrij.',
                        'Momenteel zijn er geen bulk transacties beschikbaar.',
                    ].join('\n')}
                    button={{
                        text: 'Vestiging toevoegen',
                        to: getStateRouteUrl('transactions-create', { organizationId: activeOrganization.id }),
                    }}
                />
            )}

            {transactionBulks && viewType.key == 'bulks' && transactionBulks?.meta && (
                <div className="card-section">
                    <Paginator
                        meta={transactionBulks.meta}
                        filters={bulkFilter.values}
                        updateFilters={bulkFilter.update}
                        perPageKey={paginatorTransactionBulkKey}
                    />
                </div>
            )}
        </div>
    );
}
