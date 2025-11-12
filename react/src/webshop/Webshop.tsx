import { ModalsProvider } from '../dashboard/modules/modals/context/ModalContext';
import { AuthProvider } from './contexts/AuthContext';
import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { Layout } from './layout/Layout';
import { HashRouter, Route, Routes, BrowserRouter } from 'react-router';
import EnvDataProp from '../props/EnvData';
import { MainProvider, mainContext } from './contexts/MainContext';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { QueryParamProvider } from 'use-query-params';
import { PushNotificationsProvider } from '../dashboard/modules/push_notifications/context/PushNotificationsContext';
import { LoadingBarProvider } from '../dashboard/modules/loading_bar/context/LoadingBarContext';
import ApiRequestService from '../dashboard/services/ApiRequestService';
import { getRoutes } from './modules/state_router/Router';
import EnvDataWebshopProp from '../props/EnvDataWebshopProp';
import { LoadScript } from '@react-google-maps/api';
import { PrintableProvider } from '../dashboard/modules/printable/context/PrintableContext';
import MatomoScript from './modules/matomo/MatomoScript';
import SiteImproveAnalytics from './modules/site_improve_analytics/SiteImproveAnalytics';
import AwsRumScript from '../dashboard/modules/aws_rum/AwsRumScript';
import StateHashPrefixRedirect from '../dashboard/modules/state_router/StateHashPrefixRedirect';
import { TitleProvider } from './contexts/TitleContext';
import i18nNL from './i18n/i18n-nl.mjs';
import i18nEN from './i18n/translated/en-US.json';
import i18nRU from './i18n/translated/ru.json';
import i18nPL from './i18n/translated/pl.json';
import i18nAR from './i18n/translated/ar.json';
import i18nDE from './i18n/translated/de.json';
import i18nFR from './i18n/translated/fr.json';
import i18nTR from './i18n/translated/tr.json';
import i18nUK from './i18n/translated/uk.json';
import CookieBanner from './modules/cookie_banner/CookieBanner';
import ReadSpeakerScript from './modules/read_speaker/ReadSpeakerScript';
import { isValidLocaleString } from '../dashboard/helpers/url';
import { FrameDirectorProvider } from '../dashboard/modules/frame_director/context/FrameDirectorContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { ReactRouter7Adapter } from '../dashboard/modules/state_router/ReactRouter7Adapter';
import 'react-datepicker/dist/react-datepicker.css';

const locale = localStorage.getItem('locale');

i18n.use(initReactI18next)
    .init({
        resources: {
            en: { translation: i18nEN },
            nl: { translation: i18nNL },
            ru: { translation: i18nRU },
            pl: { translation: i18nPL },
            ar: { translation: i18nAR },
            de: { translation: i18nDE },
            fr: { translation: i18nFR },
            tr: { translation: i18nTR },
            uk: { translation: i18nUK },
        },
        lng: isValidLocaleString(locale) ? locale : 'nl',
        fallbackLng: 'nl',
        // https://www.i18next.com/translation-function/interpolation#unescape
        interpolation: { escapeValue: true },
    })
    .then((r) => r);

/**
 * @param envData
 * @constructor
 */
const RouterLayout = ({ envData }: { envData: EnvDataWebshopProp }) => {
    const { setEnvData } = useContext(mainContext);

    useEffect(() => {
        setEnvData(envData);
    }, [setEnvData, envData]);

    return (
        <Layout>
            <Routes>
                {getRoutes().map((route) => (
                    <Route key={route.state.name} path={route.state.path} element={route.element} />
                ))}
            </Routes>
        </Layout>
    );
};

function RouterSelector({ children, envData }: { envData: EnvDataProp; children: ReactNode | ReactNode[] }) {
    if (envData.useHashRouter) {
        return <HashRouter basename={`/`}>{children}</HashRouter>;
    }

    return <BrowserRouter basename={`/${envData.webRoot}`}>{children}</BrowserRouter>;
}

/**
 * Dashboard
 * @param envData
 * @constructor
 */
export default function Webshop({ envData }: { envData: EnvDataWebshopProp }): React.ReactElement {
    envData.config.flags = {
        showAccountSidebar: true,

        // menu settings
        productsMenu: true,
        meAppMenu: true,
        forusPlatformMenu: true,
        portfolioMenu: true,
        aboutSiteMenu: true,

        // home settings
        fundsMenu: false, // Show funds option on the top menu
        providersMenu: true, // Show providers option on the top menu

        // voucher settings
        ...(envData.config?.flags || {}),
    };

    ApiRequestService.setHost(envData.config.api_url);
    ApiRequestService.setEnvData(envData as unknown as EnvDataProp);

    const [allowOptionalCookies, setAllowOptionalCookies] = useState<boolean>(null);

    return (
        <FrameDirectorProvider>
            <LoadScript googleMapsApiKey={envData.config.google_maps_api_key} language={'nl'}>
                <PushNotificationsProvider
                    groups={{
                        webshop: {
                            defaultDismissTimeout: 15,
                            showConfig: true,
                        },
                        bookmarks: {
                            maxCount: 1,
                            className: 'block-push-notifications-bookmarks',
                            showConfig: true,
                            defaultDismissTimeout: null,
                        },
                    }}>
                    <RouterSelector envData={envData as unknown as EnvDataProp}>
                        <LayoutProvider>
                            <LoadingBarProvider>
                                <PrintableProvider>
                                    <ModalsProvider>
                                        <MainProvider cookiesAccepted={allowOptionalCookies}>
                                            <TitleProvider>
                                                <AuthProvider>
                                                    <QueryParamProvider adapter={ReactRouter7Adapter}>
                                                        <StateHashPrefixRedirect />
                                                        <RouterLayout envData={envData} />
                                                    </QueryParamProvider>
                                                </AuthProvider>
                                            </TitleProvider>
                                        </MainProvider>
                                    </ModalsProvider>
                                </PrintableProvider>
                            </LoadingBarProvider>
                        </LayoutProvider>

                        <CookieBanner envData={envData} setAllowOptionalCookies={setAllowOptionalCookies} />
                        <AwsRumScript awsRum={envData.config?.aws_rum} cookiesAccepted={allowOptionalCookies} />
                        <MatomoScript envData={envData} cookiesAccepted={allowOptionalCookies} />
                        <SiteImproveAnalytics envData={envData} cookiesAccepted={allowOptionalCookies} />

                        <ReadSpeakerScript envData={envData} />
                    </RouterSelector>
                </PushNotificationsProvider>
            </LoadScript>
        </FrameDirectorProvider>
    );
}
