import React from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';

export default function BlockLabelsFAQ() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-labels-list">
            <div className="block-labels-list-items">
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-14.svg`)} alt={``} />
                    CMS
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-15.svg`)} alt={``} />
                    Veelgestelde vragen
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-16.svg`)} alt={``} />
                    FAQ&apos;s bewerken
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-17.svg`)} alt={``} />
                    Verwijder FAQ&apos;s
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-18.svg`)} alt={``} />
                    Vraag en antwoord
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms/labels/icon-19.svg`)} alt={``} />
                    Vertrouwen
                </div>
            </div>
        </div>
    );
}
