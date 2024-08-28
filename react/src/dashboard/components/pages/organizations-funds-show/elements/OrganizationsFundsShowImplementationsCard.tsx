import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Fund from '../../../../props/models/Fund';
import ClickOutside from '../../../elements/click-outside/ClickOutside';
import FilterItemToggle from '../../../elements/tables/elements/FilterItemToggle';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import Paginator from '../../../../modules/paginator/components/Paginator';
import useTranslate from '../../../../hooks/useTranslate';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import { PaginationData } from '../../../../props/ApiResponses';
import useFilter from '../../../../hooks/useFilter';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import TableRowActions from '../../../elements/tables/TableRowActions';
import { hasPermission } from '../../../../helpers/utils';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import Implementation from '../../../../props/models/Implementation';

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

    const [paginationPerPageKey] = useState('fund_implementation_per_page');
    const [lastQueryImplementations, setLastQueryImplementations] = useState<string>('');
    const [shownImplementationMenuId, setShownImplementationMenuId] = useState<number>(null);
    const [implementations, setImplementations] = useState<PaginationData<Implementation>>(null);

    const filter = useFilter({
        q: '',
        per_page: paginatorService.getPerPage(paginationPerPageKey),
    });

    const transformImplementations = useCallback(() => {
        const { q = '', per_page } = filter.activeValues;
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
    }, [filter.activeValues, fund?.implementation]);

    useEffect(() => {
        transformImplementations();
    }, [viewType, transformImplementations]);

    return (
        <div className="card">
            <div className="card-header card-header-next">
                <div className="flex flex-grow">
                    <div className="card-title">
                        {translate(`funds_show.titles.${viewType}`)}
                        {implementations?.meta && <span>&nbsp;({implementations?.meta?.total || 0})</span>}
                    </div>
                </div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <div className="block block-label-tabs">
                            <div className="label-tab-set">
                                {viewTypes?.map((type) => (
                                    <div
                                        key={type.key}
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
                                                    label={translate(
                                                        'funds_show.implementations_table.filters.search',
                                                    )}>
                                                    <input
                                                        className="form-control"
                                                        value={filter.values.q}
                                                        onChange={(e) =>
                                                            filter.update({
                                                                q: e.target.value,
                                                            })
                                                        }
                                                        placeholder={translate(
                                                            'funds_show.implementations_table.filters.search',
                                                        )}
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

            {implementations ? (
                <Fragment>
                    {implementations?.meta?.total > 0 ? (
                        <div className="card-section card-section-padless">
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th className="td-narrow">Afbeelding</th>
                                            <th>Naam</th>
                                            <th>Status</th>
                                            <th>Acties</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {implementations?.data?.map((implementation) => (
                                            <tr key={implementation?.id}>
                                                <td className="td-narrow">
                                                    <img
                                                        className="td-media"
                                                        src={assetUrl(
                                                            '/assets/img/placeholders/organization-thumbnail.png',
                                                        )}
                                                        alt={''}></img>
                                                </td>
                                                <td>{implementation?.name}</td>
                                                {fund.state == 'active' && (
                                                    <td>
                                                        <div className="label label-success">Zichtbaar</div>
                                                    </td>
                                                )}
                                                {fund.state != 'active' && (
                                                    <td>
                                                        <div className="label label-success">Onzichtbaar</div>
                                                    </td>
                                                )}

                                                <td className="td-narrow text-right">
                                                    <TableRowActions
                                                        activeId={shownImplementationMenuId}
                                                        setActiveId={setShownImplementationMenuId}
                                                        id={implementation.id}>
                                                        <div className="dropdown dropdown-actions">
                                                            <a
                                                                className="dropdown-item"
                                                                target="_blank"
                                                                href={implementation?.url_webshop + 'funds/' + fund.id}
                                                                rel="noreferrer">
                                                                <em className="mdi mdi-open-in-new icon-start" /> Bekijk
                                                                op webshop
                                                            </a>

                                                            {hasPermission(
                                                                activeOrganization,
                                                                'manage_implementation_cms',
                                                            ) && (
                                                                <StateNavLink
                                                                    name={'implementations-view'}
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
                                                    </TableRowActions>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <EmptyCard
                            title="No webshops"
                            type={'card-section'}
                            description={
                                lastQueryImplementations
                                    ? `Could not find any webshops for "${lastQueryImplementations}"`
                                    : null
                            }
                        />
                    )}

                    <div className="card-section card-section-narrow" hidden={implementations?.meta?.last_page < 2}>
                        <Paginator
                            meta={implementations.meta}
                            filters={filter.activeValues}
                            updateFilters={filter.update}
                            perPageKey={paginationPerPageKey}
                        />
                    </div>
                </Fragment>
            ) : (
                <LoadingCard type={'card-section'} />
            )}
        </div>
    );
}
