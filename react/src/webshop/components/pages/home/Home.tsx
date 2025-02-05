import React, { useCallback, useContext, useEffect, useState } from 'react';
import useEnvData from '../../../hooks/useEnvData';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import Markdown from '../../elements/markdown/Markdown';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../../dashboard/props/models/Fund';
import { useVoucherService } from '../../../services/VoucherService';
import Voucher from '../../../../dashboard/props/models/Voucher';
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
import ReadSpeakerButton from '../../../modules/read_speaker/ReadSpeakerButton';

export default function Home() {
    const envData = useEnvData();
    const appConfigs = useAppConfigs();

    const setTitle = useSetTitle();
    const openModal = useOpenModal();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const { closeModal } = useContext(modalsContext);

    const authIdentity = useAuthIdentity();

    const fundService = useFundService();
    const productService = useProductService();
    const voucherService = useVoucherService();

    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [vouchers, setVouchers] = useState<Array<Voucher>>(null);
    const [products, setProducts] = useState<PaginationData<Product>>(null);
    const [subsidies, setSubsidies] = useState<PaginationData<Product>>(null);

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

    const fetchVouchers = useCallback(() => {
        setProgress(0);

        voucherService
            .list()
            .then((res) => setVouchers(res.data.data))
            .catch((e) => console.error(e))
            .finally(() => setProgress(100));
    }, [voucherService, setProgress]);

    const fetchProducts = useCallback(() => {
        setProgress(0);

        productService
            .sample('budget')
            .then((res) => setProducts(res.data))
            .catch((e) => console.error(e))
            .finally(() => setProgress(100));

        productService
            .sample('subsidies')
            .then((res) => setSubsidies(res.data))
            .catch((e) => console.error(e))
            .finally(() => setProgress(100));
    }, [productService, setProgress]);

    useEffect(() => {
        fetchFunds();
        fetchProducts();
    }, [fetchFunds, fetchProducts]);

    useEffect(() => {
        if (digidResponse?.digid_error) {
            navigateState('error', { errorCode: 'digid_' + digidResponse?.digid_error });
        }
    }, [digidResponse, navigateState]);

    useEffect(() => {
        if (authIdentity) {
            fetchVouchers();
        } else {
            setVouchers(null);
        }
    }, [fetchVouchers, authIdentity]);

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
                title={'Sessie verlopen'}
                header={translate('modal.logout.description')}
                mdiIconType="primary"
                mdiIconClass={'information-outline'}
                confirmBtnText={'Inloggen'}
                onConfirm={() => navigateState('start', {}, { reload: true })}
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
            <header
                className={`section section-header section-header-landing section-header-${appConfigs.settings.banner_text_color}`}
                style={appConfigs.banner ? { backgroundImage: `url(${appConfigs?.banner?.sizes?.large})` } : {}}>
                {appConfigs.settings.overlay_enabled && (
                    <div
                        className={`header-overlay ${
                            appConfigs.settings.overlay_type != 'color' ? 'header-overlay-pattern' : ''
                        }`}
                        style={{
                            opacity: appConfigs.settings.overlay_opacity,
                            backgroundImage:
                                appConfigs.settings.overlay_type == 'color'
                                    ? 'none'
                                    : `url("assets/img/banner-patterns/${appConfigs.settings.overlay_type}.svg")`,
                        }}
                    />
                )}
                <div className="header-note">
                    {translate(`home.header.${envData.client_key}.header_note`, null, 'home.header.header_note')}
                </div>
                <div className="wrapper">
                    <div className="header-content" data-dusk="header">
                        <ReadSpeakerButton className={'header-read-speaker'} targetId={'main-content'} />
                        {appConfigs.settings.title ? (
                            <h1 className="header-title" data-dusk="headerTitle">
                                {appConfigs.settings.title}
                            </h1>
                        ) : (
                            <h1 className="header-title" data-dusk="headerTitle">
                                {translate(
                                    `home.header.${envData.client_key}.title`,
                                    { implementation: appConfigs.implementation?.name },
                                    'home.header.title',
                                )}
                            </h1>
                        )}

                        {appConfigs.settings.description && (
                            <div className="header-description" id="desc">
                                <Markdown
                                    content={appConfigs.settings.description_html}
                                    align={appConfigs.settings.description_alignment}
                                />
                            </div>
                        )}

                        {!appConfigs.settings.description && !appConfigs.digid && (
                            <div className="header-description" id="desc">
                                {funds.length <= 1 && (
                                    <p>
                                        {translate(
                                            `home.header.${envData.client_key}.subtitle`,
                                            { fund: funds?.[0]?.name, start_date: funds?.[0]?.start_date_locale },
                                            'home.header.subtitle',
                                        )}
                                    </p>
                                )}
                                {funds.length > 1 && (
                                    <p>
                                        {translate(
                                            `home.header.${envData.client_key}.subtitle_multi`,
                                            { org_name: funds?.[0].organization.name },
                                            'home.header.subtitle_multi',
                                        )}
                                    </p>
                                )}
                                {!authIdentity && funds.length <= 1 && (
                                    <p>
                                        {translate(
                                            `home.header.${envData.client_key}.cta`,
                                            { fund: funds?.[0]?.name, start_date: funds?.[0]?.start_date_locale },
                                            'home.header.cta',
                                        )}
                                    </p>
                                )}

                                {!authIdentity && funds.length > 1 && (
                                    <p>
                                        {translate(
                                            `home.header.${envData.client_key}.cta`,
                                            { fund: funds?.[0].name, start_date: funds?.[0].start_date_locale },
                                            'home.header.cta_multi',
                                        )}
                                    </p>
                                )}

                                {authIdentity && vouchers?.length > 0 && (
                                    <p>
                                        {translate(`home.header.auth_cta`, {
                                            fund: funds?.[0].name,
                                            start_date: funds?.[0].start_date_locale,
                                        })}
                                    </p>
                                )}
                            </div>
                        )}

                        {!appConfigs.settings.description && appConfigs.digid && (
                            <div className="header-description" id="desc">
                                <p>
                                    {translate(
                                        `home.header.${envData.client_key}.subtitle_av`,
                                        { fund: funds?.[0]?.name, start_date: funds?.[0]?.start_date_locale },
                                        'home.header.subtitle_av',
                                    )}
                                </p>

                                {!authIdentity && (
                                    <p>
                                        {translate(
                                            `home.header.${envData.client_key}.cta_av`,
                                            { fund: funds?.[0]?.name, start_date: funds?.[0]?.start_date_locale },
                                            'home.header.cta_av',
                                        )}
                                    </p>
                                )}

                                {authIdentity && vouchers?.length > 0 && (
                                    <p>
                                        {translate(`home.header.auth_cta`, {
                                            fund: funds?.[0]?.name,
                                            start_date: funds?.[0]?.start_date_locale,
                                        })}
                                    </p>
                                )}
                            </div>
                        )}

                        {appConfigs.pages.explanation && (
                            <StateNavLink name={'explanation'} className="header-how-it-works" target="_blank">
                                {translate('home.how_it_works')}
                            </StateNavLink>
                        )}
                    </div>
                </div>
            </header>

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

            {appConfigs.pre_check_enabled && appConfigs.pre_check_banner_state == 'public' && (
                <div className="wrapper">
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
                                <StateNavLink name={'fund-pre-check'} className="button button-primary">
                                    {translate('home.pre_check.take_check')}
                                    <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                </StateNavLink>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {appConfigs.pages.home && <CmsBlocks page={appConfigs.pages.home} />}

            {(appConfigs.show_home_products || appConfigs.show_home_map) && (
                <div className="page page-home">
                    {appConfigs.show_home_products && (
                        <div>
                            {products?.data.length > 0 && (
                                <div className="wrapper">
                                    <BlockProducts
                                        products={products.data}
                                        setProducts={(list) => setProducts({ ...products, data: list })}
                                        type="budget"
                                        large={true}
                                        display="grid"
                                        showCustomDescription={subsidies?.data.length === 0}
                                    />
                                </div>
                            )}

                            {subsidies?.data.length > 0 && (
                                <div className="wrapper">
                                    <BlockProducts
                                        products={subsidies.data}
                                        setProducts={(list) => setSubsidies({ ...subsidies, data: list })}
                                        type="subsidies"
                                        large={true}
                                        display="grid"
                                        showCustomDescription={true}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {appConfigs.show_home_map && (
                        <section className="section section-map" id="map_block">
                            <div className="wrapper">
                                <div className="block block-map">
                                    <div className="block-content">
                                        <h2 className="block-title">{translate('home.map.title')}</h2>
                                        <div className="block-description">{translate('home.map.subtitle')}</div>
                                        <StateNavLink
                                            id="show_map"
                                            name={'providers'}
                                            query={{ show_map: 1 }}
                                            className="button button-primary">
                                            {translate('home.map.show')}
                                            <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                        </StateNavLink>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            )}
        </main>
    );
}
