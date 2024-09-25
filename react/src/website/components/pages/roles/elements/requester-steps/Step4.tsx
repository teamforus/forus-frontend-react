import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step4({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-requester/requester-4.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 4</div>
                    <div className="block-with-image-title">Regelingen aanvragen en meldingen ontvangen</div>
                    <div className="block-with-image-description">
                        Aanvragers vragen eenvoudig en efficiënt regelingen aan en ontvangen waardevolle feedback met
                        betrekking tot hun aanvraag.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Regelingen aanvragen:</div>
                            De aanvrager kan de regeling eenvoudig aanvragen in een paar stappen. Duidelijke instructies
                            begeleiden de aanvrager stap voor stap door het proces.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Status van de aanvraag zien:</div>
                            Aanvragers kunnen de status van hun aanvraag bekijken, of deze is toegekend, afgewezen, of
                            wanneer er aanvullende informatie nodig is.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Aanvullende informatie indienen:</div>
                            Aanvragers krijgen een verzoek om extra gegevens van de beoordelaar wanneer deze nodig zijn
                            voor de beoordeling van de aanvraag. Op deze manier weten aanvragers precies welke
                            informatie zij moeten verstrekken.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Beschikking ontvangen:</div>
                            De aanvragers krijgen een officieel besluit over hun aanvraag bijvoorbeeld een besluit over
                            toekenning of afwijzing van een regeling.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
