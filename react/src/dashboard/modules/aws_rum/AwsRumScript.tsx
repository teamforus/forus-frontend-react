import { useEffect } from 'react';
import { AwsRum, AwsRumConfig } from 'aws-rum-web';
import AwsRumProps from '../../../props/AwsRumProps';

export default function AwsRumScript({ awsRum }: { awsRum: AwsRumProps }) {
    useEffect(() => {
        if (!awsRum) {
            return;
        }

        try {
            const config: AwsRumConfig = {
                allowCookies: awsRum.allowCookies,
                enableXRay: awsRum.enableXRay,
                endpoint: awsRum.endpoint,
                identityPoolId: awsRum.identityPoolId,
                sessionSampleRate: awsRum.sessionSampleRate,
                telemetries: awsRum.telemetries,
            };

            new AwsRum(awsRum.appId, awsRum.appVersion, awsRum.appRegion, config);
        } catch {
            // Ignore errors thrown during CloudWatch RUM web client initialization
        }
    }, [awsRum]);

    return null;
}
