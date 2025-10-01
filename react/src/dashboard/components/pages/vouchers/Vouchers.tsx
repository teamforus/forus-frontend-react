import React, { Fragment, useCallback, useEffect, useState } from 'react';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { PaginationData } from '../../../props/ApiResponses';
import SponsorVoucher from '../../../props/models/Sponsor/SponsorVoucher';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useVoucherService from '../../../services/VoucherService';
import useSetProgress from '../../../hooks/useSetProgress';
import useTranslate from '../../../hooks/useTranslate';
import VouchersTableNoFundsBlock from './elements/VouchersTableNoFundsBlock';
import useVoucherTableOptions from './hooks/useVoucherTableOptions';
import VouchersTableFilters, { VouchersTableFiltersProps } from './elements/VouchersTableFilters';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { BooleanParam, createEnumParam, NumberParam, StringParam } from 'use-query-params';
import classNames from 'classnames';
import { hasPermission } from '../../../helpers/utils';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptionsFund from '../../elements/select-control/templates/SelectControlOptionsFund';
import useOpenModal from '../../../hooks/useOpenModal';
import Fund from '../../../props/models/Fund';
import ModalVoucherCreate from '../../modals/ModalVoucherCreate';
import ModalVouchersUpload from '../../modals/ModalVouchersUpload';
import VouchersTable from './elements/VouchersTable';
import { Permission } from '../../../props/models/Organization';

export default function Vouchers() {
    const activeOrganization = useActiveOrganization();

    const translate = useTranslate();

    const openModal = useOpenModal();
    const setProgress = useSetProgress();

    const voucherService = useVoucherService();
    const paginatorService = usePaginatorService();

    const [loading, setLoading] = useState<boolean>(true);
    const [vouchers, setVouchers] = useState<PaginationData<SponsorVoucher>>(null);
    const [paginatorKey] = useState<string>('vouchers');

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
            order_by: 'created_at',
            order_dir: 'desc',
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
                order_by: StringParam,
                order_dir: StringParam,
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

    const createVoucher = useCallback(
        (funds: Array<Partial<Fund>>, fundId?: number, onCreate?: () => void) => {
            const fundsList = funds.filter((fund) => fund.id);

            openModal((modal) => (
                <ModalVoucherCreate
                    fundId={fundId || fundsList[0].id}
                    funds={fundsList}
                    modal={modal}
                    onCreated={onCreate}
                    organization={activeOrganization}
                />
            ));
        },
        [openModal, activeOrganization],
    );

    const uploadVouchers = useCallback(
        (funds: Array<Partial<Fund>>, fundId?: number, onCreate?: () => void) => {
            openModal((modal) => (
                <ModalVouchersUpload
                    modal={modal}
                    fundId={fundId || funds[0].id}
                    funds={funds}
                    organization={activeOrganization}
                    onCompleted={onCreate}
                />
            ));
        },
        [openModal, activeOrganization],
    );

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    if (!vouchers || !funds) {
        return <LoadingCard />;
    }

    if (funds?.length === 0) {
        return <VouchersTableNoFundsBlock organization={activeOrganization} />;
    }

    return (
        <div className="card" data-dusk={`tableVoucherContent${filterValues?.fund_id || ''}`}>
            <div className={classNames(`card-header`, loading && 'card-header-inactive')}>
                <div className="card-title flex flex-grow" data-dusk="vouchersTitle">
                    {translate('vouchers.header.title')} ({vouchers?.meta?.total})
                </div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        {hasPermission(activeOrganization, Permission.MANAGE_VOUCHERS) && (
                            <Fragment>
                                <button
                                    id="create_voucher"
                                    className="button button-primary"
                                    disabled={funds?.filter((fund) => fund.id)?.length < 1}
                                    onClick={() => createVoucher(funds, filter.activeValues?.fund_id, fetchVouchers)}>
                                    <em className="mdi mdi-plus-circle icon-start" />
                                    {translate('vouchers.buttons.add_new')}
                                </button>

                                <button
                                    id="voucher_upload_csv"
                                    className="button button-primary"
                                    disabled={funds?.filter((fund) => fund.id)?.length < 1}
                                    onClick={() => uploadVouchers(funds, filter.activeValues?.fund_id, fetchVouchers)}
                                    data-dusk="uploadVouchersBatchButton">
                                    <em className="mdi mdi-upload icon-start" />
                                    {translate('vouchers.buttons.upload_csv')}
                                </button>
                            </Fragment>
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

                        <VouchersTableFilters
                            filter={filter}
                            organization={activeOrganization}
                            vouchers={vouchers}
                            funds={funds}
                        />
                    </div>
                </div>
            </div>

            <VouchersTable
                funds={funds}
                loading={loading}
                paginatorKey={paginatorKey}
                vouchers={vouchers}
                organization={activeOrganization}
                fetchVouchers={fetchVouchers}
                filterValues={filterValues}
                filterUpdate={filterUpdate}
            />
        </div>
    );
}
