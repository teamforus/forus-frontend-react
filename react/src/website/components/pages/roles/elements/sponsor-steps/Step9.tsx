import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
export default function Step9({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-sponsor/sponsor-9.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 9</div>
                    <div className="block-with-image-title">De impact monitoren en evalueren</div>
                    <div className="block-with-image-description">
                        De sponsor monitort en evalueert de impact van de fondsen door gebruik te maken van de
                        statistiekenpagina in de beheeromgeving. Ook gebruikt de sponsor de website analytics koppeling
                        voor het monitoren en optimaliseren van de website.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Statistieken:</div>
                            In de beheeromgeving beheren sponsors hun fondsen en bekijken ze{' '}
                            <StateNavLink name={'information'}>financiële statistieken</StateNavLink>. Er zijn
                            verschillende filteropties beschikbaar, bijvoorbeeld het filteren op fondsen of aanbieders.
                            Voor meer informatie naar de{' '}
                            <StateNavLink name={'information'}>Managementinformatiepagina</StateNavLink>.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Website analytics koppeling:</div>
                            Een uitgebreide tool stelt een sponsor in staat om website-analyse te bekijken en
                            optimalisatie toe te passen.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
