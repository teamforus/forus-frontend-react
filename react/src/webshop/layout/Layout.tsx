import React, { Fragment, useContext, useEffect, useMemo, useRef } from 'react';
import { useStateRoutes } from '../../dashboard/modules/state_router/Router';
import Modals from '../../dashboard/modules/modals/components/Modals';
import PushNotifications from '../../dashboard/modules/push_notifications/components/PushNotifications';
import { modalsContext } from '../../dashboard/modules/modals/context/ModalContext';
import LoadingBar from '../../dashboard/modules/loading_bar/components/LoadingBar';
import { LayoutType } from '../../dashboard/modules/state_router/RouterProps';
import useAuthIdentity from '../hooks/useAuthIdentity';
import SkipLinks from './elements/SkipLinks';
import useEnvData from '../hooks/useEnvData';
import useAppConfigs from '../hooks/useAppConfigs';
import LayoutFooter from './elements/LayoutFooter';
import LayoutMobileMenu from './elements/LayoutMobileMenu';
import Printable from '../../dashboard/modules/printable/components/Printable';
import ErrorBoundaryHandler from '../../dashboard/components/elements/error-boundary-handler/ErrorBoundaryHandler';

export const Layout = ({ children }: { children: React.ReactElement }) => {
    const { route } = useStateRoutes();

    const { modals } = useContext(modalsContext);

    const envData = useEnvData();
    const appConfigs = useAppConfigs();

    const layout = route?.state?.layout;
    const authIdentity = useAuthIdentity();
    const pageScrollRef = useRef<HTMLDivElement>(null);

    const isReady = useMemo(() => {
        return !!envData && !!appConfigs && (!route.state?.protected || authIdentity);
    }, [authIdentity, route.state, envData, appConfigs]);

    useEffect(() => {
        pageScrollRef?.current?.scrollTo({ top: 0 });
    }, [route?.pathname]);

    if (!envData?.config) {
        return null;
    }

    return (
        <ErrorBoundaryHandler type={'main'}>
            <div
                className={`${route?.state?.name == 'fund-request' ? 'signup-layout' : ''}`}
                ref={pageScrollRef}
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'fixed',
                    overflow: modals.length > 0 ? 'hidden' : 'auto',
                }}>
                <SkipLinks />
                <LoadingBar />

                {[LayoutType.dashboard, LayoutType.landing].includes(layout) && <>{/*<LayoutHeader />*/}</>}

                <div className="app app-container">
                    {layout == LayoutType.dashboard && <>{/*<LayoutAside />*/}</>}

                    {isReady && (
                        <section className={`${layout == LayoutType.dashboard ? 'app app-content' : ''}`}>
                            {children}
                        </section>
                    )}
                </div>

                <LayoutMobileMenu />
                <LayoutFooter />

                <Modals />

                <PushNotifications group={'default'} />
                <PushNotifications group={'bookmarks'} className={'block-push-notifications-bookmarks'} maxCount={1} />
            </div>

            <Printable />
        </ErrorBoundaryHandler>
    );
};
