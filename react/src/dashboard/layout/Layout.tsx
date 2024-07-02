import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutHeader } from './elements/LayoutHeader';
import { LayoutAside } from './elements/LayoutAside';
import { useStateRoutes } from '../modules/state_router/Router';
import Modals from '../modules/modals/components/Modals';
import PushNotifications from '../modules/push_notifications/components/PushNotifications';
import { modalsContext } from '../modules/modals/context/ModalContext';
import LoadingBar from '../modules/loading_bar/components/LoadingBar';
import { LayoutType } from '../modules/state_router/RouterProps';
import useAuthIdentity from '../hooks/useAuthIdentity';
import useActiveOrganization from '../hooks/useActiveOrganization';
import Toasts from '../modules/toasts/components/Toasts';
import { Libraries, LoadScript } from '@react-google-maps/api';
import useEnvData from '../hooks/useEnvData';
import Printable from '../modules/printable/components/Printable';
import ErrorBoundaryHandler from '../components/elements/error-boundary-handler/ErrorBoundaryHandler';

export const Layout = ({ children }: { children: React.ReactElement }) => {
    const { modals } = useContext(modalsContext);
    const { route } = useStateRoutes();
    const envData = useEnvData();

    const layout = route?.state?.layout;
    const authIdentity = useAuthIdentity();
    const activeOrganization = useActiveOrganization();
    const pageScrollRef = useRef<HTMLDivElement>(null);

    const [libraries] = useState(['places'] as Libraries);

    const isReady = useMemo(() => {
        return !route.state?.protected || (authIdentity && activeOrganization);
    }, [authIdentity, activeOrganization, route.state]);

    useEffect(() => {
        pageScrollRef?.current?.scrollTo({ top: 0 });
    }, [route?.pathname]);

    if (!envData?.config) {
        return null;
    }

    return (
        <LoadScript googleMapsApiKey={envData?.config?.google_maps_api_key} libraries={libraries}>
            <ErrorBoundaryHandler type={'main'} front={'dashboard'}>
                <div
                    className={`app ${route?.state?.name == 'sign-in' ? 'landing-root' : ''} ${
                        [LayoutType.landingClearNew].includes(layout) ? 'signup-layout signup-layout-new' : ''
                    }`}
                    ref={pageScrollRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'fixed',
                        overflow: modals.length > 0 ? 'hidden' : 'auto',
                    }}>
                    <LoadingBar />

                    {[LayoutType.dashboard, LayoutType.landing].includes(layout) && <LayoutHeader />}

                    <div className="app app-container">
                        {layout == LayoutType.dashboard && activeOrganization && <LayoutAside />}

                        {isReady && (
                            <section className={`${layout == LayoutType.dashboard ? 'app app-content' : ''}`}>
                                <ErrorBoundaryHandler
                                    type={
                                        [LayoutType.landingClearNew, LayoutType.landingClear].includes(layout)
                                            ? 'main'
                                            : 'block'
                                    }
                                    front={'dashboard'}>
                                    {children}
                                </ErrorBoundaryHandler>
                            </section>
                        )}
                    </div>

                    <Modals />
                    <PushNotifications />
                    <Toasts />
                </div>

                <Printable />
            </ErrorBoundaryHandler>
        </LoadScript>
    );
};
