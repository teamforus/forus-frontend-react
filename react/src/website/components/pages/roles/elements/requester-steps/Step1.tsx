import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step1({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-requester/requester-1.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 1</div>
                    <div className="block-with-image-title">Het systeem vinden en aanmelden</div>
                    <div className="block-with-image-description">
                        Mensen krijgen toegang tot een website waar zij kunnen controleren of er hulp en regelingen
                        beschikbaar zijn. Zo weten ze welke opties hen kunnen ondersteunen.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Inloggen als aanvrager:</div>
                            Aanvragers loggen eenvoudig in met de opties die door de gemeente zijn afgestemd: met DigiD,
                            e-mailadres of de Me-app.
                        </div>

                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Notificaties:</div>
                            Aanvragers kunnen eenvoudig op de hoogte blijven middels e-mail- en pushnotificaties en
                            hebben de vrijheid om hun voorkeuren naar wens aan te passen.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
