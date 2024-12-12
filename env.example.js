const fronts = {};
const api_url = 'http://forus-backend-app/api/v1';

const baseImplementationKey = 'general';
const support_id = false;
const chat_id = false;
const sessions = true;
const google_maps_api_key = '';

const me_app_link = 'https://forus.io/DL';
const ios_ipad_link = 'https://testflight.apple.com/join/gWw1lXyB';
const ios_iphone_link = 'https://testflight.apple.com/join/gWw1lXyB';
const android_link = 'https://media.forus.io/static/me-0.0.5-staging-7-release.apk';
const help_link = 'https://helpcentrum.forus.io';

const use_hash_router = true;
const disable_indexing = true;
const allow_test_errors = false;
const disable_cookie_banner = false;

const read_speaker_id = null;
const read_speaker_region = null;

const aws_rum = null; /*{
    appId: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
    appVersion: '1.0.0',
    appRegion: 'eu-west-1',
    allowCookies: false,
    enableXRay: false,
    endpoint: 'XXXXXXXXXXXXXXXXXXXXXXXX',
    identityPoolId: 'XXXXXXXXXXXXXXXXXXXXXXXX',
    sessionSampleRate: 1,
    telemetries: ['errors'],
}*/

const globalConfigs = {
    '*': {
        useHashRouter: use_hash_router,

        'config.api_url': api_url,
        'config.sessions': sessions,
        'config.aws_rum': aws_rum,
        'config.google_maps_api_key': google_maps_api_key,
        'config.disable_indexing': disable_indexing,
        'config.allow_test_errors': allow_test_errors,
        'config.disable_cookie_banner': disable_cookie_banner,
    },

    'webshop.*': {
        'config.read_speaker_id': read_speaker_id,
        'config.read_speaker_region': read_speaker_region,
        'config.provider_sign_up_filters': {
            foo: 'bar',
        },
        'config.flags': {
            fundsMenu: true,
            show2FAMenu: true,
            logoExtension: '.svg',
            showStartButton: true,
            genericSearch: true,
        },
    },

    'dashboard.*': {
        'config.chat_id': chat_id,
        'config.support_id': support_id,
        'config.help_link': help_link,
        'config.me_app_link': me_app_link,
        'config.ios_ipad_link': ios_ipad_link,
        'config.ios_iphone_link': ios_iphone_link,
        'config.android_link': android_link,
    },
};

fronts['webshop.general'] = {
    type: 'webshop',
    client_key: 'general',
    client_key_api: 'nijmegen',
    client_type: 'webshop',
    webRoot: 'webshop.general',
    name: 'General webshop',
    default_title: 'General webshop',
    config: {},
};

fronts['webshop.nijmegen'] = {
    type: 'webshop',
    client_key: 'nijmegen',
    client_type: 'webshop',
    name: 'Nijmegen webshop',
    default_title: 'Nijmegen webshop',
};

fronts['dashboard.sponsor'] = {
    type: 'dashboard',
    client_key: 'general',
    client_type: 'sponsor',
    webRoot: 'dashboard.sponsor',
    name: 'Sponsor dashboard',
    default_title: 'Sponsor dashboard',
    config: {},
};

fronts['dashboard.provider'] = {
    type: 'dashboard',
    client_key: 'general',
    client_type: 'provider',
    name: 'Provider dashboard',
    default_title: 'Provider dashboard',
    webRoot: 'dashboard.provider',
    config: {},
};

fronts['dashboard.validator'] = {
    type: 'dashboard',
    client_key: baseImplementationKey,
    client_type: 'validator',
    name: 'Validator dashboard',
    default_title: 'Validator dashboard',
    webRoot: 'dashboard.validator',
    config: {},
};

fronts['backend'] = {
    type: 'backend',
    name: 'Backend',
    client_key: 'general',
    assetsPath: '../forus-backend/public/assets',
    appFileName: '../../forus-backend/public/assets/js/app.js',
    withoutHtml: true,
    client_type: 'pin_code-auth',
    config: {},
};

// eslint-disable-next-line no-undef
module.exports = {
    fronts: fronts,
    globalConfigs: globalConfigs,
    enableOnly: ['webshop.general', 'dashboard.sponsor', 'dashboard.provider', 'dashboard.validator'],
    disableOnly: [],
    httpsKey: null,
    httpsCert: null,
    buildGzipFiles: false,
    nonce: null,
};
