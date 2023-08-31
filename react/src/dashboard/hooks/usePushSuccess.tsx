import { useContext } from 'react';
import { pushNotificationContext } from '../modules/push_notifications/context/PushNotificationsContext';

export default function usePushSuccess() {
    return useContext(pushNotificationContext).pushSuccess;
}
