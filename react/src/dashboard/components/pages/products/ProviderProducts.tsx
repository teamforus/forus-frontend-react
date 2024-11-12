import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useAssetUrl from '../../../hooks/useAssetUrl';
import useSetProgress from '../../../hooks/useSetProgress';
import useProductService from '../../../services/ProductService';
import Product from '../../../props/models/Product';
import { PaginationData } from '../../../props/ApiResponses';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useFilter from '../../../hooks/useFilter';
import ThSortable from '../../elements/tables/ThSortable';
import { strLimit } from '../../../helpers/string';
import useOpenModal from '../../../hooks/useOpenModal';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Paginator from '../../../modules/paginator/components/Paginator';
import ModalNotification from '../../modals/ModalNotification';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import EmptyCard from '../../elements/empty-card/EmptyCard';

type ProductsDataLocal = PaginationData<
    Product,
    { total_archived: number; total_provider: number; total_sponsor: number }
>;

export default function ProviderProducts() {
    const activeOrganization = useActiveOrganization();

    const assetUrl = useAssetUrl();
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

    const deleteProduct = useCallback(
        function (product) {
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
                <div className="flex-row">
                    <div className="flex flex-grow">
                        <div className="flex-col">
                            <div className="card-title">
                                {translate('products.offers')} ({products.meta.total})
                            </div>
                        </div>
                    </div>
                    <div className="form">
                        <div className="block block-inline-filters">
                            <StateNavLink
                                name={'products-create'}
                                params={{ organizationId: activeOrganization.id }}
                                className={`button button-primary button-sm ${
                                    productHardLimitReached ? 'disabled' : ''
                                }`}
                                id="add_product"
                                disabled={productHardLimitReached}>
                                <em className="mdi mdi-plus-circle icon-start" />
                                {translate('products.add')}
                                {productSoftLimitReached
                                    ? ` (${products.meta.total_provider} / ${maxProductHardLimit})`
                                    : ``}
                            </StateNavLink>

                            <div className="form">
                                <div>
                                    <div className="block block-label-tabs">
                                        <div className="label-tab-set">
                                            <div
                                                className={`label-tab label-tab-sm ${
                                                    filter.values.source == 'provider' ? 'active' : ''
                                                }`}
                                                onClick={() => filter.update({ source: 'provider' })}>
                                                In uw beheer ({products.meta.total_provider})
                                            </div>
                                            <div
                                                className={`label-tab label-tab-sm ${
                                                    filter.values.source == 'sponsor' ? 'active' : ''
                                                }`}
                                                onClick={() => filter.update({ source: 'sponsor' })}>
                                                In beheer van sponsor ({products.meta.total_sponsor})
                                            </div>
                                            <div
                                                className={`label-tab label-tab-sm ${
                                                    filter.values.source == 'archive' ? 'active' : ''
                                                }`}
                                                onClick={() => filter.update({ source: 'archive' })}>
                                                Archief ({products.meta.total_archived})
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="form">
                                <div className="form-group">
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
            </div>

            {loading && <LoadingCard type={'card-section'} />}

            {!loading && products?.meta.total > 0 && (
                <div className="card-section card-section-padless">
                    <div className="table-wrapper">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <ThSortable
                                        className="th-narrow nowrap"
                                        filter={filter}
                                        label={translate('products.labels.id')}
                                        value="id"
                                    />

                                    <ThSortable
                                        disabled={true}
                                        className="th-narrow nowrap"
                                        filter={filter}
                                        label={translate('products.labels.photo')}
                                        value="photo"
                                    />

                                    <ThSortable
                                        className={'nowrap'}
                                        filter={filter}
                                        label={translate('products.labels.name')}
                                        value="name"
                                    />

                                    <ThSortable
                                        className={'nowrap'}
                                        filter={filter}
                                        label={translate('products.labels.stock_amount')}
                                        value="stock_amount"
                                    />

                                    <ThSortable
                                        className={'nowrap'}
                                        filter={filter}
                                        label={translate('products.labels.price')}
                                        value="price"
                                    />

                                    <ThSortable
                                        className={'nowrap'}
                                        filter={filter}
                                        label={translate('products.labels.expire_at')}
                                        value="expire_at"
                                    />

                                    <ThSortable
                                        className={'nowrap'}
                                        filter={filter}
                                        label={translate('products.labels.expired')}
                                        value="expire_at"
                                    />

                                    {filter.values.source != 'archive' && (
                                        <th className="text-right nowrap th-narrow">
                                            {translate('products.labels.actions')}
                                        </th>
                                    )}
                                </tr>
                                {products?.data.map((product) => (
                                    <tr key={product.id}>
                                        <td>{product.id}</td>
                                        <td>
                                            <img
                                                alt={product.name}
                                                className="td-media"
                                                src={
                                                    product.photo?.sizes?.thumbnail ||
                                                    assetUrl('/assets/img/placeholders/product-small.png')
                                                }
                                            />
                                        </td>
                                        <td>
                                            <div className="relative">
                                                <div className="block block-tooltip-details block-tooltip-hover flex flex-inline">
                                                    <span className="text-word-break">
                                                        {strLimit(product.name, 100)}
                                                    </span>
                                                    {product.name.length > 100 && (
                                                        <div
                                                            className="tooltip-content tooltip-content-fit tooltip-content-bottom tooltip-content-compact"
                                                            onClick={(e) => e.stopPropagation()}>
                                                            <div className="triangle" />
                                                            <div className="nowrap">{product.name}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {product.unlimited_stock ? (
                                            <td>{translate('product_edit.labels.unlimited')}</td>
                                        ) : (
                                            <td>{product.stock_amount}</td>
                                        )}

                                        <td>{product.price_locale}</td>

                                        <td className={product.expire_at_locale ? '' : 'text-muted'}>
                                            {product.expire_at_locale ? product.expire_at_locale : 'Geen'}
                                        </td>

                                        <td className={product.expired ? '' : 'text-muted'}>
                                            {product.expired ? 'Ja' : 'Nee'}
                                        </td>

                                        {filter.values.source != 'archive' && (
                                            <td className={'text-right'}>
                                                <div className="button-group">
                                                    {product.sponsor_organization ? (
                                                        <button
                                                            type="button"
                                                            className="button button-danger button-icon"
                                                            onClick={() => deleteProduct(product)}>
                                                            <em className="mdi mdi-close icon-start icon-start" />
                                                        </button>
                                                    ) : (
                                                        <StateNavLink
                                                            name={'products-show'}
                                                            params={{
                                                                id: product.id,
                                                                organizationId: activeOrganization.id,
                                                            }}
                                                            className={`button button-primary-light button-icon ${
                                                                !(product.unseen_messages > 0) ? 'button-disabled' : ''
                                                            }`}>
                                                            <em className="mdi mdi-message-text" />
                                                        </StateNavLink>
                                                    )}

                                                    <StateNavLink
                                                        name={'products-edit'}
                                                        params={{
                                                            id: product.id,
                                                            organizationId: activeOrganization.id,
                                                        }}
                                                        className="button button-default button-icon">
                                                        <div className="mdi mdi-pencil-outline icon-start" />
                                                    </StateNavLink>

                                                    <StateNavLink
                                                        name={'products-show'}
                                                        params={{
                                                            id: product.id,
                                                            organizationId: activeOrganization.id,
                                                        }}
                                                        className="button button-primary button-icon">
                                                        <div className="mdi mdi-eye-outline icon-start" />
                                                    </StateNavLink>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                <EmptyCard title={'Er zijn geen aanbiedingen gevonden voor de zoekopdracht.'} type={'card-section'} />
            )}

            {!loading && filter.values.source == 'sponsor' && products.meta.total == 0 && (
                <EmptyCard title={'Er zijn momenteel geen aanbiedingen.'} type={'card-section'} />
            )}

            {!loading && filter.values.source == 'archive' && products.meta.total == 0 && (
                <EmptyCard title={'Er zijn momenteel geen aanbiedingen.'} type={'card-section'} />
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
