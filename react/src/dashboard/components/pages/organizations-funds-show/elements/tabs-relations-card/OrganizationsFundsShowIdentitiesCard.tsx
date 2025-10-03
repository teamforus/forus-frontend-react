import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Fund from '../../../../../props/models/Fund';
import FilterItemToggle from '../../../../elements/tables/elements/FilterItemToggle';
import EmptyCard from '../../../../elements/empty-card/EmptyCard';
import Paginator from '../../../../../modules/paginator/components/Paginator';
import useTranslate from '../../../../../hooks/useTranslate';
import useActiveOrganization from '../../../../../hooks/useActiveOrganization';
import usePaginatorService from '../../../../../modules/paginator/services/usePaginatorService';
import { PaginationData } from '../../../../../props/ApiResponses';
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
import useFilterNext from '../../../../../modules/filter_next/useFilterNext';
import CardHeaderFilter from '../../../../elements/tables/elements/CardHeaderFilter';

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

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{ q: string; per_page?: number }>({
        q: '',
        per_page: paginatorService.getPerPage(paginationPerPageKey),
    });

    const { headElement, configsElement } = useConfigurableTable(fundService.getIdentitiesColumns(), {
        filter,
        sortable: true,
    });

    const fetchIdentities = useCallback(() => {
        setProgress(0);

        fundService
            .listIdentities(activeOrganization.id, fund.id, filterValuesActive)
            .then((res) => {
                setIdentities(res.data);
                setIdentitiesActive(res.data.meta.counts['active']);
                setIdentitiesWithoutEmail(res.data.meta.counts['without_email']);
                setLastQueryIdentities(filterValuesActive.q);
            })
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization.id, fund.id, filterValuesActive]);

    const exportIdentities = useCallback(() => {
        fundIdentitiesExporter.exportData(activeOrganization.id, fund.id, filterValuesActive);
    }, [activeOrganization.id, fund?.id, fundIdentitiesExporter, filterValuesActive]);

    useEffect(() => {
        fetchIdentities();
    }, [fetchIdentities]);

    if (!identities) {
        return <LoadingCard />;
    }

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
                                            defaultValue={filterValues.q}
                                            placeholder="Zoeken"
                                            data-dusk="tableIdentitySearch"
                                            onChange={(e) =>
                                                filterUpdate({
                                                    q: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            <CardHeaderFilter filter={filter}>
                                <FilterItemToggle
                                    show={true}
                                    label={translate('funds_show.top_up_table.filters.search')}>
                                    <input
                                        className="form-control"
                                        value={filterValues.q}
                                        onChange={(e) =>
                                            filterUpdate({
                                                q: e.target.value,
                                            })
                                        }
                                        placeholder={translate('funds_show.top_up_table.filters.search')}
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
                            </CardHeaderFilter>
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
                                                                    name={'identities-show'}
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
                            filters={filterValues}
                            updateFilters={filterUpdate}
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
