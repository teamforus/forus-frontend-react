export default interface EnvDataProp {
    client_key: string;
    client_type: 'sponsor' | 'provider' | 'validator' | 'webshop';
    name: string;
    type: 'webshop' | 'dashboard' | 'backend';
    webRoot?: string;
    useHashRouter?: boolean;
    config: {
        api_url: string;
        google_maps_api_key?: string;
        help_link?: string;
        me_app_link?: string;
        ios_ipad_link?: string;
        ios_iphone_link?: string;
        android_link?: string;
        single_record_validation?: boolean;
        [key: string]: string | number | boolean;
    };
}
