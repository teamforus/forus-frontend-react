import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step2({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-validator/validator-2.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 2</div>
                    <div className="block-with-image-title">Fonds toewijzing</div>
                    <div className="block-with-image-description">
                        Op het Forus-platform is het zichtbaar welke fondsen aan een bepaalde beoordelaar zijn
                        toegewezen.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <span className="block-with-image-list-item-title">Overzicht van alle fondsen:</span>
                            <span className="block-with-image-list-item-description">
                                Beoordelaars zien in het fondsenoverzicht welke fondsen aan hen zijn toegewezen door de
                                sponsor.
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
