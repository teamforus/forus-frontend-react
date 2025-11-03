import { PaginationData } from '../../../../props/ApiResponses';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TableRowActions from '../../../elements/tables/TableRowActions';
import Paginator from '../../../../modules/paginator/components/Paginator';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import React, { useCallback, useEffect, useState } from 'react';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import { usePhysicalCardService } from '../../../../services/PhysicalCardService';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import Organization from '../../../../props/models/Organization';
import useTranslate from '../../../../hooks/useTranslate';
import useSetProgress from '../../../../hooks/useSetProgress';
import BlockLabelTabs from '../../../elements/block-label-tabs/BlockLabelTabs';
import SelectControl from '../../../elements/select-control/SelectControl';
import SelectControlOptionsFund from '../../../elements/select-control/templates/SelectControlOptionsFund';
import Fund from '../../../../props/models/Fund';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import { StringParam } from 'use-query-params';
import CardHeaderFilterNext from '../../../elements/tables/elements/CardHeaderFilterNext';
import FilterItemToggle from '../../../elements/tables/elements/FilterItemToggle';
import SponsorPhysicalCard from '../../../../props/models/Sponsor/SponsorPhysicalCard';
import { strLimit } from '../../../../helpers/string';
import BlockInlineCopy from '../../../elements/block-inline-copy/BlockInlineCopy';
import PhysicalCardType from '../../../../props/models/PhysicalCardType';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function PhysicalCardsTable({
    tab,
    tabs,
    funds,
    setTab,
    organization,
    physicalCardType,
}: {
    tab: 'physical_cards' | 'physical_card_types';
    tabs: Array<{ value: 'physical_cards' | 'physical_card_types'; label: string }>;
    funds: Array<Partial<Fund>>;
    setTab: React.Dispatch<React.SetStateAction<'physical_cards' | 'physical_card_types'>>;
    organization: Organization;
    physicalCardType?: PhysicalCardType;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const [paginatorKey] = useState('physical-cards');
    const [physicalCards, setPhysicalCards] = useState<PaginationData<SponsorPhysicalCard>>(null);

    const paginatorService = usePaginatorService();
    const physicalCardService = usePhysicalCardService();

    const [filterValues, filterActiveValues, filterUpdate, filter] = useFilterNext<{
        q: string;
        page?: number;
        fund_id?: number;
        per_page?: number;
    }>(
        {
            q: '',
            page: 1,
            fund_id: null,
            per_page: paginatorService.getPerPage(paginatorKey),
        },
        {
            queryParams: {
                q: StringParam,
                page: StringParam,
                fund_id: StringParam,
                per_page: StringParam,
            },
        },
    );

    const { headElement, configsElement } = useConfigurableTable(physicalCardService.getColumns(), {
        sortable: true,
        filter: filter,
    });

    const fetchPhysicalCards = useCallback(() => {
        setProgress(0);

        physicalCardService
            .list(organization.id, { ...filterActiveValues, physical_card_type_id: physicalCardType?.id })
            .then((res) => setPhysicalCards(res.data))
            .finally(() => setProgress(100));
    }, [physicalCardService, organization.id, setProgress, filterActiveValues, physicalCardType?.id]);

    useEffect(() => {
        fetchPhysicalCards();
    }, [fetchPhysicalCards]);

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">{`Fysieke passen (${physicalCards?.meta?.total || 0})`}</div>

                <div className="card-header-filters">
                    <div className="block block-inline-filters form">
                        <BlockLabelTabs value={tab} setValue={setTab} tabs={tabs} />

                        <div className="form-group">
                            <SelectControl
                                className="form-control inline-filter-control"
                                propKey={'id'}
                                options={funds}
                                value={filterActiveValues.fund_id}
                                placeholder={'Fonds'}
                                allowSearch={false}
                                onChange={(fund_id: number) => filterUpdate({ fund_id })}
                                optionsComponent={SelectControlOptionsFund}
                            />
                        </div>

                        <CardHeaderFilterNext filter={filter}>
                            <FilterItemToggle show={true} label={'Zoeken'}>
                                <input
                                    type="text"
                                    value={filter.values?.q}
                                    onChange={(e) => filterUpdate({ q: e.target.value })}
                                    placeholder={'Zoeken'}
                                    className="form-control"
                                />
                            </FilterItemToggle>
                        </CardHeaderFilterNext>
                    </div>
                </div>
            </div>

            <LoaderTableCard
                loading={!physicalCards?.meta}
                empty={physicalCards?.meta?.total === 0}
                emptyTitle={'Geen fysieke passen'}
                emptyDescription={'Er zijn momenteel geen fysieke passen.'}>
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {physicalCards?.data.map((card) => (
                                        <tr key={card.id}>
                                            <td className={'td-narrow'}>{card.id}</td>
                                            <td className={'text-strong'}>
                                                <BlockInlineCopy value={card.code}>{card.code_locale}</BlockInlineCopy>
                                            </td>
                                            <td>
                                                {card?.voucher ? (
                                                    <StateNavLink
                                                        className={'text-primary text-underline text-semibold'}
                                                        name={DashboardRoutes.VOUCHER}
                                                        params={{
                                                            id: card?.voucher.id,
                                                            organizationId: organization.id,
                                                        }}>{`#${card?.voucher?.number}`}</StateNavLink>
                                                ) : (
                                                    <TableEmptyValue />
                                                )}
                                            </td>
                                            <td>
                                                {card?.voucher?.fund ? (
                                                    <StateNavLink
                                                        className={'text-primary text-underline text-semibold'}
                                                        name={DashboardRoutes.VOUCHER}
                                                        params={{
                                                            id: card?.voucher.id,
                                                            organizationId: organization.id,
                                                        }}>
                                                        {strLimit(card?.voucher?.fund.name, 64)}
                                                    </StateNavLink>
                                                ) : (
                                                    <TableEmptyValue />
                                                )}
                                            </td>
                                            <td>
                                                {card?.physical_card_type ? (
                                                    <StateNavLink
                                                        className={'text-primary text-underline text-semibold'}
                                                        name={DashboardRoutes.PHYSICAL_CARD_TYPE}
                                                        params={{
                                                            id: card?.physical_card_type.id,
                                                            organizationId: organization.id,
                                                        }}>
                                                        {strLimit(card?.physical_card_type?.name, 53)}
                                                    </StateNavLink>
                                                ) : (
                                                    <TableEmptyValue />
                                                )}
                                            </td>
                                            <td className={'table-td-actions text-right'}>
                                                {filterValues.source != 'archive' ? (
                                                    <TableRowActions
                                                        content={() => (
                                                            <div className="dropdown dropdown-actions">
                                                                {card?.voucher && (
                                                                    <StateNavLink
                                                                        name={DashboardRoutes.VOUCHER}
                                                                        params={{
                                                                            id: card?.voucher.id,
                                                                            organizationId: organization.id,
                                                                        }}
                                                                        className="dropdown-item">
                                                                        <div className="mdi mdi-eye-outline icon-start" />
                                                                        Bekijk tegoeden
                                                                    </StateNavLink>
                                                                )}

                                                                {card.physical_card_type && (
                                                                    <StateNavLink
                                                                        name={DashboardRoutes.PHYSICAL_CARD_TYPE}
                                                                        params={{
                                                                            id: card.physical_card_type?.id,
                                                                            organizationId: organization.id,
                                                                        }}
                                                                        className="dropdown-item">
                                                                        <div className="mdi mdi-eye-outline icon-start" />
                                                                        Bekijk passen type
                                                                    </StateNavLink>
                                                                )}
                                                            </div>
                                                        )}
                                                    />
                                                ) : (
                                                    <span className={'text-muted'}>
                                                        {translate('organization_employees.labels.owner')}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>

                {physicalCards?.meta.total > 0 && (
                    <div className="card-section">
                        <Paginator
                            meta={physicalCards.meta}
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
