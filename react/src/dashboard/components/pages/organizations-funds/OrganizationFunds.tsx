import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { PaginationData } from '../../../props/ApiResponses';
import Fund from '../../../props/models/Fund';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { hasPermission } from '../../../helpers/utils';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { useFundService } from '../../../services/FundService';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useSetProgress from '../../../hooks/useSetProgress';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../elements/select-control/SelectControl';
import useImplementationService from '../../../services/ImplementationService';
import Implementation from '../../../props/models/Implementation';
import { strLimit } from '../../../helpers/string';
import TableRowActions from '../../elements/tables/TableRowActions';
import usePushSuccess from '../../../hooks/usePushSuccess';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useOpenModal from '../../../hooks/useOpenModal';
import { createEnumParam, NumberParam, StringParam } from 'use-query-params';
import Paginator from '../../../modules/paginator/components/Paginator';
import ModalFundTopUp from '../../modals/ModalFundTopUp';
import useTranslate from '../../../hooks/useTranslate';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';
import FundStateLabels from '../../elements/resource-states/FundStateLabels';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import TableEntityMain from '../../elements/tables/elements/TableEntityMain';
import usePushApiError from '../../../hooks/usePushApiError';
import classNames from 'classnames';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { Permission } from '../../../props/models/Organization';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import CardHeaderFilter from '../../elements/tables/elements/CardHeaderFilter';

