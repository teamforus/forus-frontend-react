import React, { useCallback, useEffect, useMemo, useState } from 'react';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { PaginationData } from '../../../props/ApiResponses';
import Voucher from '../../../props/models/Voucher';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import Paginator from '../../../modules/paginator/components/Paginator';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import useVoucherService from '../../../services/VoucherService';
import useSetProgress from '../../../hooks/useSetProgress';
import useTranslate from '../../../hooks/useTranslate';
import VouchersTableNoFundsBlock from './elements/VouchersTableNoFundsBlock';
import useVoucherTableOptions from './hooks/useVoucherTableOptions';
import { VouchersTableFiltersProps } from './elements/VouchersTableFilters';
import VouchersTableHeader from './elements/VouchersTableHeader';
import VouchersTableRow from './elements/VouchersTableRow';
import useConfigurableTable from './hooks/useConfigurableTable';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { BooleanParam, createEnumParam, NumberParam, StringParam } from 'use-query-params';
import TableTopScroller from '../../elements/tables/TableTopScroller';

export default function Vouchers() {
    const activeOrganization = useActiveOrganization();

    const translate = useTranslate();
    const setProgress = useSetProgress();

    const voucherService = useVoucherService();
    const paginatorService = usePaginatorService();

    const [loading, setLoading] = useState<boolean>(true);
    const [vouchers, setVouchers] = useState<PaginationData<Voucher>>(null);
    const [paginatorKey] = useState<string>('vouchers');
    const [shownVoucherMenuId, setShownVoucherMenuId] = useState<number>(null);

    const { funds } = useVoucherTableOptions(activeOrganization);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<VouchersTableFiltersProps>(
        {
            q: '',
            granted: null,
            amount_min: null,
            amount_max: null,
            amount_available_min: null,
            amount_available_max: null,
            date_type: 'created_at',
            from: null,
            to: null,
            state: null,
            in_use: null,
            has_payouts: null,
            count_per_identity_min: null,
            count_per_identity_max: null,
            type: 'all',
            source: 'all',
            fund_id: null,
            implementation_id: null,
            sort_by: 'created_at',
            sort_order: 'desc',
            page: 1,
            per_page: paginatorService.getPerPage(paginatorKey, 10),
        },
        {
            queryParams: {
                q: StringParam,
                granted: BooleanParam,
                amount_min: NumberParam,
                amount_max: NumberParam,
                amount_available_min: NumberParam,
                amount_available_max: NumberParam,
                date_type: createEnumParam(['created_at', 'used_at']),
                from: StringParam,
                to: StringParam,
                state: createEnumParam(['pending', 'active', 'deactivated', 'expired']),
                in_use: BooleanParam,
                has_payouts: BooleanParam,
                count_per_identity_min: NumberParam,
                count_per_identity_max: NumberParam,
                type: StringParam,
                source: createEnumParam(['all', 'user', 'employee']),
                fund_id: NumberParam,
                implementation_id: NumberParam,
                sort_by: StringParam,
                sort_order: StringParam,
                per_page: NumberParam,
                page: NumberParam,
            },
            queryParamsRemoveDefault: true,
            throttledValues: [
                'q',
                'amount_min',
                'amount_max',
                'amount_available_min',
                'amount_available_max',
                'count_per_identity_min',
                'count_per_identity_max',
            ],
        },
    );

    const columns = useMemo(() => {
        return voucherService.getColumns();
    }, [voucherService]);

    const {
        configsElement,
        showTableTooltip,
        hideTableTooltip,
        tableConfigCategory,
        showTableConfig,
        displayTableConfig,
    } = useConfigurableTable(voucherService.getColumns());

    const fetchVouchers = useCallback(() => {
        setProgress(0);
        setLoading(true);

        const values = filterValuesActive;

        voucherService
            .index(activeOrganization.id, {
                ...values,
                date_type: null,
                in_use: values.in_use == null ? null : values.in_use ? 1 : 0,
                granted: values.granted == null ? null : values.granted ? 1 : 0,
                has_payouts: values.has_payouts == null ? null : values.has_payouts ? 1 : 0,
                from: values.date_type === 'created_at' ? values.from : null,
                to: values.date_type === 'created_at' ? values.to : null,
                in_use_from: values.date_type === 'used_at' ? values.from : null,
                in_use_to: values.date_type === 'used_at' ? values.to : null,
            })
            .then((res) => setVouchers(res.data))
            .finally(() => {
                setProgress(100);
                setLoading(false);
            });
    }, [activeOrganization.id, filterValuesActive, setProgress, voucherService]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    if (!vouchers) {
        return <LoadingCard />;
    }

    if (funds?.length === 0) {
        return <VouchersTableNoFundsBlock organization={activeOrganization} />;
    }

    return (
        <div className="card" data-dusk={`vouchersCard${filterValues?.fund_id || ''}`}>
            <VouchersTableHeader
                filter={filter}
                organization={activeOrganization}
                vouchers={vouchers}
                funds={funds}
                loading={loading}
                fetchVouchers={fetchVouchers}
            />

            {!loading && vouchers.data.length > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                <thead>
                                    <tr>
                                        {columns.map((column, index: number) => (
                                            <th
                                                key={index}
                                                onMouseOver={() => showTableTooltip(column.tooltip?.key)}
                                                onMouseLeave={() => hideTableTooltip()}>
                                                {translate(column.label)}
                                            </th>
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
                                    {vouchers.data.map((voucher) => (
                                        <VouchersTableRow
                                            funds={funds}
                                            key={voucher.id}
                                            voucher={voucher}
                                            fetchVouchers={fetchVouchers}
                                            organization={activeOrganization}
                                            shownVoucherMenuId={shownVoucherMenuId}
                                            setShownVoucherMenuId={setShownVoucherMenuId}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>
            )}

            {loading && <LoadingCard type={'card-section'} />}

            {!loading && vouchers.meta.total == 0 && (
                <EmptyCard title={'Geen vouchers gevonden'} type={'card-section'} />
            )}

            {vouchers.meta && (
                <div className="card-section">
                    <Paginator
                        meta={vouchers.meta}
                        filters={filterValues}
                        updateFilters={filterUpdate}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </div>
    );
}
