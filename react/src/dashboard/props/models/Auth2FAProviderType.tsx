export default interface Auth2FAProviderType {
    key: string;
    type: 'phone' | 'authenticator';
    name: string;
    subtitle: string;
    url_ios?: string;
    url_android?: string;
}
