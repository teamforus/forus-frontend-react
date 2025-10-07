import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
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
import Fund from '../../../props/models/Fund';
import { useFundService } from '../../../services/FundService';
import PayoutTransaction from '../../../../dashboard/props/models/PayoutTransaction';
import usePayoutTransactionService from '../../../services/PayoutTransactionService';
import Section from '../../elements/sections/Section';
import useShowProductPaymentOptionsInfoModal from '../../../hooks/useShowProductPaymentOptionsInfoModal';
import useProductFeatures from '../../../hooks/useProductFeatures';

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
    const showProductIconsInfoModal = useShowProductPaymentOptionsInfoModal();

    const fundService = useFundService();
    const productService = useProductService();
    const voucherService = useVoucherService();
    const providerService = useProviderService();
    const payoutTransactionService = usePayoutTransactionService();

    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [product, setProduct] = useState<Product>(null);
    const [provider, setProvider] = useState<Provider>(null);
    const [payouts, setPayouts] = useState<Array<PayoutTransaction>>(null);
    const [vouchers, setVouchers] = useState<Array<Voucher>>(null);

    const productFeatures = useProductFeatures(product);

    const { showBack } = useStateParams<{ showBack: boolean }>();

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
        setProgress(0);

        voucherService
            .list({ product_id: parseInt(id), type: 'regular', state: 'active' })
            .then((res) => setVouchers(res.data.data))
            .finally(() => setProgress(100));
    }, [voucherService, setProgress, id]);

    const fetchPayouts = useCallback(() => {
        setProgress(0);

        payoutTransactionService
            .list()
            .then((res) => setPayouts(res.data.data))
            .finally(() => setProgress(100));
    }, [setProgress, payoutTransactionService]);

    const fetchFunds = useCallback(() => {
        if (!product?.funds.length) {
            return;
        }

        fundService
            .list({ per_page: 100, check_criteria: 1, fund_ids: product?.funds.map((fund) => fund.id) })
            .then((res) => setFunds(res.data.data));
    }, [fundService, product?.funds]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    useEffect(() => {
        fetchProvider();
    }, [fetchProvider]);

    useEffect(() => {
        if (authIdentity) {
            fetchVouchers();
            fetchPayouts();
        } else {
            setVouchers([]);
            setPayouts([]);
        }
    }, [authIdentity, fetchPayouts, fetchVouchers]);

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
            breadcrumbItems={
                product && [
                    showBack && { name: translate('product.breadcrumbs.back'), back: true },
                    { name: translate('product.breadcrumbs.home'), state: 'home' },
                    { name: translate('product.breadcrumbs.products'), state: 'products' },
                    product && { name: product.name },
                ]
            }>
            {product && funds && vouchers && (
                <Section type={'product'}>
                    <div className="block block-product">
                        <div className="product-content">
                            <div className="product-photo">
                                <img
                                    src={
                                        product.photos[0]?.sizes?.large ||
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

                                {authIdentity && (
                                    <div
                                        className={`block block-bookmark-toggle ${product.bookmarked ? 'active' : ''}`}
                                        onClick={(e) => toggleBookmark(e, product)}
                                        onKeyDown={clickOnKeyEnter}
                                        role={'button'}
                                        tabIndex={0}
                                        aria-label={translate('product.buttons.bookmark')}
                                        aria-pressed={product.bookmarked}>
                                        {product.bookmarked ? (
                                            <em className="mdi mdi-cards-heart" aria-hidden="true" />
                                        ) : (
                                            <em className="mdi mdi-cards-heart-outline" aria-hidden="true" />
                                        )}
                                    </div>
                                )}

                                <dl className="product-properties">
                                    <div className="product-property">
                                        <dt id="categoryLabel" className="product-property-label">
                                            {translate('product.labels.category')}
                                        </dt>
                                        <dd className="product-property-value">{product.product_category.name}</dd>
                                    </div>

                                    <div className="product-property">
                                        <dt id="paymentOptionsLabel" className="product-property-label">
                                            {translate('product.labels.payment_options')}
                                        </dt>
                                        <dd className="product-property-value flex flex-gap flex-vertical">
                                            <ul
                                                className="product-property-icons"
                                                role="list"
                                                aria-labelledby="paymentOptionsLabel">
                                                {productFeatures.feature_scanning_enabled && (
                                                    <li className="product-property-icons-item">
                                                        <span aria-hidden="true">
                                                            <em className="mdi mdi-qrcode-scan" />
                                                        </span>
                                                        <span>{translate('product.labels.payment_option_qr')}</span>
                                                    </li>
                                                )}

                                                {productFeatures.feature_reservations_enabled && (
                                                    <li className="product-property-icons-item">
                                                        <span aria-hidden="true">
                                                            <em className="mdi mdi-tag-multiple-outline" />
                                                        </span>
                                                        <span>
                                                            {translate('product.labels.payment_option_reservation')}
                                                        </span>
                                                    </li>
                                                )}

                                                {productFeatures.feature_reservation_extra_payments_enabled && (
                                                    <li className="product-property-icons-item">
                                                        <img
                                                            src={assetUrl('/assets/img/icon-ideal.svg')}
                                                            alt=""
                                                            aria-hidden="true"
                                                        />
                                                        <span>{translate('product.labels.payment_option_ideal')}</span>
                                                    </li>
                                                )}
                                            </ul>

                                            <button
                                                type="button"
                                                className="product-property-info-link"
                                                onClick={showProductIconsInfoModal}>
                                                <em
                                                    className="mdi mdi-information-variant-circle-outline"
                                                    aria-hidden="true"
                                                />
                                                <span>{translate('product.labels.payment_option_link')}</span>
                                            </button>
                                        </dd>
                                    </div>

                                    <div className="product-property">
                                        <dt id="descriptionLabel" className="product-property-label">
                                            {translate('product.labels.description')}
                                        </dt>
                                        <dd className="product-property-value">
                                            <Markdown content={product.description_html} />
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        <ProductFundsCard funds={funds} product={product} vouchers={vouchers} payouts={payouts} />

                        {provider && (
                            <div className="block block-organizations">
                                <ProvidersListItem provider={provider} display={'list'} />
                            </div>
                        )}

                        {appConfigs?.show_product_map && (
                            <div className="block block-map_card">
                                <div className="map_card-header">
                                    <h2 className="map_card-title">{translate('product.map.title')}</h2>
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
                </Section>
            )}
        </BlockShowcase>
    );
}
