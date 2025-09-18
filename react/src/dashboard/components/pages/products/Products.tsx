import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useSetProgress from '../../../hooks/useSetProgress';
import useProductService from '../../../services/ProductService';
import Product from '../../../props/models/Product';
import { PaginationData } from '../../../props/ApiResponses';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useFilter from '../../../hooks/useFilter';
import useOpenModal from '../../../hooks/useOpenModal';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Paginator from '../../../modules/paginator/components/Paginator';
import ModalNotification from '../../modals/ModalNotification';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import TableRowActions from '../../elements/tables/TableRowActions';
import classNames from 'classnames';
import BlockLabelTabs from '../../elements/block-label-tabs/BlockLabelTabs';
import TableEntityMain from '../../elements/tables/elements/TableEntityMain';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';

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

    const filter = useFilter({
        q: '',
        source: 'provider',
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const { headElement, configsElement } = useConfigurableTable(productService.getColumns(), {
        sortable: true,
        filter: filter,
    });

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
            .list(activeOrganization.id, filter.activeValues)
            .then((res) => setProducts(res.data))
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [productService, activeOrganization.id, setProgress, filter?.activeValues]);

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
                    {translate('products.offers')} ({products.meta.total})
                </div>

                <div className="card-header-filters">
                    <div className="block block-inline-filters form">
                        <StateNavLink
                            name={'products-create'}
                            params={{ organizationId: activeOrganization.id }}
                            className={`button button-primary button-sm ${productHardLimitReached ? 'disabled' : ''}`}
                            id="add_product"
                            disabled={productHardLimitReached}>
                            <em className="mdi mdi-plus-circle icon-start" />
                            {translate('products.add')}
                            {productSoftLimitReached
                                ? ` (${products.meta.total_provider} / ${maxProductHardLimit})`
                                : ``}
                        </StateNavLink>

                        <BlockLabelTabs
                            value={filter.values.source}
                            setValue={(value) => filter.update({ source: value })}
                            tabs={[
                                { value: 'provider', label: `In uw beheer (${products?.meta?.total_provider})` },
                                { value: 'sponsor', label: `In beheer van sponsor (${products?.meta?.total_sponsor})` },
                                { value: 'archive', label: `Archief (${products?.meta?.total_archived})` },
                            ]}
                        />
                        <div className="form">
                            <div className="form-group">
                                {/*TODO: add arialabel*/}
                                <input
                                    className="form-control"
                                    type="text"
                                    value={filter.values.q}
                                    onChange={(e) => filter.update({ q: e.target.value })}
                                    data-dusk="searchTransaction"
                                    placeholder={translate('transactions.labels.search')}
                                />
                            </div>
                        </div>
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

            {!loading && products?.meta.total > 0 && (
                <div className="card-section card-section-padless">
                    {configsElement}

                    <TableTopScroller>
                        <table className="table">
                            {headElement}

                            <tbody>
                                {products?.data.map((product) => (
                                    <StateNavLink
                                        key={product.id}
                                        name={'products-show'}
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
                                                media={product.photo}
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

                                        <td className={product.expire_at_locale ? '' : 'text-muted'}>
                                            {product.expire_at_locale ? product.expire_at_locale : 'Geen'}
                                        </td>

                                        <td className={product.expired ? '' : 'text-muted'}>
                                            {product.expired ? 'Ja' : 'Nee'}
                                        </td>

                                        <td className={'table-td-actions text-right'}>
                                            {filter.values.source != 'archive' ? (
                                                <TableRowActions
                                                    content={(e) => (
                                                        <div className="dropdown dropdown-actions">
                                                            <StateNavLink
                                                                name={'products-show'}
                                                                params={{
                                                                    id: product.id,
                                                                    organizationId: activeOrganization.id,
                                                                }}
                                                                className="dropdown-item">
                                                                <div className="mdi mdi-eye-outline icon-start" />
                                                                Bekijk
                                                            </StateNavLink>

                                                            <StateNavLink
                                                                name={'products-edit'}
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
                                                                    name={'products-show'}
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
            )}

            {!loading && filter.values.source == 'provider' && products.meta.total == 0 && !filter.activeValues.q && (
                <div className="card-section text-center">
                    <div className="card-subtitle">Er zijn momenteel geen aanbiedingen.</div>
                    <br />
                    <StateNavLink
                        name={'products-create'}
                        params={{ organizationId: activeOrganization.id }}
                        className="button button-primary">
                        <em className="mdi mdi-plus-circle icon-start" />
                        Aanbieding toevoegen
                    </StateNavLink>
                </div>
            )}

            {!loading && filter.values.source == 'provider' && products.meta.total == 0 && filter.activeValues.q && (
                <div className="card-section text-center">
                    <div className="card-subtitle">Er zijn geen aanbiedingen gevonden voor de zoekopdracht.</div>
                </div>
            )}

            {!loading && filter.values.source == 'sponsor' && products.meta.total == 0 && (
                <div className="card-section">
                    <div className="card-subtitle text-center">Er zijn momenteel geen aanbiedingen.</div>
                </div>
            )}

            {!loading && filter.values.source == 'archive' && products.meta.total == 0 && (
                <div className="card-section">
                    <div className="card-subtitle text-center">Er zijn momenteel geen aanbiedingen.</div>
                </div>
            )}

            {!loading && products?.meta && (
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
