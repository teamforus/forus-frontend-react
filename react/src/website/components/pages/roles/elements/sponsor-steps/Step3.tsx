import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
export default function Step3({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-sponsor/sponsor-3.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 3</div>
                    <div className="block-with-image-title">Fonds opzetten</div>
                    <div className="block-with-image-description">
                        Met behulp van het Forus-platform zet de sponsor eenvoudig een fonds op door voorwaarden vast te
                        stellen waaraan aanvragers moeten voldoen om in aanmerking te komen. Daarnaast selecteert de
                        sponsor beoordelaars om de aanvragen te beoordelen.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Fonds opzetten:</div>
                            Een sponsor kan in enkele eenvoudige stappen een nieuw fonds opzetten. Hier kiest de sponsor
                            onder andere het type fonds en de aanvraagmethode, en stelt hij de voorwaarden voor deelname
                            in. Voor meer informatie over de fondsen, ga naar de{' '}
                            <StateNavLink name={'funds'}>Fondsenpagina</StateNavLink>.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
