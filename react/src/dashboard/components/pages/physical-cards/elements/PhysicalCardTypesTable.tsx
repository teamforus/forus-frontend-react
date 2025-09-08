import { PaginationData } from '../../../../props/ApiResponses';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TableRowActions from '../../../elements/tables/TableRowActions';
import Paginator from '../../../../modules/paginator/components/Paginator';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import Organization from '../../../../props/models/Organization';
import useTranslate from '../../../../hooks/useTranslate';
import useSetProgress from '../../../../hooks/useSetProgress';
import BlockLabelTabs from '../../../elements/block-label-tabs/BlockLabelTabs';
import PhysicalCardType from '../../../../props/models/PhysicalCardType';
import { usePhysicalCardTypeService } from '../../../../services/PhysicalCardTypeService';
import SelectControl from '../../../elements/select-control/SelectControl';
import SelectControlOptionsFund from '../../../elements/select-control/templates/SelectControlOptionsFund';
import CardHeaderFilterNext from '../../../elements/tables/elements/CardHeaderFilterNext';
import FilterItemToggle from '../../../elements/tables/elements/FilterItemToggle';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import { StringParam } from 'use-query-params';
import Fund from '../../../../props/models/Fund';
import TableEntityMain from '../../../elements/tables/elements/TableEntityMain';
import { strLimit } from '../../../../helpers/string';
import { useDeletePhysicalCardType } from '../hooks/useDeletePhysicalCardType';
import classNames from 'classnames';
import { useEditPhysicalCardType } from '../hooks/useEditPhysicalCardType';

