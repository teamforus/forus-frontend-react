import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step2({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-requester/requester-2.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 2</div>
                    <div className="block-with-image-title">Regelingen begrijpen</div>
                    <div className="block-with-image-description">
                        Aanvragers hebben de mogelijkheid om een overzicht te bekijken van diverse regelingen en
                        aanbieders, waarbij ze inzicht krijgen in de verschillende vormen van hulp die zij kunnen
                        ontvangen.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">
                                Overzichtspagina van regelingen en voorwaarden:
                            </div>
                            Overzichtspagina van regelingen en voorwaarden: Op deze pagina zien aanvragers welke
                            regelingen beschikbaar zijn en welke voorwaarden van toepassing zijn om hiervoor in
                            aanmerking te komen.
                        </div>

                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Zoekfunctionaliteit:</div>
                            Aanvragers kunnen gebruikmaken van de zoekfunctionaliteit om zelf informatie op te zoeken.
                        </div>

                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Aanbieders en aanbod:</div>
                            Aanvragers krijgen op de website een overzicht van alle aanbieders en de producten die zij
                            aanbieden. Ze kunnen hun favorieten opslaan in een verlanglijstje voor later gebruik.
                        </div>

                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Uitlegpagina:</div>
                            Op de uitlegpagina vinden aanvragers aanvullende informatie over werkwijze van de website en
                            de regeling(en).
                        </div>

                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Veelgestelde vragen:</div>
                            Voor elke regeling is er een FAQ beschikbaar waar aanvragers aanvullende informatie kunnen
                            vinden.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
