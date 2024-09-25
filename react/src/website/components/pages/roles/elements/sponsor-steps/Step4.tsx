import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step4({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-sponsor/sponsor-4.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 4</div>
                    <div className="block-with-image-title">De aanvraagprocedure instellen</div>
                    <div className="block-with-image-description">
                        Sponsors zetten het aanvraagproces op via het Forus-platform, zodat aanvragers gemakkelijk hun
                        gegevens kunnen indienen.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Verificatiemethode bepalen:</div>
                            Sponsors hebben de keuze uit verschillende verificatiemethoden: DigiD, e-mail of een brief
                            met een activatiecode.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">
                                Directe activering voor de bekende doelgroep:
                            </div>
                            In gevallen waarin de doelgroep bekend is, kan hun applicatie direct worden geactiveerd.
                            Onbekende personen kunnen de aanvraagprocedure doorlopen door middel van een geïntegreerd
                            e-formulier.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
