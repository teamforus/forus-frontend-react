import React, { Fragment, useCallback, useEffect, useState } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import Product from '../../../props/models/Product';
import { useProductService } from '../../../services/ProductService';
import ProductsList from '../../elements/lists/products-list/ProductsList';
import { useNavigateState } from '../../../modules/state_router/Router';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import useFilterNext from '../../../../dashboard/modules/filter_next/useFilterNext';
import { NumberParam, StringParam } from 'use-query-params';

export default function BookmarkedProducts() {
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const productService = useProductService();

    const [products, setProducts] = useState<PaginationData<Product>>(null);
    const [sortByOptions] = useState(productService.getSortOptions());

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        page: number;
        display_type: 'list' | 'grid';
        order_by: 'created_at' | 'price' | 'most_popular' | 'name';
        order_dir: 'asc' | 'desc';
    }>(
        {
            page: 1,
            display_type: 'list',
            order_by: sortByOptions[0]?.value.order_by,
            order_dir: sortByOptions[0]?.value.order_dir,
        },
        {
            queryParams: {
                page: NumberParam,
                display_type: StringParam,
                order_by: StringParam,
                order_dir: StringParam,
            },
            filterParams: ['display_type'],
        },
    );

    const fetchProducts = useCallback(() => {
        setProgress(0);

        productService
            .list({ ...filterValuesActive, bookmarked: 1 })
            .then((res) => setProducts(res.data))
            .finally(() => setProgress(100));
    }, [productService, filterValuesActive, setProgress]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <BlockShowcaseProfile
            breadcrumbs={
                <div className="block block-breadcrumbs">
                    <StateNavLink name={'home'} className="breadcrumb-item">
                        Home
                    </StateNavLink>
                    <div className="breadcrumb-item active" aria-current="location">
                        Mijn verlanglijstje
                    </div>
                </div>
            }
            profileHeader={
                products && (
                    <div className="profile-content-header clearfix">
                        <div className="profile-content-title">
                            <div className="pull-left">
                                <div className="profile-content-title-count">{products.meta.total}</div>
                                <h1 className="profile-content-header">Mijn verlanglijstje</h1>
                            </div>
                        </div>
                        <div className="block block-label-tabs form pull-right">
                            {/*todo: fix styles*/}
                            {/*<div className="showcase-filters-item">
                                <label className="form-label">Sorteer</label>
                                <SelectControl
                                    id="sort_by"
                                    allowSearch={false}
                                    propKey={'id'}
                                    propValue={'label'}
                                    value={sortBy}
                                    options={sortByOptions}
                                    placeholder="Sorteer"
                                    onChange={(sortBy: number) => {
                                        setSortBy(sortByOptions?.find((item) => item.id == sortBy));
                                    }}
                                />
                            </div>*/}
                            <div className="label-tab-set">
                                <div
                                    className={`label-tab label-tab-sm ${
                                        filterValues.display_type == 'list' ? 'active' : ''
                                    }`}
                                    onClick={() => filterUpdate({ display_type: 'list' })}
                                    aria-pressed={filterValues.display_type == 'list'}
                                    role="button">
                                    <em className="mdi mdi-format-list-text icon-start" />
                                    Lijst
                                </div>
                                <div
                                    className={`label-tab label-tab-sm ${
                                        filterValues.display_type == 'grid' ? 'active' : ''
                                    }`}
                                    onClick={() => filterUpdate({ display_type: 'grid' })}
                                    aria-pressed={filterValues.display_type == 'grid'}
                                    role="button">
                                    <em className="mdi mdi-view-grid-outline icon-start" />
                                    {"Foto's"}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }>
            {products && (
                <Fragment>
                    {products.meta.total > 0 ? (
                        <ProductsList display={filterValues.display_type} products={products.data} />
                    ) : (
                        <EmptyBlock
                            title="Er zijn nog geen aanbiedingen toegevoegd."
                            svgIcon="reimbursements"
                            hideLink={true}
                            button={{
                                iconEnd: true,
                                icon: 'arrow-right',
                                type: 'primary',
                                text: 'Bekijk het aanbod',
                                onClick: () => navigateState('products'),
                            }}
                        />
                    )}

                    <div className="card" hidden={products?.meta?.last_page < 2}>
                        <div className="card-section">
                            <Paginator
                                meta={products.meta}
                                filters={filterValues}
                                updateFilters={filterUpdate}
                                buttonClass={'button-primary-outline'}
                            />
                        </div>
                    </div>
                </Fragment>
            )}
        </BlockShowcaseProfile>
    );
}