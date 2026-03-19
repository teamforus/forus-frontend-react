import NotificationTemplate from './NotificationTemplate';
import SystemNotificationFundState from './SystemNotificationFundState';

export default interface SystemNotification {
    id?: number;
    key?: string;
    title?: string;
    order?: number;
    group?: string;
    optional?: boolean;
    editable?: boolean;
    enable_all?: boolean;
    enable_mail?: boolean;
    enable_push?: boolean;
    enable_database?: boolean;
    variables?: Array<string>;
    channels?: Array<'database' | 'mail' | 'push'>;
    last_sent_date?: string;
    last_sent_date_locale?: string;
    funds?: Array<SystemNotificationFundState> | null;
    templates?: Array<NotificationTemplate>;
    templates_default?: Array<NotificationTemplate>;
}
