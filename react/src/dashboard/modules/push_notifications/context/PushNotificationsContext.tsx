import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { createContext } from 'react';
import { uniqueId } from 'lodash';
import ButtonType from '../../../../props/elements/ButtonType';
import useStorageService from '../../storage/useStrorrageService';

interface NotificationConfig {
    type?: 'success' | 'danger' | 'info';
    icon?: string;
    timeout?: number;
}

interface Notification extends NotificationConfig {
    title: string;
    message: string;
}

export interface PushNotification extends Notification {
    id?: string;
    timerShow?: number;
    timerHide?: number;
    timerPop?: number;
    group?: string;
    imageSrc?: string;
    button?: ButtonType;
}

interface PushNotificationMemo {
    groups: PushNotificationGroups;
    pushRaw: (notification: PushNotification) => string;
    pushInfo: (title: string, message?: string, notification?: NotificationConfig) => string;
    pushDanger: (title: string, message?: string, notification?: NotificationConfig) => string;
    pushSuccess: (title: string, message?: string, notification?: NotificationConfig) => string;
    notifications: Array<PushNotification>;
    setNotifications: React.Dispatch<React.SetStateAction<PushNotification[]>>;
    popNotification: (id: string) => void;
    pushNotification: (notification: PushNotification) => void;
    setDismissTimeValue: (type: string, time: number) => void;
    getDismissTimeValue: (type: string) => number | undefined;
    pushNotificationStorageKey: string;
}

interface PushNotificationGroup {
    maxCount?: number;
    className?: string;
    showConfig?: boolean;
    maxVisibleCount?: number;
    defaultDismissTimeout?: number;
}

type PushNotificationGroups = {
    [key: string]: PushNotificationGroup;
};

const pushNotificationContext = createContext<PushNotificationMemo>(null);
const { Provider } = pushNotificationContext;

const PushNotificationsProvider = (props: {
    groups?: PushNotificationGroups;
    children: React.ReactElement | React.ReactElement[];
}) => {
    const storage = useStorageService();

    const defaultGroups = useMemo<PushNotificationGroups>(
        () => ({
            default: { maxCount: 0, className: '', showConfig: false, maxVisibleCount: 3, defaultDismissTimeout: 5 },
        }),
        [],
    );

    const groups = useMemo(() => {
        if (props?.groups) {
            Object.keys(props?.groups).forEach(
                (key) => (props.groups[key] = { ...defaultGroups[0], ...props?.groups[key] }),
            );

            return props?.groups;
        }

        return defaultGroups;
    }, [props?.groups, defaultGroups]);

    const [notifications, setNotifications] = useState<Array<PushNotification>>([]);
    const [pushNotificationStorageKey] = useState('push_notification_preferences');

    const popNotification = useCallback((id: string) => {
        setNotifications((notifications) => {
            return [...notifications.filter((item) => item.id !== id)];
        });
    }, []);

    const setDismissTimeValue = useCallback(
        (storageKey: string, time: number) => {
            storage.setCollectionItem(pushNotificationStorageKey, storageKey, time);
        },
        [pushNotificationStorageKey, storage],
    );

    const getDismissTimeValue = useCallback(
        (storageKey: string): number | undefined => {
            const value = storage.getCollectionItem(pushNotificationStorageKey, storageKey);

            return (value == 0 || value) && !isNaN(parseInt(value))
                ? parseInt(value)
                : groups[storageKey]?.defaultDismissTimeout || undefined;
        },
        [pushNotificationStorageKey, storage, groups],
    );

    const pushNotification = useCallback(
        (notification: PushNotification) => {
            const groupKey = notification.group ? notification.group : Object.keys(groups)?.[0];
            const group = groups[groupKey];

            notification.id = uniqueId();
            notification.group = groupKey;

            setNotifications((notifications) => {
                const list = [notification, ...notifications];
                const listGroup = list.filter((item) => item.group === groupKey);

                listGroup
                    .slice(group.maxCount > 0 ? group.maxCount : listGroup.length)
                    .forEach((item) => setTimeout(() => popNotification(item.id)));

                return list;
            });

            return notification.id;
        },
        [groups, popNotification],
    );

    const pushSuccess = useCallback(
        (title: string, message = '', notification?: NotificationConfig) => {
            return pushNotification({ title, message, icon: 'check', type: 'success', ...notification });
        },
        [pushNotification],
    );

    const pushDanger = useCallback(
        (title: string, message = '', notification?: NotificationConfig) => {
            return pushNotification({ title, message, icon: 'close', type: 'danger', ...notification });
        },
        [pushNotification],
    );

    const pushInfo = useCallback(
        (title: string, message = '', notification?: NotificationConfig) => {
            return pushNotification({ title, message, icon: 'close', type: 'info', ...notification });
        },
        [pushNotification],
    );

    const pushRaw = useCallback(
        (notification: PushNotification) => {
            return pushNotification(notification);
        },
        [pushNotification],
    );

    useEffect(() => {
        notifications.forEach((notification) => {
            const groupKey = notification.group ? notification.group : Object.keys(groups)?.[0];
            const timeout = getDismissTimeValue(groupKey);
            notification.timeout = notification.timeout || (timeout ? timeout * 1000 : null);

            if (notification.timeout) {
                window.setTimeout(() => popNotification(notification.id), notification.timeout);
            }
        });
    }, [notifications, groups, popNotification, getDismissTimeValue]);

    return (
        <Provider
            value={{
                groups,
                pushRaw,
                pushInfo,
                pushDanger,
                pushSuccess,
                notifications,
                setNotifications,
                popNotification,
                pushNotification,
                setDismissTimeValue,
                getDismissTimeValue,
                pushNotificationStorageKey,
            }}>
            {props.children}
        </Provider>
    );
};

export { PushNotificationsProvider, pushNotificationContext };
