import React from 'react';

import useAssetUrl from '../../../../hooks/useAssetUrl';

export default function PlatformAspects() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-platform-aspects">
            <div className="block-platform-aspects-title">Unieke aspecten van ons platform</div>
            <div className="block-platform-aspects-main">
                <div className="block-platform-aspects-list">
                    <div className="block-platform-aspects-list-item">
                        <div className="block-platform-aspects-list-item-image">
                            <img src={assetUrl(`/assets/img/payouts.svg`)} alt="" />
                        </div>
                        Efficiënte uitbetalingen
                    </div>
                    <div className="block-platform-aspects-list-item">
                        <div className="block-platform-aspects-list-item-image">
                            <img src={assetUrl(`/assets/img/request-processing.svg`)} alt="" />
                        </div>
                        Snelle afhandeling van aanvragen
                    </div>
                    <div className="block-platform-aspects-list-item">
                        <div className="block-platform-aspects-list-item-image">
                            <img src={assetUrl(`/assets/img/thumbs-up.svg`)} alt="" />
                        </div>
                        Toegankelijk voor iedereen
                    </div>
                    <div className="block-platform-aspects-list-item">
                        <div className="block-platform-aspects-list-item-image">
                            <img src={assetUrl(`/assets/img/efficiency.svg`)} alt="" />
                        </div>
                        Doelmatige besteding
                    </div>
                    <div className="block-platform-aspects-list-item">
                        <div className="block-platform-aspects-list-item-image">
                            <img src={assetUrl(`/assets/img/support.svg`)} alt="" />
                        </div>
                        Hulp en ondersteuning
                    </div>
                    <div className="block-platform-aspects-list-item">
                        <div className="block-platform-aspects-list-item-image">
                            <img src={assetUrl(`/assets/img/webshop.svg`)} alt="" />
                        </div>
                        Herkenbaar en vertrouwd
                    </div>
                    <div className="block-platform-aspects-list-item">
                        <div className="block-platform-aspects-list-item-image">
                            <img src={assetUrl(`/assets/img/real-time.svg`)} alt="" />
                        </div>
                        Real-time managementinformatie
                    </div>
                    <div className="block-platform-aspects-list-item">
                        <div className="block-platform-aspects-list-item-image">
                            <img src={assetUrl(`/assets/img/user-association.svg`)} alt="" />
                        </div>
                        Samenwerking en best-pratices
                    </div>
                </div>

                <div className="block-platform-aspects-image">
                    <img src={assetUrl(`/assets/img/phone.png`)} alt="" />
                </div>
            </div>

            <div className="actions">
                <div className="button button-primary">
                    Bekijk basisfuncties van ons systeem
                    <em className={'mdi mdi-arrow-right icon-end'} />
                </div>
            </div>
        </div>
    );
}
