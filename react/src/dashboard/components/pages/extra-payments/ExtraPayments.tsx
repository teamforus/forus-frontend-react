import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import useSetProgress from '../../../hooks/useSetProgress';
import useExtraPaymentService from '../../../services/ExtraPaymentService';
import ExtraPayment from '../../../props/models/ExtraPayment';
import { PaginationData } from '../../../props/ApiResponses';
import { strLimit } from '../../../helpers/string';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../elements/select-control/SelectControl';
import CardHeaderFilter from '../../elements/tables/elements/CardHeaderFilter';
import Fund from '../../../props/models/Fund';
import { useFundService } from '../../../services/FundService';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import SelectControlOptionsFund from '../../elements/select-control/templates/SelectControlOptionsFund';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { NumberParam, StringParam } from 'use-query-params';
import LoadingCard from '../../elements/loading-card/LoadingCard';

export default function ExtraPayments() {
    const activeOrganization = useActiveOrganization();

    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError(DashboardRoutes.ORGANIZATION_NO_PERMISSIONS);

    const fundService = useFundService();
    const paginatorService = usePaginatorService();
    const extraPaymentService = useExtraPaymentService();

    const [loading, setLoading] = useState(false);
    const [paginatorKey] = useState('extra_payments');

    const [funds, setFunds] = useState(null);
    const [extraPayments, setExtraPayments] = useState<PaginationData<ExtraPayment>>(null);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q: string;
        fund_id?: number;
        per_page?: number;
        page?: number;
        order_by?: string;
        order_dir?: string;
    }>(
        {
            q: '',
            fund_id: null,
            per_page: paginatorService.getPerPage(paginatorKey),
            order_by: 'paid_at',
            order_dir: 'desc',
        },
        {
            queryParams: {
                q: StringParam,
                fund_id: NumberParam,
                per_page: NumberParam,
                page: NumberParam,
                order_by: StringParam,
                order_dir: StringParam,
            },
        },
    );

    const fetchExtraPayments = useCallback(() => {
        setProgress(0);
        setLoading(true);

        extraPaymentService
            .list(activeOrganization.id, filterValuesActive)
            .then((res) => setExtraPayments(res.data))
            .catch(pushApiError)
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [extraPaymentService, activeOrganization.id, setProgress, filterValuesActive, pushApiError]);

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
                    {translate('extra_payments.header.title')} ({extraPayments?.meta?.total})
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
                                            value={filterValues.fund_id}
                                            placeholder={translate('vouchers.labels.fund')}
                                            allowSearch={false}
                                            onChange={(fund_id: number) => filterUpdate({ fund_id })}
                                            optionsComponent={SelectControlOptionsFund}
                                        />
                                    </div>
                                </div>
                                <div className="form">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={filterValues.q}
                                            onChange={(e) => filterUpdate({ q: e.target.value })}
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
                                    value={filterValues.q}
                                    onChange={(e) => filterUpdate({ q: e.target.value })}
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
                                    value={filterValues.fund_id}
                                    onChange={(fund_id: number) => filterUpdate({ fund_id })}
                                />
                            </FilterItemToggle>
                        </CardHeaderFilter>
                    </div>
                </div>
            </div>

            <LoaderTableCard
                loading={loading}
                empty={extraPayments?.meta?.total === 0}
                emptyTitle="Geen extra payments gevonden"
                columns={extraPaymentService.getColumns()}
                tableOptions={{ sortable: true, filter }}
                paginator={{ key: paginatorKey, data: extraPayments, filterValues, filterUpdate }}>
                {extraPayments?.data?.map((extraPayment) => (
                    <tr key={extraPayment.id} data-dusk="extraPaymentItem">
                        <td>{extraPayment.id}</td>
                        <td>{extraPayment.reservation.price_locale}</td>
                        <td>{extraPayment.amount_locale}</td>
                        <td>{extraPayment.method}</td>
                        <td>
                            <strong className="text-primary">{extraPayment.paid_at_locale.split(' - ')[0]}</strong>
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
                            {strLimit(extraPayment.reservation.product?.organization?.name || '-', 25)}
                        </td>
                        <td className="td-narrow text-right">
                            <StateNavLink
                                name={DashboardRoutes.EXTRA_PAYMENT}
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
            </LoaderTableCard>
        </div>
    );
}
