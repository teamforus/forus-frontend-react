import React, { useContext, useMemo } from 'react';
import { LayoutHeader } from './elements/LayoutHeader';
import { LayoutAside } from './elements/LayoutAside';
import { classList } from '../helpers/utils';
import { useStateRoutes } from '../modules/state_router/Router';
import Modals from '../modules/modals/components/Modals';
import PushNotifications from '../modules/push_notifications/components/PushNotifications';
import { modalsContext } from '../modules/modals/context/ModalContext';
import LoadingBar from '../modules/loading_bar/components/LoadingBar';
import { LayoutType } from '../modules/state_router/RouterProps';
import useAuthIdentity from '../hooks/useAuthIdentity';
import useActiveOrganization from '../hooks/useActiveOrganization';

export const Layout = ({ children }: { children: React.ReactElement }) => {
    const { modals } = useContext(modalsContext);
    const { route } = useStateRoutes();

    const layout = route?.state?.layout;
    const authIdentity = useAuthIdentity();
    const activeOrganization = useActiveOrganization();

    const isReady = useMemo(() => {
        return !route.state.protected || (authIdentity && activeOrganization);
    }, [authIdentity, activeOrganization, route.state]);

    return (
        <div className={''}>
            <div
                className={classList([
                    'app',
                    route.state?.name == 'sign-in' ? 'landing-root' : '',
                    [LayoutType.landingClearNew].includes(layout) ? 'signup-layout signup-layout-new' : '',
                ])}
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
                            {children}
                        </section>
                    )}
                </div>

                <Modals />
                <PushNotifications />
            </div>
        </div>
    );
};