export default function PhysicalCardTypesTable({
    tab = 'physical_cards',
    tabs = [],
    funds = [],
    setTab = null,
    fundId = null,
    organization,
    cardButtons = null,
    actionButtons = null,
    filterUseQueryParams = true,
}: {
    tab?: 'physical_cards' | 'physical_card_types';
    tabs?: Array<{ value: 'physical_cards' | 'physical_card_types'; label: string }>;
    funds?: Array<Partial<Fund>>;
    setTab?: React.Dispatch<React.SetStateAction<'physical_cards' | 'physical_card_types'>>;
    organization: Organization;
    fundId?: number;
    cardButtons?: (e: {
        physicalCardTypes?: PaginationData<PhysicalCardType>;
        fetchPhysicalCardTypes?: () => void;
    }) => React.ReactNode | React.ReactNode[];
    actionButtons?: (e: {
        physicalCardType?: PhysicalCardType;
        fetchPhysicalCardTypes?: () => void;
        closeMenu?: () => void;
    }) => React.ReactNode | React.ReactNode[];
    filterUseQueryParams?: boolean;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const editPhysicalCardType = useEditPhysicalCardType();
    const deletePhysicalCardType = useDeletePhysicalCardType();

    const [paginatorKey] = useState('physical-card-types');
    const [physicalCardTypes, setPhysicalCardTypes] = useState<PaginationData<PhysicalCardType>>(null);

    const paginatorService = usePaginatorService();
    const physicalCardTypeService = usePhysicalCardTypeService();

    const [filterValues, filterActiveValues, filterUpdate, filter] = useFilterNext<{
        q: string;
        fund_id?: number;
        per_page?: number;
    }>(
        { q: '', fund_id: null, per_page: paginatorService.getPerPage(paginatorKey) },
        { queryParams: filterUseQueryParams ? { q: StringParam, fund_id: StringParam, per_page: StringParam } : null },
    );

    const { headElement, configsElement } = useConfigurableTable(physicalCardTypeService.getColumns(), {
        sortable: true,
        filter: filter,
    });

    const fetchPhysicalCardTypes = useCallback(() => {
        setProgress(0);

        physicalCardTypeService
            .list(organization.id, { ...filterActiveValues, ...(fundId ? { fund_id: fundId } : {}) })
            .then((res) => setPhysicalCardTypes(res.data))
            .finally(() => setProgress(100));
    }, [physicalCardTypeService, organization.id, setProgress, filterActiveValues, fundId]);

    useEffect(() => {
        fetchPhysicalCardTypes();
    }, [fetchPhysicalCardTypes]);

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">{`Passen types (${physicalCardTypes?.meta?.total || 0})`}</div>

                <div className="card-header-filters">
                    <div className="block block-inline-filters form">
                        {cardButtons({ fetchPhysicalCardTypes, physicalCardTypes })}

                        {tabs.length > 0 && <BlockLabelTabs value={tab} setValue={setTab} tabs={tabs} />}

                        {funds?.length > 0 && (
                            <div className="form-group">
                                <SelectControl
                                    className="form-control inline-filter-control"
                                    propKey={'id'}
                                    options={funds}
                                    value={filterValues.fund_id}
                                    placeholder={'Fonds'}
                                    allowSearch={false}
                                    onChange={(fund_id: number) => filter.update({ fund_id })}
                                    optionsComponent={SelectControlOptionsFund}
                                />
                            </div>
                        )}

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
                loading={!physicalCardTypes?.meta}
                empty={physicalCardTypes?.meta?.total === 0}
                emptyTitle={'Geen fysieke passen'}
                emptyDescription={'Er zijn momenteel geen fysieke passen.'}>
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {physicalCardTypes?.data.map((cardType) => (
                                        <StateNavLink
                                            key={cardType.id}
                                            name={'physical-card-types-show'}
                                            params={{
                                                id: cardType.id,
                                                organizationId: organization.id,
                                            }}
                                            customElement={'tr'}
                                            className={'tr-clickable'}>
                                            <td title={cardType.name}>
                                                <TableEntityMain
                                                    title={strLimit(cardType.name, 64)}
                                                    subtitle={strLimit(cardType.description || 'Geen omschrijving', 64)}
                                                    media={cardType.photo}
                                                    mediaRound={false}
                                                    mediaSize={'md'}
                                                    mediaPlaceholder={'physical_card_type'}
                                                />
                                            </td>
                                            <td>{cardType?.physical_cards_count}</td>
                                            <td>{cardType?.funds_count}</td>
                                            <td>{cardType?.code_blocks || <TableEmptyValue />}</td>
                                            <td>{cardType?.code_block_size || <TableEmptyValue />}</td>
                                            <td className={'table-td-actions text-right'}>
                                                {filter.values.source != 'archive' ? (
                                                    <TableRowActions
                                                        content={(e) => (
                                                            <div className="dropdown dropdown-actions">
                                                                {actionButtons ? (
                                                                    actionButtons({
                                                                        fetchPhysicalCardTypes,
                                                                        physicalCardType: cardType,
                                                                        closeMenu: e.close,
                                                                    })
                                                                ) : (
                                                                    <Fragment>
                                                                        <StateNavLink
                                                                            name={'physical-card-types-show'}
                                                                            params={{
                                                                                id: cardType.id,
                                                                                organizationId: organization.id,
                                                                            }}
                                                                            className="dropdown-item">
                                                                            <div className="mdi mdi-eye-outline icon-start" />
                                                                            Bekijk
                                                                        </StateNavLink>

                                                                        <div
                                                                            onClick={() => {
                                                                                e?.close();
                                                                                editPhysicalCardType(
                                                                                    organization,
                                                                                    cardType,
                                                                                    fetchPhysicalCardTypes,
                                                                                );
                                                                            }}
                                                                            className="dropdown-item">
                                                                            <div className="mdi mdi-pencil-outline icon-start" />
                                                                            Bewerking
                                                                        </div>

                                                                        <div
                                                                            className={classNames(
                                                                                'dropdown-item',
                                                                                cardType.in_use && 'disabled',
                                                                            )}
                                                                            onClick={() => {
                                                                                e?.close();
                                                                                deletePhysicalCardType(
                                                                                    cardType,
                                                                                    fetchPhysicalCardTypes,
                                                                                );
                                                                            }}>
                                                                            <em className="mdi mdi-close icon-start icon-start" />
                                                                            Verwijderen
                                                                        </div>
                                                                    </Fragment>
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
                                        </StateNavLink>
                                    ))}
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>

                {physicalCardTypes?.meta.total > 0 && (
                    <div className="card-section">
                        <Paginator
                            meta={physicalCardTypes.meta}
                            filters={filter.values}
                            updateFilters={filter.update}
                            perPageKey={paginatorKey}
                        />
                    </div>
                )}
            </LoaderTableCard>
        </div>
    );
}
