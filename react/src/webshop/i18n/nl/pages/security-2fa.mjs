export default {
    title: 'Tweefactorauthenticatie',
    subtitle:
        'Voeg een extra beveiligingslaag toe aan uw account door tweefactorauthenticatie in te schakelen. U kunt kiezen uit de volgende verificatiemethoden: Authenticator app en SMS-verificatie.',
    breadcrumbs: {
        home: 'Home',
        security_2fa: 'Tweefactorauthenticatie',
    },
    enabled_on: 'Ingeschakeld: ',
    disabled: 'Uitgeschakeld',
    sms_message: 'SMS Bericht',
    number_confirmed: 'Nummer bevestigd',
    verification_codes_sent: 'Verificatie codes zijn verzonden via SMS',
    disable: 'Uitschakelen',
    enable: 'Inschakelen',
    settings: 'Instellingen',
    remember_ip: 'Onthoud IP-adres',
    vouchers_restrict: 'Er zijn één of meerdere vouchers van een fonds die deze instelling beperken',
    municipality_restrict:
        'Deze instellingen kunnen niet worden aangepast vanwege de voorwaarden die door de gemeente zijn gesteld',
    confirm: 'Bevestigen',
    require_2fa_always: 'Altijd bevestiging vereisen met 2FA',
    require_2fa_ip: 'Als IP-adres in de afgelopen 48 uur gebruikt, geen 2FA vereisen.',
    saved: 'Opgeslagen!',
    error: 'Error',
    unknown_error: 'Onbekende foutmelding.',
    failed: 'Mislukt!',

    providers: {
        authenticator: {
            title: 'Authenticator app',
        },
        phone: {
            title: 'SMS Verificatie',
        },
    },
    app_providers: {
        authenticator_google: 'Google authenticator',
        authenticator_microsoft: 'Microsoft Authenticator',
        authenticator_lastpass: 'LastPass Authenticator',
        authenticator_1password: '1Password authenticator',
    },
};
