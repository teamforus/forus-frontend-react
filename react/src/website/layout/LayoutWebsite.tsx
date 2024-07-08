import React, { Fragment, useContext, useEffect, useMemo, useRef } from 'react';
import { useStateRoutes } from '../modules/state_router/Router';
import Modals from '../../dashboard/modules/modals/components/Modals';
import PushNotifications from '../../dashboard/modules/push_notifications/components/PushNotifications';
import { modalsContext } from '../../dashboard/modules/modals/context/ModalContext';
import LoadingBar from '../../dashboard/modules/loading_bar/components/LoadingBar';
import useAuthIdentity from '../hooks/useAuthIdentity';
import useEnvData from '../hooks/useEnvData';
import useAppConfigs from '../hooks/useAppConfigs';
import LayoutFooter from './elements/LayoutFooter';
import LayoutHeader from './elements/LayoutHeader';
import useActiveMenuDropdown from '../hooks/useActiveMenuDropdown';

export const LayoutWebsite = ({ children }: { children: React.ReactElement }) => {
    const { route } = useStateRoutes();
    const { modals } = useContext(modalsContext);

    const envData = useEnvData();
    const appConfigs = useAppConfigs();
    const activeMenuDropdown = useActiveMenuDropdown();

    const authIdentity = useAuthIdentity();
    const pageScrollRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);

    const isReady = useMemo(() => {
        return !!envData && !!appConfigs && (!route.state?.protected || authIdentity);
    }, [authIdentity, route.state, envData, appConfigs]);

    useEffect(() => {
        pageScrollRef?.current?.scrollTo({ top: 0 });
    }, [route, route.pathname]);

    useEffect(() => {
        bodyRef?.current?.style.setProperty('visibility', activeMenuDropdown ? 'hidden' : 'visible');
        footerRef?.current?.style.setProperty('visibility', activeMenuDropdown ? 'hidden' : 'visible');
    }, [activeMenuDropdown, route, route.pathname]);

    if (!envData?.config) {
        return null;
    }

    return (
        <div
            ref={pageScrollRef}
            className={'layout'}
            style={{
                width: '100%',
                height: '100%',
                position: 'fixed',
                overflow: modals.length > 0 ? 'hidden' : 'auto',
            }}>
            <LoadingBar />

            {isReady && (
                <Fragment>
                    <LayoutHeader />
                    <div className="layout-body" ref={bodyRef}>
                        {children}
                    </div>
                    <div ref={footerRef}>
                        <LayoutFooter />
                    </div>
                </Fragment>
            )}

            <Modals />
            <PushNotifications group={'default'} />
        </div>
    );
};
