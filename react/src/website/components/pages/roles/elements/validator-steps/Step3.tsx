import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step3({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-validator/validator-3.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 3</div>
                    <div className="block-with-image-title">Aanvragen ontvangen</div>
                    <div className="block-with-image-description">
                        Het overzicht van alle aanvragen geeft de beoordelaar inzicht in de ontvangen aanvragen en hun
                        status. Tevens is het mogelijk om nieuwe aanvragen toe te wijzen aan andere personen.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Inzicht in aanvragen:</div>
                            De beoordelaar heeft in het overzicht van alle aanvragen een duidelijk zicht op welke
                            aanvragen hij heeft ontvangen en wat de status ervan is.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Toewijzing van beoordelingen:</div>
                            De beoordelaar kan nieuwe aanvragen toewijzen aan andere personen.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
