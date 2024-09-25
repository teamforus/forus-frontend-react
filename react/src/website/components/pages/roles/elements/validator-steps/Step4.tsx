import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step4({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-validator/validator-4.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 4</div>
                    <div className="block-with-image-title">Gegevens van de aanvrager controleren</div>
                    <div className="block-with-image-description">
                        Beoordelaars controleren eenvoudig de basisgegevens van aanvragers.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Haal Centraal-API:</div>
                            Met behulp van de Haal Centraal API kunnen beoordelaars op een eenvoudige manier
                            BRP-gegevens binnen hun beheeromgeving ophalen. Deze gegevens zijn van essentieel belang bij
                            het beoordelen van aanvragen (naam, adres, postcode, geboortedatum, partnerstatus en aantal
                            kinderen).
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
