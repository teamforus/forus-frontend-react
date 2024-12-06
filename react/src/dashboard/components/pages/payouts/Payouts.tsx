import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useOpenModal from '../../../hooks/useOpenModal';
import useSetProgress from '../../../hooks/useSetProgress';
import { PaginationData } from '../../../props/ApiResponses';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import CardHeaderFilter from '../../elements/tables/elements/CardHeaderFilter';
import { dateFormat, dateParse } from '../../../helpers/dates';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import ModalPayoutsEdit from '../../modals/ModalPayoutEdit';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import ModalPayoutsUpload from '../../modals/ModalPayoutsUpload';
import SelectControlOptionsFund from '../../elements/select-control/templates/SelectControlOptionsFund';
import usePayoutTransactionService from '../../../services/PayoutTransactionService';
import PayoutTransaction from '../../../props/models/PayoutTransaction';
import usePushApiError from '../../../hooks/usePushApiError';
import PayoutsTable from './elements/PayoutsTable';

export default function Payouts() {
    const openModal = useOpenModal();
    const translate = useTranslate();
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
                <div className="card-title flex flex-grow">
                    {translate('payouts.header.title')} ({transactions.meta.total})
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

            <PayoutsTable
                filter={filter}
                loading={loading}
                paginatorKey={paginatorTransactionsKey}
                transactions={transactions}
                organization={activeOrganization}
                filterValues={filterValues}
                filterUpdate={filterUpdate}
                fetchTransactions={fetchTransactions}
                fundsWithPayouts={fundsWithPayouts}
            />
        </div>
    );
}
