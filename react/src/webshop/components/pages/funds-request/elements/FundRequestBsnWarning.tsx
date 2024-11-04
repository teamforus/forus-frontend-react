import React, { useEffect, useState } from 'react';
import { addSeconds, format } from 'date-fns';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import Fund from '../../../../props/models/Fund';
import useAuthIdentity from '../../../../hooks/useAuthIdentity';

export default function FundRequestBsnWarning({
    fund,
    setDigidExpired,
}: {
    fund: Fund;
    setDigidExpired: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();

    const [bsnWarningShow, setBsnWarningShow] = useState<boolean>(null);
    const [bsnWarningValue, setBsnWarningValue] = useState<string>(null);

    useEffect(() => {
        if (!fund) {
            return;
        }

        const timeOffset = Math.min(appConfigs.bsn_confirmation_offset || 300, fund.bsn_confirmation_time / 2);
        const timeBeforeReConfirmation = Math.max((fund.bsn_confirmation_time || 0) - authIdentity.bsn_time, 0);
        const timeBeforeWarning = Math.max(timeBeforeReConfirmation - timeOffset, 0);

        if (fund.bsn_confirmation_time === null) {
            return;
        }

        const timeoutWarning = window.setTimeout(() => {
            setBsnWarningShow(true);
            setBsnWarningValue(format(addSeconds(new Date(), timeOffset), 'HH:mm'));
        }, timeBeforeWarning * 1000);

        const timeoutExpired = window.setTimeout(() => {
            setDigidExpired(true);
        }, timeBeforeReConfirmation * 1000);

        return () => {
            window.clearTimeout(timeoutWarning);
            window.clearTimeout(timeoutExpired);
        };
    }, [appConfigs?.bsn_confirmation_offset, authIdentity.bsn_time, fund, setDigidExpired]);

    return bsnWarningShow ? (
        <div className="sign_up-pane-warning">
            <div className="warning-icon">
                <div className="mdi mdi-alert-circle-outline" />
            </div>
            <div className="warning-details">
                Let op! U dient het aanvraagformulier afgerond te hebben voor <strong>{bsnWarningValue}</strong>, anders
                dient opnieuw in te loggen met DigiD en opnieuw te beginnen met de aanvraag.
            </div>
        </div>
    ) : null;
}
