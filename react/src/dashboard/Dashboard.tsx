import { ModalsProvider } from './modules/modals/context/ModalContext';
import { AuthProvider } from './contexts/AuthContext';
import React, { useContext, useEffect } from 'react';
import { Layout } from './layout/Layout';
import { HashRouter, Route, Routes, BrowserRouter } from 'react-router';
import EnvDataProp from '../props/EnvData';
import { MainProvider, mainContext } from './contexts/MainContext';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getRoutes } from './modules/state_router/Router';
import { QueryParamProvider } from 'use-query-params';
import { PushNotificationsProvider } from './modules/push_notifications/context/PushNotificationsContext';
import { LoadingBarProvider } from './modules/loading_bar/context/LoadingBarContext';
import ApiRequestService from './services/ApiRequestService';
import StateHashPrefixRedirect from './modules/state_router/StateHashPrefixRedirect';
import { ToastsProvider } from './modules/toasts/context/ToastsContext';
import AwsRumScript from './modules/aws_rum/AwsRumScript';
import { PrintableProvider } from './modules/printable/context/PrintableContext';
import i18nEN from './i18n/i18n-en';
import i18nNL from './i18n/i18n-nl';
import { FrameDirectorProvider } from './modules/frame_director/context/FrameDirectorContext';
import ProviderNotificationProductRequired from './modules/provider_notification_product_required/ProviderNotificationProductRequired';
import { setDefaultOptions } from 'date-fns';
import { nl } from 'date-fns/locale';
import { ReactRouter7Adapter } from './modules/state_router/ReactRouter7Adapter';
import 'react-datepicker/dist/react-datepicker.css';

setDefaultOptions({ weekStartsOn: 1, locale: nl });

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
const RouterLayout = ({ envData }: { envData: EnvDataProp }) => {
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
export default function Dashboard({ envData }: { envData: EnvDataProp }): React.ReactElement {
    ApiRequestService.setHost(envData.config.api_url);
    ApiRequestService.setEnvData(envData);

    return (
        <PushNotificationsProvider>
            <ToastsProvider>
                <RouterSelector envData={envData}>
                    <FrameDirectorProvider>
                        <LoadingBarProvider>
                            <AuthProvider>
                                <PrintableProvider>
                                    <ModalsProvider>
                                        <MainProvider>
                                            <QueryParamProvider adapter={ReactRouter7Adapter} options={{}}>
                                                <StateHashPrefixRedirect />
                                                <RouterLayout envData={envData} />
                                                {envData.client_type === 'provider' && (
                                                    <ProviderNotificationProductRequired />
                                                )}
                                            </QueryParamProvider>
                                        </MainProvider>
                                    </ModalsProvider>
                                </PrintableProvider>
                            </AuthProvider>
                        </LoadingBarProvider>
                    </FrameDirectorProvider>
                </RouterSelector>
            </ToastsProvider>
            <AwsRumScript awsRum={envData.config?.aws_rum} cookiesAccepted={false} />
        </PushNotificationsProvider>
    );
}
