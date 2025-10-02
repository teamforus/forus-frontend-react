import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import useSetProgress from '../../../../hooks/useSetProgress';
import Paginator from '../../../../modules/paginator/components/Paginator';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import FilterItemToggle from '../../../elements/tables/elements/FilterItemToggle';
import CardHeaderFilter from '../../../elements/tables/elements/CardHeaderFilter';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import usePushApiError from '../../../../hooks/usePushApiError';
import useSponsorIdentitiesService from '../../../../services/SponsorIdentitesService';
import TableRowActions from '../../../elements/tables/TableRowActions';
import TableRowActionItem from '../../../elements/tables/TableRowActionItem';
import useIdentityRelationEdit from '../hooks/useIdentityRelationEdit';
import useIdentityRelationDelete from '../hooks/useIdentityRelationDelete';
import Organization from '../../../../props/models/Organization';
import { PaginationData } from '../../../../props/ApiResponses';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';
import SponsorProfileRelation from '../../../../props/models/Sponsor/SponsorProfileRelation';
import ProfileRelationsTableRowItem from './ProfileRelationsTableRowItem';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

export default function ProfileRelationsCard({
    organization,
    identity,
}: {
    organization: Organization;
    identity: SponsorIdentity;
}) {
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();

    const sponsorIdentitiesService = useSponsorIdentitiesService();

    const identityRelationEdit = useIdentityRelationEdit(activeOrganization);
    const identityRelationDelete = useIdentityRelationDelete(activeOrganization);

    const [loading, setLoading] = useState(false);
    const [paginatorKey] = useState('identities');

    const [relations, setRelations] = useState<PaginationData<SponsorProfileRelation>>(null);

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

    const fetchIdentityRelations = useCallback(() => {
        setLoading(true);
        setProgress(0);

        sponsorIdentitiesService
            .listRelations(organization.id, identity?.id, filterValuesActive)
            .then((res) => setRelations(res.data))
            .catch(pushApiError)
            .finally(() => {
                setProgress(100);
                setLoading(false);
            });
    }, [filterValuesActive, identity?.id, organization.id, pushApiError, setProgress, sponsorIdentitiesService]);

    const { headElement, configsElement } = useConfigurableTable(
        sponsorIdentitiesService.getColumnsRelations(activeOrganization),
        { filter: filter, sortable: false, hasTooltips: true },
    );

    useEffect(() => {
        fetchIdentityRelations();
    }, [fetchIdentityRelations]);

    if (!relations) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">{`Relaties (${relations?.meta?.total || 0})`}</div>

                <div className={'card-header-filters'}>
                    <div className="block block-inline-filters">
                        <button
                            type="button"
                            className="button button-primary button-sm"
                            onClick={() => identityRelationEdit(identity, null, fetchIdentityRelations)}>
                            <em className="mdi mdi-plus-circle" />
                            Aanmaken
                        </button>

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

            <LoaderTableCard loading={loading} empty={relations.meta.total == 0} emptyTitle={'Geen relaties gevonden'}>
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {relations.data.map((relation) => (
                                        <StateNavLink
                                            name={'identities-show'}
                                            params={{
                                                organizationId: activeOrganization.id,
                                                id:
                                                    relation?.identity_id === identity?.id
                                                        ? relation?.related_identity_id
                                                        : relation?.identity_id,
                                            }}
                                            className={'tr-clickable'}
                                            customElement={'tr'}
                                            key={relation?.id}>
                                            <ProfileRelationsTableRowItem
                                                actions={
                                                    <TableRowActions
                                                        content={(e) => (
                                                            <div className="dropdown dropdown-actions">
                                                                <TableRowActionItem
                                                                    type={'link'}
                                                                    name={'identities-show'}
                                                                    params={{
                                                                        organizationId: activeOrganization.id,
                                                                        id:
                                                                            relation?.identity_id === identity?.id
                                                                                ? relation?.related_identity_id
                                                                                : relation?.identity_id,
                                                                    }}>
                                                                    <em className="mdi mdi-eye-outline icon-start" />
                                                                    Bekijken
                                                                </TableRowActionItem>
                                                                <TableRowActionItem
                                                                    type={'button'}
                                                                    onClick={() => {
                                                                        e?.close();
                                                                        identityRelationEdit(
                                                                            identity,
                                                                            relation,
                                                                            fetchIdentityRelations,
                                                                        );
                                                                    }}>
                                                                    <em className="mdi mdi-pencil icon-start" />
                                                                    Wijzigen
                                                                </TableRowActionItem>
                                                                <TableRowActionItem
                                                                    type={'button'}
                                                                    onClick={() => {
                                                                        e?.close();
                                                                        identityRelationDelete(
                                                                            relation,
                                                                            fetchIdentityRelations,
                                                                        );
                                                                    }}>
                                                                    <em className="mdi mdi-close icon-start" />
                                                                    Verwijderen
                                                                </TableRowActionItem>
                                                            </div>
                                                        )}
                                                    />
                                                }
                                                relation={relation}
                                                identity={identity}
                                                organization={activeOrganization}
                                            />
                                        </StateNavLink>
                                    ))}
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>

                {relations.meta.total > 0 && (
                    <div className="card-section">
                        <Paginator
                            meta={relations.meta}
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
