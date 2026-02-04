import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import Fund from '../../../../../props/models/Fund';
import FilterItemToggle from '../../../../elements/tables/elements/FilterItemToggle';
import DatePickerControl from '../../../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../../../helpers/dates';
import FundTopUpTransaction from '../../../../../props/models/FundTopUpTransaction';
import LoaderTableCard from '../../../../elements/loader-table-card/LoaderTableCard';
import useTranslate from '../../../../../hooks/useTranslate';
import useSetProgress from '../../../../../hooks/useSetProgress';
import useActiveOrganization from '../../../../../hooks/useActiveOrganization';
import { useFundService } from '../../../../../services/FundService';
import usePaginatorService from '../../../../../modules/paginator/services/usePaginatorService';
import { PaginationData } from '../../../../../props/ApiResponses';
import TableEmptyValue from '../../../../elements/table-empty-value/TableEmptyValue';
import useFilterNext from '../../../../../modules/filter_next/useFilterNext';
import CardHeaderFilter from '../../../../elements/tables/elements/CardHeaderFilter';
import BlockLabelTabs from '../../../../elements/block-label-tabs/BlockLabelTabs';

export default function OrganizationsFundsShowTopUpsCard({
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

    const fundService = useFundService();
    const paginatorService = usePaginatorService();

    const [lastQueryTopUpTransactions, setLastQueryTopUpTransactions] = useState<string>('');
    const [topUpTransactions, setTopUpTransactions] = useState<PaginationData<FundTopUpTransaction>>(null);

    const [paginationPerPageKey] = useState('fund_top_up_per_page');

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q: string;
        per_page?: number;
        amount_min?: string;
        amount_max?: string;
        from?: string;
        to?: string;
    }>(
        {
            q: '',
            amount_min: null,
            amount_max: null,
            from: null,
            to: null,
            per_page: paginatorService.getPerPage(paginationPerPageKey),
        },
        {
            throttledValues: ['q', 'amount_min', 'amount_max'],
        },
    );

    const { resetFilters: resetFilters } = filter;

    const fetchTopUps = useCallback(() => {
        if (!fund?.is_configured) {
            setLastQueryTopUpTransactions(filterValuesActive.q);
            return;
        }

        setProgress(0);

        fundService
            .listTopUpTransactions(activeOrganization.id, fund.id, filterValuesActive)
            .then((res) => {
                setTopUpTransactions(res.data);
                setLastQueryTopUpTransactions(filterValuesActive.q);
            })
            .finally(() => setProgress(100));
    }, [fund?.is_configured, setProgress, fundService, activeOrganization.id, fund.id, filterValuesActive]);

    useEffect(() => {
        fetchTopUps();
    }, [fetchTopUps]);

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex flex-grow">
                    <div className="card-title">
                        {translate(`funds_show.titles.${viewType}`)}
                        {topUpTransactions?.meta && <span>&nbsp;({topUpTransactions?.meta?.total || 0})</span>}
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
                                    label={translate('funds_show.top_up_table.filters.search')}>
                                    <input
                                        className="form-control"
                                        defaultValue={filterValues.q}
                                        onChange={(e) =>
                                            filterUpdate({
                                                q: e.target.value,
                                            })
                                        }
                                        placeholder={translate('funds_show.top_up_table.filters.search')}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('funds_show.top_up_table.filters.amount')}>
                                    <div className="row">
                                        <div className="col col-lg-6">
                                            <input
                                                className="form-control"
                                                min={0}
                                                type="number"
                                                defaultValue={filterValues.amount_min || ''}
                                                onChange={(e) =>
                                                    filterUpdate({
                                                        amount_min: e.target.value,
                                                    })
                                                }
                                                placeholder={translate('funds_show.top_up_table.filters.amount_min')}
                                            />
                                        </div>

                                        <div className="col col-lg-6">
                                            <input
                                                className="form-control"
                                                min={0}
                                                type="number"
                                                defaultValue={filterValues.amount_max || ''}
                                                onChange={(e) =>
                                                    filterUpdate({
                                                        amount_max: e.target.value,
                                                    })
                                                }
                                                placeholder={translate('transactions.labels.amount_max')}
                                            />
                                        </div>
                                    </div>
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('funds_show.top_up_table.filters.from')}>
                                    <DatePickerControl
                                        value={dateParse(filterValues.from)}
                                        placeholder={translate('dd-MM-yyyy')}
                                        onChange={(from: Date) => {
                                            filterUpdate({
                                                from: dateFormat(from),
                                            });
                                        }}
                                    />
                                </FilterItemToggle>

                                <FilterItemToggle label={translate('funds_show.top_up_table.filters.to')}>
                                    <DatePickerControl
                                        value={dateParse(filterValues.to)}
                                        placeholder={translate('dd-MM-yyyy')}
                                        onChange={(to: Date) => {
                                            filterUpdate({
                                                to: dateFormat(to),
                                            });
                                        }}
                                    />
                                </FilterItemToggle>
                            </CardHeaderFilter>
                        </div>
                    </div>
                </div>
            </div>

            <LoaderTableCard
                loading={!topUpTransactions}
                empty={topUpTransactions?.meta?.total === 0}
                emptyTitle="No top-ups"
                emptyDescription={
                    lastQueryTopUpTransactions
                        ? `Could not find any top-ups for "${lastQueryTopUpTransactions}"`
                        : undefined
                }
                columns={fundService.getTopUpColumns()}
                tableOptions={{ filter, sortable: true }}
                paginator={{ key: paginationPerPageKey, data: topUpTransactions, filterValues, filterUpdate }}>
                {topUpTransactions?.data?.map((top_up_transaction: FundTopUpTransaction) => (
                    <tr key={top_up_transaction.id}>
                        <td>{top_up_transaction.code}</td>
                        <td className={classNames(!top_up_transaction.iban && 'text-muted')}>
                            {top_up_transaction.iban || 'Geen IBAN'}
                        </td>
                        <td>{top_up_transaction.amount_locale}</td>
                        <td>{top_up_transaction.created_at_locale}</td>
                        <td className={'table-td-actions text-right'}>
                            <TableEmptyValue />
                        </td>
                    </tr>
                ))}
            </LoaderTableCard>
        </div>
    );
}
