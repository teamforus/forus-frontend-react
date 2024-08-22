import React from 'react';

import useAssetUrl from '../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

export default function SocialImpact() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-social-impact">
            <div className="block-social-impact-main-info">
                <div className="block-social-impact-label">Wat we doen</div>
                <div className="block-social-impact-details">
                    <div className="block-social-impact-title">
                        Samenwerken aan het maximaliseren van sociale impact
                    </div>
                    <div className="block-social-impact-description">
                        Forus biedt een gebruiksvriendelijk online platform waarmee mensen en organisaties kunnen
                        samenwerken en bijdragen aan sociale initiatieven. Ons platform vergemakkelijkt de samenwerking
                        tussen overheidsorganisaties, goede doelen organisaties, bedrijven en individuen, zodat ze een
                        positieve en meetbare impact kunnen hebben.
                        <br />
                        Het platform is gebaseerd op een vier-rollen model waarbij sponsors middelen kunnen doneren,
                        aanvragers aanvragen kunnen indienen, beoordelaars gegevens kunnen verifiëren, en aanbieders
                        producten of diensten kunnen leveren.
                    </div>
                </div>

                <div className="block-social-impact-actions">
                    <StateNavLink name={'roles-main'} className="button button-primary">
                        Meer informatie over de vier rollen
                    </StateNavLink>
                </div>
            </div>

            <div className="block-social-impact-details">
                <div className="block block-overview-list">
                    <div className="block block-overview-list-item">
                        <div className="block block-overview-list-item-image">
                            <img
                                src={assetUrl(`/assets/img/requester.svg`)}
                                alt="Icoon van de deelnemersrol in het Forus-systeem"
                            />
                        </div>
                        <div className="block block-overview-list-item-info">
                            <div className="block block-overview-list-item-title">Deelnemer</div>
                            <div className="block block-overview-list-item-description">
                                Voor mensen die in aanmerking komen voor een regeling, fonds of potje.
                            </div>
                            <StateNavLink name={'roles-requester'} className="block block-overview-list-item-read-more">
                                Lees meer
                                <em className={'mdi mdi-arrow-right'} />
                            </StateNavLink>
                        </div>
                    </div>

                    <div className="block block-overview-list-item">
                        <div className="block block-overview-list-item-image">
                            <img
                                src={assetUrl(`/assets/img/provider.svg`)}
                                alt="Icoon van de aanbiedersrol in het Forus-systeem"
                            />
                        </div>
                        <div className="block block-overview-list-item-info">
                            <div className="block block-overview-list-item-title">Aanbieder</div>
                            <div className="block block-overview-list-item-description">
                                Voor medewerkers van organisaties die aanbod aanbieden in een webshop.
                            </div>
                            <StateNavLink name={'roles-provider'} className="block block-overview-list-item-read-more">
                                Lees meer
                                <em className={'mdi mdi-arrow-right'} />
                            </StateNavLink>
                        </div>
                    </div>

                    <div className="block block-overview-list-item">
                        <div className="block block-overview-list-item-image">
                            <img
                                src={assetUrl(`/assets/img/sponsor.svg`)}
                                alt="Icoon van de sponsorrol in het Forus-systeem"
                            />
                        </div>
                        <div className="block block-overview-list-item-info">
                            <div className="block block-overview-list-item-title">Sponsor</div>
                            <div className="block block-overview-list-item-description">
                                Voor medewerkers van gemeenten en goede doelen die regelingen uitgeven.
                            </div>
                            <StateNavLink name={'roles-sponsor'} className="block block-overview-list-item-read-more">
                                Lees meer
                                <em className={'mdi mdi-arrow-right'} />
                            </StateNavLink>
                        </div>
                    </div>

                    <div className="block block-overview-list-item">
                        <div className="block block-overview-list-item-image">
                            <img
                                src={assetUrl(`/assets/img/validator.svg`)}
                                alt="Icoon van de beoordelaardsrol in het Forus-systeem"
                            />
                        </div>
                        <div className="block block-overview-list-item-info">
                            <div className="block block-overview-list-item-title">Beoordelaar</div>
                            <div className="block block-overview-list-item-description">
                                Voor medewerkers van gemeenten en goede doelen die aanvragen van regelingen beoordelen.
                            </div>
                            <StateNavLink name={'roles-validator'} className="block block-overview-list-item-read-more">
                                Lees meer
                                <em className={'mdi mdi-arrow-right'} />
                            </StateNavLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
