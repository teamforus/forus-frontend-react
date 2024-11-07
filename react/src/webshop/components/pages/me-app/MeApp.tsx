import React from 'react';
import useEnvData from '../../../hooks/useEnvData';
import AppLinks from '../../elements/app-links/AppLinks';
import useAssetUrl from '../../../hooks/useAssetUrl';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';

export default function MeApp() {
    const envData = useEnvData();
    const assetUrl = useAssetUrl();

    return (
        <BlockShowcase wrapper={true} breadcrumbItems={[{ name: 'Home', state: 'home' }, { name: 'Over de Me-app' }]}>
            <div className="block block-about-me_app">
                <div className="me_app-overview">
                    <div className="block block-markdown">
                        <h2>Over de Me-app</h2>
                        <div className="block-description">
                            <p>
                                De Me-app is een digitale portemonnee en kassa in één. Gemeenten gebruiken de Me-app
                                voor het uitgeven van tegoeden. Met de app kunnen inwoners gemakkelijk hun tegoeden
                                beheren. Aanbieders gebruiken de app om QR-codes te scannen.
                            </p>
                        </div>
                        <br />
                        <h2>Download Me op je telefoon of tablet</h2>
                        <div className="block-description">
                            <p>
                                Download de Me-app via onderstaande app stores.{' '}
                                <a href={envData.config.me_app_link}>Klik hier om direct de juiste app store</a> te
                                openen op je telefoon of tablet.
                            </p>
                        </div>
                        <AppLinks className={'hide-sm'} type={'lg'} />
                    </div>
                </div>
                <div className="me_app-download flex-center">
                    <AppLinks />
                </div>
                <div className="me_app-images">
                    <div className="me_app-image">
                        <img src={assetUrl('/assets/img/me/app-1.jpg')} alt="Me-app" />
                    </div>
                    <div className="me_app-image">
                        <img src={assetUrl('/assets/img/me/app-2.jpg')} alt="Me-app" />
                    </div>
                    <div className="me_app-image">
                        <img src={assetUrl('/assets/img/me/app-3.jpg')} alt="Me-app" />
                    </div>
                </div>
            </div>
        </BlockShowcase>
    );
}
