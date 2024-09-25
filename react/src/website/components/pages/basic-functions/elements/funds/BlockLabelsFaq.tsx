import React from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';

export default function BlockLabelsFaq() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-labels-list">
            <div className="block-labels-list-items">
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/funds/labels/icon-8.svg`)} alt={``} />
                    Titel
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/funds/labels/icon-9.svg`)} alt={``} />
                    Veelgestelde Vragen
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/funds/labels/icon-10.svg`)} alt={``} />
                    Omschrijving
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/funds/labels/icon-11.svg`)} alt={``} />
                    Verwijder FAQ&apos;s
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/funds/labels/icon-12.svg`)} alt={``} />
                    Inhoud bewerken
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/funds/labels/icon-13.svg`)} alt={``} />
                    Q&A
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/funds/labels/icon-14.svg`)} alt={``} />
                    Vertrouwen opbouwen met deelnemers
                </div>
            </div>
        </div>
    );
}
