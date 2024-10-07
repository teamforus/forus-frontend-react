import React, { Fragment, useContext, useMemo } from 'react';
import { pushNotificationContext } from '../context/PushNotificationsContext';
import PushNotificationsGroup from './PushNotificationsGroup';

export default function PushNotifications() {
    const { groups } = useContext(pushNotificationContext);

    const groupList = useMemo(() => {
        return Object.keys(groups)?.map((key) => {
            return { key, ...groups[key] };
        });
    }, [groups]);

    return (
        <Fragment>
            {groupList.map((group) => (
                <PushNotificationsGroup
                    key={group.key}
                    group={group.key}
                    className={group.className}
                    showConfig={group.showConfig}
                />
            ))}
        </Fragment>
    );
}
