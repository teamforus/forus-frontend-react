import React from 'react';
import useEnvData from '../../../hooks/useEnvData';
import useAssetUrl from '../../../hooks/useAssetUrl';

export default function AppLinks({
    type = null,
    theme = 'dark',
    iosId = 'ios_button',
    className = '',
    androidId = 'android_button',
    showIosButton = true,
    showAndroidButton = true,
}: {
    type?: 'lg';
    theme?: string;
    iosId?: string;
    className?: string;
    androidId?: string;
    showIosButton?: boolean;
    showAndroidButton?: boolean;
}) {
    const envData = useEnvData();
    const assetUrl = useAssetUrl();

    return (
        <div className={`block block-app_links ${className} ${type ? `block-app_links-${type}` : ''}`}>
            {showAndroidButton && (
                <a
                    href={envData?.config?.android_link}
                    target="_blank"
                    id={androidId}
                    className="download-link"
                    rel="noreferrer">
                    <img
                        src={assetUrl(`/assets/img/icon-app/app-store-android-${theme}.svg`)}
                        alt="Ontdek het op Google Play"
                    />
                </a>
            )}

            {showIosButton && (
                <a
                    href={envData?.config?.ios_iphone_link}
                    target="_blank"
                    id={iosId}
                    className="download-link"
                    rel="noreferrer">
                    <img
                        src={assetUrl(`/assets/img/icon-app/app-store-ios-${theme}.svg`)}
                        alt="Download in de App Store"
                    />
                </a>
            )}
        </div>
    );
}