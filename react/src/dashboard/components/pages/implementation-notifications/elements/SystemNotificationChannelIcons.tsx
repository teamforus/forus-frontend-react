import React from 'react';
import SystemNotification from '../../../../props/models/SystemNotification';
import SystemNotificationChannelIcon from './SystemNotificationChannelIcon';

export default function SystemNotificationChannelIcons({ notification }: { notification: SystemNotification }) {
    const channels: Array<'mail' | 'push' | 'database'> = ['mail', 'push', 'database'];

    return (
        <div className="td-icons">
            {channels.map((channel) => (
                <SystemNotificationChannelIcon key={channel} notification={notification} type={channel} />
            ))}
        </div>
    );
}
