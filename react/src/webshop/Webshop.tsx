import { ModalsProvider } from '../dashboard/modules/modals/context/ModalContext';
import { AuthProvider } from './contexts/AuthContext';
import React, { Fragment, useContext, useEffect } from 'react';
import { Layout } from './layout/Layout';
import { HashRouter, Route, Routes, BrowserRouter } from 'react-router-dom';
import EnvDataProp from '../props/EnvData';
import { MainProvider, mainContext } from './contexts/MainContext';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
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
import i18nEN from './i18n/i18n-en';
import i18nNL from './i18n/i18n-nl';

i18n.use(initReactI18next)
    .init({
        resources: {
            en: { translation: i18nEN },
            nl: { translation: i18nNL },
        },
        lng: 'nl',
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

function RouterSelector({ children, envData }: { envData: EnvDataProp; children: React.ReactElement }) {
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
        logoExtension: '.svg',
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

    return (
        <Fragment>
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
                        <LoadingBarProvider>
                            <PrintableProvider>
                                <ModalsProvider>
                                    <MainProvider>
                                        <TitleProvider>
                                            <AuthProvider>
                                                <QueryParamProvider adapter={ReactRouter6Adapter}>
                                                    <StateHashPrefixRedirect />
                                                    <RouterLayout envData={envData} />
                                                </QueryParamProvider>
                                            </AuthProvider>
                                        </TitleProvider>
                                    </MainProvider>
                                </ModalsProvider>
                            </PrintableProvider>
                        </LoadingBarProvider>
                    </RouterSelector>
                </PushNotificationsProvider>
            </LoadScript>

            <AwsRumScript awsRum={envData.config?.aws_rum} />
            <MatomoScript envData={envData} />
            <SiteImproveAnalytics envData={envData} />
        </Fragment>
    );
}
