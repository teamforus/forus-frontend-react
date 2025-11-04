import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
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
import MapMarkerProviderOffice from '../../elements/map-markers/MapMarkerProviderOffice';
import useBookmarkProductToggle from '../../../services/helpers/useBookmarkProductToggle';
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
import classNames from 'classnames';
import useProductPriceMinLocale from '../../elements/lists/products-list/hooks/useProductPriceMinLocale';
import PaneGroup from '../../elements/block-panel-group/PaneGroup';
import PaneGroupPanel from '../../elements/block-panel-group/PaneGroupPanel';
import BlockOrganizationOffices from '../../elements/block-organization-offices/BlockOrganizationOffices';
import ProductFunds from './elements/ProductFunds';
import ProductMedia from './elements/ProductMedia';
import useStartFundRequest from '../../elements/top-navbar/desktop/hooks/useStartFundRequest';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import RandomProductsBlock from '../home/elements/RandomProductsBlock';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

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
    const startFundRequest = useStartFundRequest();
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
    const price = useProductPriceMinLocale(product);
    const fundsRef = useRef<HTMLDivElement>(null);

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
        if (!product?.funds.length || product.id !== parseInt(id)) {
            setFunds(null);
            return;
        }

        fundService
            .list({ per_page: 100, check_criteria: 1, fund_ids: product?.funds.map((fund) => fund.id) })
            .then((res) => setFunds(res.data.data));
    }, [fundService, product, id]);

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
            navigateState(WebshopRoutes.HOME);
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
            narrow={true}
            breadcrumbItems={
                product && [
                    showBack && { name: translate('product.breadcrumbs.back'), back: true },
                    { name: translate('product.breadcrumbs.home'), state: WebshopRoutes.HOME },
                    { name: translate('product.breadcrumbs.products'), state: WebshopRoutes.PRODUCTS },
                    product && { name: product.name },
                ]
            }>
            {product && funds && vouchers && (
                <Fragment>
                    <Section type={'product'}>
                        <div className="block block-product">
                            <div className="product-overview">
                                <ProductMedia product={product} />

                                <div className="product-overview-details">
                                    <div className="product-overview-provider">
                                        <em className="mdi mdi-storefront-outline" aria-hidden="true" />
                                        <StateNavLink
                                            name={WebshopRoutes.PROVIDER}
                                            params={{ id: product?.organization_id }}
                                            className="product-overview-provider-name">
                                            {product?.organization?.name}
                                        </StateNavLink>

                                        {authIdentity && (
                                            <button
                                                type="button"
                                                className={classNames(
                                                    'block',
                                                    'block-bookmark-toggle',
                                                    'block-bookmark-toggle-compact',
                                                    product.bookmarked && 'active',
                                                )}
                                                onClick={(e) => toggleBookmark(e, product)}
                                                onKeyDown={clickOnKeyEnter}
                                                aria-label={
                                                    product.bookmarked
                                                        ? translate('product.labels.remove_from_favorites')
                                                        : translate('product.labels.add_to_favorites')
                                                }
                                                aria-pressed={product.bookmarked}>
                                                {product.bookmarked ? (
                                                    <em className="mdi mdi-cards-heart" aria-hidden="true" />
                                                ) : (
                                                    <em className="mdi mdi-cards-heart-outline" aria-hidden="true" />
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    <h1 className="product-overview-name" data-dusk="productName">
                                        {product.name}
                                    </h1>
                                    <div className="product-prop-item-category" role="text">
                                        <em className="mdi mdi-television-classic" aria-hidden="true" />
                                        <span>{product?.product_category?.name}</span>
                                    </div>

                                    <div className="product-overview-price">{price}</div>

                                    {authIdentity ? (
                                        <button
                                            type="button"
                                            className="button button-primary button-fill"
                                            onClick={() => fundsRef?.current?.scrollIntoView({ behavior: 'smooth' })}
                                            aria-label={translate('product.labels.buy_now')}>
                                            {translate('product.labels.buy_now')}
                                        </button>
                                    ) : (
                                        <Fragment>
                                            <button
                                                type="button"
                                                className="button button-dark button-fill"
                                                onClick={() => startFundRequest({ reset: 1 })}
                                                aria-label={translate('product.labels.login_to_order')}>
                                                {translate('product.labels.login_to_order')}
                                            </button>

                                            <div className="product-overview-apply">
                                                {translate('product.labels.dont_have_voucher')}
                                                <button
                                                    type="button"
                                                    className="product-overview-apply-link"
                                                    onClick={() => {
                                                        fundsRef?.current?.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                    aria-label={translate('product.labels.request_one_now')}>
                                                    {translate('product.labels.request_one_now')}
                                                    <em className="mdi mdi-chevron-right" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </Fragment>
                                    )}
                                </div>
                            </div>

                            <div className="product-props">
                                {product.info_duration && (
                                    <div className="product-prop-item">
                                        <div className="product-prop-item-icon">
                                            <em className="mdi mdi-calendar-start-outline" aria-hidden="true" />
                                        </div>
                                        <div className="product-prop-item-details">
                                            <h2 className="product-prop-item-title">
                                                {translate('product.labels.duration_of_promotion')}
                                            </h2>
                                            <div className="product-prop-item-description">{product.info_duration}</div>
                                        </div>
                                    </div>
                                )}

                                <div className="product-prop-item">
                                    <div className="product-prop-item-icon">
                                        <em className="mdi mdi-wallet-bifold-outline" aria-hidden="true" />
                                    </div>
                                    <div className="product-prop-item-details">
                                        <h2 className="product-prop-item-title">
                                            {translate('product.labels.payment_options_title')}
                                        </h2>
                                        <div className="product-prop-item-description">
                                            <div className="product-prop-item-payment-options">
                                                {productFeatures.feature_scanning_enabled && (
                                                    <div
                                                        className="product-prop-item-payment-option"
                                                        title={translate('product.labels.payment_option_qr')}
                                                        role="img"
                                                        aria-label={translate('product.labels.payment_option_qr')}>
                                                        <em className="mdi mdi-qrcode" aria-hidden="true" />
                                                    </div>
                                                )}

                                                {productFeatures.feature_reservations_enabled && (
                                                    <div
                                                        className="product-prop-item-payment-option"
                                                        title={translate('product.labels.payment_option_reservation')}
                                                        role="img"
                                                        aria-label={translate(
                                                            'product.labels.payment_option_reservation',
                                                        )}>
                                                        <em
                                                            className="mdi mdi-tag-multiple-outline"
                                                            aria-hidden="true"
                                                        />
                                                    </div>
                                                )}

                                                {productFeatures.feature_reservation_extra_payments_enabled && (
                                                    <div
                                                        className="product-prop-item-payment-option"
                                                        title={translate('product.labels.payment_option_ideal')}
                                                        role="img"
                                                        aria-label={translate('product.labels.payment_option_ideal')}>
                                                        <img
                                                            src={assetUrl('/assets/img/icon-ideal.svg')}
                                                            alt={translate('product.labels.ideal_logo_alt')}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={showProductIconsInfoModal}
                                                className="product-prop-item-payment-info"
                                                aria-label={translate('product.labels.how_can_i_pay')}>
                                                {translate('product.labels.how_can_i_pay')}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {product.info_when && (
                                    <div className="product-prop-item">
                                        <div className="product-prop-item-icon">
                                            <em className="mdi mdi-calendar-month-outline" aria-hidden="true" />
                                        </div>
                                        <div className="product-prop-item-details">
                                            <h2 className="product-prop-item-title">
                                                {translate('product.labels.when')}
                                            </h2>
                                            <div className="product-prop-item-description">{product.info_when}</div>
                                        </div>
                                    </div>
                                )}

                                {product.info_more_info && (
                                    <div className="product-prop-item">
                                        <div className="product-prop-item-icon">
                                            <em className="mdi mdi-information-outline" aria-hidden="true" />
                                        </div>
                                        <div className="product-prop-item-details">
                                            <h2 className="product-prop-item-title">
                                                {translate('product.labels.more_info')}
                                            </h2>
                                            <div className="product-prop-item-description">
                                                {product.info_more_info}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {product.info_where && (
                                    <div className="product-prop-item">
                                        <div className="product-prop-item-icon">
                                            <em className="mdi mdi-store-marker-outline" aria-hidden="true" />
                                        </div>
                                        <div className="product-prop-item-details">
                                            <h2 className="product-prop-item-title">
                                                {translate('product.labels.where')}
                                            </h2>
                                            <div className="product-prop-item-description">{product.info_where}</div>
                                        </div>
                                    </div>
                                )}

                                {product.info_attention && (
                                    <div className="product-prop-item">
                                        <div className="product-prop-item-icon">
                                            <em className="mdi mdi-alert-outline" aria-hidden="true" />
                                        </div>
                                        <div className="product-prop-item-details">
                                            <h2 className="product-prop-item-title">
                                                {translate('product.labels.attention')}
                                            </h2>
                                            <div className="product-prop-item-description">
                                                {product.info_attention}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <PaneGroup>
                                <PaneGroupPanel title={translate('product.labels.description_card')}>
                                    <Markdown content={product.description_html} />
                                </PaneGroupPanel>

                                <PaneGroupPanel title={translate('product.labels.choose_credit')} elRef={fundsRef}>
                                    <ProductFunds
                                        funds={funds}
                                        product={product}
                                        vouchers={vouchers}
                                        payouts={payouts}
                                    />
                                </PaneGroupPanel>

                                {provider && (
                                    <PaneGroupPanel title={translate('product.labels.provider')} openByDefault={false}>
                                        <BlockOrganizationOffices provider={provider} />
                                    </PaneGroupPanel>
                                )}

                                <PaneGroupPanel
                                    title={translate('product.labels.locations_on_map')}
                                    openByDefault={false}>
                                    <div className="product-map-container">
                                        <GoogleMap
                                            appConfigs={appConfigs}
                                            mapPointers={product.offices}
                                            mapGestureHandling={'greedy'}
                                            mapGestureHandlingMobile={'none'}
                                            fullscreenPosition={window.google.maps.ControlPosition.TOP_RIGHT}
                                            markerTemplate={(office: Office) => (
                                                <MapMarkerProviderOffice office={office} />
                                            )}
                                        />
                                    </div>
                                </PaneGroupPanel>
                            </PaneGroup>
                        </div>
                    </Section>

                    <RandomProductsBlock count={3} title={translate('product.other_products')} />
                </Fragment>
            )}
        </BlockShowcase>
    );
}
