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
import useImplementationService from '../../../../services/ImplementationService';
import Implementation from '../../../../props/models/Implementation';

export default function SponsorProducts() {
    const activeOrganization = useActiveOrganization();

    const setProgress = useSetProgress();
    const translate = useTranslate();

    const productService = useProductService();
    const paginatorService = usePaginatorService();
    const implementationService = useImplementationService();

    const [paginatorKey] = useState('sponsor_products');
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<PaginationData<Product>>(null);
    const [implementations, setImplementations] = useState<Array<Partial<Implementation>>>(null);

    const [statesOptions] = useState([
        { key: null, name: 'Alle' },
        { key: 'approved', name: translate(`sponsor_products.states.approved`) },
        { key: 'waiting', name: translate(`sponsor_products.states.waiting`) },
        { key: 'declined', name: translate(`sponsor_products.states.declined`) },
    ]);

    const [groupByOptions] = useState([
        { value: null, name: 'Geen' },
        { value: 'per_product', name: 'Per product' },
    ]);

    const [filterValues, filterActiveValues, filterUpdate, filter] = useFilterNext<{
        q?: string;
        page?: number;
        amount_min?: string;
        amount_max?: string;
        source?: string;
        group_by?: string;
        per_page?: number;
    }>(
        {
            q: '',
            page: 1,
            source: 'all',
            group_by: groupByOptions[0].value,
            per_page: paginatorService.getPerPage(paginatorKey),
        },
        {
            queryParamsRemoveDefault: true,
            queryParams: {
                q: StringParam,
                page: NumberParam,
                per_page: NumberParam,
                source: StringParam,
                group_by: StringParam,
            },
        },
    );

    const fetchProducts = useCallback(() => {
        setProgress(0);
        setLoading(true);

        if (filterActiveValues.source == 'all') {
            productService
                .sponsorProducts(activeOrganization.id, filterActiveValues)
                .then((res) => setProducts(res.data))
                .finally(() => {
                    setLoading(false);
                    setProgress(100);
                });
        } else {
            productService
                .sponsorDigestLogs(activeOrganization.id, filterActiveValues)
                .then((res) => setProducts(res.data))
                .finally(() => {
                    setLoading(false);
                    setProgress(100);
                });
        }
    }, [setProgress, productService, activeOrganization.id, filterActiveValues]);

    const fetchImplementations = useCallback(() => {
        setProgress(0);

        implementationService
            .list(activeOrganization.id, { per_page: 100 })
            .then((res) => setImplementations([{ id: null, name: 'Alle implementaties...' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, implementationService, setProgress]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        fetchImplementations();
    }, [fetchImplementations]);

    if (!products) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header card-header-next">
                <div className="flex flex-grow">
                    <div className="flex-col">
                        <div className="card-title">
                            {translate('products.offers')} ({products.meta.total})
                        </div>
                    </div>
                </div>

                <div className="card-header-filters form">
                    <div className="block block-inline-filters">
                        {filter.show && (
                            <div className="button button-text" onClick={() => filter.resetFilters()}>
                                <em className="mdi mdi-close icon-start" />
                                Wis filters
                            </div>
                        )}

                        {!filter.show && (
                            <Fragment>
                                {filterActiveValues.source == 'changes' && (
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
                                                    filterActiveValues.source == 'all' ? 'active' : ''
                                                }`}
                                                onClick={() => filterUpdate({ source: 'all' })}>
                                                All
                                            </div>

                                            <div
                                                className={`label-tab label-tab-sm ${
                                                    filterActiveValues.source == 'changes' ? 'active' : ''
                                                }`}
                                                onClick={() => filterUpdate({ source: 'changes' })}>
                                                Changes
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
                                        data-dusk="searchTransaction"
                                        placeholder={translate('transactions.labels.search')}
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

                                            <FilterItemToggle label={translate('sponsor_products.filters.state')}>
                                                <SelectControl
                                                    className="form-control"
                                                    propKey={'key'}
                                                    allowSearch={false}
                                                    value={filter.values.state}
                                                    options={statesOptions}
                                                    optionsComponent={SelectControlOptions}
                                                    onChange={(state: string) => filter.update({ state })}
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle
                                                label={translate('sponsor_products.filters.implementation')}>
                                                <SelectControl
                                                    className="form-control"
                                                    propKey={'id'}
                                                    allowSearch={false}
                                                    value={filter.values.implementation_id}
                                                    options={implementations}
                                                    optionsComponent={SelectControlOptions}
                                                    onChange={(implementation_id: string) =>
                                                        filter.update({ implementation_id })
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
                                                            value={filter.values.amount_min || ''}
                                                            onChange={(e) => {
                                                                filter.update({ amount_min: e.target.value || null });
                                                            }}
                                                            placeholder={translate('transactions.labels.amount_min')}
                                                        />
                                                    </div>

                                                    <div className="col col-lg-6">
                                                        <input
                                                            className="form-control"
                                                            min={0}
                                                            type="number"
                                                            value={filter.values.amount_max || ''}
                                                            onChange={(e) => {
                                                                filter.update({ amount_max: e.target.value || null });
                                                            }}
                                                            placeholder={translate('transactions.labels.amount_max')}
                                                        />
                                                    </div>
                                                </div>
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

            {!loading && products?.meta?.total > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            {filterValues.source == 'all' ? (
                                <TableTopScroller>
                                    <SponsorProductsGeneralTable products={products?.data} />
                                </TableTopScroller>
                            ) : (
                                <SponsorProductsChangesTable
                                    products={products?.data}
                                    groupBy={filterActiveValues.group_by}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!loading && products.meta.total == 0 && filterActiveValues?.q && (
                <div className="card-section text-center">
                    <div className="card-subtitle">Er zijn geen aanbiedingen gevonden voor de zoekopdracht.</div>
                </div>
            )}

            {!loading && products?.meta?.last_page > 1 && (
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
