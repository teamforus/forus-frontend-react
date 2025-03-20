import { ModalsProvider } from '../dashboard/modules/modals/context/ModalContext';
import { AuthProvider } from './contexts/AuthContext';
import React, { Fragment, ReactElement, useContext, useEffect, useMemo } from 'react';
import { LoadingBarProvider } from '../dashboard/modules/loading_bar/context/LoadingBarContext';
import ApiRequestService from '../dashboard/services/ApiRequestService';
import Auth2FA from './components/pages/Auth2FA';
import EnvDataProp from '../props/EnvData';
import Modals from '../dashboard/modules/modals/components/Modals';
import { mainContext, MainProvider } from './contexts/MainContext';
import EnvDataBackend from '../props/EnvDataBackend';
import { PushNotificationsProvider } from '../dashboard/modules/push_notifications/context/PushNotificationsContext';
import PushNotifications from '../dashboard/modules/push_notifications/components/PushNotifications';

/**
 * @param envData
 * @param children
 * @constructor
 */
const Layout = ({ envData, children }: { envData: EnvDataBackend; children: ReactElement | ReactElement[] }) => {
    const { setEnvData } = useContext(mainContext);

    useEffect(() => {
        setEnvData(envData);
    }, [setEnvData, envData]);

    return <Fragment>{children}</Fragment>;
};

/**
 * Backend
 * @constructor
 */
export default function Backend(): React.ReactElement {
    const params = document.getElementById('params');
    const mobile = params.dataset.mobile === 'true';
    const { exchangeToken, type, apiUrl } = params.dataset;

    const envData = useMemo(
        () => ({
            client_key: 'general',
            client_type: 'pin_code-auth',
            name: 'Backend general',
            type: 'backend',
            webRoot: '',
            config: {
                api_url: apiUrl,
            },
        }),
        [apiUrl],
    );

    ApiRequestService.setHost(apiUrl);
    ApiRequestService.setEnvData(envData as unknown as EnvDataProp);

    return (
        <PushNotificationsProvider>
            <LoadingBarProvider>
                <ModalsProvider>
                    <MainProvider>
                        <AuthProvider>
                            <Layout envData={envData}>
                                <Auth2FA mobile={mobile} exchangeToken={exchangeToken} type={type} />
                                <Modals focusExclusions={'.frame-director'} />
                                <PushNotifications />
                            </Layout>
                        </AuthProvider>
                    </MainProvider>
                </ModalsProvider>
            </LoadingBarProvider>
        </PushNotificationsProvider>
    );
}
