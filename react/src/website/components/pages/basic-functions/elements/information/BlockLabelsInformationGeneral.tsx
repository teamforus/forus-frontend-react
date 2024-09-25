import React from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';

export default function BlockLabelsInformationGeneral() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-labels-list">
            <div className="block-labels-list-items">
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/information/labels/icon-1.svg`)} alt={``} />
                    Fondsen
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/information/labels/icon-2.svg`)} alt={``} />
                    Aanbieders
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/information/labels/icon-3.svg`)} alt={``} />
                    Postcodes
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/information/labels/icon-4.svg`)} alt={``} />
                    Categorieën
                </div>
            </div>
        </div>
    );
}
