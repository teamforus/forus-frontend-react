import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step8({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-validator/validator-8.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 8</div>
                    <div className="block-with-image-title">Toegang tot support</div>
                    <div className="block-with-image-description">
                        Beoordelaars hebben toegang tot support en het helpcenter van Forus.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Forus Support:</div>
                            Forus verleent assistentie binnen het systeem. Beoordelaars kunnen de chatfunctie activeren
                            door op het chatpictogram te klikken. Bovendien hebben ze een helpcentrum tot hun
                            beschikking voor extra informatie en ondersteuning.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
