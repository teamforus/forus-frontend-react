export default interface SystemNotificationFundState {
    id?: number;
    name?: string;
    enable_all?: boolean;
    enable_mail?: boolean;
    enable_push?: boolean;
    enable_database?: boolean;
    last_sent_date?: string;
    last_sent_date_locale?: string;
}
