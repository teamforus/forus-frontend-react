import React from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';

export default function BlockLabelsGeneral() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-labels-list">
            <div className="block-labels-list-title">
                De werkbalk boven het tekstvak biedt verschillende opmaakopties, waaronder:
            </div>

            <div className="block-labels-list-items">
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-1.svg`)} alt={``} />
                    Stijl (Headers)
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-2.svg`)} alt={``} />
                    Uitlijning
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-3.svg`)} alt={``} />
                    Lijst (Unordered list)
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-4.svg`)} alt={``} />
                    Tabel
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-5.svg`)} alt={``} />
                    Geselecteerde tekst cursief maken (Italic)
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-6.svg`)} alt={``} />
                    Genummerde lijst (Ordered list)
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-7.svg`)} alt={``} />
                    Geselecteerde tekst in vet weergeven (Bold)
                </div>
            </div>
        </div>
    );
}
