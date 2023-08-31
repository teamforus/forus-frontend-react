import Auth2FAProviderType from './Auth2FAProviderType';

export default interface Identity2FA {
    uuid: string;
    state: 'active' | 'pending' | 'deactivated';
    provider_type: Auth2FAProviderType;
    phone?: string;
    secret?: string;
    secret_url?: string;
    created_at?: string;
    created_at_locale?: string;
}
