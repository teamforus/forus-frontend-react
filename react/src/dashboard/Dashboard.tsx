import { ModalsProvider } from './modules/modals/context/ModalContext';
import { AuthProvider } from './contexts/AuthContext';
import React, { useContext, useEffect } from 'react';
import { Layout } from './layout/Layout';
import { HashRouter, Route, Routes, BrowserRouter } from 'react-router-dom';
import EnvDataProp from '../props/EnvData';
import { MainProvider, mainContext } from './contexts/MainContext';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getRoutes } from './modules/state_router/Router';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { PushNotificationsProvider } from './modules/push_notifications/context/PushNotificationsContext';
import { LoadingBarProvider } from './modules/loading_bar/context/LoadingBarContext';
import ApiRequestService from './services/ApiRequestService';

i18n.use(initReactI18next)
    .init({
        resources: {
            en: { translation: require('./i18n/i18n-en') },
            nl: { translation: require('./i18n/i18n-nl') },
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

    return (
        <PushNotificationsProvider>
            <RouterSelector envData={envData}>
                <LoadingBarProvider>
                    <AuthProvider>
                        <MainProvider>
                            <ModalsProvider>
                                <QueryParamProvider adapter={ReactRouter6Adapter}>
                                    <RouterLayout envData={envData} />
                                </QueryParamProvider>
                            </ModalsProvider>
                        </MainProvider>
                    </AuthProvider>
                </LoadingBarProvider>
            </RouterSelector>
        </PushNotificationsProvider>
    );
}
