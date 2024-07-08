import React from 'react';

import useAssetUrl from '../../hooks/useAssetUrl';

export default function Carousel() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block-collaborations-logo-block">
            <div className="block-collaborations-logo-row">
                <div className="block-collaborations-logo">
                    <img src={assetUrl(`/assets/img/collaboration-logos/data-wise.png`)} alt="" />
                </div>
                <div className="block-collaborations-logo">
                    <img src={assetUrl(`/assets/img/collaboration-logos/groningen.png`)} alt="" />
                </div>
                <div className="block-collaborations-logo">
                    <img src={assetUrl(`/assets/img/collaboration-logos/janita-top.png`)} alt="" />
                </div>
                <div className="block-collaborations-logo">
                    <img src={assetUrl(`/assets/img/collaboration-logos/pinkroccade.png`)} alt="" />
                </div>

                <div className="block-collaborations-logo">
                    <img src={assetUrl(`/assets/img/collaboration-logos/rminds.png`)} alt="" />
                </div>
                <div className="block-collaborations-logo">
                    <img src={assetUrl(`/assets/img/collaboration-logos/university-groningen.png`)} alt="" />
                </div>
                <div className="block-collaborations-logo">
                    <img src={assetUrl(`/assets/img/collaboration-logos/university-hanze.png`)} alt="" />
                </div>
                <div className="block-collaborations-logo">
                    <img src={assetUrl(`/assets/img/collaboration-logos/warpnet.png`)} alt="" />
                </div>
            </div>
        </div>
    );
}
