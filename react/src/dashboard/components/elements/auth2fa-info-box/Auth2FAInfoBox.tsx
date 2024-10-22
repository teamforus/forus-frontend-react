import React from 'react';
import useEnvData from '../../../hooks/useEnvData';

export default function Auth2FAInfoBox({ className = '' }: { className?: string }) {
    const envData = useEnvData();

    return (
        <div className={`block block-info-box ${className}`}>
            <div className="info-box-icon mdi mdi-information-outline" />
            {envData.client_type == 'sponsor' && (
                <div className="info-box-content">
                    Kijk voor meer informatie over 2FA op ons:&nbsp;
                    <a
                        className="info-box-link"
                        href="https://forusoperations.zendesk.com/hc/nl-nl/sections/29408618867473-Tweefactorauthenticatie"
                        rel="noreferrer"
                        target="_blank">
                        Helpcenter artikel
                        <div className="mdi mdi-chevron-right" />
                    </a>
                </div>
            )}

            {envData.client_type == 'provider' && (
                <div className="info-box-content">
                    Kijk voor meer informatie over 2FA op ons:&nbsp;
                    <a
                        className="info-box-link"
                        href="https://forusoperations.zendesk.com/hc/nl-nl/sections/29408389433745-Tweefactorauthenticatie"
                        rel="noreferrer"
                        target="_blank">
                        Helpcenter artikel
                        <div className="mdi mdi-chevron-right" />
                    </a>
                </div>
            )}

            {envData.client_type == 'validator' && (
                <div className="info-box-content">
                    Kijk voor meer informatie over 2FA op ons:&nbsp;
                    <a
                        className="info-box-link"
                        href="https://forusoperations.zendesk.com/hc/nl-nl/sections/29408618867473-Tweefactorauthenticatie"
                        rel="noreferrer"
                        target="_blank">
                        Helpcenter artikel
                        <div className="mdi mdi-chevron-right" />
                    </a>
                </div>
            )}
        </div>
    );
}
