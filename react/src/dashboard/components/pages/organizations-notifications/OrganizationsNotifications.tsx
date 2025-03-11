import React, { useCallback, useEffect, useState } from 'react';
import { PaginationData } from '../../../props/ApiResponses';
import Notification from '../../../props/models/Notification';
import { useNotificationService } from '../../../services/NotificationService';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import Paginator from '../../../modules/paginator/components/Paginator';
import useFilter from '../../../hooks/useFilter';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import useSetProgress from '../../../hooks/useSetProgress';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';

export default function OrganizationsNotifications() {
    const setProgress = useSetProgress();
    const paginatorService = usePaginatorService();
    const activeOrganization = useActiveOrganization();
    const notificationsService = useNotificationService();

    const [paginatorKey] = useState('organizations_notifications');
    const [notifications, setNotifications] = useState<PaginationData<Notification>>(null);
    const [timeoutThreshold] = useState(2500);

    const filter = useFilter({
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const fetchNotifications = useCallback(
        (mark_read = false) => {
            setProgress(0);

            notificationsService
                .list({
                    ...filter.activeValues,
                    organization_id: activeOrganization?.id,
                    mark_read: mark_read ? 1 : 0,
                })
                .then((res) => {
                    res.data.data = res.data.data.map((item) => ({ ...item, seen: item.seen || mark_read }));
                    setNotifications(res.data);
                })
                .finally(() => setProgress(100));
        },
        [notificationsService, filter?.activeValues, setProgress, activeOrganization],
    );

    useEffect(() => {
        if (!notifications?.data.find((notification) => !notification.seen)) {
            return;
        }

        const timeout = window.setTimeout(() => {
            fetchNotifications(true);
        }, timeoutThreshold);

        return () => window.clearTimeout(timeout);
    }, [fetchNotifications, notifications, timeoutThreshold]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    if (!notifications) {
        return <LoadingCard />;
    }

    if (notifications?.meta.total == 0) {
        return <EmptyCard description="Geen nieuwe notificaties." />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">
                    {`Notificaties ${
                        notifications?.meta.total_seen ? '(' + notifications?.meta.total_seen + ' nieuw)' : ''
                    }`}
                </div>
            </div>

            <div className="card-section card-section card-section-padless">
                <div className="block block-notifications">
                    {notifications.data.map((notification) => (
                        <div
                            key={notification.id}
                            className={`notification-item ${!notification.seen ? 'notification-item-new' : ''}`}>
                            <div className="notification-details">
                                <div className="notification-title">{notification.title}</div>
                                <div className="notification-description">
                                    {notification.description.split('\n').map((description, index) => (
                                        <div key={index}>{description}</div>
                                    ))}
                                </div>
                            </div>

                            <div className="notification-actions">
                                <div className="notification-date">
                                    <em className="mdi mdi-clock-outline" />
                                    {notification.created_at_locale}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {notifications.meta && (
                <div className="card-section">
                    <Paginator
                        meta={notifications.meta}
                        filters={filter.values}
                        updateFilters={filter.update}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </div>
    );
}
