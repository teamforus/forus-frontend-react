import { PaginationData } from '../../../../props/ApiResponses';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import Paginator from '../../../../modules/paginator/components/Paginator';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../../hooks/useTranslate';
import useSetProgress from '../../../../hooks/useSetProgress';
import PhysicalCardType from '../../../../props/models/PhysicalCardType';
import SelectControl from '../../../elements/select-control/SelectControl';
import FilterItemToggle from '../../../elements/tables/elements/FilterItemToggle';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import TableEntityMain from '../../../elements/tables/elements/TableEntityMain';
import { strLimit } from '../../../../helpers/string';
import usePushApiError from '../../../../hooks/usePushApiError';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import { useFundService } from '../../../../services/FundService';
import Fund from '../../../../props/models/Fund';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import { hasPermission } from '../../../../helpers/utils';
import ClickOutside from '../../../elements/click-outside/ClickOutside';
import FundStateLabels from '../../../elements/resource-states/FundStateLabels';
import TableRowActions from '../../../elements/tables/TableRowActions';
import { Permission } from '../../../../props/models/Organization';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function PhysicalCardTypeFundsTable({ physicalCardType }: { physicalCardType: PhysicalCardType }) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const paginatorService = usePaginatorService();

    const [paginatorKey] = useState<string>('organization_funds');
    const [funds, setFunds] =
        useState<PaginationData<Fund, { unarchived_funds_total: number; archived_funds_total: number }>>(null);

    const [statesOptions] = useState([
        { key: null, name: 'Alle' },
        { key: 'active', name: translate(`components.organization_funds.states.active`) },
        { key: 'paused', name: translate(`components.organization_funds.states.paused`) },
        { key: 'closed', name: translate(`components.organization_funds.states.closed`) },
    ]);

    const [filterValues, filterActiveValues, filterUpdate, filter] = useFilterNext<{
        q: string;
        page: number;
        state: string;
        per_page: number;
        funds_type: string;
        implementation_id: string;
        physical_card_type_id?: number;
    }>({
        q: '',
        page: 1,
        state: null,
        per_page: paginatorService.getPerPage(paginatorKey),
        funds_type: 'active',
        implementation_id: null,
        physical_card_type_id: physicalCardType?.id,
    });

    const { headElement, configsElement } = useConfigurableTable(
        fundService.getColumns(activeOrganization, filterActiveValues?.funds_type),
    );

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(activeOrganization.id, {
                ...filterActiveValues,
                with_archived: 1,
                with_external: 1,
                stats: 'min',
                archived: filterActiveValues?.funds_type == 'archived' ? 1 : 0,
                per_page: filterActiveValues.per_page,
                physical_card_type_id: physicalCardType?.id,
            })
            .then((res) => setFunds(res.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [activeOrganization.id, filterActiveValues, fundService, pushApiError, setProgress, physicalCardType?.id]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    if (!funds) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow" data-dusk="fundsTitle">
                    {translate('components.organization_funds.title')} ({funds.meta.total})
                </div>

                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <StateNavLink
                            name={DashboardRoutes.ORGANIZATION_FUNDS}
                            params={{ organizationId: activeOrganization.id }}
                            className="button button-primary button-sm">
                            <em className="mdi mdi-view-list icon-start" />
                            Toon fondsen
                        </StateNavLink>

                        <div className="flex">
                            {filter.show && (
                                <div className="button button-text" onClick={filter.resetFilters}>
                                    <em className="mdi mdi-close icon-start" />
                                    Wis filters
                                </div>
                            )}

                            {!filter.show && (
                                <div className="form">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Zoeken"
                                            value={filter.values.q}
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

                                            <div className="form">
                                                <FilterItemToggle
                                                    show={true}
                                                    label={translate('components.organization_funds.filters.search')}>
                                                    <input
                                                        className="form-control"
                                                        value={filterValues.q}
                                                        onChange={(e) => filterUpdate({ q: e.target.value })}
                                                        placeholder={translate(
                                                            'components.organization_funds.filters.search',
                                                        )}
                                                    />
                                                </FilterItemToggle>

                                                <FilterItemToggle
                                                    label={translate('components.organization_funds.filters.state')}>
                                                    <SelectControl
                                                        className="form-control"
                                                        propKey={'key'}
                                                        allowSearch={false}
                                                        value={filterValues.state}
                                                        options={statesOptions}
                                                        onChange={(state: string) => filterUpdate({ state })}
                                                    />
                                                </FilterItemToggle>
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        className="button button-default button-icon"
                                        onClick={() => filter.setShow(!filter.show)}>
                                        <em className="mdi mdi-filter-outline" />
                                    </div>
                                </div>
                            </ClickOutside>
                        </div>
                    </div>
                </div>
            </div>

            <LoaderTableCard
                loading={!funds?.meta}
                empty={funds?.meta?.total === 0}
                emptyTitle={'Geen fondsen'}
                emptyDescription={'Geen fondsen gevonden.'}>
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {funds.data.map((fund) => (
                                        <StateNavLink
                                            key={fund.id}
                                            name={DashboardRoutes.FUND}
                                            params={{ organizationId: activeOrganization.id, fundId: fund.id }}
                                            customElement={'tr'}
                                            className={'tr-clickable'}>
                                            <td>
                                                <TableEntityMain
                                                    title={strLimit(fund.name, 50)}
                                                    subtitle={fund.organization?.name}
                                                    mediaPlaceholder={'fund'}
                                                    media={fund?.logo}
                                                />
                                            </td>

                                            <td className="text-strong text-muted-dark">
                                                {fund?.implementation?.name || <TableEmptyValue />}
                                            </td>

                                            {filterActiveValues?.funds_type == 'active' && (
                                                <Fragment>
                                                    {hasPermission(activeOrganization, Permission.VIEW_FINANCES) && (
                                                        <td>{fund.budget?.left_locale}</td>
                                                    )}

                                                    <td className="text-strong text-muted-dark">
                                                        {fund.requester_count}
                                                    </td>
                                                </Fragment>
                                            )}

                                            <td>
                                                <FundStateLabels fund={fund} />
                                            </td>

                                            <td className={'table-td-actions text-right'}>
                                                <TableRowActions
                                                    content={() => (
                                                        <div className="dropdown dropdown-actions">
                                                            <StateNavLink
                                                                name={DashboardRoutes.FUND}
                                                                params={{
                                                                    organizationId: activeOrganization.id,
                                                                    fundId: fund.id,
                                                                }}
                                                                className="dropdown-item">
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

                {funds?.meta.total > 0 && (
                    <div className="card-section">
                        <Paginator
                            meta={funds.meta}
                            filters={filterValues}
                            updateFilters={filterUpdate}
                            perPageKey={paginatorKey}
                        />
                    </div>
                )}
            </LoaderTableCard>
        </div>
    );
}
