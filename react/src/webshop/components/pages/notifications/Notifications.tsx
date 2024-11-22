import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { useNotificationService } from '../../../../dashboard/services/NotificationService';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import Notification from '../../../../dashboard/props/models/Notification';
import useFilter from '../../../../dashboard/hooks/useFilter';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';

export default function Notifications() {
    const translate = useTranslate();

    const setProgress = useSetProgress();
    const notificationsService = useNotificationService();

    const [notifications, setNotifications] = useState<PaginationData<Notification, { total_unseen: number }>>(null);
    const [timeoutThreshold] = useState(2500);

    const filter = useFilter({
        per_page: 10,
    });

    const fetchNotifications = useCallback(
        (mark_read = false) => {
            setProgress(0);

            notificationsService
                .list({ ...filter.activeValues, mark_read: mark_read ? 1 : 0 })
                .then((res) => {
                    res.data.data = res.data.data.map((item) => ({ ...item, seen: item.seen || mark_read }));
                    setNotifications(res.data);
                })
                .finally(() => setProgress(100));
        },
        [notificationsService, filter?.activeValues, setProgress],
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

    return (
        <BlockShowcaseProfile
            breadcrumbItems={[{ name: 'Home', state: 'home' }, { name: 'Notificaties' }]}
            profileHeader={
                notifications && (
                    <div className="profile-content-header clearfix">
                        <div className="profile-content-title">
                            <div className="pull-left">
                                {(notifications?.meta.total_unseen as number) > 0 && (
                                    <div className="profile-content-title-count">
                                        {notifications?.meta.total_unseen}
                                    </div>
                                )}
                                <h1 className="profile-content-header">Notificaties</h1>
                            </div>
                        </div>
                    </div>
                )
            }>
            {notifications && (
                <Fragment>
                    {notifications?.data.length > 0 && (
                        <div className="card block block-notifications-table">
                            <div className="card-section card-section-padless">
                                <table className="table">
                                    <tbody>
                                        <tr>
                                            <th className="hide-sm">Datum</th>
                                            <th>Notificatie</th>
                                        </tr>
                                        {notifications.data?.map((notification) => (
                                            <tr key={notification.id} className={!notification.seen ? 'dim' : ''}>
                                                <td className="notification-date hide-sm">
                                                    <em className="mdi mdi-clock-outline" />
                                                    {notification.created_at_locale}
                                                </td>
                                                <td>
                                                    <h2 className="notification-title">{notification.title}</h2>
                                                    <div className="notification-description">
                                                        {notification.description}
                                                    </div>
                                                    <div className="notification-date show-sm">
                                                        <em className="mdi mdi-clock-outline" />
                                                        {notification.created_at_locale}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {notifications?.data.length == 0 && (
                        <EmptyBlock
                            title={translate('block_notifications.labels.title')}
                            description={translate('block_notifications.labels.subtitle')}
                            svgIcon={'reimbursements'}
                            hideLink={true}
                        />
                    )}

                    <div className="card" hidden={notifications?.meta?.last_page < 2}>
                        <div className="card-section">
                            <Paginator
                                meta={notifications.meta}
                                filters={filter.values}
                                updateFilters={filter.update}
                            />
                        </div>
                    </div>
                </Fragment>
            )}
        </BlockShowcaseProfile>
    );
}
