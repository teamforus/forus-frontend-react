import React, { useCallback, useContext, useEffect, useState } from 'react';
import useEnvData from '../../../hooks/useEnvData';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { useFundService } from '../../../services/FundService';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import Product from '../../../../dashboard/props/models/Product';
import { useProductService } from '../../../services/ProductService';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import BlockProducts from '../../elements/block-products/BlockProducts';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { StringParam, useQueryParams } from 'use-query-params';
import { useNavigateState, useStateParams } from '../../../modules/state_router/Router';
import useOpenModal from '../../../../dashboard/hooks/useOpenModal';
import { modalsContext } from '../../../../dashboard/modules/modals/context/ModalContext';
import ModalNotification from '../../modals/ModalNotification';
import useSetTitle from '../../../hooks/useSetTitle';
import BlockBanner from '../../elements/block-banner/BlockBanner';
import Fund from '../../../props/models/Fund';
import Section from '../../elements/sections/Section';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function Home() {
    const envData = useEnvData();
    const appConfigs = useAppConfigs();

    const setTitle = useSetTitle();
    const openModal = useOpenModal();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const { closeModal } = useContext(modalsContext);

    const fundService = useFundService();
    const productService = useProductService();

    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [products, setProducts] = useState<PaginationData<Product>>(null);

    const [digidResponse] = useQueryParams({
        digid_error: StringParam,
    });

    const stateParams = useStateParams<{
        session_expired?: boolean;
    }>();

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list()
            .then((res) => setFunds(res.data.data))
            .catch((e) => console.error(e))
            .finally(() => setProgress(100));
    }, [fundService, setProgress]);

    const fetchProducts = useCallback(() => {
        setProgress(0);

        productService
            .sample()
            .then((res) => setProducts(res.data))
            .catch((e) => console.error(e))
            .finally(() => setProgress(100));
    }, [productService, setProgress]);

    useEffect(() => {
        fetchFunds();
        fetchProducts();
    }, [fetchFunds, fetchProducts]);

    useEffect(() => {
        if (digidResponse?.digid_error) {
            navigateState(WebshopRoutes.ERROR, { errorCode: 'digid_' + digidResponse?.digid_error });
        }
    }, [digidResponse, navigateState]);

    useEffect(() => {
        if (!stateParams?.session_expired) {
            return;
        }

        // clear session_expired state
        window.history.replaceState({}, '');

        const modal = openModal((modal) => (
            <ModalNotification
                modal={modal}
                type={'confirm'}
                title={translate('modal.logout.title')}
                header={translate('modal.logout.description')}
                mdiIconType="primary"
                mdiIconClass={'information-outline'}
                confirmBtnText={translate('modal.logout.confirm')}
                onConfirm={() => navigateState(WebshopRoutes.START, {}, { reload: true })}
            />
        ));

        return () => {
            closeModal(modal);
        };
    }, [closeModal, navigateState, openModal, stateParams?.session_expired, translate]);

    useEffect(() => {
        setTitle(translate('page_state_titles.home'));
    }, [setTitle, translate]);

    if (!funds) {
        return <div style={{ width: '100%', height: '100vh' }} />;
    }

    return (
        <main id="main-content">
            <BlockBanner funds={funds} />

            {envData.client_key === 'vergoedingen' && (
                <div className="wrapper">
                    <div className="block block-organization-info">
                        <div className="info-block-panel">
                            <h2 className="block-title">{translate('home.nijmegen.title')}</h2>
                            <p className="block-description">{translate('home.nijmegen.description')}</p>
                            <ul className="block-list">
                                <li>
                                    <a href="https://vergoedingen.nijmegen.nl/fondsen/26">
                                        {translate('home.nijmegen.participation_scheme')}
                                    </a>
                                </li>
                                <li>
                                    <a href="https://vergoedingen.nijmegen.nl/fondsen/37">
                                        {translate('home.nijmegen.bus_benefit_subscription')}
                                    </a>
                                </li>
                                <li>
                                    <a href="https://vergoedingen.nijmegen.nl/fondsen/79">
                                        {translate('home.nijmegen.individual_income_allowance')}
                                    </a>
                                </li>
                                <li>
                                    <a href="https://vergoedingen.nijmegen.nl/fondsen/82">
                                        {translate('home.nijmegen.study_allowance')}
                                    </a>
                                </li>
                                <li>
                                    <a href="https://vergoedingen.nijmegen.nl/fondsen/81">
                                        {translate('home.nijmegen.collective_health_insurance')}
                                    </a>
                                </li>
                                <li>
                                    <a href="https://vergoedingen.nijmegen.nl/fondsen/83">
                                        {translate('home.nijmegen.special_assistance')}
                                    </a>
                                </li>
                                <li>
                                    <a href="https://vergoedingen.nijmegen.nl/fondsen/84">
                                        {translate('home.nijmegen.tax_relief')}
                                    </a>
                                </li>
                            </ul>
                            <a href="https://vergoedingen.nijmegen.nl/fondsen">
                                {translate('home.nijmegen.more_info')}
                            </a>
                        </div>

                        <div className="info-block-panel">
                            <h2 className="block-title">{translate('home.leergeld.title')}</h2>
                            <p className="block-description">{translate('home.leergeld.description')}</p>
                            <ul className="block-list">
                                <li>
                                    <a href="https://www.leergeldnijmegen.nl/hulp-voor-uw-kind">
                                        {translate('home.leergeld.help_for_child')}
                                    </a>
                                </li>
                            </ul>
                            <a href="https://www.leergeldnijmegen.nl/homepagina">
                                {translate('home.leergeld.more_info')}
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <Section type={'pre-check'}>
                {appConfigs.pre_check_enabled && appConfigs.pre_check_banner_state == 'public' && (
                    <div className="block block-pre-check-banner">
                        {appConfigs.pre_check_banner?.sizes?.large && (
                            <div className="pre-check-banner-media">
                                <img src={appConfigs.pre_check_banner?.sizes?.large} alt="" />
                            </div>
                        )}
                        <div className="pre-check-banner-content">
                            {appConfigs.pre_check_banner_label && (
                                <h2 className="pre-check-banner-label">
                                    <span className="label label-primary">{appConfigs.pre_check_banner_label}</span>
                                </h2>
                            )}
                            {appConfigs.pre_check_banner_title && (
                                <h2 className="pre-check-banner-title">{appConfigs.pre_check_banner_title}</h2>
                            )}
                            {appConfigs.pre_check_banner_description && (
                                <div className="pre-check-banner-description">
                                    {appConfigs.pre_check_banner_description}
                                </div>
                            )}

                            <div className="pre-check-banner-actions">
                                <StateNavLink name={WebshopRoutes.FUND_PRE_CHECK} className="button button-primary">
                                    {translate('home.pre_check.take_check')}
                                    <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                </StateNavLink>
                            </div>
                        </div>
                    </div>
                )}
            </Section>

            {appConfigs.pages.home && <CmsBlocks page={appConfigs.pages.home} />}

            {appConfigs.show_home_products && products?.data.length > 0 && (
                <BlockProducts
                    products={products.data}
                    setProducts={(list) => setProducts({ ...products, data: list })}
                    display="grid"
                    showCustomDescription={true}
                />
            )}

            {appConfigs.show_home_map && (
                <Section type={'map'} id="map_block">
                    <div className="block block-map">
                        <div className="block-content">
                            <h2 className="block-title">{translate('home.map.title')}</h2>
                            <div className="block-description">{translate('home.map.subtitle')}</div>
                            <StateNavLink
                                id="show_map"
                                name={WebshopRoutes.PROVIDERS}
                                query={{ show_map: 1 }}
                                className="button button-primary block-map-button">
                                {translate('home.map.show')}
                                <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                            </StateNavLink>
                        </div>
                    </div>
                </Section>
            )}
        </main>
    );
}
