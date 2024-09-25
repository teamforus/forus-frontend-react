import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step8({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-sponsor/sponsor-8.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 8</div>
                    <div className="block-with-image-title">Transacties verwerken</div>
                    <div className="block-with-image-description">
                        Sponsors verwerken transacties in de beheeromgeving. Dankzij de bankintegratie worden
                        automatische betalingen naar de sponsor gestuurd. Daarnaast krijgen ze een overzicht van alle
                        transacties en beheren ze het budget.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Bank integratie:</div>
                            Door het bankrekeningnummer te koppelen, worden de transacties automatisch naar de bank van
                            de aanbieder gestuurd. Op dit moment zijn er twee banken waarmee sponsors kunnen koppelen:
                            BNG en Bunq.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">
                                (Bulk) transacties inzien als sponsor:
                            </div>
                            Elke ochtend om 09:00 uur wordt er een bulkbestand aangemaakt met alle transacties die in
                            afwachting staan.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Budgetbeheer:</div>
                            De sponsor kan het budget voor het fonds gemakkelijk beheren en de uitgaven bijhouden.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
