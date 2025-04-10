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
import { hasPermission } from '../../../helpers/utils';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import useReimbursementsExporter from '../../../services/exporters/useReimbursementsExporter';
import useImplementationService from '../../../services/ImplementationService';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../helpers/dates';
import Implementation from '../../../props/models/Implementation';
import useSetProgress from '../../../hooks/useSetProgress';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useTranslate from '../../../hooks/useTranslate';
import SelectControlOptionsFund from '../../elements/select-control/templates/SelectControlOptionsFund';
import CardHeaderFilter from '../../elements/tables/elements/CardHeaderFilter';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { createEnumParam, NumberParam, StringParam } from 'use-query-params';
import ReimbursementsTable from './elements/ReimbursementsTable';

export default function Reimbursements() {
    const activeOrganization = useActiveOrganization();
    const reimbursementsExporter = useReimbursementsExporter();

    const translate = useTranslate();
    const setProgress = useSetProgress();

    const fundService = useFundService();
    const paginatorService = usePaginatorService();
    const reimbursementService = useReimbursementsService();
    const implementationService = useImplementationService();

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [paginatorKey] = useState('reimbursements');
    const [implementations, setImplementations] = useState<Array<Partial<Implementation>>>(null);
    const [reimbursements, setReimbursements] = useState<PaginationData<Reimbursement>>(null);

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
        setLoading(true);

        reimbursementService
            .list(activeOrganization.id, filterValuesActive)
            .then((res) => setReimbursements(res.data))
            .finally(() => {
                setProgress(100);
                setLoading(false);
            });
    }, [setProgress, activeOrganization.id, filterValuesActive, reimbursementService]);

    const fetchImplementations = useCallback(() => {
        implementationService
            .list(activeOrganization.id, { per_page: 100 })
            .then((res) => setImplementations([{ id: null, name: 'Alle implementaties...' }, ...res.data.data]));
    }, [activeOrganization.id, implementationService]);

    const exportReimbursements = useCallback(() => {
        reimbursementsExporter.exportData(activeOrganization.id, {
            ...filterValuesActive,
            per_page: null,
        });
    }, [activeOrganization.id, filterValuesActive, reimbursementsExporter]);

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
                <div className="card-header">
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
                                        onChange={(implementation_id: string) => filterUpdate({ implementation_id })}
                                    />
                                </FilterItemToggle>

                                <div className="form-actions">
                                    <button
                                        className="button button-primary button-wide"
                                        onClick={() => exportReimbursements()}
                                        data-dusk="export"
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

                <ReimbursementsTable
                    loading={loading}
                    paginatorKey={paginatorKey}
                    organization={activeOrganization}
                    reimbursements={reimbursements}
                    filterValues={filterValues}
                    filterUpdate={filterUpdate}
                />
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
