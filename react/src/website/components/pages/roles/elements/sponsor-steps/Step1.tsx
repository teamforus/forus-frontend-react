import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step1({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-sponsor/sponsor-1.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 1</div>
                    <div className="block-with-image-title">Oriëntatie en onderzoek</div>
                    <div className="block-with-image-description">
                        De sponsor oriënteert zich en laat een onderzoek uitvoeren naar best practices op het gebied van
                        sociale regelingen. Op deze manier neemt de sponsor weloverwogen beslissingen over de toewijzing
                        van fondsen en het ontwerp ervan.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Onderzoek & advies (dienst):</div>
                            Het onderzoek en advies van Forus leiden tot innovatieve doorontwikkeling en nieuwe
                            functionaliteiten die op de markt gebracht kunnen worden bijvoorbeeld integraties in het
                            systeem.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
