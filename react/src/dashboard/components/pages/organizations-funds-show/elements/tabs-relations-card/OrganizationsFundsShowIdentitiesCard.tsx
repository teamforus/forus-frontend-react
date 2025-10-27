import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Fund from '../../../../../props/models/Fund';
import ClickOutside from '../../../../elements/click-outside/ClickOutside';
import FilterItemToggle from '../../../../elements/tables/elements/FilterItemToggle';
import EmptyCard from '../../../../elements/empty-card/EmptyCard';
import Paginator from '../../../../../modules/paginator/components/Paginator';
import useTranslate from '../../../../../hooks/useTranslate';
import useActiveOrganization from '../../../../../hooks/useActiveOrganization';
import usePaginatorService from '../../../../../modules/paginator/services/usePaginatorService';
import { PaginationData } from '../../../../../props/ApiResponses';
import useFilter from '../../../../../hooks/useFilter';
import LoadingCard from '../../../../elements/loading-card/LoadingCard';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import SponsorIdentity from '../../../../../props/models/Sponsor/SponsorIdentity';
import useSetProgress from '../../../../../hooks/useSetProgress';
import { useFundService } from '../../../../../services/FundService';
import useFundIdentitiesExporter from '../../../../../services/exporters/useFundIdentitiesExporter';
import { hasPermission } from '../../../../../helpers/utils';
import { Permission } from '../../../../../props/models/Organization';
import useConfigurableTable from '../../../vouchers/hooks/useConfigurableTable';
import TableTopScroller from '../../../../elements/tables/TableTopScroller';
import TableRowActions from '../../../../elements/tables/TableRowActions';
import { DashboardRoutes } from '../../../../../modules/state_router/RouterBuilder';

