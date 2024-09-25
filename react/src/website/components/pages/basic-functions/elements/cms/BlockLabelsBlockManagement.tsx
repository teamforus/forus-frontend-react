import React from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';

export default function BlockLabelsBlockManagement() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-labels-list">
            <div className="block-labels-list-items">
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-8.svg`)} alt={``} />
                    Knop met een link naar een externe pagina (URL)
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-9.svg`)} alt={``} />
                    Label
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-10.svg`)} alt={``} />
                    Titel
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-11.svg`)} alt={``} />
                    Omschrijving
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-12.svg`)} alt={``} />
                    Koppelingen
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-13.svg`)} alt={``} />
                    Afbeelding
                </div>
            </div>
        </div>
    );
}
