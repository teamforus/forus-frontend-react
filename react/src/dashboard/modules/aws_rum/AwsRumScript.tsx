import { useEffect, useState } from 'react';
import { AwsRum, AwsRumConfig } from 'aws-rum-web';
import AwsRumProps from '../../../props/AwsRumProps';

export default function AwsRumScript({
    awsRum,
    cookiesAccepted = null,
}: {
    awsRum: AwsRumProps;
    cookiesAccepted?: boolean;
}) {
    const [rum, setRum] = useState(null);

    useEffect(() => {
        if (!awsRum || rum) {
            return;
        }

        if (cookiesAccepted !== true) {
            return;
        }

        try {
            const config: AwsRumConfig = {
                allowCookies: cookiesAccepted && (awsRum.allowCookies || true),
                enableXRay: awsRum.enableXRay,
                endpoint: awsRum.endpoint,
                identityPoolId: awsRum.identityPoolId,
                sessionSampleRate: awsRum.sessionSampleRate,
                telemetries: awsRum.telemetries,
            };

            setRum(new AwsRum(awsRum.appId, awsRum.appVersion, awsRum.appRegion, config));
        } catch {
            // Ignore errors thrown during CloudWatch RUM web client initialization
        }
    }, [rum, awsRum, cookiesAccepted]);

    return null;
}
