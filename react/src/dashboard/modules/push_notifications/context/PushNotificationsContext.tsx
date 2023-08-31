import React, { useState, useCallback } from 'react';
import { createContext } from 'react';
import { uniqueId } from 'lodash';

interface NotificationConfig {
    type?: 'success' | 'danger';
    icon?: string;
    timeout?: number;
}

interface Notification extends NotificationConfig {
    title: string;
    message: string;
}

interface PushNotification extends Notification {
    id?: string;
    visible?: boolean;
    timerShow?: number;
    timerHide?: number;
    timerPop?: number;
}

interface PushNotificationMemo {
    pushDanger: (title: string, message?: string, notification?: NotificationConfig) => void;
    pushSuccess: (title: string, message?: string, notification?: NotificationConfig) => void;
    notifications: Array<PushNotification>;
    popNotification: (id: string) => void;
    pushNotification: (notification: PushNotification) => void;
}

const pushNotificationContext = createContext<PushNotificationMemo>(null);
const { Provider } = pushNotificationContext;

const PushNotificationsProvider = ({ children }: { children: React.ReactElement }) => {
    const [total] = useState(4);
    const [notifications, setNotifications] = useState<Array<PushNotification>>([]);

    const setVisibility = useCallback((id: string, visible: boolean) => {
        setNotifications((notifications) => {
            return [...notifications.map((item) => Object.assign(item, item.id == id ? { visible } : {}))];
        });
    }, []);

    const popNotification = useCallback(
        (id: string) => {
            setVisibility(id, false);

            setTimeout(() => {
                setNotifications((notifications) => {
                    return [...notifications.filter((item) => item.id !== id)];
                });
            }, 200);
        },
        [setVisibility],
    );

    const pushNotification = useCallback(
        (notification: PushNotification) => {
            setNotifications((notifications) => {
                notification.id = uniqueId();
                notification.timeout = notification.timeout ? notification.timeout : 8000;

                notification.timerPop = window.setTimeout(() => popNotification(notification.id), notification.timeout);
                notification.timerShow = window.setTimeout(() => setVisibility(notification.id, true), 200);

                notifications.slice(total).forEach((notification) => {
                    window.clearTimeout(notification.timerPop);
                    window.clearTimeout(notification.timerShow);
                    popNotification(notification.id);
                });

                return [notification, ...notifications];
            });
        },
        [total, setVisibility, popNotification],
    );

    const pushSuccess = useCallback(
        (title: string, message = '', notification?: NotificationConfig) => {
            pushNotification({ title, message, icon: 'check', type: 'success', ...notification });
        },
        [pushNotification],
    );

    const pushDanger = useCallback(
        (title: string, message = '', notification?: NotificationConfig) => {
            pushNotification({ title, message, icon: 'close', type: 'danger', ...notification });
        },
        [pushNotification],
    );

    return (
        <Provider
            value={{
                pushDanger,
                pushSuccess,
                notifications,
                popNotification,
                pushNotification,
            }}>
            {children}
        </Provider>
    );
};

export { PushNotificationsProvider, pushNotificationContext };