export default function OrganizationsFundsShowIdentitiesCard({
    fund,
    viewType,
    setViewType,
    viewTypes,
}: {
    fund: Fund;
    viewType: 'top_ups' | 'implementations' | 'identities';
    setViewType: React.Dispatch<React.SetStateAction<'top_ups' | 'implementations' | 'identities'>>;
    viewTypes: Array<{ key: 'top_ups' | 'implementations' | 'identities'; name: string }>;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const activeOrganization = useActiveOrganization();
    const fundIdentitiesExporter = useFundIdentitiesExporter();

    const fundService = useFundService();
    const paginatorService = usePaginatorService();

    const [identities, setIdentities] = useState<PaginationData<SponsorIdentity>>(null);
    const [identitiesActive, setIdentitiesActive] = useState<number>(0);
    const [lastQueryIdentities, setLastQueryIdentities] = useState<string>('');
    const [identitiesWithoutEmail, setIdentitiesWithoutEmail] = useState<number>(0);

    const [paginationPerPageKey] = useState('fund_identities_per_page');

    const filter = useFilter({
        per_page: paginatorService.getPerPage(paginationPerPageKey),
    });

    const { headElement, configsElement } = useConfigurableTable(fundService.getIdentitiesColumns(), {
        filter,
        sortable: true,
    });

    const fetchIdentities = useCallback(() => {
        setProgress(0);

        fundService
            .listIdentities(activeOrganization.id, fund.id, filter.activeValues)
            .then((res) => {
                setIdentities(res.data);
                setIdentitiesActive(res.data.meta.counts['active']);
                setIdentitiesWithoutEmail(res.data.meta.counts['without_email']);
                setLastQueryIdentities(filter.activeValues.q);
            })
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization.id, fund.id, filter.activeValues]);

    const exportIdentities = useCallback(() => {
        fundIdentitiesExporter.exportData(activeOrganization.id, fund.id, filter.activeValues);
    }, [activeOrganization.id, fund?.id, fundIdentitiesExporter, filter.activeValues]);

    useEffect(() => {
        fetchIdentities();
    }, [fetchIdentities]);

    return (
        <div className="card" data-dusk="tableIdentityContent">
            <div className="card-header">
                <div className="flex flex-grow">
                    <div className="card-title">
                        {translate(`funds_show.titles.${viewType}`)}
                        {identities?.meta && <span>&nbsp;({identities?.meta?.total || 0})</span>}
                    </div>
                </div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <div className="block block-label-tabs">
                            <div className="label-tab-set">
                                {viewTypes?.map((type) => (
                                    <div
                                        key={type.key}
                                        data-dusk={`${type.key}_tab`}
                                        className={`label-tab label-tab-sm ${viewType == type.key ? 'active' : ''}`}
                                        onClick={() => setViewType(type.key)}>
                                        {type.name}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="block block-inline-filters">
                            {filter.show && (
                                <div className="button button-text" onClick={() => filter.resetFilters()}>
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
                                            defaultValue={filter.values.q}
                                            placeholder="Zoeken"
                                            data-dusk="tableIdentitySearch"
                                            onChange={(e) =>
                                                filter.update({
                                                    q: e.target.value,
                                                })
                                            }
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
                                                    label={translate('funds_show.top_up_table.filters.search')}>
                                                    <input
                                                        className="form-control"
                                                        value={filter.values.q}
                                                        onChange={(e) =>
                                                            filter.update({
                                                                q: e.target.value,
                                                            })
                                                        }
                                                        placeholder={translate(
                                                            'funds_show.top_up_table.filters.search',
                                                        )}
                                                    />
                                                </FilterItemToggle>

                                                <div className="form-actions">
                                                    <button
                                                        className="button button-primary button-wide"
                                                        data-dusk="export"
                                                        onClick={() => exportIdentities()}>
                                                        <em className="mdi mdi-download icon-start" />
                                                        <span>
                                                            {translate('components.dropdown.export', {
                                                                total: identities.meta.total,
                                                            })}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        className="button button-default button-icon"
                                        data-dusk="showFilters"
                                        onClick={() => filter.setShow(!filter.show)}>
                                        <em className="mdi mdi-filter-outline" />
                                    </div>
                                </div>
                            </ClickOutside>
                        </div>
                    </div>
                </div>
            </div>

            {identities ? (
                <Fragment>
                    {identities?.meta?.total > 0 ? (
                        <div className="card-section card-section-padless">
                            {configsElement}

                            <TableTopScroller>
                                <table className="table">
                                    {headElement}

                                    <tbody>
                                        {identities.data.map((identity: SponsorIdentity, index: number) => (
                                            <tr key={index} data-dusk={`tableIdentityRow${identity.id}`}>
                                                <td>{identity.id}</td>
                                                <td>{identity.email}</td>
                                                <td>{identity.count_vouchers}</td>
                                                <td>{identity.count_vouchers_active}</td>
                                                <td>{identity.count_vouchers_active_with_balance}</td>

                                                <td className={'table-td-actions text-right'}>
                                                    <TableRowActions
                                                        disabled={
                                                            !hasPermission(
                                                                activeOrganization,
                                                                [
                                                                    Permission.VIEW_IDENTITIES,
                                                                    Permission.MANAGE_IDENTITIES,
                                                                ],
                                                                false,
                                                            )
                                                        }
                                                        content={() => (
                                                            <div className="dropdown dropdown-actions">
                                                                <StateNavLink
                                                                    className="dropdown-item"
                                                                    name={DashboardRoutes.IDENTITY}
                                                                    params={{
                                                                        organizationId: fund.organization_id,
                                                                        id: identity.id,
                                                                    }}>
                                                                    <em className="icon-start mdi mdi-eye-outline" />
                                                                    Bekijken
                                                                </StateNavLink>
                                                            </div>
                                                        )}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TableTopScroller>
                        </div>
                    ) : (
                        <EmptyCard
                            title={'Geen gebruikers gevonden'}
                            type={'card-section'}
                            description={
                                lastQueryIdentities ? `Geen gebruikers gevonden voor "${lastQueryIdentities}"` : null
                            }
                        />
                    )}

                    <div className="card-section card-section-narrow" hidden={identities.meta.total < 1}>
                        <Paginator
                            meta={identities.meta}
                            filters={filter.activeValues}
                            updateFilters={filter.update}
                            perPageKey={paginationPerPageKey}
                        />
                    </div>
                </Fragment>
            ) : (
                <LoadingCard type={'card-section'} />
            )}

            {identities?.meta?.total > 0 && (
                <div className="card-section card-section-primary">
                    <div className="card-block card-block-keyvalue card-block-keyvalue-horizontal row">
                        <div className="keyvalue-item col col-lg-4">
                            <div className="keyvalue-key">Aanvragers met tegoeden</div>
                            <div className="keyvalue-value">
                                <span>{identitiesActive}</span>
                                <span className="icon mdi mdi-account-multiple-outline" />
                            </div>
                        </div>

                        <div className="keyvalue-item col col-lg-4">
                            <div className="keyvalue-key">Aanvragers zonder e-mailadres</div>
                            <div className="keyvalue-value">
                                <span>{identitiesWithoutEmail}</span>
                                <span className="icon mdi mdi-email-off-outline" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
