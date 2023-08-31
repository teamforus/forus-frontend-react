import React, { useContext } from 'react';
import { pushNotificationContext } from '../context/PushNotificationsContext';

export default function PushNotifications() {
    const { notifications, popNotification } = useContext(pushNotificationContext);

    return (
        <div className="block block-push-notifications">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`notification notification-${notification.type} ${notification.visible ? 'shown' : ''}`}
                    data-dusk={`${notification.type}Notification`}>
                    <div
                        className="notification-close mdi mdi-close"
                        onClick={() => popNotification(notification.id)}
                    />
                    <div className={`notification-icon mdi mdi-${notification.icon}`} />

                    {notification.visible && (
                        <div className="notification-details">
                            {notification.title && <strong>{notification.title}</strong>}
                            {notification.message && <span>{notification.message}</span>}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
