import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import ProductsList from '../../elements/lists/products-list/ProductsList';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import BlockShowcaseList from '../../elements/block-showcase/BlockShowcaseList';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import classNames from 'classnames';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';
import useProductsPageFilters from './hooks/useProductsPageFilters';
import ProductsSidebarFilters from './elements/ProductsSidebarFilters';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useSetTitle from '../../../hooks/useSetTitle';
import { useProductService } from '../../../services/ProductService';
import { PaginationData, ResponseError, ResponseErrorData } from '../../../../dashboard/props/ApiResponses';
import Product from '../../../props/models/Product';
import useLatestRequestWithProgress from '../../../../dashboard/hooks/useLatestRequestWithProgress';

export default function Products() {
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();
    const productService = useProductService();
    const runLatestRequest = useLatestRequestWithProgress();

    const setTitle = useSetTitle();
    const translate = useTranslate();

    const [errors, setErrors] = useState<ResponseErrorData>({});
    const [toMax, setToMax] = useState(0);
    const [products, setProducts] = useState<PaginationData<Product, { price_max: number }>>(null);

    const {
        countFiltersApplied,
        filter,
        filterUpdate,
        filterValues,
        funds,
        initialFilterValues,
        productCategories,
        productCategoriesIconMap,
        productsQuery,
        providers,
        sortByOptions,
    } = useProductsPageFilters();

    const fetchProducts = useCallback(
        (query: object) => {
            setErrors(null);

            runLatestRequest((config) => productService.list({ ...query }, config), {
                onSuccess: (res) => {
                    setProducts(res.data);
                    setToMax((max) => Math.max(res.data?.meta?.price_max, max));
                },
                onError: (e: ResponseError) => setErrors(e.data?.errors),
            });
        },
        [productService, runLatestRequest],
    );

    useEffect(() => {
        fetchProducts(productsQuery);
    }, [fetchProducts, productsQuery]);

    useEffect(() => {
        setTitle(translate('page_state_titles.products'));
    }, [setTitle, translate]);

    return (
        <BlockShowcaseList
            dusk="listProductsContent"
            countFiltersApplied={countFiltersApplied}
            breadcrumbItems={[
                { name: translate('products.breadcrumbs.home'), state: WebshopRoutes.HOME },
                { name: translate('products.breadcrumbs.products') },
            ]}
            aside={
                <ProductsSidebarFilters
                    errors={errors}
                    filter={filter}
                    filterValues={filterValues}
                    filterUpdate={filterUpdate}
                    funds={funds}
                    productCategories={productCategories}
                    productCategoriesIconMap={productCategoriesIconMap}
                    providers={providers}
                    initialFilterValues={initialFilterValues}
                    showBookmarkTabs={!!authIdentity}
                    toMax={toMax}
                />
            }>
            {appConfigs && products && (
                <Fragment>
                    <div className="showcase-content-header">
                        <h1 className="showcase-filters-title">
                            {filterValues.bookmarked
                                ? translate('products.filters.bookmarked')
                                : translate('products.title')}
                            <div className="showcase-filters-title-count" data-nosnippet="true">
                                {products?.meta?.total}
                            </div>
                        </h1>
                        <div className="showcase-filters-block">
                            <div className="block block-label-tabs form">
                                <div className="showcase-filters-item">
                                    <div className="form-label" id={'sort_by_label'}>
                                        {translate('products.filters.sort')}
                                    </div>
                                    <SelectControl
                                        id={'sort_by'}
                                        allowSearch={false}
                                        propKey={'id'}
                                        propValue={'label'}
                                        options={sortByOptions}
                                        ariaLabelledby="sort_by_label"
                                        value={
                                            sortByOptions.find(
                                                (option) =>
                                                    option.value.order_by == filterValues.order_by &&
                                                    option.value.order_dir == filterValues.order_dir,
                                            )?.id
                                        }
                                        onChange={(id: number) => {
                                            filterUpdate(
                                                sortByOptions.find((option) => {
                                                    return option.id == id;
                                                })?.value || {},
                                            );
                                        }}
                                        dusk="selectControlOrderBy"
                                    />
                                </div>
                                <div className="label-tab-set">
                                    <div
                                        className={classNames(
                                            'label-tab',
                                            'label-tab-sm',
                                            filterValues.display_type == 'grid' && 'active',
                                        )}
                                        onClick={() => filterUpdate({ display_type: 'grid' })}
                                        onKeyDown={clickOnKeyEnter}
                                        tabIndex={0}
                                        aria-pressed={filterValues.display_type == 'grid'}
                                        role="button">
                                        <em className="mdi mdi-view-grid-outline icon-start" />
                                        {translate('products.view.grid')}
                                    </div>
                                    <div
                                        className={classNames(
                                            'label-tab',
                                            'label-tab-sm',
                                            filterValues.display_type == 'list' && 'active',
                                        )}
                                        onClick={() => filterUpdate({ display_type: 'list' })}
                                        onKeyDown={clickOnKeyEnter}
                                        tabIndex={0}
                                        aria-pressed={filterValues.display_type == 'list'}
                                        role="button">
                                        <em className="mdi mdi-format-list-text icon-start" />
                                        {translate('products.view.list')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {appConfigs.pages.products && <CmsBlocks page={appConfigs.pages.products} />}

                    {products?.meta?.total > 0 && (
                        <ProductsList display={filterValues.display_type} products={products.data} />
                    )}

                    {products?.meta?.total == 0 && (
                        <EmptyBlock
                            title={translate('block_products.labels.title')}
                            description={translate('block_products.labels.subtitle')}
                            hideLink={true}
                            svgIcon={'reimbursements'}
                        />
                    )}

                    <div className="card" hidden={products?.meta?.last_page < 2}>
                        <div className="card-section">
                            <Paginator
                                meta={products.meta}
                                filters={filterValues}
                                count-buttons={5}
                                updateFilters={filterUpdate}
                            />
                        </div>
                    </div>
                </Fragment>
            )}
        </BlockShowcaseList>
    );
}
