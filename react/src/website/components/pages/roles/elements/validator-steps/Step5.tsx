import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step5({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-validator/validator-5.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 5</div>
                    <div className="block-with-image-title">Directe communicatie met aanvragers</div>
                    <div className="block-with-image-description">
                        Beoordelaars sturen een aanvullingsverzoek naar de aanvrager om aanvullende informatie of bewijs
                        te verkrijgen die nodig is voor het beoordelen van de aanvraag.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Aanvullingsverzoek:</div>
                            Beoordelaars kunnen via het Forus-platform extra informatie of bewijsmateriaal opvragen van
                            de aanvrager. Dit is nodig om de aanvraag compleet te beoordelen.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
