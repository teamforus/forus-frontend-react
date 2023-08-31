import React, { useCallback, useEffect, useState } from 'react';
import Organization from '../../../props/models/Organization';
import { useNotificationService } from '../../../services/NotificationService';
import { classList } from '../../../helpers/utils';
import ClickOutside from '../../../components/elements/click-outside/ClickOutside';
import { NavLink } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { PaginationData } from '../../../props/ApiResponses';
import Notification from '../../../props/models/Notification';
import useEnvData from '../../../hooks/useEnvData';

export default function HeaderNotifications({ organization }: { organization: Organization }) {
    const envData = useEnvData();
    const [notifications, setNotifications] = useState<PaginationData<Notification>>(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationService = useNotificationService();
    const [setReadTimeoutDelay] = useState(2500);

    const fetchNotifications = useCallback(
        (mark_read = false, seenIds = []) => {
            notificationService
                .list({ organization_id: organization?.id, per_page: 100, mark_read: mark_read ? 1 : 0 })
                .then((res) => {
                    res.data.data = res.data.data.map((item) => ({
                        ...item,
                        seen: item.seen || seenIds.includes(item.id),
                    }));

                    setNotifications(res.data);
                });
        },
        [notificationService, organization],
    );

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (notifications && showNotifications) {
            const timeout = window.setTimeout(() => {
                fetchNotifications(
                    true,
                    notifications.data.map((item) => item.id),
                );
            }, setReadTimeoutDelay);

            return () => window.clearTimeout(timeout);
        }
    }, [showNotifications, fetchNotifications, setReadTimeoutDelay, notifications]);

    return (
        <div className={classList(['notifications', showNotifications ? 'active' : null])}>
            <div className="notifications-icons flex">
                {/* Help link */}
                {envData?.config?.help_link && (
                    <a
                        href={envData?.config?.help_link}
                        className="notifications-icon notifications-icon-help"
                        target={'_blank'}
                        rel="noreferrer">
                        <em className="mdi mdi-help" />
                    </a>
                )}

                {/* Notifications */}
                <div
                    className={classList([
                        'notifications-icon',
                        parseInt(notifications?.meta?.total_unseen?.toString()) > 0
                            ? 'notifications-icon-updates'
                            : null,
                    ])}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowNotifications(!showNotifications);
                    }}>
                    {parseInt(notifications?.meta?.total_unseen?.toString()) > 0 ? (
                        <em className="mdi mdi-bell" />
                    ) : (
                        <em className="mdi mdi-bell-outline" />
                    )}
                </div>
            </div>

            {/* Notifications dropdown */}
            {showNotifications && (
                <ClickOutside onClickOutside={() => setShowNotifications(false)} className="notifications-menu">
                    <div className="notifications-menu-inner">
                        <div className="arrow-box">
                            <em className="arrow" />
                        </div>
                        <div className="notifications-menu-header">
                            Nieuwe notificaties
                            {parseInt(notifications?.meta?.total_unseen?.toString()) > 0 &&
                                ` (${notifications.meta.total_unseen} nieuw)`}
                            <NavLink
                                to={getStateRouteUrl('organization-notifications', { organizationId: organization.id })}
                                onClick={() => setShowNotifications(false)}
                                className="notifications-menu-header-link">
                                Bekijk alles
                                <em className="mdi mdi-arrow-right" />
                            </NavLink>
                        </div>
                        <div className="notifications-menu-body">
                            {notifications?.data.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={classList([
                                        'notifications-menu-item',
                                        notification.seen ? null : 'notifications-menu-item-new',
                                    ])}>
                                    <div className="notifications-menu-item-details">
                                        <div className="notifications-menu-item-title">{notification.title}</div>
                                        <div className="notifications-menu-item-text">{notification.description}</div>
                                        <div className="notifications-menu-item-date">
                                            <em className="mdi mdi-clock-outline" />
                                            {notification.created_at_locale}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {notifications?.data.length == 0 && (
                                <div className="notifications-menu-empty">Geen nieuwe notificaties</div>
                            )}
                        </div>
                    </div>
                </ClickOutside>
            )}
        </div>
    );
}
