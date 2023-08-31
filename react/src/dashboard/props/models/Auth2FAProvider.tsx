import Auth2FAProviderType from './Auth2FAProviderType';

export default interface Auth2FAProvider {
    key: string;
    type: 'phone' | 'authenticator';
    name: string;
    url_ios?: string;
    url_android?: string;
    provider_type?: Auth2FAProviderType;
}
