import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step4({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-provider/provider-4.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 4</div>
                    <div className="block-with-image-title">Producten en diensten presenteren op de website</div>
                    <div className="block-with-image-description">
                        Aanbieders presenteren hun producten of diensten via het platform. Ze verstrekken gedetailleerde
                        informatie, prijzen en specifieke voorwaarden, zodat deelnemers goed geïnformeerde keuzes kunnen
                        maken bij het gebruik van hun toegewezen budgetten.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Plaatsen van aanbod:</div>
                            Aanbieders kunnen gebruikmaken van de mogelijkheid om hun aanbod op een zichtbare manier te
                            presenteren. Op het platform hebben zij de gelegenheid om hun producten of diensten te
                            presenteren met een aantrekkelijke titel, heldere omschrijving en aansprekende afbeelding.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Beoordeling van het aanbod:</div>
                            Het aanbod dient te worden goedgekeurd door de sponsor, wat plaatsvindt via het
                            Forus-systeem. Na goedkeuring wordt het aanbod zichtbaar op de website.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
