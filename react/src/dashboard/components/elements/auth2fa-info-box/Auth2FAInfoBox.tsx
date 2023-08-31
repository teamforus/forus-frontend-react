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
                        href="https://helpcentrum.forus.io/kb/guide/nl/tweefactorauthenticatie-Nu6ntYlHzX/Steps/2584019"
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
                        href="https://helpcentrum.forus.io/kb/guide/nl/tweefactorauthenticatie-g2hokCxKEG/Steps/2584018"
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
                        href="https://helpcentrum.forus.io/kb/guide/nl/tweefactorauthenticatie-Nu6ntYlHzX/Steps/2584019"
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
