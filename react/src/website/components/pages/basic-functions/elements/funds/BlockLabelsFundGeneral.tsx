import React from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';

export default function BlockLabelsFundGeneral() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-labels-list">
            <div className="block-labels-list-items">
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/funds/labels/icon-1.svg`)} alt={``} />
                    Sponsor omgeving van het Forus-platform
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/funds/labels/icon-2.svg`)} alt={``} />
                    Eenvoudig beheer van budgetten
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/funds/labels/icon-3.svg`)} alt={``} />
                    Monitoren en beoordelen van de impact
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/funds/labels/icon-4.svg`)} alt={``} />
                    Voorwaarden vaststellen
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/funds/labels/icon-5.svg`)} alt={``} />
                    Focus op uw doelgroep
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/funds/labels/icon-6.svg`)} alt={``} />
                    Gebruikersvriendelijk
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/funds/labels/icon-7.svg`)} alt={``} />
                    Aanvraagprocedure toevoegen
                </div>
            </div>
        </div>
    );
}
