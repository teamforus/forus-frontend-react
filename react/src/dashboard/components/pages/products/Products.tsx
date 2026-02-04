import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import useSetProgress from '../../../hooks/useSetProgress';
import useProductService from '../../../services/ProductService';
import Product from '../../../props/models/Product';
import { PaginationData } from '../../../props/ApiResponses';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useOpenModal from '../../../hooks/useOpenModal';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import ModalNotification from '../../modals/ModalNotification';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import TableRowActions from '../../elements/tables/TableRowActions';
import classNames from 'classnames';
import BlockLabelTabs from '../../elements/block-label-tabs/BlockLabelTabs';
import TableEntityMain from '../../elements/tables/elements/TableEntityMain';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { createEnumParam, NumberParam, StringParam } from 'use-query-params';

type ProductsDataLocal = PaginationData<
    Product,
    { total_archived: number; total_provider: number; total_sponsor: number }
>;

export default function Products() {
    const activeOrganization = useActiveOrganization();

    const translate = useTranslate();

    const productService = useProductService();
    const paginatorService = usePaginatorService();

    const openModal = useOpenModal();
    const appConfigs = useAppConfigs();
    const setProgress = useSetProgress();

    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<ProductsDataLocal>(null);
    const [paginatorKey] = useState('products');

    const maxProductHardLimit = useMemo(() => appConfigs?.products_hard_limit, [appConfigs]);
    const maxProductSoftLimit = useMemo(() => appConfigs?.products_soft_limit, [appConfigs]);

    const productHardLimitReached = useMemo(() => {
        return maxProductHardLimit > 0 && products?.meta?.total_provider >= maxProductHardLimit;
    }, [maxProductHardLimit, products?.meta?.total_provider]);

    const productSoftLimitReached = useMemo(() => {
        return maxProductSoftLimit > 0 && products?.meta?.total_provider >= maxProductSoftLimit;
    }, [maxProductSoftLimit, products?.meta?.total_provider]);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q: string;
        source: 'provider' | 'sponsor' | 'archive';
        page?: number;
        per_page?: number;
        order_by?: string;
        order_dir?: string;
    }>(
        {
            q: '',
            source: 'provider',
            page: 1,
            per_page: paginatorService.getPerPage(paginatorKey),
            order_by: 'id',
            order_dir: 'desc',
        },
        {
            queryParams: {
                q: StringParam,
                source: createEnumParam(['provider', 'sponsor', 'archive']),
                per_page: NumberParam,
                page: NumberParam,
                order_by: StringParam,
                order_dir: StringParam,
            },
        },
    );

    const deleteProduct = useCallback(
        function (product: Product) {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    icon={'product-create'}
                    title={translate('products.confirm_delete.title')}
                    description={translate('products.confirm_delete.description')}
                    buttonSubmit={{
                        onClick: () => {
                            modal.close();
                            productService
                                .destroy(product.organization_id, product.id)
                                .then(() => document.location.reload());
                        },
                    }}
                />
            ));
        },
        [productService, openModal, translate],
    );

    const fetchProducts = useCallback(() => {
        setProgress(0);
        setLoading(true);

        productService
            .list(activeOrganization.id, {
                ...filterValuesActive,
                order_by: filterValuesActive.order_by === 'expired_at' ? 'expire_at' : filterValuesActive.order_by,
            })
            .then((res) => setProducts(res.data))
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [productService, activeOrganization.id, setProgress, filterValuesActive]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    if (!products) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {translate('products.offers')} ({products?.meta?.total})
                </div>

                <div className="card-header-filters">
                    <div className="block block-inline-filters form">
                        <StateNavLink
                            name={DashboardRoutes.PRODUCT_CREATE}
                            params={{ organizationId: activeOrganization.id }}
                            className={classNames(
                                'button',
                                'button-primary',
                                'button-sm',
                                productHardLimitReached && 'disabled',
                            )}
                            id="add_product"
                            disabled={productHardLimitReached}>
                            <em className="mdi mdi-plus-circle icon-start" />
                            {translate('products.add')}
                            {productSoftLimitReached
                                ? ` (${products?.meta?.total_provider} / ${maxProductHardLimit})`
                                : ``}
                        </StateNavLink>

                        <BlockLabelTabs
                            value={filterValues.source}
                            setValue={(value: 'provider' | 'sponsor' | 'archive') => filterUpdate({ source: value })}
                            tabs={[
                                { value: 'provider', label: `In uw beheer (${products?.meta?.total_provider})` },
                                { value: 'sponsor', label: `In beheer van sponsor (${products?.meta?.total_sponsor})` },
                                { value: 'archive', label: `Archief (${products?.meta?.total_archived})` },
                            ]}
                        />
                        <div className="form">
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
                        </div>
                    </div>
                </div>
            </div>

            <LoaderTableCard
                loading={loading}
                empty={products?.meta?.total == 0}
                emptyTitle={
                    filterValues.source == 'provider' && filterValuesActive.q
                        ? 'Er zijn geen aanbiedingen gevonden voor de zoekopdracht.'
                        : 'Er zijn momenteel geen aanbiedingen.'
                }
                emptyButton={
                    filterValues.source == 'provider' &&
                    !filterValuesActive.q && {
                        state: DashboardRoutes.PRODUCT_CREATE,
                        stateParams: { organizationId: activeOrganization.id },
                        type: 'primary',
                        icon: 'plus-circle',
                        text: 'Aanbieding toevoegen',
                    }
                }
                columns={productService.getColumns()}
                tableOptions={{ sortable: true, filter }}
                paginator={{ key: paginatorKey, data: products, filterValues, filterUpdate }}>
                {products?.data?.map((product) => (
                    <StateNavLink
                        key={product.id}
                        name={DashboardRoutes.PRODUCT}
                        params={{
                            id: product.id,
                            organizationId: activeOrganization.id,
                        }}
                        customElement={'tr'}
                        className={'tr-clickable'}>
                        <td className={'td-narrow'}>{product.id}</td>
                        <td title={product.name}>
                            <TableEntityMain
                                title={product.name}
                                titleLimit={64}
                                media={product.photos[0]}
                                mediaRound={false}
                                mediaSize={'md'}
                                mediaPlaceholder={'product'}
                            />
                        </td>

                        {product?.price_type === 'informational' ? (
                            <td>
                                <TableEmptyValue />
                            </td>
                        ) : (
                            <td>
                                {product.unlimited_stock
                                    ? translate('product_edit.labels.unlimited')
                                    : product.stock_amount}
                            </td>
                        )}

                        <td>{product.price_locale}</td>

                        <td className={classNames(!product.expire_at_locale && 'text-muted')}>
                            {product.expire_at_locale ? product.expire_at_locale : 'Geen'}
                        </td>

                        <td className={classNames(!product.expired && 'text-muted')}>
                            {product.expired ? 'Ja' : 'Nee'}
                        </td>

                        <td className={'table-td-actions text-right'}>
                            {filterValues.source != 'archive' ? (
                                <TableRowActions
                                    content={(e) => (
                                        <div className="dropdown dropdown-actions">
                                            <StateNavLink
                                                name={DashboardRoutes.PRODUCT}
                                                params={{
                                                    id: product.id,
                                                    organizationId: activeOrganization.id,
                                                }}
                                                className="dropdown-item">
                                                <div className="mdi mdi-eye-outline icon-start" />
                                                Bekijk
                                            </StateNavLink>

                                            <StateNavLink
                                                name={DashboardRoutes.PRODUCT_EDIT}
                                                params={{
                                                    id: product.id,
                                                    organizationId: activeOrganization.id,
                                                }}
                                                className="dropdown-item">
                                                <div className="mdi mdi-pencil-outline icon-start" />
                                                Bewerking
                                            </StateNavLink>

                                            {product.sponsor_organization ? (
                                                <div
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        deleteProduct(product);
                                                        e.close();
                                                    }}>
                                                    <em className="mdi mdi-close icon-start icon-start" />
                                                    Verwijderen
                                                </div>
                                            ) : (
                                                <StateNavLink
                                                    name={DashboardRoutes.PRODUCT}
                                                    params={{
                                                        id: product.id,
                                                        organizationId: activeOrganization.id,
                                                    }}
                                                    className={classNames(
                                                        'dropdown-item',
                                                        !(product.unseen_messages > 0) && 'disabled',
                                                    )}>
                                                    <em className="mdi mdi-message-text icon-start" />
                                                    Bericht
                                                </StateNavLink>
                                            )}
                                        </div>
                                    )}
                                />
                            ) : (
                                <span className={'text-muted'}>{translate('organization_employees.labels.owner')}</span>
                            )}
                        </td>
                    </StateNavLink>
                ))}
            </LoaderTableCard>
        </div>
    );
}
