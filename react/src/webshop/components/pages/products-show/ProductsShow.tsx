import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useAssetUrl from '../../../hooks/useAssetUrl';
import { useNavigateState, useStateParams } from '../../../modules/state_router/Router';
import { GoogleMap } from '../../../../dashboard/components/elements/google-map/GoogleMap';
import Office from '../../../../dashboard/props/models/Office';
import Provider from '../../../props/models/Provider';
import Product from '../../../props/models/Product';
import { useVoucherService } from '../../../services/VoucherService';
import { useProductService } from '../../../services/ProductService';
import { useProviderService } from '../../../services/ProviderService';
import Markdown from '../../elements/markdown/Markdown';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import ProvidersListItem from '../../elements/lists/providers-list/ProvidersListItem';
import MapMarkerProviderOffice from '../../elements/map-markers/MapMarkerProviderOffice';
import useBookmarkProductToggle from '../../../services/helpers/useBookmarkProductToggle';
import ProductFundsCard from './elements/ProductFundsCard';
import Voucher from '../../../../dashboard/props/models/Voucher';
import useSetTitle from '../../../hooks/useSetTitle';
import useEnvData from '../../../hooks/useEnvData';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';

export default function ProductsShow() {
    const { id } = useParams();

    const envData = useEnvData();
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();

    const assetUrl = useAssetUrl();
    const setTitle = useSetTitle();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();
    const bookmarkProductToggle = useBookmarkProductToggle();

    const productService = useProductService();
    const voucherService = useVoucherService();
    const providerService = useProviderService();

    const [product, setProduct] = useState<Product>(null);
    const [provider, setProvider] = useState<Provider>(null);
    const [vouchers, setVouchers] = useState<Array<Voucher>>(null);

    const { searchParams } = useStateParams();

    const hasBudgetFunds = useMemo(() => {
        return product?.funds.filter((fund) => fund.type === 'budget').length > 0;
    }, [product?.funds]);

    const hasSubsidyFunds = useMemo(() => {
        return product?.funds.filter((fund) => fund.type === 'subsidies').length > 0;
    }, [product?.funds]);

    const toggleBookmark = useCallback(
        async (e: React.MouseEvent, product: Product) => {
            e.preventDefault();
            e.stopPropagation();

            setProduct({ ...product, bookmarked: await bookmarkProductToggle(product) });
        },
        [bookmarkProductToggle],
    );

    const fetchProduct = useCallback(() => {
        setProgress(0);

        productService
            .read(parseInt(id))
            .then((res) => setProduct(res.data.data))
            .finally(() => setProgress(100));
    }, [productService, setProgress, id]);

    const fetchProvider = useCallback(() => {
        if (!product?.organization_id) {
            return setProvider(null);
        }

        setProgress(0);

        providerService
            .read(product.organization_id)
            .then((res) => setProvider(res.data.data))
            .finally(() => setProgress(100));
    }, [product?.organization_id, setProgress, providerService]);

    const fetchVouchers = useCallback(() => {
        if (!authIdentity) {
            return setVouchers([]);
        }

        setProgress(0);

        voucherService
            .list({ product_id: parseInt(id), type: 'regular', state: 'active' })
            .then((res) => setVouchers(res.data.data))
            .finally(() => setProgress(100));
    }, [authIdentity, voucherService, setProgress, id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    useEffect(() => {
        fetchProvider();
    }, [fetchProvider]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    useEffect(() => {
        if (!appConfigs?.products?.show) {
            navigateState('home');
            return;
        }
    }, [appConfigs, navigateState]);

    useEffect(() => {
        if (product?.name && product?.organization?.name && envData?.client_key) {
            setTitle(
                translate('page_state_titles.product', {
                    product_name: product?.name || '',
                    implementation: translate(`implementation_name.${envData?.client_key}`, null, ''),
                    organization_name: product?.organization?.name || '',
                }),
            );
        }
    }, [envData?.client_key, product, product?.name, product?.organization?.name, setTitle, translate]);

    return (
        <BlockShowcase
            wrapper={true}
            breadcrumbs={
                product && (
                    <div className="block block-breadcrumbs">
                        {searchParams && (
                            <StateNavLink
                                className="breadcrumb-item breadcrumb-item-back"
                                name={'search-result'}
                                state={searchParams}>
                                <em className="mdi mdi-chevron-left" />
                                Terug
                            </StateNavLink>
                        )}
                        <StateNavLink name="home" className="breadcrumb-item">
                            {translate('product.headers.home')}
                        </StateNavLink>

                        {hasBudgetFunds && (
                            <StateNavLink className="breadcrumb-item" activeExact={true} name="products">
                                {translate('product.headers.products')}
                            </StateNavLink>
                        )}

                        {hasSubsidyFunds && !hasBudgetFunds && (
                            <StateNavLink className="breadcrumb-item" activeExact={true} name="actions">
                                {translate('product.headers.subsidies')}
                            </StateNavLink>
                        )}

                        <div className="breadcrumb-item active" aria-current="location">
                            {product.name}
                        </div>
                    </div>
                )
            }>
            {product && (
                <section className="section section-product">
                    <div className="block block-product">
                        <div className="product-card">
                            <div className="product-photo">
                                <img
                                    src={
                                        product.photo?.sizes?.large ||
                                        assetUrl('/assets/img/placeholders/product-large.png')
                                    }
                                    alt={productService.transformProductAlternativeText(product)}
                                />
                            </div>
                            <div className="product-details">
                                <h1 className="product-name">
                                    <span data-dusk="productName">{product.name}</span>

                                    {!product.deleted && product.sold_out && (
                                        <span className="label label-danger">
                                            {translate('product.status.out_of_stock')}
                                        </span>
                                    )}
                                </h1>
                                <div className="organization-name">{product.organization?.name}</div>
                                <div className="product-properties">
                                    <div className="product-property">
                                        <div className="product-property-label">
                                            {translate('product.labels.category')}
                                        </div>
                                        <div className="product-property-value">{product.product_category.name}</div>
                                    </div>
                                </div>
                                <div className="product-properties">
                                    <div className="product-property product-property-full">
                                        <div className="product-property-label">
                                            {translate('product.labels.description')}
                                        </div>
                                        <div className="product-property-value">
                                            <Markdown content={product.description_html} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {authIdentity && (
                                <div
                                    className={`block block-bookmark-toggle ${product.bookmarked ? 'active' : ''}`}
                                    onClick={(e) => toggleBookmark(e, product)}
                                    onKeyDown={clickOnKeyEnter}
                                    role={'button'}
                                    tabIndex={0}
                                    aria-label="toevoegen aan verlanglijstje"
                                    aria-pressed={product.bookmarked}>
                                    <em className="mdi mdi-cards-heart" />
                                </div>
                            )}
                        </div>

                        {product && vouchers && <ProductFundsCard product={product} vouchers={vouchers} />}

                        {provider && (
                            <div className="block block-organizations">
                                <ProvidersListItem provider={provider} display={'list'} />
                            </div>
                        )}

                        {appConfigs?.show_product_map && (
                            <div className="block block-map_card">
                                <div className="map_card-header">
                                    <h2 className="map_card-title">{translate('product.headers.map')}</h2>
                                </div>
                                <div className="map_card-iframe">
                                    <GoogleMap
                                        appConfigs={appConfigs}
                                        mapPointers={product.offices}
                                        mapGestureHandling={'greedy'}
                                        mapGestureHandlingMobile={'none'}
                                        fullscreenPosition={window.google.maps.ControlPosition.TOP_RIGHT}
                                        markerTemplate={(office: Office) => <MapMarkerProviderOffice office={office} />}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </BlockShowcase>
    );
}
