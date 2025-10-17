import { PaginationData } from '../../../../../../props/ApiResponses';
import TableTopScroller from '../../../../../elements/tables/TableTopScroller';
import StateNavLink from '../../../../../../modules/state_router/StateNavLink';
import TableRowActions from '../../../../../elements/tables/TableRowActions';
import Paginator from '../../../../../../modules/paginator/components/Paginator';
import LoaderTableCard from '../../../../../elements/loader-table-card/LoaderTableCard';
import React, { useCallback, useEffect, useState } from 'react';
import useConfigurableTable from '../../../../vouchers/hooks/useConfigurableTable';
import usePaginatorService from '../../../../../../modules/paginator/services/usePaginatorService';
import Organization from '../../../../../../props/models/Organization';
import useTranslate from '../../../../../../hooks/useTranslate';
import useSetProgress from '../../../../../../hooks/useSetProgress';
import CardHeaderFilterNext from '../../../../../elements/tables/elements/CardHeaderFilterNext';
import FilterItemToggle from '../../../../../elements/tables/elements/FilterItemToggle';
import useFilterNext from '../../../../../../modules/filter_next/useFilterNext';
import Fund from '../../../../../../props/models/Fund';
import TableEntityMain from '../../../../../elements/tables/elements/TableEntityMain';
import { strLimit } from '../../../../../../helpers/string';
import classNames from 'classnames';
import { useEditFundPhysicalCardType } from '../../../hooks/useEditFundPhysicalCardType';
import { useFundPhysicalCardTypeService } from '../../../../../../services/FundPhysicalCardTypeService';
import FundPhysicalCardType from '../../../../../../props/models/FundPhysicalCardType';
import { useDeleteFundPhysicalCardType } from '../../../hooks/useDeleteFundPhysicalCardType';

export default function FundPhysicalCardTypesTable({ fund, organization }: { fund: Fund; organization: Organization }) {
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const [paginatorKey] = useState('physical-card-types');
    const [fundPhysicalCardTypes, setFundPhysicalCardTypes] = useState<PaginationData<FundPhysicalCardType>>(null);

    const paginatorService = usePaginatorService();
    const fundPhysicalCardTypeService = useFundPhysicalCardTypeService();

    const [, filterActiveValues, filterUpdate, filter] = useFilterNext<{
        q: string;
        fund_id?: number;
        per_page?: number;
    }>({ q: '', fund_id: fund?.id, per_page: paginatorService.getPerPage(paginatorKey) });

    const { headElement, configsElement } = useConfigurableTable(fundPhysicalCardTypeService.getColumns(), {
        sortable: true,
        filter: filter,
    });

    const fetchPhysicalCardTypes = useCallback(() => {
        setProgress(0);

        fundPhysicalCardTypeService
            .list(organization.id, filterActiveValues)
            .then((res) => setFundPhysicalCardTypes(res.data))
            .finally(() => setProgress(100));
    }, [fundPhysicalCardTypeService, organization.id, setProgress, filterActiveValues]);

    const storeFundPhysicalCardType = useEditFundPhysicalCardType();
    const deleteFundPhysicalCardType = useDeleteFundPhysicalCardType();

    useEffect(() => {
        fetchPhysicalCardTypes();
    }, [fetchPhysicalCardTypes]);

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">{`Passen types (${fundPhysicalCardTypes?.meta?.total || 0})`}</div>

                <div className="card-header-filters">
                    <div className="block block-inline-filters form">
                        <button
                            onClick={() =>
                                storeFundPhysicalCardType(
                                    organization,
                                    fund,
                                    null,
                                    fundPhysicalCardTypes.data.map((type) => type.physical_card_type_id),
                                    fetchPhysicalCardTypes,
                                )
                            }
                            className="button button-primary button-sm">
                            <em className="mdi mdi-plus-circle icon-start" />
                            Voeg pas toe
                        </button>

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
                loading={!fundPhysicalCardTypes?.meta}
                empty={fundPhysicalCardTypes?.meta?.total === 0}
                emptyTitle={'Geen fysieke passen'}
                emptyDescription={'Er zijn momenteel geen fysieke passen.'}>
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {fundPhysicalCardTypes?.data.map((cardType) => (
                                        <StateNavLink
                                            key={cardType.id}
                                            name={'physical-card-types-show'}
                                            params={{
                                                id: cardType.physical_card_type_id,
                                                organizationId: organization.id,
                                            }}
                                            customElement={'tr'}
                                            className={'tr-clickable'}>
                                            <td title={cardType.physical_card_type.name}>
                                                <TableEntityMain
                                                    title={strLimit(cardType.physical_card_type.name, 64)}
                                                    subtitle={strLimit(
                                                        cardType.physical_card_type.description || 'Geen omschrijving',
                                                        64,
                                                    )}
                                                    media={cardType.physical_card_type.photo}
                                                    mediaRound={false}
                                                    mediaSize={'md'}
                                                    mediaPlaceholder={'physical_card_type'}
                                                />
                                            </td>
                                            <td>{cardType?.allow_physical_card_linking ? 'Ja' : 'Nee'}</td>
                                            <td>{cardType?.allow_physical_card_deactivation ? 'Ja' : 'Nee'}</td>
                                            <td>{cardType?.allow_physical_card_requests ? 'Ja' : 'Nee'}</td>
                                            <td className={'table-td-actions text-right'}>
                                                {filter.values.source != 'archive' ? (
                                                    <TableRowActions
                                                        content={(e) => (
                                                            <div className="dropdown dropdown-actions">
                                                                <StateNavLink
                                                                    name={'physical-card-types-show'}
                                                                    params={{
                                                                        id: cardType.physical_card_type_id,
                                                                        organizationId: organization.id,
                                                                    }}
                                                                    className="dropdown-item">
                                                                    <div className="mdi mdi-eye-outline icon-start" />
                                                                    Bekijk
                                                                </StateNavLink>

                                                                <div
                                                                    onClick={() => {
                                                                        e?.close();
                                                                        storeFundPhysicalCardType(
                                                                            organization,
                                                                            fund,
                                                                            cardType,
                                                                            null,
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
                                                                        cardType?.in_use && 'disabled',
                                                                    )}
                                                                    onClick={() => {
                                                                        e?.close();
                                                                        deleteFundPhysicalCardType(
                                                                            fund,
                                                                            cardType,
                                                                            fetchPhysicalCardTypes,
                                                                        );
                                                                    }}>
                                                                    <em className="mdi mdi-close icon-start icon-start" />
                                                                    Verwijderen
                                                                </div>
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

                {fundPhysicalCardTypes?.meta.total > 0 && (
                    <div className="card-section">
                        <Paginator
                            meta={fundPhysicalCardTypes.meta}
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
