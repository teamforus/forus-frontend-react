import React from 'react';

import useAssetUrl from '../../hooks/useAssetUrl';

export default function HelpCenter() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-help-center">
            <div className="block-help-center-img">
                <img src={assetUrl(`/assets/img/icon-help-center.svg`)} alt="" />
                <div className="block-help-center-title show-sm">Nog meer vragen?</div>
            </div>
            <div className="block-help-center-info">
                <div className="block-help-center-title hide-sm">Nog meer vragen?</div>
                <div className="block-help-center-description">
                    Bezoek ons Helpcentrum voor uitgebreide inzichten en antwoorden op technische vragen over ons
                    platform.
                </div>

                <div>
                    <div className="button button-text button-text-padless button-read-more">
                        Lees meer
                        <em className="mdi mdi-arrow-right icon-end" />
                    </div>
                </div>
            </div>
        </div>
    );
}
