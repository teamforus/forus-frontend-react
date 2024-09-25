import React, { CSSProperties, useEffect, useRef, useState } from 'react';

import useAssetUrl from '../../hooks/useAssetUrl';

export default function CollaborationsCarousel() {
    const assetUrl = useAssetUrl();
    const rowRef = useRef<HTMLDivElement>(null);
    const [countElements, setCountElements] = useState(rowRef.current?.children?.length);

    useEffect(() => {
        setCountElements(rowRef.current?.children?.length);
        rowRef.current.parentNode.append(rowRef.current.cloneNode(true));
    }, []);

    return (
        <div className="block block-carousel" style={{ '--carousel-size': countElements } as CSSProperties}>
            <div className="block-carousel-row" ref={rowRef}>
                <div className="block-carousel-logo">
                    <img
                        src={assetUrl(`/assets/img/collaboration-logos/datawise.png`)}
                        alt="Logo van Minor Data Wise"
                    />
                </div>
                <div className="block-carousel-logo">
                    <img
                        src={assetUrl(`/assets/img/collaboration-logos/groningen.png`)}
                        alt="Logo van Provincie Groningen"
                    />
                </div>
                <div className="block-carousel-logo">
                    <img src={assetUrl(`/assets/img/collaboration-logos/janita-top.png`)} alt="Logo van Janita Top" />
                </div>
                <div className="block-carousel-logo">
                    <img src={assetUrl(`/assets/img/collaboration-logos/pinkroccade.png`)} alt="Logo van Pinkroccade" />
                </div>

                <div className="block-carousel-logo">
                    <img src={assetUrl(`/assets/img/collaboration-logos/rminds.png`)} alt="Logo van Rocket Minds" />
                </div>
                <div className="block-carousel-logo">
                    <img
                        src={assetUrl(`/assets/img/collaboration-logos/university-groningen.png`)}
                        alt="Logo van Universiteit van Groningen"
                    />
                </div>
                <div className="block-carousel-logo">
                    <img
                        src={assetUrl(`/assets/img/collaboration-logos/university-hanze.png`)}
                        alt="Logo van Hanze University of Applied Sciences"
                    />
                </div>
                <div className="block-carousel-logo">
                    <img src={assetUrl(`/assets/img/collaboration-logos/warpnet.png`)} alt="Logo van Warpnet" />
                </div>
                <div className="block-carousel-logo">
                    <img src={assetUrl(`/assets/img/collaboration-logos/bkbo.png`)} alt="Logo van BKBO" />
                </div>
                <div className="block-carousel-logo">
                    <img
                        src={assetUrl(`/assets/img/collaboration-logos/ministerie.png`)}
                        alt="Logo van Ministerie van Binnenlandse Zaken en Koningrijksrelaties"
                    />
                </div>
            </div>
        </div>
    );
}
