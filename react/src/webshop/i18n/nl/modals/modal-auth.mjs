export default {
    // AUTHENTICATION POPUP = popup-auth.pug
    header: {
        title: 'E-mail verstuurd',
        title_sr: 'Start aanmelden',
        subtitle_formal: 'Vul uw e-mailadres in om een link te ontvangen waarmee u kunt inloggen.',
        subtitle_informal: 'Vul jouw e-mailadres in om een link te ontvangen waarmee je kunt inloggen.',

        title_succes_formal: 'Bevestig dat u toegang heeft tot dit e-mailadres.',
        title_succes_informal: 'Bevestig dat je toegang hebt tot dit e-mailadres.',

        title_existing_user_succes_formal: 'Controleer uw e-mail.',
        title_existing_user_succes_informal: 'Controleer je e-mail.',

        subtitle_we_succes_formal: [
            'U heeft een e-mail ontvangen op <strong class="text-primary">{{email}}</strong>.',
            'Ga naar uw inbox en open de e-mail met het onderwerp "E-mail bevestigen" en klik in de e-mail op "Bevestigen".',
        ].join(' '),
        subtitle_we_succes_informal: [
            'Je hebt een e-mail ontvangen op <strong class="text-primary">{{email}}</strong>.',
            'Ga naar je inbox en open de e-mail met het onderwerp "E-mail bevestigen" en klik in de e-mail op "Bevestigen".',
        ].join(' '),

        subtitle_succes_formal:
            'U heeft een e-mail ontvangen op het e-mailadres dat u zojuist hebt ingevuld. Ga naar uw inbox en open de e-mail met het onderwerp "E-mail bevestigen" en klik in de e-mail op de blauwe knop.',
        subtitle_succes_informal:
            'Je hebt een e-mail ontvangen op het e-mailadres dat je zojuist hebt ingevuld. Ga naar je inbox en open de e-mail met het onderwerp "E-mail bevestigen" en klik in de e-mail op de blauwe knop.',
    },
    notifications: {
        confirmation: 'Het is gelukt!',
        link_formal:
            'Er is een e-mail verstuurd naar <strong class="text-primary">{{email}}</strong>.<br/>Klik op de link om u aan te melden.',
        link_informal:
            'Er is een e-mail verstuurd naar <strong class="text-primary">{{email}}</strong>.<br/>Klik op de link om je aan te melden.',
        invalid: 'De activatiecode is ongeldig of al gebruikt.',
        voucher_email: 'De QR-code is verstuurd.',
    },
    buttons: {
        qrcode: 'Log in via de Me-app',
        mail: 'Log in via e-mail',
        submit: 'Bevestigen',
        cancel: 'Annuleren',
        confirm: 'Volgende',
    },
    labels: {
        zuidhorn: {
            mail: '<strong>Let op</strong>: gebruik uw eigen e-mailadres.<br /> U kunt voor het Kindpakket per jaar maximaal één activatiecode per e-mailadres gebruiken.',
        },
        berkelland: {
            mail: 'Maak een account aan voordat u verder kan met de activatie.',
        },
        oostgelre: {
            mail: 'Maak een account aan voordat u verder kan met de activatie.',
        },
        winterswijk: {
            mail: 'Maak een account aan voordat u verder kan met de activatie.',
        },
        westerkwartier: {
            mail: 'Maak een account aan voordat u verder kan met de activatie.',
        },
        noordoostpolder: {
            mail: 'Maak een account aan voordat u verder kan met de activatie.',
        },
        timelimit: 'U wordt automatisch uitgelogd na 15 minuten inactiviteit.',
        warning: "Sluit dit venster en klik op 'Login' als u de activatiecode al eens heeft gebruikt.",
        join: 'Aanmelden',
        mail_sent: 'Een e-mail is onderweg!',
        activate: 'Stap 1 van 3: Webshop account aanmaken.',
        activate_code: 'Stap 3 van 3: Activeer uw tegoed.',
        scancode: 'Scan deze QR-Code met een ander apparaat waar u al op aangemeld bent.',
        mobilecode: 'Vul uw toegangscode van de Me-app in.',
        mail: '<strong>Let op</strong>: gebruik uw eigen e-mailadres.<br /> U kunt voor {{fund}} per jaar maximaal één activatiecode per e-mailadres gebruiken.',
        link: 'Vul uw e-mailadres in om een link te ontvangen waarmee u kunt inloggen.',
        code: 'Vul de activatiecode in die u per brief hebt ontvangen.<br /><strong>Let op:</strong> U kunt één activatiecode per e-mailadres gebruiken. Sluit dit venster als u al een activatiecode heeft gebruikt.',
        voucher_email: 'Het is gelukt!',
        isactivated: 'Uw tegoed is al geactiveerd.',
        codeactivated: 'U heeft al een activatiecode gebruikt. Het is niet mogelijk nog één te gebruiken.',
        dont_have_account: 'Heeft u geen account en wilt u één aanmaken door een activatiecode te gebruiken?',
    },
    input: {
        mail: 'E-mailadres',
        coding: 'Vul de activatiecode in',
        code: 'Activatiecode',
        mailing: 'E-mail',
        confirmation: 'Bevestig uw e-mailadres',
    },
    pin_code: {
        confirmation: {
            title_formal: 'De app wordt gekoppeld aan uw account',
            title_informal: 'De app wordt gekoppeld aan je account',
            description: 'Na vijf tot tien seconden wordt de app gekoppeld. Is het gelukt? Klik dan op volgende.',
            notice_formal: 'Ziet u na dertig seconden nog steeds de zes cijfers in de app? Probeer het dan opnieuw.',
            notice_informal: 'Zie je na dertig seconden nog steeds de zes cijfers in de app? Probeer het dan opnieuw.',
            buttons: {
                try_again: 'Opnieuw proberen',
                confirm: 'Volgende',
            },
        },
    },
    validation: {
        email_confirmation: 'De e-mailadressen komen niet overeen',
    },
    restore_formal: 'Vergeten welk e-mailadres u heeft gebruikt?',
    restore_informal: 'Vergeten welk e-mailadres je hebt gebruikt?',
    restore_subtitle_formal: 'Herstel uw account door opnieuw in te loggen met DigiD',
    restore_subtitle_informal: 'Herstel je account door opnieuw in te loggen met DigiD',
};
