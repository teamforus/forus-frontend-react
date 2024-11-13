import { useEffect, useState } from 'react';
import EnvDataWebshopProp from '../../../props/EnvDataWebshopProp';

export default function SiteImproveAnalytics({
    envData,
    cookiesAccepted = null,
}: {
    envData: EnvDataWebshopProp;
    cookiesAccepted: boolean;
}) {
    const { site_improve_analytics_id } = envData?.config || {};
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        if (!site_improve_analytics_id || cookiesAccepted === null || scriptLoaded) {
            return;
        }

        if (cookiesAccepted) {
            setScriptLoaded(true);

            const script = document.createElement('script');

            script.type = 'text/javascript';
            script.async = true;
            script.defer = true;
            script.src = `https://siteimproveanalytics.com/js/siteanalyze_${site_improve_analytics_id}.js`;

            document.body.appendChild(script);
        }
    }, [site_improve_analytics_id, cookiesAccepted, scriptLoaded]);

    return null;
}