export default function OrganizationFunds() {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const openModal = useOpenModal();
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const paginatorService = usePaginatorService();
    const implementationService = useImplementationService();

    const [paginatorKey] = useState<string>('organization_funds');
    const [implementations, setImplementations] = useState<Array<Partial<Implementation>>>(null);
    const [funds, setFunds] =
        useState<PaginationData<Fund, { unarchived_funds_total: number; archived_funds_total: number }>>(null);

    const [topUpInProgress, setTopUpInProgress] = useState(false);

    const [statesOptions] = useState([
        { key: null, name: 'Alle' },
        { key: 'active', name: translate(`components.organization_funds.states.active`) },
        { key: 'paused', name: translate(`components.organization_funds.states.paused`) },
        { key: 'closed', name: translate(`components.organization_funds.states.closed`) },
    ]);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q: string;
        page: number;
        state: string;
        per_page: number;
        funds_type: string;
        implementation_id: number;
        physical_card_type_id?: number;
    }>(
        {
            q: '',
            page: 1,
            state: null,
            per_page: paginatorService.getPerPage(paginatorKey),
            funds_type: 'active',
            implementation_id: null,
            physical_card_type_id: null,
        },
        {
            queryParams: {
                q: StringParam,
                page: NumberParam,
                per_page: NumberParam,
                state: createEnumParam(['active', 'paused', 'closed']),
                funds_type: createEnumParam(['active', 'archived']),
                implementation_id: NumberParam,
            },
        },
    );

    const { resetFilters: resetFilters } = filter;

    const { headElement, configsElement } = useConfigurableTable(
        fundService.getColumns(activeOrganization, filterValues.funds_type),
    );

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(activeOrganization.id, {
                ...filterValuesActive,
                with_archived: 1,
                with_external: 1,
                stats: 'min',
                archived: filterValuesActive.funds_type == 'archived' ? 1 : 0,
                per_page: filterValuesActive.per_page,
            })
            .then((res) => setFunds(res.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [activeOrganization.id, filterValuesActive, fundService, pushApiError, setProgress]);

    const fetchImplementations = useCallback(() => {
        setProgress(0);

        implementationService
            .list(activeOrganization.id, { per_page: 100 })
            .then((res) => setImplementations([{ id: null, name: 'Alle implementaties' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, implementationService, setProgress]);

    const askConfirmation = useCallback(
        (type: string, onConfirm: () => void) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate(`modals.danger_zone.${type}.title`)}
                    description={translate(`modals.danger_zone.${type}.description`)}
                    buttonCancel={{
                        text: translate(`modals.danger_zone.${type}.buttons.cancel`),
                        onClick: modal.close,
                    }}
                    buttonSubmit={{
                        text: translate(`modals.danger_zone.${type}.buttons.confirm`),
                        onClick: () => {
                            onConfirm();
                            modal.close();
                        },
                    }}
                />
            ));
        },
        [openModal, translate],
    );

    const archiveFund = useCallback(
        (fund: Fund) => {
            askConfirmation('archive_fund', () => {
                setProgress(0);

                fundService
                    .archive(fund.organization_id, fund.id)
                    .then(() => {
                        filterUpdate({ funds_type: 'archived' });
                        pushSuccess('Opgeslagen!');
                    })
                    .catch(pushApiError)
                    .finally(() => setProgress(100));
            });
        },
        [askConfirmation, fundService, pushApiError, pushSuccess, setProgress, filterUpdate],
    );

    const restoreFund = useCallback(
        (e: React.MouseEvent, fund: Fund) => {
            e?.stopPropagation();
            e?.preventDefault();

            askConfirmation('restore_fund', () => {
                setProgress(0);

                fundService
                    .unarchive(fund.organization_id, fund.id)
                    .then(() => {
                        filterUpdate({ funds_type: 'active' });
                        pushSuccess('Opgeslagen!');
                    })
                    .catch(pushApiError)
                    .finally(() => setProgress(100));
            });
        },
        [askConfirmation, fundService, pushApiError, pushSuccess, setProgress, filterUpdate],
    );

    const topUpModal = useCallback(
        (fund: Fund) => {
            if (topUpInProgress) {
                return;
            }

            setTopUpInProgress(true);

            openModal((modal) => (
                <ModalFundTopUp modal={modal} fund={fund} onClose={() => setTopUpInProgress(false)} />
            ));
        },
        [openModal, topUpInProgress],
    );

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchImplementations();
    }, [fetchImplementations]);

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
                        {hasPermission(activeOrganization, Permission.MANAGE_FUNDS) && (
                            <StateNavLink
                                name={DashboardRoutes.FUND_CREATE}
                                params={{ organizationId: activeOrganization.id }}
                                className="button button-primary button-sm">
                                <em className="mdi mdi-plus-circle icon-start" />
                                {translate('components.organization_funds.buttons.add')}
                            </StateNavLink>
                        )}

                        {activeOrganization.allow_2fa_restrictions &&
                            hasPermission(activeOrganization, Permission.MANAGE_ORGANIZATION) && (
                                <StateNavLink
                                    name={DashboardRoutes.ORGANIZATION_SECURITY}
                                    query={{ view_type: 'funds' }}
                                    params={{ organizationId: activeOrganization.id }}
                                    className="button button-default button-sm">
                                    <em className="mdi mdi-security icon-start" />
                                    {translate('components.organization_funds.buttons.security')}
                                </StateNavLink>
                            )}

                        <div className="form">
                            <div className="flex">
                                <div>
                                    <div className="block block-label-tabs">
                                        <div className="label-tab-set">
                                            <div
                                                onClick={() => filterUpdate({ funds_type: 'active' })}
                                                className={`label-tab label-tab-sm ${
                                                    filterValues.funds_type == 'active' ? 'active' : ''
                                                }`}>
                                                Lopend ({funds.meta.unarchived_funds_total})
                                            </div>

                                            <div
                                                onClick={() => filterUpdate({ funds_type: 'archived' })}
                                                className={`label-tab label-tab-sm ${
                                                    filterValues.funds_type == 'archived' ? 'active' : ''
                                                }`}>
                                                Archief ({funds.meta.archived_funds_total})
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex">
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
                                            type="text"
                                            className="form-control"
                                            placeholder="Zoeken"
                                            value={filterValues.q}
                                            onChange={(e) => filterUpdate({ q: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <CardHeaderFilter filter={filter}>
                                <FilterItemToggle
                                    show={true}
                                    label={translate('components.organization_funds.filters.search')}>
                                    <input
                                        className="form-control"
                                        value={filterValues.q}
                                        onChange={(e) => filterUpdate({ q: e.target.value })}
                                        placeholder={translate('components.organization_funds.filters.search')}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('components.organization_funds.filters.state')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'key'}
                                        allowSearch={false}
                                        value={filterValues.state}
                                        options={statesOptions}
                                        onChange={(state: string) => filterUpdate({ state })}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle
                                    label={translate('components.organization_funds.filters.implementation')}>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'id'}
                                        allowSearch={false}
                                        value={filterValues.implementation_id}
                                        options={implementations}
                                        onChange={(implementation_id: number) => filterUpdate({ implementation_id })}
                                    />
                                </FilterItemToggle>
                            </CardHeaderFilter>
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

                                            {filterValues.funds_type == 'active' && (
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
                                                {!fund.archived ? (
                                                    <TableRowActions
                                                        content={({ close }) => (
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

                                                                {hasPermission(
                                                                    activeOrganization,
                                                                    [
                                                                        Permission.MANAGE_FUNDS,
                                                                        Permission.MANAGE_FUND_TEXTS,
                                                                    ],
                                                                    false,
                                                                ) && (
                                                                    <StateNavLink
                                                                        name={DashboardRoutes.FUND_EDIT}
                                                                        className="dropdown-item"
                                                                        params={{
                                                                            organizationId: activeOrganization.id,
                                                                            fundId: fund.id,
                                                                        }}>
                                                                        <em className="mdi mdi-pencil icon-start" />
                                                                        Bewerken
                                                                    </StateNavLink>
                                                                )}

                                                                {activeOrganization.allow_2fa_restrictions &&
                                                                    hasPermission(
                                                                        activeOrganization,
                                                                        Permission.MANAGE_FUNDS,
                                                                    ) && (
                                                                        <StateNavLink
                                                                            className="dropdown-item"
                                                                            name={DashboardRoutes.FUND_SECURITY}
                                                                            params={{
                                                                                fundId: fund.id,
                                                                                organizationId: activeOrganization.id,
                                                                            }}>
                                                                            <em className="mdi mdi-security icon-start" />
                                                                            Beveiliging
                                                                        </StateNavLink>
                                                                    )}

                                                                {hasPermission(
                                                                    activeOrganization,
                                                                    Permission.VIEW_FINANCES,
                                                                ) &&
                                                                    fund.key &&
                                                                    fund.state != 'closed' && (
                                                                        <a
                                                                            className={classNames(
                                                                                'dropdown-item',
                                                                                !fund.organization
                                                                                    .has_bank_connection && 'disabled',
                                                                            )}
                                                                            onClick={() => {
                                                                                topUpModal(fund);
                                                                                close();
                                                                            }}>
                                                                            <em className="mdi mdi-plus-circle icon-start" />
                                                                            Budget toevoegen
                                                                        </a>
                                                                    )}

                                                                {hasPermission(
                                                                    activeOrganization,
                                                                    Permission.MANAGE_FUNDS,
                                                                ) && (
                                                                    <a
                                                                        className={classNames(
                                                                            'dropdown-item',
                                                                            fund.state != 'closed' && 'disabled',
                                                                        )}
                                                                        onClick={() => {
                                                                            archiveFund(fund);
                                                                            close();
                                                                        }}>
                                                                        <em className="mdi mdi-download-box-outline icon-start" />
                                                                        {translate(
                                                                            'components.organization_funds.buttons.archive',
                                                                        )}
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    />
                                                ) : (
                                                    hasPermission(activeOrganization, Permission.MANAGE_FUNDS) && (
                                                        <button
                                                            className="button button-primary"
                                                            onClick={(e) => restoreFund(e, fund)}>
                                                            <em className="mdi mdi-lock-reset icon-start" />
                                                            {translate('components.organization_funds.buttons.restore')}
                                                        </button>
                                                    )
                                                )}
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
