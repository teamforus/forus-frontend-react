import AwsRumProps from './AwsRumProps';
import { WebshopRoutes } from '../webshop/modules/state_router/RouterBuilder';

export type MenuItem = {
    id?: string;
    name?: string;
    className?: string;
    nameTranslate?: string;
    nameTranslateDefault?: string;
    href?: string;
    state?: WebshopRoutes;
    stateParams?: object;
    target?: string;
    enabled?: boolean;
};

export default interface EnvDataWebshopProp {
    client_key: string;
    client_type: string;
    name: string;
    type: 'webshop';
    webRoot?: string;
    useHashRouter?: boolean;
    config: {
        api_url: string;
        matomo_url?: string;
        matomo_site_id?: string;
        read_speaker_id?: string;
        read_speaker_region?: string;
        site_improve_analytics_id?: string;
        tag_manager_id?: string;
        sessions?: boolean;
        google_maps_api_key?: string;
        disable_cookie_banner?: boolean;
        default_title?: string;
        allow_indexing?: boolean;

        me_app_link?: string;
        ios_ipad_link?: string;
        ios_iphone_link?: string;
        android_link?: string;

        provider_sign_up_filters: {
            [key: string]: string;
        };

        aws_rum?: AwsRumProps;
        allow_test_errors?: boolean;

        flags: {
            genericSearch?: boolean;
            showAccountSidebar?: boolean;
            showOnlyUsedCategories?: boolean;
            show2FAMenu?: boolean;
            useLightAppIcons?: boolean;

            // menu settings
            meAppMenu?: boolean;
            forusPlatformMenu?: boolean;
            portfolioMenu?: boolean;
            aboutSiteMenu?: boolean;
            fundsMenu?: boolean;
            fundsMenuIfLoggedOut?: boolean;
            productsMenu?: boolean;
            providersMenu?: boolean;
            providersSignUpMenu?: boolean;
            navbarCombined?: boolean;

            noPrintOption?: boolean;
            activateFirstFund?: boolean;
            accessibilityPage?: boolean;

            // home
            showStartButton?: boolean;

            showFooterSponsorLogo?: boolean;
            productDetailsOnlyAvailableFunds?: boolean;

            productsAlign?: 'left' | 'center' | 'right';

            menuItems?: Array<MenuItem>;

            startPage?: {
                combineColumns?: boolean;
                hideSignUpColumn?: boolean;
                hideSignUpDigidOption?: boolean;
                hideSignUpEmailOption?: boolean;
                hideSignUpQrCodeOption?: boolean;
                hideSignInColumn?: boolean;
                hideSignInDigidOption?: boolean;
                hideSignInEmailOption?: boolean;
                hideSignInQrCodeOption?: boolean;
            };
        };
    };
}
