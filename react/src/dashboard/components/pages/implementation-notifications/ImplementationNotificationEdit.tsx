import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useImplementationService from '../../../services/ImplementationService';
import Implementation from '../../../props/models/Implementation';
import useImplementationNotificationService from '../../../services/ImplementationNotificationService';
import SystemNotification from '../../../props/models/SystemNotification';
import { useParams } from 'react-router';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import SystemNotificationEditor from './elements/SystemNotificationEditor';
import useTranslate from '../../../hooks/useTranslate';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushApiError from '../../../hooks/usePushApiError';
import ImplementationsRootBreadcrumbs from '../implementations/elements/ImplementationsRootBreadcrumbs';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function ImplementationNotificationEdit() {
    const { id, implementationId } = useParams();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();

    const implementationService = useImplementationService();
    const implementationNotificationsService = useImplementationNotificationService();

    const [notification, setNotification] = useState<SystemNotification>(null);
    const [implementation, setImplementation] = useState<Implementation>(null);

    const fetchImplementation = useCallback(() => {
        setProgress(0);

        implementationService
            .read(activeOrganization.id, parseInt(implementationId))
            .then((res) => setImplementation(res.data.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [implementationService, activeOrganization.id, implementationId, pushApiError, setProgress]);

    const fetchNotification = useCallback(() => {
        setProgress(0);

        implementationNotificationsService
            .read(activeOrganization.id, parseInt(implementationId), parseInt(id))
            .then((res) => setNotification(res.data.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [id, setProgress, pushApiError, implementationId, activeOrganization.id, implementationNotificationsService]);

    useEffect(() => {
        fetchImplementation();
    }, [fetchImplementation]);

    useEffect(() => {
        fetchNotification();
    }, [fetchNotification]);

    if (!implementation || !notification) {
        return <LoadingCard />;
    }

    return (
        <div className="form">
            <div className="block block-breadcrumbs">
                <ImplementationsRootBreadcrumbs implementation={implementation} />
                <StateNavLink
                    name={DashboardRoutes.IMPLEMENTATION_NOTIFICATIONS}
                    params={{ organizationId: activeOrganization.id, id: implementation.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Systeemberichten
                </StateNavLink>
                <div className="breadcrumb-item active">
                    {translate(`system_notifications.notifications.${notification.key}.title`)}
                </div>
            </div>

            <SystemNotificationEditor
                organization={activeOrganization}
                implementation={implementation}
                notification={notification}
                setNotifications={setNotification}
            />
        </div>
    );
}
