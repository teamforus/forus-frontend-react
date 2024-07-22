import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushDanger from '../../../hooks/usePushDanger';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import Implementation from '../../../props/models/Implementation';
import useImplementationNotificationService from '../../../services/ImplementationNotificationService';
import SystemNotification from '../../../props/models/SystemNotification';
import { useParams } from 'react-router-dom';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import SystemNotificationEditor from './elements/SystemNotificationEditor';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import useTranslate from '../../../hooks/useTranslate';
import useSetProgress from '../../../hooks/useSetProgress';

export default function ImplementationsNotificationsEdit() {
    const { id, implementationId } = useParams();
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const implementationService = useImplementationService();
    const implementationNotificationsService = useImplementationNotificationService();

    const [fund, setFund] = useState<Partial<Fund>>(null);
    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);

    const [notification, setNotification] = useState<SystemNotification>(null);
    const [implementation, setImplementation] = useState<Implementation>(null);

    const fetchImplementation = useCallback(() => {
        setProgress(0);

        implementationService
            .read(activeOrganization.id, parseInt(implementationId))
            .then((res) => setImplementation(res.data.data))
            .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message))
            .finally(() => setProgress(100));
    }, [implementationService, activeOrganization.id, implementationId, pushDanger, setProgress]);

    const fetchNotification = useCallback(() => {
        setProgress(0);

        implementationNotificationsService
            .read(activeOrganization.id, parseInt(implementationId), parseInt(id), { fund_id: fund?.id })
            .then((res) => setNotification(res.data.data))
            .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message))
            .finally(() => setProgress(100));
    }, [
        id,
        fund?.id,
        pushDanger,
        setProgress,
        implementationId,
        activeOrganization.id,
        implementationNotificationsService,
    ]);

    const fetchFunds = useCallback(() => {
        if (implementation.allow_per_fund_notification_templates) {
            setProgress(0);

            fundService
                .list(activeOrganization.id, {
                    implementation_id: implementation.id,
                    with_archived: 1,
                    stats: 'min',
                })
                .then((res) => setFunds([{ id: null, name: 'Alle fondsen' }, ...res.data.data]))
                .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message))
                .finally(() => setProgress(100));
        }
    }, [setProgress, implementation, fundService, activeOrganization.id, pushDanger]);

    useEffect(() => {
        fetchImplementation();
    }, [fetchImplementation]);

    useEffect(() => {
        fetchNotification();
    }, [fetchNotification]);

    useEffect(() => {
        if (implementation) {
            fetchFunds();
        }
    }, [fetchFunds, implementation]);

    if (!implementation || !notification || (implementation?.allow_per_fund_notification_templates && !funds)) {
        return <LoadingCard />;
    }

    return (
        <div className="form">
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'implementation-notifications'}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Systeemberichten
                </StateNavLink>
                <div className="breadcrumb-item active">
                    {translate(`system_notifications.notifications.${notification.key}.title`)}
                </div>
            </div>

            <SystemNotificationEditor
                fund={fund}
                setFund={setFund}
                funds={funds}
                organization={activeOrganization}
                implementation={implementation}
                notification={notification}
                setNotifications={setNotification}
            />
        </div>
    );
}
