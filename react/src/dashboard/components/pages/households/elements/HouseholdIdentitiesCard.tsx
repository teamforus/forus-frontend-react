import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import useSetProgress from '../../../../hooks/useSetProgress';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import FilterItemToggle from '../../../elements/tables/elements/FilterItemToggle';
import CardHeaderFilter from '../../../elements/tables/elements/CardHeaderFilter';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import usePushApiError from '../../../../hooks/usePushApiError';
import useSponsorIdentitiesService from '../../../../services/SponsorIdentitesService';
import TableRowActions from '../../../elements/tables/TableRowActions';
import TableRowActionItem from '../../../elements/tables/TableRowActionItem';
import IdentitiesTableRowItems from '../../identities/elements/IdentitiesTableRowItems';
import Household from '../../../../props/models/Sponsor/Household';
import useHouseholdAddIdentity from '../hooks/useHouseholdAddIdentity';
import useHouseholdDeleteIdentity from '../hooks/useHouseholdDeleteIdentity';
import { hasPermission } from '../../../../helpers/utils';
import { Permission } from '../../../../props/models/Organization';
import { PaginationData } from '../../../../props/ApiResponses';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import useHouseholdProfilesService from '../../../../services/HouseholdProfilesService';
import HouseholdProfile from '../../../../props/models/Sponsor/HouseholdProfile';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function HouseholdIdentitiesCard({ household }: { household: Household }) {
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();

    const sponsorIdentitiesService = useSponsorIdentitiesService();
    const householdProfilesService = useHouseholdProfilesService();

    const householdAddIdentity = useHouseholdAddIdentity(activeOrganization);
    const householdDeleteIdentity = useHouseholdDeleteIdentity(activeOrganization);

    const [loading, setLoading] = useState(false);
    const [paginatorKey] = useState('identities');

    const [householdMembers, setHouseholdMembers] = useState<PaginationData<HouseholdProfile>>(null);

    const paginatorService = usePaginatorService();

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q: string;
        page?: number;
        per_page?: number;
        order_by?: string;
        order_dir?: string;
    }>({
        q: '',
        page: 1,
        order_by: 'created_at',
        order_dir: 'desc',
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const fetchHouseholdMembers = useCallback(() => {
        setLoading(true);
        setProgress(0);

        householdProfilesService
            .list(household?.organization_id, household?.id, filterValuesActive)
            .then((res) => setHouseholdMembers(res.data))
            .catch(pushApiError)
            .finally(() => {
                setProgress(100);
                setLoading(false);
            });
    }, [
        setProgress,
        householdProfilesService,
        household?.organization_id,
        household?.id,
        filterValuesActive,
        pushApiError,
    ]);

    useEffect(() => {
        fetchHouseholdMembers();
    }, [fetchHouseholdMembers]);

    if (!householdMembers) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {`Personen binnen dit huishouden (${householdMembers?.meta?.total || 0})`}
                </div>

                <div className={'card-header-filters'}>
                    <div className="block block-inline-filters">
                        {hasPermission(activeOrganization, Permission.MANAGE_IDENTITIES) && (
                            <button
                                type="button"
                                className="button button-primary button-sm"
                                onClick={() => householdAddIdentity(household, fetchHouseholdMembers)}>
                                <em className="mdi mdi-plus-circle" />
                                Aanmaken
                            </button>
                        )}

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
                                        className="form-control"
                                        value={filterValues.q}
                                        onChange={(e) => filterUpdate({ q: e.target.value })}
                                        placeholder={'Zoek'}
                                    />
                                </div>
                            </div>
                        )}

                        <CardHeaderFilter filter={filter}>
                            <FilterItemToggle label={'Zoek'} show={true}>
                                <input
                                    className="form-control"
                                    value={filterValues.q}
                                    onChange={(e) => filterUpdate({ q: e.target.value })}
                                    placeholder={'Zoek'}
                                />
                            </FilterItemToggle>
                        </CardHeaderFilter>
                    </div>
                </div>
            </div>

            <LoaderTableCard
                loading={loading}
                empty={householdMembers?.meta?.total == 0}
                emptyTitle={'Geen personen gevonden'}
                columns={sponsorIdentitiesService.getColumns(activeOrganization)}
                tableOptions={{ filter, sortable: false, hasTooltips: true }}
                paginator={{ key: paginatorKey, data: householdMembers, filterValues, filterUpdate }}>
                {householdMembers?.data?.map((member) => (
                    <StateNavLink
                        key={member?.identity.id}
                        name={DashboardRoutes.IDENTITY}
                        dataDusk={`tableProfilesRow${member?.identity.id}`}
                        params={{
                            organizationId: activeOrganization.id,
                            id: member?.identity.id,
                        }}
                        className={'tr-clickable'}
                        customElement={'tr'}>
                        <IdentitiesTableRowItems
                            actions={
                                <TableRowActions
                                    content={(e) => (
                                        <div className="dropdown dropdown-actions">
                                            <TableRowActionItem
                                                type={'link'}
                                                name={DashboardRoutes.IDENTITY}
                                                params={{
                                                    organizationId: activeOrganization.id,
                                                    id: member?.identity.id,
                                                }}>
                                                <em className="mdi mdi-eye-outline icon-start" />
                                                Bekijken
                                            </TableRowActionItem>
                                            <TableRowActionItem
                                                type={'button'}
                                                onClick={() => {
                                                    e?.close();
                                                    householdDeleteIdentity(member, fetchHouseholdMembers);
                                                }}>
                                                <em className="mdi mdi-close icon-start" />
                                                Verwijderen
                                            </TableRowActionItem>
                                        </div>
                                    )}
                                />
                            }
                            identity={member?.identity}
                            organization={activeOrganization}
                        />
                    </StateNavLink>
                ))}
            </LoaderTableCard>
        </div>
    );
}
