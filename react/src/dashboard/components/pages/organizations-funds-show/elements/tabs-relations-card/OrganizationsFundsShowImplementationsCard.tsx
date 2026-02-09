import React, { useCallback, useEffect, useState } from 'react';
import Fund from '../../../../../props/models/Fund';
import FilterItemToggle from '../../../../elements/tables/elements/FilterItemToggle';
import LoaderTableCard from '../../../../elements/loader-table-card/LoaderTableCard';
import useTranslate from '../../../../../hooks/useTranslate';
import useActiveOrganization from '../../../../../hooks/useActiveOrganization';
import usePaginatorService from '../../../../../modules/paginator/services/usePaginatorService';
import { PaginationData } from '../../../../../props/ApiResponses';
import TableRowActions from '../../../../elements/tables/TableRowActions';
import { hasPermission } from '../../../../../helpers/utils';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import Implementation from '../../../../../props/models/Implementation';
import Label from '../../../../elements/image_cropper/Label';
import { Permission } from '../../../../../props/models/Organization';
import { useFundService } from '../../../../../services/FundService';
import { DashboardRoutes } from '../../../../../modules/state_router/RouterBuilder';
import useFilterNext from '../../../../../modules/filter_next/useFilterNext';
import CardHeaderFilter from '../../../../elements/tables/elements/CardHeaderFilter';
import BlockLabelTabs from '../../../../elements/block-label-tabs/BlockLabelTabs';

export default function OrganizationsFundsShowImplementationsCard({
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
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const activeOrganization = useActiveOrganization();

    const paginatorService = usePaginatorService();
    const fundService = useFundService();

    const [paginationPerPageKey] = useState('fund_implementation_per_page');
    const [lastQueryImplementations, setLastQueryImplementations] = useState<string>('');
    const [implementations, setImplementations] = useState<PaginationData<Implementation>>(null);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{ q: string; per_page?: number }>({
        q: '',
        per_page: paginatorService.getPerPage(paginationPerPageKey),
    });

    const { resetFilters: resetFilters } = filter;

    const transformImplementations = useCallback(() => {
        const { q = '', per_page } = filterValuesActive;
        const links = { active: false, label: '', url: '' };

        setLastQueryImplementations(q);

        if (
            fund?.implementation &&
            (!q || fund?.implementation?.name?.toLowerCase().includes(q?.toLowerCase().trim()))
        ) {
            setImplementations({
                data: [fund.implementation],
                meta: { total: 1, current_page: 1, per_page, from: 1, to: 1, last_page: 1, path: '', links },
            });
        } else {
            setImplementations({
                data: [],
                meta: { total: 0, current_page: 1, per_page, from: 0, to: 0, last_page: 1, path: '', links },
            });
        }
    }, [filterValuesActive, fund?.implementation]);

    useEffect(() => {
        transformImplementations();
    }, [viewType, transformImplementations]);

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex flex-grow">
                    <div className="card-title">
                        {translate(`funds_show.titles.${viewType}`)}
                        {implementations?.meta && <span>&nbsp;({implementations?.meta?.total || 0})</span>}
                    </div>
                </div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <BlockLabelTabs
                            value={viewType}
                            setValue={(type) => setViewType(type)}
                            tabs={viewTypes?.map((type) => ({
                                value: type.key,
                                dusk: `${type.key}_tab`,
                                label: type.name,
                            }))}
                        />

                        <div className="block block-inline-filters">
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
                                            defaultValue={filterValues.q}
                                            placeholder="Zoeken"
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
                                    label={translate('funds_show.implementations_table.filters.search')}>
                                    <input
                                        className="form-control"
                                        value={filterValues.q}
                                        onChange={(e) =>
                                            filterUpdate({
                                                q: e.target.value,
                                            })
                                        }
                                        placeholder={translate('funds_show.implementations_table.filters.search')}
                                    />
                                </FilterItemToggle>
                            </CardHeaderFilter>
                        </div>
                    </div>
                </div>
            </div>

            <LoaderTableCard
                loading={!implementations}
                empty={implementations?.meta?.total === 0}
                emptyTitle="No webshops"
                emptyDescription={
                    lastQueryImplementations
                        ? `Could not find any webshops for "${lastQueryImplementations}"`
                        : undefined
                }
                columns={fundService.getImplementationsColumns()}
                paginator={{ key: paginationPerPageKey, data: implementations, filterValues, filterUpdate }}>
                {implementations?.data?.map((implementation) => (
                    <tr key={implementation?.id}>
                        <td className="td-narrow">
                            <img
                                className="td-media"
                                src={assetUrl('/assets/img/placeholders/organization-thumbnail.png')}
                                alt={''}></img>
                        </td>
                        <td>{implementation?.name}</td>
                        {fund.state == 'active' && (
                            <td>
                                <Label type="success">Zichtbaar</Label>
                            </td>
                        )}
                        {fund.state != 'active' && (
                            <td>
                                <Label type="default">Onzichtbaar</Label>
                            </td>
                        )}

                        <td className="td-narrow text-right">
                            <TableRowActions
                                content={() => (
                                    <div className="dropdown dropdown-actions">
                                        <a
                                            className="dropdown-item"
                                            target="_blank"
                                            href={implementation?.url_webshop + 'funds/' + fund.id}
                                            rel="noreferrer">
                                            <em className="mdi mdi-open-in-new icon-start" /> Bekijk op webshop
                                        </a>

                                        {hasPermission(activeOrganization, Permission.MANAGE_IMPLEMENTATION_CMS) && (
                                            <StateNavLink
                                                name={DashboardRoutes.IMPLEMENTATION}
                                                params={{
                                                    id: implementation?.id,
                                                    organizationId: fund.organization_id,
                                                }}
                                                className="dropdown-item">
                                                <em className="mdi mdi-store-outline icon-start" />
                                                Ga naar CMS
                                            </StateNavLink>
                                        )}
                                    </div>
                                )}
                            />
                        </td>
                    </tr>
                ))}
            </LoaderTableCard>
        </div>
    );
}
