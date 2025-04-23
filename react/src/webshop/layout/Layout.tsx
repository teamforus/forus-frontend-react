import React, { Fragment, useContext, useEffect, useMemo, useRef } from 'react';
import { useStateRoutes } from '../../dashboard/modules/state_router/Router';
import Modals from '../../dashboard/modules/modals/components/Modals';
import PushNotifications from '../../dashboard/modules/push_notifications/components/PushNotifications';
import { modalsContext } from '../../dashboard/modules/modals/context/ModalContext';
import LoadingBar from '../../dashboard/modules/loading_bar/components/LoadingBar';
import useAuthIdentity from '../hooks/useAuthIdentity';
import BlockSkipLinks from './elements/BlockSkipLinks';
import useEnvData from '../hooks/useEnvData';
import useAppConfigs from '../hooks/useAppConfigs';
import LayoutFooter from './elements/LayoutFooter';
import Printable from '../../dashboard/modules/printable/components/Printable';
import ErrorBoundaryHandler from '../../dashboard/components/elements/error-boundary-handler/ErrorBoundaryHandler';
import { TopNavbar } from '../components/elements/top-navbar/TopNavbar';
import classNames from 'classnames';

export const Layout = ({ children }: { children: React.ReactElement }) => {
    const { route } = useStateRoutes();
    const { modals } = useContext(modalsContext);

    const envData = useEnvData();
    const appConfigs = useAppConfigs();
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
                className={classNames('app-root', route?.state?.name == 'fund-request' && 'signup-layout')}
                ref={pageScrollRef}
                style={{ overflow: modals.length > 0 ? 'hidden' : 'auto' }}>
                <BlockSkipLinks />
                <LoadingBar />

                <Fragment>
                    {isReady && (
                        <Fragment>
                            <TopNavbar />
                            {children}
                        </Fragment>
                    )}
                </Fragment>

                <LayoutFooter />

                <Modals focusExclusions={'.frame-director'} />
                <PushNotifications />
            </div>

            <Printable />
        </ErrorBoundaryHandler>
    );
};
