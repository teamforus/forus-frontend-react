import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step6({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-requester/requester-6.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 6</div>
                    <div className="block-with-image-title">Persoonlijk account beheren</div>
                    <div className="block-with-image-description">
                        De deelnemer bekijkt een overzicht van zaken zoals aangevraagde regelingen, verstrekte
                        informatie, afwijzingen, toekenningen, communicatie en hun transactiegeschiedenis. Hierdoor
                        beheren en volgen deelnemers eenvoudig hun interacties met het platform.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Persoonsgegevens zien:</div>
                            Op het platform zien deelnemers de persoonlijke informatie terug die ze hebben ingevuld voor
                            een aanvraag.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Transactieoverzicht:</div>
                            Deelnemers kunnen hun transactiegeschiedenis bekijken.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
