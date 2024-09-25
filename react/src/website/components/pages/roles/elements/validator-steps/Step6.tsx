import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step6({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-validator/validator-6.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 6</div>
                    <div className="block-with-image-title">Aanvragen beoordelen</div>
                    <div className="block-with-image-description">
                        Beoordelaars beoordelen aanvragen in slechts een paar eenvoudige stappen en zien direct de
                        status ervan.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Aanvragen beoordelen:</div>
                            Beoordelaars nemen beslissingen over de aanvragen en verwerken deze direct in het systeem.
                            Na de beoordeling wordt de status van de aanvraag gewijzigd naar toegewezen of afgewezen.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
