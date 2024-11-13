import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useSetProgress from '../../../hooks/useSetProgress';
import useProductService from '../../../services/ProductService';
import { PaginationData } from '../../../props/ApiResponses';
import Paginator from '../../../modules/paginator/components/Paginator';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import ClickOutside from '../../elements/click-outside/ClickOutside';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SponsorProductsTable from './elements/SponsorProductsTable';
import SponsorProductsChangesTable from './elements/SponsorProductsChangesTable';
import SponsorProduct from '../../../props/models/Sponsor/SponsorProduct';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { NumberParam, StringParam, createEnumParam, useQueryParam, withDefault } from 'use-query-params';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../helpers/dates';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import SelectControlOptionsFund from '../../elements/select-control/templates/SelectControlOptionsFund';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import classNames from 'classnames';

export default function SponsorProducts() {
    const activeOrganization = useActiveOrganization();

    const setProgress = useSetProgress();
    const translate = useTranslate();

    const productService = useProductService();
    const paginatorService = usePaginatorService();
    const fundService = useFundService();

    const [loading, setLoading] = useState(false);
    const [paginatorKey] = useState('sponsor_products');
    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [products, setProducts] = useState<PaginationData<SponsorProduct>>(null);

    const [view, setView] = useQueryParam<'products' | 'history'>(
        'view',
        withDefault(createEnumParam(['products', 'history']), 'products'),
        { removeDefaultsFromUrl: true },
    );

    const [hasReservationOptions] = useState([
        { key: 1, name: 'Ja' },
        { key: 0, name: 'Nee' },
        { key: null, name: 'Alle' },
    ]);

    const [dateTypeOptions] = useState([
        { key: 'created_at', name: 'Aanmaakdatum' },
        { key: 'updated_at', name: 'Laatste wijziging datum' },
    ]);

    const [filterValues, filterActiveValues, filterUpdate, filter] = useFilterNext<{
        q?: string;
        to?: string;
        from?: string;
        page?: number;
        fund_id?: number;
        price_min?: string;
        price_max?: string;
        per_page?: number;
        has_reservations?: number;
        date_type?: 'created_at' | 'updated_at';
    }>(
        {
            q: '',
            page: 1,
            from: null,
            to: null,
            price_min: null,
            price_max: null,
            fund_id: null,
            has_reservations: null,
            date_type: 'created_at',
            per_page: paginatorService.getPerPage(paginatorKey),
        },
        {
            queryParamsRemoveDefault: true,
            queryParams: {
                q: StringParam,
                to: StringParam,
                from: StringParam,
                page: NumberParam,
                fund_id: NumberParam,
                per_page: NumberParam,
                has_reservations: NumberParam,
                date_type: createEnumParam(['created_at', 'updated_at']),
                price_min: StringParam,
                price_max: StringParam,
            },
            throttledValues: ['q', 'from', 'to', 'price_min', 'price_max'],
        },
    );

    const { headElement, configsElement } = useConfigurableTable(productService.getColumnsSponsor(view));

    const { resetFilters: resetFilters } = filter;

    const fetchProducts = useCallback(() => {
        setProgress(0);
        setLoading(true);

        const values = {
            ...filterActiveValues,
            date_type: null,
            from: filterActiveValues.date_type === 'created_at' ? filterActiveValues.from : null,
            to: filterActiveValues.date_type === 'created_at' ? filterActiveValues.to : null,
            updated_from: filterActiveValues.date_type === 'updated_at' ? filterActiveValues.from : null,
            updated_to: filterActiveValues.date_type === 'updated_at' ? filterActiveValues.to : null,
            order_by: filterActiveValues.view === 'products' ? 'name' : 'last_monitored_change_at',
        };

        productService
            .sponsorProducts(activeOrganization.id, values)
            .then((res) => setProducts(res.data))
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [setProgress, productService, activeOrganization.id, filterActiveValues]);

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(activeOrganization.id, { with_archived: 1 })
            .then((res) => setFunds([{ id: null, name: 'Alle fondsen' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, fundService, setProgress]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    if (!products) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header card-header-next">
                <div className="card-title flex flex-grow">
                    {translate('products.offers')} ({products.meta.total})
                </div>

                <div className="card-header-filters form">
                    <div className="block block-inline-filters">
                        {filter.show && (
                            <div className="button button-text" onClick={() => resetFilters()}>
                                <em className="mdi mdi-close icon-start" />
                                Wis filters
                            </div>
                        )}

                        {!filter.show && (
                            <Fragment>
                                <div className="block block-label-tabs">
                                    <div className="label-tab-set">
                                        <div
                                            className={classNames(
                                                `label-tab label-tab-sm`,
                                                view == 'products' && 'active',
                                            )}
                                            onClick={() => setView('products')}>
                                            Alle
                                        </div>

                                        <div
                                            className={classNames(
                                                `label-tab label-tab-sm`,
                                                view == 'history' && 'active',
                                            )}
                                            onClick={() => setView('history')}>
                                            Wijzigingen
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <SelectControl
                                        className="form-control inline-filter-control"
                                        propKey={'id'}
                                        options={funds}
                                        value={filter.activeValues.fund_id}
                                        placeholder={translate('vouchers.labels.fund')}
                                        allowSearch={false}
                                        onChange={(fund_id: number) => filter.update({ fund_id })}
                                        optionsComponent={SelectControlOptionsFund}
                                    />
                                </div>

                                <div className="form-group">
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={filterValues.q}
                                        onChange={(e) => filterUpdate({ q: e.target.value })}
                                        placeholder={translate('sponsor_products.labels.search')}
                                    />
                                </div>
                            </Fragment>
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
                                                label={translate('sponsor_products.filters.search')}>
                                                <input
                                                    className="form-control"
                                                    value={filterValues.q}
                                                    onChange={(e) =>
                                                        filterUpdate({
                                                            q: e.target.value,
                                                        })
                                                    }
                                                    placeholder={translate('sponsor_products.filters.search')}
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle label={translate('sponsor_products.filters.funds')}>
                                                <SelectControl
                                                    className="form-control"
                                                    propKey={'id'}
                                                    allowSearch={false}
                                                    value={filterValues.fund_id || funds?.[0]?.id}
                                                    options={funds}
                                                    optionsComponent={SelectControlOptions}
                                                    onChange={(fund_id: number) => filterUpdate({ fund_id })}
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle
                                                label={translate('sponsor_products.filters.has_reservations')}>
                                                <SelectControl
                                                    className="form-control"
                                                    propKey={'key'}
                                                    allowSearch={false}
                                                    value={filterValues.has_reservations}
                                                    options={hasReservationOptions}
                                                    optionsComponent={SelectControlOptions}
                                                    onChange={(has_reservations: number) =>
                                                        filterUpdate({ has_reservations })
                                                    }
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle label={translate('sponsor_products.filters.amount')}>
                                                <div className="row">
                                                    <div className="col col-lg-6">
                                                        <input
                                                            className="form-control"
                                                            min={0}
                                                            type="number"
                                                            value={filterValues.price_min || ''}
                                                            onChange={(e) => {
                                                                filterUpdate({ price_min: e.target.value || null });
                                                            }}
                                                            placeholder={translate('sponsor_products.labels.price_min')}
                                                        />
                                                    </div>

                                                    <div className="col col-lg-6">
                                                        <input
                                                            className="form-control"
                                                            min={0}
                                                            type="number"
                                                            value={filter.values.price_max || ''}
                                                            onChange={(e) => {
                                                                filterUpdate({ price_max: e.target.value || null });
                                                            }}
                                                            placeholder={translate('sponsor_products.labels.price_max')}
                                                        />
                                                    </div>
                                                </div>
                                            </FilterItemToggle>

                                            <FilterItemToggle label={translate('sponsor_products.labels.date_type')}>
                                                <SelectControl
                                                    className="form-control"
                                                    propKey={'key'}
                                                    allowSearch={false}
                                                    value={filterValues.date_type}
                                                    options={dateTypeOptions}
                                                    onChange={(date_type: 'created_at' | 'updated_at') =>
                                                        filterUpdate({ date_type })
                                                    }
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle label={translate('sponsor_products.labels.from')}>
                                                <DatePickerControl
                                                    value={dateParse(filterValues.from)}
                                                    placeholder={translate('dd-MM-yyyy')}
                                                    onChange={(from: Date) => filterUpdate({ from: dateFormat(from) })}
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle label={translate('sponsor_products.labels.to')}>
                                                <DatePickerControl
                                                    value={dateParse(filterValues.to)}
                                                    placeholder={translate('dd-MM-yyyy')}
                                                    onChange={(to: Date) => filterUpdate({ to: dateFormat(to) })}
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

            {loading ? (
                <LoadingCard type={'card-section'} />
            ) : (
                <Fragment>
                    {products?.meta?.total > 0 && (
                        <div className="card-section">
                            <div className="card-block card-block-table">
                                {configsElement}

                                <TableTopScroller>
                                    {filterActiveValues.view == 'products' ? (
                                        <SponsorProductsTable products={products?.data} headElement={headElement} />
                                    ) : (
                                        <SponsorProductsChangesTable
                                            products={products?.data}
                                            headElement={headElement}
                                        />
                                    )}
                                </TableTopScroller>
                            </div>
                        </div>
                    )}

                    {products?.meta?.total === 0 && (
                        <EmptyCard title={'Er zijn momenteel geen aanbiedingen.'} type={'card-section'} />
                    )}

                    {products?.meta && (
                        <div className="card-section">
                            <Paginator
                                meta={products.meta}
                                filters={filter.values}
                                updateFilters={filter.update}
                                perPageKey={paginatorKey}
                            />
                        </div>
                    )}
                </Fragment>
            )}
        </div>
    );
}
