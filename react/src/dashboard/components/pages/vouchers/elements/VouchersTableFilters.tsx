import React, { Fragment, useCallback, useState } from 'react';
import { hasPermission } from '../../../../helpers/utils';
import Organization from '../../../../props/models/Organization';
import SelectControl from '../../../elements/select-control/SelectControl';
import ClickOutside from '../../../elements/click-outside/ClickOutside';
import FilterItemToggle from '../../../elements/tables/elements/FilterItemToggle';
import DatePickerControl from '../../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../../helpers/dates';
import FilterScope from '../../../../types/FilterScope';
import useTranslate from '../../../../hooks/useTranslate';
import useVoucherService from '../../../../services/VoucherService';
import useVoucherTableOptions from '../hooks/useVoucherTableOptions';
import useVoucherExportService from '../../../../services/exports/useVoucherExportService';
import { PaginationData } from '../../../../props/ApiResponses';
import Voucher from '../../../../props/models/Voucher';
import Fund from '../../../../props/models/Fund';
import { keyBy } from 'lodash';

export type VouchersTableFiltersProps = {
    q?: string;
    to?: string;
    from?: string;
    type?: string;
    state?: 'pending' | 'active' | 'deactivated' | 'expired';
    in_use?: boolean;
    source?: 'all' | 'user' | 'employee';
    granted?: boolean;
    fund_id?: number;
    has_payouts?: boolean;
    implementation_id?: number;
    amount_min?: string;
    amount_max?: string;
    date_type?: 'created_at' | 'used_at';
    amount_available_min?: string;
    amount_available_max?: string;
    count_per_identity_min?: string;
    count_per_identity_max?: string;
    sort_by?: string;
    sort_order?: string;
    per_page?: number;
    page?: number;
};

