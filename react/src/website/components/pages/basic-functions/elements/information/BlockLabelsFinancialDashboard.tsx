import React from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';

export default function BlockLabelsFinancialDashboard() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-labels-list">
            <div className="block-labels-list-items">
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/information/labels/icon-5.svg`)} alt={``} />
                    Verslag exporteren
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/information/labels/icon-6.svg`)} alt={``} />
                    Real-time informatie
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/information/labels/icon-7.svg`)} alt={``} />
                    Gedetailleerde tabellen
                </div>
                <div className="block-labels-list-item">
                    <img src={assetUrl(`/assets/img/icons-basic-functions/information/labels/icon-8.svg`)} alt={``} />
                    Financiële statistieken
                </div>
            </div>
        </div>
    );
}
