import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step7({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-sponsor/sponsor-7.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 7</div>
                    <div className="block-with-image-title">De website en fondsen lanceren</div>
                    <div className="block-with-image-description">
                        De sponsor ontvangt ondersteuning van Forus bij het organiseren van een evenement ter
                        gelegenheid van de lancering, waarin de officiële start van de website en financiering wordt
                        aangekondigd.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Lancering (dienst) -</div>
                            Forus ondersteunt de sponsor bij het organiseren van een lanceringsevenement waarin de
                            officiële lancering van de website en fondsen wordt aangekondigd.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
