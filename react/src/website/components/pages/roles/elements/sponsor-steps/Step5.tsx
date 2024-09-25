import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step5({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-sponsor/sponsor-5.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 5</div>
                    <div className="block-with-image-title">Selectie van aanbieders</div>
                    <div className="block-with-image-description">
                        De sponsor kan ook aanbieders selecteren. Deze aanbieders kunnen producten of diensten leveren
                        die met het budget van het fonds worden betaald. Dit zorgt ervoor dat er relevante keuzes
                        beschikbaar zijn voor aanvragers. Zo kunnen de fondsen op passende wijze worden gebruikt.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Selectie van aanbieders:</div>
                            De sponsor beoordeelt de geschiktheid van specifieke aanbieders, zowel op het niveau van een
                            fonds als op het niveau van een product.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">
                                Sponsor goedkeuring vereist voor zichtbaarheid:
                            </div>
                            Het aanbod en de aanbieder worden alleen zichtbaar op de website wanneer de sponsor ze heeft
                            goedgekeurd.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
