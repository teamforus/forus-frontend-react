import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useSetProgress from '../../../hooks/useSetProgress';
import useExtraPaymentService from '../../../services/ExtraPaymentService';
import ExtraPayment from '../../../props/models/ExtraPayment';
import { PaginationData } from '../../../props/ApiResponses';
import useFilter from '../../../hooks/useFilter';
import { strLimit } from '../../../helpers/string';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Paginator from '../../../modules/paginator/components/Paginator';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../elements/select-control/SelectControl';
import CardHeaderFilter from '../../elements/tables/elements/CardHeaderFilter';
import Fund from '../../../props/models/Fund';
import { useFundService } from '../../../services/FundService';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import SelectControlOptionsFund from '../../elements/select-control/templates/SelectControlOptionsFund';

export default function ExtraPayments() {
    const activeOrganization = useActiveOrganization();

    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError('organization-no-permissions');

    const fundService = useFundService();
    const paginatorService = usePaginatorService();
    const extraPaymentService = useExtraPaymentService();

    const [loading, setLoading] = useState(false);
    const [paginatorKey] = useState('extra_payments');

    const [funds, setFunds] = useState(null);
    const [extraPayments, setExtraPayments] = useState<PaginationData<ExtraPayment>>(null);

    const filter = useFilter({
        q: '',
        fund_id: null,
        per_page: paginatorService.getPerPage(paginatorKey),
        order_by: 'paid_at',
        order_dir: 'desc',
    });

    const { headElement, configsElement } = useConfigurableTable(extraPaymentService.getColumns(), {
        sortable: true,
        filter: filter,
    });

    const fetchExtraPayments = useCallback(() => {
        setProgress(0);
        setLoading(true);

        extraPaymentService
            .list(activeOrganization.id, filter.activeValues)
            .then((res) => setExtraPayments(res.data))
            .catch(pushApiError)
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [extraPaymentService, activeOrganization.id, setProgress, filter?.activeValues, pushApiError]);

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

    useEffect(() => {
        fetchExtraPayments();
    }, [fetchExtraPayments]);

    useEffect(() => {
        fetchFunds({}).then((funds) => setFunds([{ id: null, name: 'Selecteer fonds' }, ...funds]));
    }, [fetchFunds]);

    if (!extraPayments) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {translate('extra_payments.header.title')} ({extraPayments.meta.total})
                </div>

                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        {filter.show && (
                            <button
                                className="button button-text"
                                onClick={() => {
                                    filter.resetFilters();
                                    filter.setShow(false);
                                }}>
                                <em className="mdi mdi-close icon-start" />
                                {translate('extra_payments.buttons.clear_filter')}
                            </button>
                        )}

                        {!filter.show && (
                            <Fragment>
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
                                <div className="form">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={filter.values.q}
                                            onChange={(e) => filter.update({ q: e.target.value })}
                                            placeholder={translate('extra_payments.labels.search')}
                                        />
                                    </div>
                                </div>
                            </Fragment>
                        )}

                        <CardHeaderFilter filter={filter}>
                            <FilterItemToggle show={true} label={translate('extra_payments.labels.search')}>
                                <input
                                    type="text"
                                    value={filter.values?.q}
                                    onChange={(e) => filter.update({ q: e.target.value })}
                                    placeholder={translate('extra_payments.labels.search')}
                                    className="form-control"
                                />
                            </FilterItemToggle>
                            <FilterItemToggle label={translate('extra_payments.labels.fund')}>
                                <SelectControl
                                    className={'form-control'}
                                    options={funds}
                                    propKey={'id'}
                                    allowSearch={false}
                                    onChange={(fund_id: string) => filter.update({ fund_id })}
                                />
                            </FilterItemToggle>
                        </CardHeaderFilter>
                    </div>
                </div>
            </div>

            {!loading && extraPayments?.meta.total > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {extraPayments?.data.map((extraPayment) => (
                                        <tr key={extraPayment.id} data-dusk="extraPaymentItem">
                                            <td>{extraPayment.id}</td>
                                            <td>{extraPayment.reservation.price_locale}</td>
                                            <td>{extraPayment.amount_locale}</td>
                                            <td>{extraPayment.method}</td>
                                            <td>
                                                <strong className="text-primary">
                                                    {extraPayment.paid_at_locale.split(' - ')[0]}
                                                </strong>
                                                <br />
                                                <strong className="text-strong text-md text-muted-dark">
                                                    {extraPayment.paid_at_locale.split(' - ')[1]}
                                                </strong>
                                            </td>
                                            <td title={extraPayment.reservation.fund.name || ''}>
                                                {strLimit(extraPayment.reservation.fund.name, 25)}
                                            </td>
                                            <td title={extraPayment.reservation.product?.name || '-'}>
                                                {strLimit(extraPayment.reservation.product?.name || '-', 25)}
                                            </td>
                                            <td title={extraPayment.reservation.product?.organization?.name || '-'}>
                                                {strLimit(
                                                    extraPayment.reservation.product?.organization?.name || '-',
                                                    25,
                                                )}
                                            </td>
                                            <td className="td-narrow text-right">
                                                <StateNavLink
                                                    name="extra-payments-show"
                                                    params={{
                                                        organizationId: activeOrganization.id,
                                                        id: extraPayment.id,
                                                    }}
                                                    className="button button-sm button-primary button-icon pull-right">
                                                    <em className="mdi mdi-eye-outline icon-start" />
                                                </StateNavLink>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>
            )}

            {!loading && extraPayments.meta.total === 0 && (
                <EmptyCard type="card-section" title="Geen extra payments gevonden" />
            )}

            {!loading && extraPayments?.meta && (
                <div className="card-section">
                    <Paginator
                        meta={extraPayments.meta}
                        filters={filter.values}
                        updateFilters={filter.update}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </div>
    );
}
