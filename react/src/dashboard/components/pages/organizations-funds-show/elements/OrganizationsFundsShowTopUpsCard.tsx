import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Fund from '../../../../props/models/Fund';
import ClickOutside from '../../../elements/click-outside/ClickOutside';
import FilterItemToggle from '../../../elements/tables/elements/FilterItemToggle';
import DatePickerControl from '../../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../../helpers/dates';
import ThSortable from '../../../elements/tables/ThSortable';
import FundTopUpTransaction from '../../../../props/models/FundTopUpTransaction';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import Paginator from '../../../../modules/paginator/components/Paginator';
import useTranslate from '../../../../hooks/useTranslate';
import useSetProgress from '../../../../hooks/useSetProgress';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import { useFundService } from '../../../../services/FundService';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import { PaginationData } from '../../../../props/ApiResponses';
import useFilter from '../../../../hooks/useFilter';
import LoadingCard from '../../../elements/loading-card/LoadingCard';

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

    const filter = useFilter({
        q: '',
        amount_min: null,
        amount_max: null,
        from: null,
        to: null,
        per_page: paginatorService.getPerPage(paginationPerPageKey),
    });

    const fetchTopUps = useCallback(() => {
        if (!fund?.is_configured) {
            setLastQueryTopUpTransactions(filter.activeValues.q);
            return;
        }

        setProgress(0);

        fundService
            .listTopUpTransactions(activeOrganization.id, fund.id, filter.activeValues)
            .then((res) => {
                setTopUpTransactions(res.data);
                setLastQueryTopUpTransactions(filter.activeValues.q);
            })
            .finally(() => setProgress(100));
    }, [fund?.is_configured, setProgress, fundService, activeOrganization.id, fund.id, filter.activeValues]);

    useEffect(() => {
        fetchTopUps();
    }, [fetchTopUps]);

    return (
        <div className="card">
            <div className="card-header card-header-next">
                <div className="flex flex-grow">
                    <div className="card-title">
                        {translate(`funds_show.titles.${viewType}`)}
                        {topUpTransactions?.meta && <span>&nbsp;({topUpTransactions?.meta?.total || 0})</span>}
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
                                                    label={translate('funds_show.top_up_table.filters.search')}>
                                                    <input
                                                        className="form-control"
                                                        defaultValue={filter.values.q}
                                                        onChange={(e) =>
                                                            filter.update({
                                                                q: e.target.value,
                                                            })
                                                        }
                                                        placeholder={translate(
                                                            'funds_show.top_up_table.filters.search',
                                                        )}
                                                    />
                                                </FilterItemToggle>

                                                <FilterItemToggle
                                                    label={translate('funds_show.top_up_table.filters.amount')}>
                                                    <div className="row">
                                                        <div className="col col-lg-6">
                                                            <input
                                                                className="form-control"
                                                                min={0}
                                                                type="number"
                                                                defaultValue={filter.values.amount_min || ''}
                                                                onChange={(e) =>
                                                                    filter.update({
                                                                        amount_min: e.target.value,
                                                                    })
                                                                }
                                                                placeholder={translate(
                                                                    'funds_show.top_up_table.filters.amount_min',
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="col col-lg-6">
                                                            <input
                                                                className="form-control"
                                                                min={0}
                                                                type="number"
                                                                defaultValue={filter.values.amount_max || ''}
                                                                onChange={(e) =>
                                                                    filter.update({
                                                                        amount_max: e.target.value,
                                                                    })
                                                                }
                                                                placeholder={translate(
                                                                    'transactions.labels.amount_max',
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </FilterItemToggle>

                                                <FilterItemToggle
                                                    label={translate('funds_show.top_up_table.filters.from')}>
                                                    <DatePickerControl
                                                        value={dateParse(filter.values.from)}
                                                        placeholder={translate('dd-MM-yyyy')}
                                                        onChange={(from: Date) => {
                                                            filter.update({
                                                                from: dateFormat(from),
                                                            });
                                                        }}
                                                    />
                                                </FilterItemToggle>

                                                <FilterItemToggle
                                                    label={translate('funds_show.top_up_table.filters.to')}>
                                                    <DatePickerControl
                                                        value={dateParse(filter.values.to)}
                                                        placeholder={translate('dd-MM-yyyy')}
                                                        onChange={(to: Date) => {
                                                            filter.update({
                                                                to: dateFormat(to),
                                                            });
                                                        }}
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

            {topUpTransactions ? (
                <Fragment>
                    {topUpTransactions?.meta?.total > 0 ? (
                        <div className="card-section card-section-padless">
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <ThSortable
                                                filter={filter}
                                                label={translate('funds_show.top_up_table.columns.code')}
                                                value="code"
                                            />
                                            <ThSortable
                                                filter={filter}
                                                label={translate('funds_show.top_up_table.columns.iban')}
                                                value="iban"
                                            />
                                            <ThSortable
                                                filter={filter}
                                                label={translate('funds_show.top_up_table.columns.amount')}
                                                value="amount"
                                            />
                                            <ThSortable
                                                className="text-right"
                                                filter={filter}
                                                label={translate('funds_show.top_up_table.columns.date')}
                                                value="created_at"
                                            />
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {topUpTransactions.data.map((top_up_transaction: FundTopUpTransaction) => (
                                            <tr key={top_up_transaction.id}>
                                                <td>{top_up_transaction.code}</td>
                                                <td className={!top_up_transaction.iban ? 'text-muted' : ''}>
                                                    {top_up_transaction.iban || 'Geen IBAN'}
                                                </td>
                                                <td>{top_up_transaction.amount_locale}</td>
                                                <td className="text-right">{top_up_transaction.created_at_locale}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <EmptyCard
                            title="No top-ups"
                            type={'card-section'}
                            description={
                                lastQueryTopUpTransactions
                                    ? `Could not find any top-ups for "${lastQueryTopUpTransactions}"`
                                    : null
                            }
                        />
                    )}

                    <div className={'card-section card-section-narrow'} hidden={topUpTransactions?.meta?.total < 2}>
                        <Paginator
                            meta={topUpTransactions.meta}
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
