import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step7({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-validator/validator-7.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 7</div>
                    <div className="block-with-image-title">Beslissing communiceren naar aanvragers</div>
                    <div className="block-with-image-description">
                        Beoordelaars informeren aanvragers over de status van de beoordeling.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Communicatie met aanvragers:</div>
                            Wanneer de beoordelaar een beslissing heeft genomen over de aanvraag, wordt deze beslissing
                            gecommuniceerd aan de aanvrager.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
