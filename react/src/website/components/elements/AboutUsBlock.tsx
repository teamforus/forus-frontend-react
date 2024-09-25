import React from 'react';

import useAssetUrl from '../../hooks/useAssetUrl';
import StateNavLink from '../../modules/state_router/StateNavLink';

export default function AboutUsBlock() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-about-us">
            <div className="block-about-us-title">Misschien bent u ook geïnteresseerd in:</div>
            <div className="block-about-us-images">
                <div className="block-about-us-image">
                    <div className="block-about-us-image-overlay-hover" />
                    <div className="block-about-us-image-overlay" />
                    <img className="hide-sm" src={assetUrl('/assets/img/about-us-1.jpg')} alt="" />
                    <img className="show-sm" src={assetUrl('/assets/img/about-us-1-mobile.jpg')} alt="" />
                    <div className="block-about-us-image-info">
                        <div className="block-about-us-image-title">Ons platform</div>
                        <div className="block-about-us-image-subtitle">
                            Een reis naar een samenleving waar iedereen een kans krijgt om mee te doen
                        </div>
                        <StateNavLink name="about-us" className="block-about-us-link">
                            <span>Leer meer</span>
                            <em className="mdi mdi-arrow-right icon-right" />
                        </StateNavLink>
                    </div>
                </div>
                <div className="block-about-us-image">
                    <div className="block-about-us-image-overlay-hover" />
                    <div className="block-about-us-image-overlay" />
                    <img className="hide-sm" src={assetUrl('/assets/img/about-us-2.jpg')} alt="" />
                    <img className="show-sm" src={assetUrl('/assets/img/about-us-2-mobile.jpg')} alt="" />
                    <div className="block-about-us-image-info">
                        <div className="block-about-us-image-title">Naar een merkbaar en meetbaar verschil!</div>
                        <div className="block-about-us-image-subtitle">
                            Project gefinancierd door het Innovatiebudget 2023 in samenwerking met Gemeente Eemsdelta en
                            Gemeente Westerkwartier.
                        </div>
                        <StateNavLink name="about-us-innovation" className="block-about-us-link">
                            <span>Leer meer</span>
                            <em className="mdi mdi-arrow-right icon-right" />
                        </StateNavLink>
                    </div>
                </div>
            </div>
        </div>
    );
}