export default function VouchersTableFilters({
    organization,
    vouchers,
    filter,
    funds,
}: {
    organization: Organization;
    vouchers: PaginationData<Voucher>;
    filter: FilterScope<VouchersTableFiltersProps>;
    funds: Array<Partial<Fund>>;
}) {
    const translate = useTranslate();

    const voucherService = useVoucherService();
    const voucherExportService = useVoucherExportService();

    const [inUseOptions] = useState(voucherService.getInUseOptions());
    const [sourcesOptions] = useState(voucherService.getSourcesOptions());
    const [grantedOptions] = useState(voucherService.getGrantedOptions());
    const [dateTypeOptions] = useState(voucherService.getDateTypesOptions());
    const [hasPayoutsOptions] = useState(voucherService.getHasPayoutsOptions());
    const [voucherStateOptions] = useState(voucherService.getStates());
    const { implementations } = useVoucherTableOptions(organization);

    const exportVouchers = useCallback(() => {
        filter.setShow(false);

        voucherExportService.exportData(
            organization.id,
            keyBy(funds, 'id')[filter.activeValues.fund_id]?.allow_voucher_records,
            {
                ...filter.activeValues,
                in_use: filter.activeValues.in_use == null ? null : filter.activeValues.in_use ? 1 : 0,
                granted: filter.activeValues.granted == null ? null : filter.activeValues.granted ? 1 : 0,
                has_payouts: filter.activeValues.has_payouts == null ? null : filter.activeValues.has_payouts ? 1 : 0,
                per_page: null,
            },
        );
    }, [organization.id, filter, funds, voucherExportService]);

    return (
        <Fragment>
            {filter.show && (
                <div className="button button-text" onClick={filter.resetFilters}>
                    <em className="mdi mdi-close icon-start" />
                    <span>{translate('vouchers.buttons.clear_filter')}</span>
                </div>
            )}

            {!filter.show && (
                <div className="form">
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-control"
                            value={filter.values.q}
                            data-dusk="searchVoucher"
                            placeholder={translate('vouchers.labels.search')}
                            onChange={(e) => filter.update({ q: e.target.value })}
                        />
                    </div>
                </div>
            )}

            <ClickOutside className="form" onClickOutside={() => filter.setShow(false)}>
                <div className="inline-filters-dropdown pull-right">
                    {filter.show && (
                        <div className="inline-filters-dropdown-content">
                            <div className="arrow-box bg-dim">
                                <div className="arrow" />
                            </div>

                            <div className="form" onClick={(e) => e.stopPropagation()}>
                                <FilterItemToggle show={true} label={translate('vouchers.labels.search')}>
                                    <input
                                        className="form-control"
                                        data-dusk="searchReimbursement"
                                        value={filter.values.q}
                                        onChange={(e) => filter.update({ q: e.target.value })}
                                        placeholder={translate('vouchers.labels.search')}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('vouchers.labels.granted')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'value'}
                                        allowSearch={false}
                                        value={filter.values.granted}
                                        options={grantedOptions}
                                        onChange={(granted?: boolean) => filter.update({ granted })}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('vouchers.labels.source')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'value'}
                                        allowSearch={false}
                                        value={filter.values.source}
                                        options={sourcesOptions}
                                        onChange={(source: 'all' | 'user' | 'employee') => filter.update({ source })}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('vouchers.labels.state')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'value'}
                                        allowSearch={false}
                                        value={filter.values.state}
                                        options={voucherStateOptions}
                                        onChange={(state: 'pending' | 'active' | 'deactivated' | 'expired') =>
                                            filter.update({ state })
                                        }
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('vouchers.labels.voucher_count_per_identity')}>
                                    <div className="row">
                                        <div className="col col-sm-6">
                                            <input
                                                className="form-control"
                                                min={0}
                                                type="number"
                                                value={filter.values.count_per_identity_min || ''}
                                                onChange={(e) => {
                                                    filter.update({ count_per_identity_min: e.target.value || null });
                                                }}
                                                placeholder={translate('transactions.labels.amount_min')}
                                            />
                                        </div>

                                        <div className="col col-sm-6">
                                            <input
                                                className="form-control"
                                                min={0}
                                                type="number"
                                                value={filter.values.count_per_identity_max || ''}
                                                onChange={(e) => {
                                                    filter.update({ count_per_identity_max: e.target.value || null });
                                                }}
                                                placeholder={translate('transactions.labels.amount_max')}
                                            />
                                        </div>
                                    </div>
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('vouchers.labels.in_use')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'value'}
                                        allowSearch={false}
                                        value={filter.values.in_use}
                                        options={inUseOptions}
                                        onChange={(in_use: boolean) => filter.update({ in_use })}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('transactions.labels.amount')}>
                                    <div className="row">
                                        <div className="col col-lg-6">
                                            <input
                                                className="form-control"
                                                min={0}
                                                type="number"
                                                value={filter.values.amount_min || ''}
                                                onChange={(e) => {
                                                    filter.update({ amount_min: e.target.value || null });
                                                }}
                                                placeholder={translate('transactions.labels.amount_min')}
                                            />
                                        </div>

                                        <div className="col col-lg-6">
                                            <input
                                                className="form-control"
                                                min={0}
                                                type="number"
                                                value={filter.values.amount_max || ''}
                                                onChange={(e) => {
                                                    filter.update({ amount_max: e.target.value || null });
                                                }}
                                                placeholder={translate('transactions.labels.amount_max')}
                                            />
                                        </div>
                                    </div>
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('vouchers.labels.amount_available')}>
                                    <div className="row">
                                        <div className="col col-sm-6">
                                            <input
                                                className="form-control"
                                                type="number"
                                                value={filter.values.amount_available_min || ''}
                                                placeholder={translate('vouchers.labels.amount_available_min')}
                                                onChange={(e) => {
                                                    filter.update({ amount_available_min: e.target.value || null });
                                                }}
                                            />
                                        </div>

                                        <div className="col col-sm-6">
                                            <input
                                                className="form-control"
                                                type="number"
                                                value={filter.values.amount_available_max || ''}
                                                placeholder={translate('vouchers.labels.amount_available_min')}
                                                onChange={(e) => {
                                                    filter.update({ amount_available_max: e.target.value || null });
                                                }}
                                            />
                                        </div>
                                    </div>
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('vouchers.labels.date_type')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'value'}
                                        allowSearch={false}
                                        value={filter.values.date_type}
                                        options={dateTypeOptions}
                                        onChange={(date_type: 'created_at' | 'used_at') => filter.update({ date_type })}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('vouchers.labels.from')}>
                                    <DatePickerControl
                                        value={dateParse(filter.values.from)}
                                        placeholder={translate('dd-MM-yyyy')}
                                        onChange={(from: Date) => filter.update({ from: dateFormat(from) })}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('vouchers.labels.to')}>
                                    <DatePickerControl
                                        value={dateParse(filter.values.to)}
                                        placeholder={translate('dd-MM-yyyy')}
                                        onChange={(to: Date) => filter.update({ to: dateFormat(to) })}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('reimbursements.labels.fund')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'id'}
                                        allowSearch={false}
                                        value={filter.values.fund_id}
                                        options={funds}
                                        onChange={(fund_id: number) => filter.update({ fund_id })}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('reimbursements.labels.implementation')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'id'}
                                        allowSearch={false}
                                        value={filter.values.implementation_id}
                                        options={implementations}
                                        onChange={(implementation_id: number) => filter.update({ implementation_id })}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('vouchers.labels.has_payouts')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'value'}
                                        allowSearch={false}
                                        value={filter.values.has_payouts}
                                        options={hasPayoutsOptions}
                                        onChange={(has_payouts: boolean) => filter.update({ has_payouts })}
                                    />
                                </FilterItemToggle>

                                {hasPermission(organization, 'manage_vouchers') && (
                                    <div className="form-actions">
                                        <button
                                            className="button button-primary button-wide"
                                            onClick={exportVouchers}
                                            disabled={vouchers.meta.total == 0}>
                                            <em className="mdi mdi-download icon-start" />
                                            {translate('components.dropdown.export', { total: vouchers.meta.total })}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div onClick={() => filter.setShow(!filter.show)} className="button button-default button-icon">
                        <em className="mdi mdi-filter-outline" />
                    </div>
                </div>
            </ClickOutside>
        </Fragment>
    );
}
