import { useEffect, useState } from 'react';
import EnvDataWebshopProp from '../../../props/EnvDataWebshopProp';

export default function MatomoScript({
    envData,
    cookiesAccepted = null,
}: {
    envData: EnvDataWebshopProp;
    cookiesAccepted: boolean;
}) {
    const { matomo_url, matomo_site_id } = envData?.config || {};
    const [paq, setPaq] = useState(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        if (!matomo_url || !matomo_site_id) {
            return;
        }

        if (scriptLoaded || cookiesAccepted !== true) {
            return;
        }

        setScriptLoaded(true);

        const script = document.createElement('script');

        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        script.src = `${matomo_url}/matomo.js`;

        document.body.appendChild(script);

        window['_paq'] = window['_paq'] || [];
        window['_paq'].push(['requireConsent']);
        window['_paq'].push(['trackPageView']);
        window['_paq'].push(['enableLinkTracking']);
        window['_paq'].push(['setTrackerUrl', `${matomo_url}/matomo.php`]);
        window['_paq'].push(['setSiteId', matomo_site_id]);

        setPaq(window['_paq']);
    }, [matomo_site_id, matomo_url, scriptLoaded, cookiesAccepted]);

    useEffect(() => {
        if (!paq || cookiesAccepted === null) {
            return;
        }

        if (cookiesAccepted === true) {
            paq.push(['setConsentGiven']);
        } else {
            paq.push(['forgetCookieConsentGiven']);
        }
    }, [paq, cookiesAccepted]);

    return null;
}
