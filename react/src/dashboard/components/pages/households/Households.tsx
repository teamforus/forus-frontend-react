import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useSetProgress from '../../../hooks/useSetProgress';
import { PaginationData } from '../../../props/ApiResponses';
import Paginator from '../../../modules/paginator/components/Paginator';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../elements/select-control/SelectControl';
import CardHeaderFilter from '../../elements/tables/elements/CardHeaderFilter';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import TableRowActions from '../../elements/tables/TableRowActions';
import SelectControlOptionsFund from '../../elements/select-control/templates/SelectControlOptionsFund';
import usePushApiError from '../../../hooks/usePushApiError';
import { NumberParam, StringParam } from 'use-query-params';
import useIdentityExporter from '../../../services/exporters/useIdentityExporter';
import { hasPermission } from '../../../helpers/utils';
import { Permission } from '../../../props/models/Organization';
import Household from '../../../props/models/Sponsor/Household';
import useHouseholdsService from '../../../services/HouseholdsService';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';
import useEditHousehold from './hooks/useEditHousehold';
import useDeleteHousehold from './hooks/useDeleteHousehold';
import TableRowActionItem from '../../elements/tables/TableRowActionItem';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function Households() {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const paginatorService = usePaginatorService();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const identityExporter = useIdentityExporter();
    const householdsService = useHouseholdsService();

    const [loading, setLoading] = useState(false);

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [households, setHouseholds] = useState<PaginationData<Household>>(null);

    const [paginatorTransactionsKey] = useState('payouts');

    const editHousehold = useEditHousehold(activeOrganization);
    const deleteHousehold = useDeleteHousehold();

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q: string;
        fund_id?: number;
        per_page?: number;
        order_by?: string;
        order_dir?: string;
    }>(
        {
            q: '',
            fund_id: null,
            order_by: 'created_at',
            order_dir: 'desc',
            per_page: paginatorService.getPerPage(paginatorTransactionsKey),
        },
        {
            throttledValues: ['q'],
            queryParams: {
                q: StringParam,
                fund_id: NumberParam,
                per_page: NumberParam,
                order_by: StringParam,
                order_dir: StringParam,
            },
        },
    );

    const { headElement, configsElement } = useConfigurableTable(householdsService.getColumns(), {
        filter: filter,
        sortable: true,
        hasTooltips: true,
    });

    const { resetFilters: resetFilters, setShow } = filter;

    const exportHouseholds = useCallback(() => {
        setShow(false);

        identityExporter.exportData(activeOrganization.id, {
            ...filter.activeValues,
            per_page: null,
        });
    }, [activeOrganization.id, filter.activeValues, setShow, identityExporter]);

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(activeOrganization.id)
            .then((res) => setFunds([{ id: null, name: 'Selecteer fonds' }, ...res.data.data]))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [activeOrganization.id, fundService, setProgress, pushApiError]);

    const fetchHouseholds = useCallback(() => {
        setLoading(true);
        setProgress(0);

        householdsService
            .list(activeOrganization.id, filterValuesActive)
            .then((res) => setHouseholds(res.data))
            .catch(pushApiError)
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [activeOrganization.id, setProgress, householdsService, pushApiError, filterValuesActive]);

    useEffect(() => {
        fetchHouseholds();
    }, [fetchHouseholds]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    if (!households || !funds) {
        return <LoadingCard />;
    }

    return (
        <div className="card" data-dusk="tableProfilesContent">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {translate('households.header.title')} ({households.meta.total})
                </div>
                <div className={'card-header-filters'}>
                    <div className="block block-inline-filters">
                        {hasPermission(activeOrganization, Permission.MANAGE_IDENTITIES) && (
                            <button
                                type="button"
                                className="button button-primary button-sm"
                                onClick={() => editHousehold(null, fetchHouseholds)}
                                data-dusk="uploadTransactionsBatchButton">
                                <em className="mdi mdi-plus-circle" />
                                Aanmaken
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
                                        data-dusk="tableProfilesSearch"
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

                            <div className="form-actions">
                                <button
                                    className="button button-primary button-wide"
                                    onClick={exportHouseholds}
                                    data-dusk="export"
                                    disabled={households.meta.total == 0}>
                                    <em className="mdi mdi-download icon-start" />
                                    {translate('components.dropdown.export', { total: households.meta.total })}
                                </button>
                            </div>
                        </CardHeaderFilter>
                    </div>
                </div>
            </div>

            <LoaderTableCard
                loading={loading}
                empty={households.meta.total == 0}
                emptyTitle={'Geen huishoudens gevonden'}>
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {households.data.map((household) => (
                                        <StateNavLink
                                            key={household.id}
                                            name={DashboardRoutes.HOUSEHOLD}
                                            dataDusk={`tableProfilesRow${household.id}`}
                                            params={{
                                                organizationId: activeOrganization.id,
                                                id: household.id,
                                            }}
                                            className={'tr-clickable'}
                                            customElement={'tr'}>
                                            <td>{household.uid ?? <TableEmptyValue />}</td>

                                            <td>{household.count_people ?? <TableEmptyValue />}</td>
                                            <td>{household.count_minors ?? <TableEmptyValue />}</td>
                                            <td>{household.count_adults ?? <TableEmptyValue />}</td>
                                            <td>{household.city || <TableEmptyValue />}</td>
                                            <td>{household.postal_code || <TableEmptyValue />}</td>
                                            <td>
                                                {[household.house_nr, household.house_nr_addition]
                                                    .filter((item) => item)
                                                    .join(' ') || <TableEmptyValue />}
                                            </td>
                                            <td>{household.neighborhood_name || <TableEmptyValue />}</td>
                                            <td>{household.municipality_name || <TableEmptyValue />}</td>

                                            <td className={'table-td-actions'}>
                                                <TableRowActions
                                                    content={(e) => (
                                                        <div className="dropdown dropdown-actions">
                                                            <TableRowActionItem
                                                                type="link"
                                                                name={DashboardRoutes.HOUSEHOLD}
                                                                params={{
                                                                    organizationId: activeOrganization.id,
                                                                    id: household.id,
                                                                }}>
                                                                <em className="mdi mdi-eye icon-start" /> Bekijken
                                                            </TableRowActionItem>
                                                            <TableRowActionItem
                                                                type="button"
                                                                onClick={() => {
                                                                    e?.close();
                                                                    editHousehold(household, fetchHouseholds);
                                                                }}>
                                                                <em className="mdi mdi-pencil icon-start" /> Bewerking
                                                            </TableRowActionItem>
                                                            <TableRowActionItem
                                                                type="button"
                                                                disable={!household?.removable}
                                                                onClick={() => {
                                                                    e?.close();
                                                                    deleteHousehold(household, fetchHouseholds);
                                                                }}>
                                                                <em className="mdi mdi-close icon-start" /> Verwijderen
                                                            </TableRowActionItem>
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

                {households.meta.total > 0 && (
                    <div className="card-section">
                        <Paginator
                            meta={households.meta}
                            filters={filterValues}
                            updateFilters={filterUpdate}
                            perPageKey={paginatorTransactionsKey}
                        />
                    </div>
                )}
            </LoaderTableCard>
        </div>
    );
}
