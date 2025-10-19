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
import TableRowActions from '../../../../elements/tables/TableRowActions';
import { hasPermission } from '../../../../../helpers/utils';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import Implementation from '../../../../../props/models/Implementation';
import Label from '../../../../elements/image_cropper/Label';
import { Permission } from '../../../../../props/models/Organization';
import useConfigurableTable from '../../../vouchers/hooks/useConfigurableTable';
import TableTopScroller from '../../../../elements/tables/TableTopScroller';
import { useFundService } from '../../../../../services/FundService';
import useFilterNext from '../../../../../modules/filter_next/useFilterNext';
import CardHeaderFilter from '../../../../elements/tables/elements/CardHeaderFilter';

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

    const { headElement, configsElement } = useConfigurableTable(fundService.getImplementationsColumns());

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

            {implementations ? (
                <Fragment>
                    {implementations?.meta?.total > 0 ? (
                        <div className="card-section card-section-padless">
                            {configsElement}

                            <TableTopScroller>
                                <table className="table">
                                    {headElement}

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
                                                                    href={
                                                                        implementation?.url_webshop + 'funds/' + fund.id
                                                                    }
                                                                    rel="noreferrer">
                                                                    <em className="mdi mdi-open-in-new icon-start" />{' '}
                                                                    Bekijk op webshop
                                                                </a>

                                                                {hasPermission(
                                                                    activeOrganization,
                                                                    Permission.MANAGE_IMPLEMENTATION_CMS,
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
                            filters={filterValues}
                            updateFilters={filterUpdate}
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
