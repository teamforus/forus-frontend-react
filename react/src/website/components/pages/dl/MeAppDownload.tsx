import React, { Fragment, useState, useEffect } from 'react';
import useEnvData from '../../../hooks/useEnvData';
import BackgroundCircles from '../../elements/BackgroundCircles';
import useAssetUrl from '../../../hooks/useAssetUrl';
import BlockDashedSeparator from '../home/elements/BlockDashedSeparator';

export default function MeAppDownload() {
    const envData = useEnvData();
    const assetUrl = useAssetUrl();

    const [isiOS, setIsiOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);

    useEffect(() => {
        setIsiOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
        setIsAndroid(navigator.userAgent.toLowerCase().indexOf('android') > -1);

        if (isiOS) {
            document.location.href = envData?.config?.ios_iphone_link;
        } else if (isAndroid) {
            document.location.href = envData?.config?.android_link;
        }
    }, [envData?.config?.android_link, envData?.config?.ios_iphone_link, isAndroid, isiOS]);

    return (
        <Fragment>
            <BackgroundCircles mainStyles={{ height: '520px' }} />

            <div className="wrapper">
                <div className="block block-me-app-download block-me-app-download-image-sm">
                    <div className="block-me-app-download-info">
                        <div className="block-me-app-download-title">
                            U wordt doorverwezen naar de app store voor uw apparaat.
                        </div>
                        <div className="block-me-app-download-description">Gebeurt dit niet?</div>
                        <div className="block-me-app-download-actions">
                            <a
                                className="block-me-app-download-action"
                                href={envData?.config?.android_link}
                                target={'_blank'}
                                rel="noreferrer">
                                <img src={assetUrl('/assets/img/dl/android.svg')} alt={''} />
                            </a>
                            <a
                                className="block-me-app-download-action"
                                href={envData?.config?.ios_iphone_link}
                                target={'_blank'}
                                rel="noreferrer">
                                <img src={assetUrl('/assets/img/dl/ios.svg')} alt={''} />
                            </a>
                        </div>
                    </div>
                    <div className="block-me-app-download-image">
                        <img src={assetUrl(`/assets/img/me-app-download.svg`)} alt="" />
                    </div>
                </div>

                <BlockDashedSeparator image={true} />
            </div>
        </Fragment>
    );
}
