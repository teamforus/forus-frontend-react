import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { PaginationData } from '../../../props/ApiResponses';
import Fund from '../../../props/models/Fund';
import Reimbursement from '../../../props/models/Reimbursement';
import { useReimbursementsService } from '../../../services/ReimbursementService';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import { useFundService } from '../../../services/FundService';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import { strLimit } from '../../../helpers/string';
import Paginator from '../../../modules/paginator/components/Paginator';
import { hasPermission } from '../../../helpers/utils';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import useReimbursementExportService from '../../../services/exports/useReimbursementExportService';
import useImplementationService from '../../../services/ImplementationService';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../helpers/dates';
import Implementation from '../../../props/models/Implementation';
import useSetProgress from '../../../hooks/useSetProgress';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useTranslate from '../../../hooks/useTranslate';
import classNames from 'classnames';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import SelectControlOptionsFund from '../../elements/select-control/templates/SelectControlOptionsFund';
import TableRowActions from '../../elements/tables/TableRowActions';
import CardHeaderFilter from '../../elements/tables/elements/CardHeaderFilter';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { createEnumParam, NumberParam, StringParam } from 'use-query-params';

export default function Reimbursements() {
    const activeOrganization = useActiveOrganization();

    const translate = useTranslate();
    const setProgress = useSetProgress();

    const fundService = useFundService();
    const paginatorService = usePaginatorService();
    const reimbursementService = useReimbursementsService();
    const implementationService = useImplementationService();
    const reimbursementExportService = useReimbursementExportService();

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [paginatorKey] = useState('reimbursements');
    const [implementations, setImplementations] = useState<Array<Partial<Implementation>>>(null);
    const [reimbursements, setReimbursements] = useState<PaginationData<Reimbursement>>(null);

    const [stateLabels] = useState({
        pending: 'label-default',
        approved: 'label-success',
        declined: 'label-danger',
    });

    const [statesOptions] = useState(reimbursementService.getStateOptions());
    const [expiredOptions] = useState(reimbursementService.getExpiredOptions());
    const [archivedOptions] = useState(reimbursementService.getArchivedOptions());
    const [deactivatedOptions] = useState(reimbursementService.getDeactivatedOptions());

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q: string;
        state: string;
        implementation_id?: string;
        amount_min?: string;
        amount_max?: string;
        expired?: number;
        archived?: number;
        deactivated?: number;
        from?: string;
        to?: string;
        fund_id?: number;
        page?: number;
        per_page?: number;
    }>(
        {
            q: '',
            state: null,
            implementation_id: null,
            amount_min: null,
            amount_max: null,
            expired: null,
            archived: 0,
            deactivated: null,
            from: null,
            to: null,
            fund_id: null,
            page: 1,
            per_page: paginatorService.getPerPage(paginatorKey, 10),
        },
        {
            queryParams: {
                q: StringParam,
                state: createEnumParam(['pending', 'approved', 'declined']),
                implementation_id: NumberParam,
                amount_min: NumberParam,
                amount_max: NumberParam,
                expired: NumberParam,
                archived: NumberParam,
                deactivated: NumberParam,
                from: StringParam,
                to: StringParam,
                fund_id: NumberParam,
                page: NumberParam,
                per_page: NumberParam,
            },
            queryParamsRemoveDefault: true,
            throttledValues: ['q', 'amount_min', 'amount_max'],
        },
    );

    const setArchivedOption = useCallback(
        (archived: number) => {
            filterUpdate({
                expired: null,
                archived: archived,
                deactivated: null,
            });
        },
        [filterUpdate],
    );

    const fetchFunds = useCallback(async (): Promise<Array<Fund>> => {
        return fundService.list(activeOrganization.id, { per_page: 100, configured: 1 }).then((res) => res.data.data);
    }, [activeOrganization.id, fundService]);

    const fetchReimbursements = useCallback(() => {
        setProgress(0);

        reimbursementService
            .list(activeOrganization.id, filterValuesActive)
            .then((res) => setReimbursements(res.data))
            .finally(() => setProgress(100));
    }, [setProgress, activeOrganization.id, filterValuesActive, reimbursementService]);

    const fetchImplementations = useCallback(() => {
        implementationService
            .list(activeOrganization.id, { per_page: 100 })
            .then((res) => setImplementations([{ id: null, name: 'Alle implementaties...' }, ...res.data.data]));
    }, [activeOrganization.id, implementationService]);

    const exportReimbursements = useCallback(() => {
        reimbursementExportService.exportData(activeOrganization.id, {
            ...filterValuesActive,
            per_page: null,
        });
    }, [activeOrganization.id, filterValuesActive, reimbursementExportService]);

    useEffect(() => {
        fetchFunds().then((funds) => setFunds([{ id: null, name: 'Selecteer fonds' }, ...funds]));
    }, [fetchFunds]);

    useEffect(() => {
        fetchReimbursements();
    }, [fetchReimbursements]);

    useEffect(() => {
        fetchImplementations();
    }, [fetchImplementations]);

    if (!reimbursements) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="card">
                <div className="card-header card-header-next">
                    <div className="flex flex-grow">
                        <div className="card-title">
                            {translate('reimbursements.header.title')} ({reimbursements?.meta?.total})
                        </div>
                    </div>
                    <div className={'card-header-filters'}>
                        <div className="block block-inline-filters">
                            <StateNavLink
                                name="reimbursement-categories"
                                params={{ organizationId: activeOrganization.id }}
                                className="button button-default button-sm">
                                <em className="mdi mdi-cog icon-start" />
                                Categorieën
                            </StateNavLink>

                            <div className="block block-label-tabs">
                                <div className="label-tab-set">
                                    {archivedOptions.map((viewType) => (
                                        <div
                                            key={viewType.value}
                                            onClick={() => setArchivedOption(viewType.value)}
                                            className={`label-tab label-tab-sm ${
                                                filterValues.archived == viewType.value ? 'active' : ''
                                            }`}
                                            data-dusk={`${
                                                viewType.value
                                                    ? 'reimbursementsFilterArchived'
                                                    : 'reimbursementsFilterActive'
                                            }`}>
                                            {viewType.name}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form">
                                <div className="form-group">
                                    <SelectControl
                                        className="form-control inline-filter-control"
                                        propKey={'id'}
                                        options={funds}
                                        value={filterValuesActive.fund_id}
                                        placeholder={translate('vouchers.labels.fund')}
                                        allowSearch={false}
                                        onChange={(fund_id: number) => filterUpdate({ fund_id })}
                                        optionsComponent={SelectControlOptionsFund}
                                    />
                                </div>
                            </div>

                            {filter.show && (
                                <div className="button button-text" onClick={filter.resetFilters}>
                                    <em className="mdi mdi-close icon-start" />
                                    <span>{translate('reimbursements.buttons.clear_filter')}</span>
                                </div>
                            )}

                            {!filter.show && (
                                <div className="form">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={filterValues.q}
                                            data-dusk="searchReimbursement"
                                            placeholder={translate('reimbursements.labels.search')}
                                            onChange={(e) => filterUpdate({ q: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <CardHeaderFilter filter={filter}>
                                <FilterItemToggle show={true} label={translate('reimbursements.labels.search')}>
                                    <input
                                        className="form-control"
                                        data-dusk="searchReimbursement"
                                        value={filterValues.q}
                                        onChange={(e) => filterUpdate({ q: e.target.value })}
                                        placeholder={translate('reimbursements.labels.search')}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('reimbursements.labels.state')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'value'}
                                        allowSearch={false}
                                        value={filterValues.state}
                                        options={statesOptions}
                                        optionsComponent={SelectControlOptions}
                                        onChange={(state: string) => filterUpdate({ state })}
                                    />
                                </FilterItemToggle>

                                {filterValues.archived == 1 && (
                                    <Fragment>
                                        <FilterItemToggle label={translate('reimbursements.labels.expired')}>
                                            <SelectControl
                                                className="form-control"
                                                propKey={'value'}
                                                allowSearch={false}
                                                value={filterValues.expired}
                                                options={expiredOptions}
                                                optionsComponent={SelectControlOptions}
                                                onChange={(expired: number) => filterUpdate({ expired })}
                                            />
                                        </FilterItemToggle>

                                        <FilterItemToggle label={translate('reimbursements.labels.deactivated')}>
                                            <SelectControl
                                                className="form-control"
                                                propKey={'value'}
                                                allowSearch={false}
                                                value={filterValues.deactivated}
                                                options={deactivatedOptions}
                                                optionsComponent={SelectControlOptions}
                                                onChange={(deactivated: number) => filterUpdate({ deactivated })}
                                            />
                                        </FilterItemToggle>
                                    </Fragment>
                                )}

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

                                <FilterItemToggle label={translate('reimbursements.labels.from')}>
                                    <DatePickerControl
                                        value={dateParse(filterValues.from)}
                                        placeholder={translate('yyyy-MM-dd')}
                                        onChange={(from: Date) => {
                                            filterUpdate({ from: dateFormat(from) });
                                        }}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('reimbursements.labels.to')}>
                                    <DatePickerControl
                                        value={dateParse(filterValues.to)}
                                        placeholder={translate('yyyy-MM-dd')}
                                        onChange={(to: Date) => {
                                            filterUpdate({ to: dateFormat(to) });
                                        }}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('reimbursements.labels.implementation')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'id'}
                                        allowSearch={false}
                                        value={filterValues.implementation_id}
                                        options={implementations}
                                        optionsComponent={SelectControlOptions}
                                        onChange={(implementation_id: string) => filterUpdate({ implementation_id })}
                                    />
                                </FilterItemToggle>

                                <div className="form-actions">
                                    <button
                                        className="button button-primary button-wide"
                                        onClick={() => exportReimbursements()}
                                        disabled={reimbursements.meta.total == 0}>
                                        <em className="mdi mdi-download icon-start"> </em>
                                        {translate('components.dropdown.export', {
                                            total: reimbursements.meta.total,
                                        })}
                                    </button>
                                </div>
                            </CardHeaderFilter>
                        </div>
                    </div>
                </div>

                <LoaderTableCard empty={reimbursements.meta.total == 0} emptyTitle={'Geen declaraties gevonden'}>
                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <TableTopScroller>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>{translate('reimbursements.labels.identity')}</th>
                                            <th>{translate('reimbursements.labels.fund')}</th>
                                            <th>{translate('reimbursements.labels.amount')}</th>
                                            <th>{translate('reimbursements.labels.created_at')}</th>
                                            <th>{translate('reimbursements.labels.lead_time')}</th>
                                            <th>{translate('reimbursements.labels.employee')}</th>
                                            <th>{translate('reimbursements.labels.expired')}</th>
                                            <th>{translate('reimbursements.labels.state')}</th>
                                            <th>{translate('reimbursements.labels.transaction')}</th>
                                            <th className="nowrap text-right">
                                                {translate('reimbursements.labels.actions')}
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {reimbursements.data.map((reimbursement) => (
                                            <StateNavLink
                                                customElement={'tr'}
                                                name={'reimbursements-view'}
                                                params={{ id: reimbursement.id, organizationId: activeOrganization.id }}
                                                key={reimbursement.id}
                                                dataDusk={`reimbursement${reimbursement.id}`}
                                                className={classNames(
                                                    'tr-clickable',
                                                    reimbursement.expired && 'tr-warning',
                                                )}>
                                                <td>
                                                    {/* Email */}
                                                    <div
                                                        className="text-primary text-medium"
                                                        data-dusk={`reimbursementIdentityEmail${reimbursement.id}`}>
                                                        {strLimit(reimbursement.identity_email, 25) || 'Geen E-mail'}
                                                    </div>

                                                    {/* BSN */}
                                                    {activeOrganization.bsn_enabled && (
                                                        <div className="text-strong text-md text-muted-dark">
                                                            {reimbursement.identity_bsn
                                                                ? 'BSN: ' + reimbursement.identity_bsn
                                                                : 'Geen BSN'}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="text-primary text-medium">
                                                        {strLimit(reimbursement.fund.name, 25)}
                                                    </div>
                                                    <div className="text-strong text-md text-muted-dark">
                                                        {strLimit(reimbursement.implementation_name, 25)}
                                                    </div>
                                                </td>

                                                {/* Amount */}
                                                <td
                                                    className="nowrap"
                                                    data-dusk={'reimbursementAmount' + reimbursement.id}>
                                                    {reimbursement.amount_locale}
                                                </td>

                                                <td>
                                                    <div className="text-primary text-medium">
                                                        {reimbursement.created_at_locale.split(' - ')[0]}
                                                    </div>
                                                    <div className="text-strong text-md text-muted-dark">
                                                        {reimbursement.created_at_locale.split(' - ')[1]}
                                                    </div>
                                                </td>

                                                <td>{reimbursement.lead_time_locale}</td>

                                                <td
                                                    className={
                                                        reimbursement.employee ? 'text-primary' : 'text-muted-dark'
                                                    }>
                                                    {strLimit(reimbursement.employee?.email || 'Niet toegewezen', 25)}
                                                </td>

                                                <td
                                                    className={
                                                        reimbursement.expired ? 'text-primary' : 'text-muted-dark'
                                                    }>
                                                    {reimbursement.expired ? 'Ja' : 'Nee'}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`label ${stateLabels[reimbursement.state] || ''}`}
                                                        data-dusk={`reimbursementState${reimbursement.id}`}>
                                                        {reimbursement.state_locale}
                                                    </span>
                                                </td>

                                                <td>
                                                    {reimbursement.voucher_transaction?.state == 'pending' && (
                                                        <span className="label label-default">
                                                            {reimbursement.voucher_transaction.state_locale}
                                                        </span>
                                                    )}

                                                    {reimbursement.voucher_transaction?.state == 'success' && (
                                                        <span className="label label-success">
                                                            {reimbursement.voucher_transaction.state_locale}
                                                        </span>
                                                    )}

                                                    {reimbursement.voucher_transaction?.state == 'canceled' && (
                                                        <span className="label label-danger">
                                                            {reimbursement.voucher_transaction.state_locale}
                                                        </span>
                                                    )}

                                                    {!reimbursement.voucher_transaction && <TableEmptyValue />}
                                                </td>

                                                <td className={'table-td-actions'}>
                                                    <TableRowActions
                                                        content={() => (
                                                            <div className="dropdown dropdown-actions">
                                                                <StateNavLink
                                                                    name={'reimbursements-view'}
                                                                    className="dropdown-item"
                                                                    params={{
                                                                        id: reimbursement.id,
                                                                        organizationId: activeOrganization.id,
                                                                    }}>
                                                                    <em className="mdi mdi-eye icon-start" /> Bekijken
                                                                </StateNavLink>
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

                    {reimbursements.meta && (
                        <div className="card-section">
                            <Paginator
                                meta={reimbursements.meta}
                                filters={filterValues}
                                updateFilters={filterUpdate}
                                perPageKey={paginatorKey}
                            />
                        </div>
                    )}
                </LoaderTableCard>
            </div>

            {funds?.length == 0 && (
                <Fragment>
                    {hasPermission(activeOrganization, 'manage_funds') ? (
                        <EmptyCard
                            description={'Je hebt momenteel geen fondsen.'}
                            button={{
                                text: 'Fonds toevoegen',
                                to: getStateRouteUrl('organization-funds', {
                                    organizationId: activeOrganization.id,
                                }),
                            }}
                        />
                    ) : (
                        <EmptyCard description={'Je hebt momenteel geen fondsen.'} />
                    )}
                </Fragment>
            )}
        </Fragment>
    );
}
