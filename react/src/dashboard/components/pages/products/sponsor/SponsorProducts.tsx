import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useSetProgress from '../../../../hooks/useSetProgress';
import useProductService from '../../../../services/ProductService';
import { PaginationData } from '../../../../props/ApiResponses';
import Paginator from '../../../../modules/paginator/components/Paginator';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../../hooks/useTranslate';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import ClickOutside from '../../../elements/click-outside/ClickOutside';
import FilterItemToggle from '../../../elements/tables/elements/FilterItemToggle';
import SponsorProductsGeneralTable from './elements/SponsorProductsGeneralTable';
import SponsorProductsChangesTable from './elements/SponsorProductsChangesTable';
import Product from '../../../../props/models/Product';
import SelectControl from '../../../elements/select-control/SelectControl';
import SelectControlOptions from '../../../elements/select-control/templates/SelectControlOptions';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import { NumberParam, StringParam } from 'use-query-params';
import FundProviderProduct from '../../../../props/models/FundProviderProduct';
import DatePickerControl from '../../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../../helpers/dates';
import { useFundService } from '../../../../services/FundService';
import Fund from '../../../../props/models/Fund';

export default function SponsorProducts() {
    const activeOrganization = useActiveOrganization();

    const setProgress = useSetProgress();
    const translate = useTranslate();

    const productService = useProductService();
    const paginatorService = usePaginatorService();
    const fundService = useFundService();

    const [loading, setLoading] = useState(false);
    const [paginatorKey] = useState('sponsor_products');
    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [products, setProducts] = useState<PaginationData<Product>>(null);
    const [fundProviderProducts, setFundProviderProducts] = useState<PaginationData<FundProviderProduct>>(null);

    const [hasReservationOptions] = useState([
        { key: 1, name: 'Ja' },
        { key: 0, name: 'Nee' },
        { key: null, name: 'Alle' },
    ]);

    const [dateTypeOptions] = useState([
        { key: 'created_at', name: 'Aanmaakdatum' },
        { key: 'updated_at', name: 'Laatste wijziging datum' },
    ]);

    const [groupByOptions] = useState([
        { value: null, name: 'Geen' },
        { value: 'per_product', name: 'Per product' },
    ]);

    const [filterValues, filterActiveValues, filterUpdate, filter] = useFilterNext<{
        q?: string;
        to?: string;
        from?: string;
        page?: number;
        fund_id?: number;
        price_min?: string;
        price_max?: string;
        source?: string;
        group_by?: string;
        per_page?: number;
        has_reservations?: number;
        date_type?: 'created_at' | 'updated_at';
    }>(
        {
            q: '',
            page: 1,
            source: 'products',
            fund_id: null,
            has_reservations: null,
            date_type: 'created_at',
            group_by: groupByOptions[0].value,
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
                source: StringParam,
                group_by: StringParam,
                has_reservations: NumberParam,
                date_type: StringParam,
                price_min: StringParam,
                price_max: StringParam,
            },
        },
    );

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
        };

        if (filterActiveValues.source == 'products') {
            productService
                .sponsorProducts(activeOrganization.id, values)
                .then((res) => setProducts(res.data))
                .finally(() => {
                    setLoading(false);
                    setProgress(100);
                });
        } else {
            productService
                .sponsorFundProviderDigestProducts(activeOrganization.id, values)
                .then((res) => setFundProviderProducts(res.data))
                .finally(() => {
                    setLoading(false);
                    setProgress(100);
                });
        }
    }, [setProgress, productService, activeOrganization.id, filterActiveValues]);

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(activeOrganization.id, { with_archived: 1 })
            .then((res) => setFunds(res.data.data))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, fundService, setProgress]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    if (!products && !fundProviderProducts) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header card-header-next">
                <div className="flex flex-grow">
                    <div className="flex-col">
                        <div className="card-title">
                            {translate('products.offers')} (
                            {(filterActiveValues.source == 'products' ? products : fundProviderProducts)?.meta.total})
                        </div>
                    </div>
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
                                {filterActiveValues.source == 'fund_provider_products' && (
                                    <div className="form-group form-group-inline">
                                        <label className="form-label">Sorteer op:</label>
                                        <div className="form-offset">
                                            <SelectControl
                                                className={'form-control form-control-text nowrap'}
                                                options={groupByOptions}
                                                propKey={'value'}
                                                allowSearch={false}
                                                value={filterValues.group_by}
                                                optionsComponent={SelectControlOptions}
                                                onChange={(group_by: string) => filterUpdate({ group_by })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className="block block-label-tabs">
                                        <div className="label-tab-set">
                                            <div
                                                className={`label-tab label-tab-sm ${
                                                    filterActiveValues.source == 'products' ? 'active' : ''
                                                }`}
                                                onClick={() => filterUpdate({ source: 'products' })}>
                                                Alle
                                            </div>

                                            <div
                                                className={`label-tab label-tab-sm ${
                                                    filterActiveValues.source == 'fund_provider_products'
                                                        ? 'active'
                                                        : ''
                                                }`}
                                                onClick={() => filterUpdate({ source: 'fund_provider_products' })}>
                                                Wijzigingen
                                            </div>
                                        </div>
                                    </div>
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

                                            {filterActiveValues.source == 'fund_provider_products' && (
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
                                            )}

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

            {loading && (
                <div className="card-section">
                    <div className="card-loading">
                        <div className="mdi mdi-loading mdi-spin" />
                    </div>
                </div>
            )}

            {!loading &&
                (filterActiveValues.source == 'products' ? products : fundProviderProducts)?.meta?.total > 0 && (
                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                {filterValues.source == 'products' ? (
                                    <TableTopScroller>
                                        <SponsorProductsGeneralTable products={products?.data} />
                                    </TableTopScroller>
                                ) : (
                                    <SponsorProductsChangesTable
                                        products={fundProviderProducts?.data}
                                        groupBy={filterActiveValues.group_by}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}

            {!loading &&
                (filterActiveValues.source == 'products' ? products : fundProviderProducts)?.meta.total == 0 && (
                    <div className="card-section text-center">
                        <div className="card-subtitle">Er zijn geen aanbiedingen gevonden voor de zoekopdracht.</div>
                    </div>
                )}

            {!loading &&
                (filterActiveValues.source == 'products' ? products : fundProviderProducts)?.meta?.last_page > 1 && (
                    <div className="card-section">
                        <Paginator
                            meta={products.meta}
                            filters={filter.values}
                            updateFilters={filter.update}
                            perPageKey={paginatorKey}
                        />
                    </div>
                )}
        </div>
    );
}
