export interface PreferenceOption {
    key: string;
    type: 'email' | 'push';
    subscribed: boolean;
}

export default interface NotificationPreference {
    email: string;
    email_unsubscribed: boolean;
    preferences: Array<PreferenceOption>;
}
