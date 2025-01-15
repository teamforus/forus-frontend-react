import React from 'react';
import useEnvData from '../../../hooks/useEnvData';
import useAssetUrl from '../../../hooks/useAssetUrl';
import useTranslate from '../../../../dashboard/hooks/useTranslate';

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
    const translate = useTranslate();

    return (
        <div className={`block block-app_links ${className} ${type ? `block-app_links-${type}` : ''}`}>
            {showAndroidButton && (
                <a
                    href={envData?.config?.android_link}
                    target="_blank"
                    id={androidId}
                    tabIndex={0}
                    className="download-link"
                    rel="noreferrer">
                    <img
                        src={assetUrl(`/assets/img/icon-app/app-store-android-${theme}.svg`)}
                        alt={translate('global.app_links.google_play')}
                    />
                </a>
            )}

            {showIosButton && (
                <a
                    href={envData?.config?.ios_iphone_link}
                    target="_blank"
                    id={iosId}
                    tabIndex={0}
                    className="download-link"
                    rel="noreferrer">
                    <img
                        src={assetUrl(`/assets/img/icon-app/app-store-ios-${theme}.svg`)}
                        alt={translate('global.app_links.app_store')}
                    />
                </a>
            )}
        </div>
    );
}
