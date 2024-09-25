import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
export default function Step6({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-sponsor/sponsor-6.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 6</div>
                    <div className="block-with-image-title">Het communicatiekanaal instellen</div>
                    <div className="block-with-image-description">
                        Dankzij het flexibele CMS kunnen sponsors een website in de huisstijl van hun organisatie maken,
                        waarop ze alle informatie over de regelingen en de aanvraagprocedure presenteren. Sponsors
                        kunnen aanpassingen maken binnen generieke kaders, waardoor de website voldoet aan de
                        WCAG-richtlijnen.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Content Management System (CMS):</div>
                            Sponsors hebben de mogelijkheid om de website volledig aan te passen en fondsen toe te
                            voegen met behulp <StateNavLink name={'cms'}>van het CMS</StateNavLink>. Ze kunnen de
                            communicatie op de website volledig personaliseren en in hun eigen huisstijl vormgeven.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Website:</div>
                            <StateNavLink name={'website'}>De voorkant van het systeem</StateNavLink> geeft deelnemers
                            een overzicht van alle benodigde informatie en biedt de mogelijkheid om in te loggen op hun
                            persoonlijke account.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
