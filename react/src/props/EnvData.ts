import AwsRumProps from './AwsRumProps';

export default interface EnvDataProp {
    client_key: string;
    client_type: 'sponsor' | 'provider' | 'validator' | 'webshop';
    client_key_api?: string;
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
        features_hide?: boolean;
        feedback_email?: string;
        features_contact_email?: string;
        features_contact_phone?: string;
        support_contact_email?: string;
        support_contact_phone?: string;
        fund_requests_use_custom_modal?: boolean;

        aws_rum?: AwsRumProps;
        allow_test_errors?: boolean;

        [key: string]: string | number | boolean | AwsRumProps;
    };
}
