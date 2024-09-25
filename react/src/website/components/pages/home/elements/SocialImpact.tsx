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
                    <div className="block-social-impact-title">Een schaalbare manier om te verbinden</div>
                    <div className="block-social-impact-description">
                        Ons platform werkt met een vier-rollenmodel: gemeenten en goede doelen organisaties treden op
                        als sponsoren die middelen verstrekken, aanvragers vragen middelen aan, beoordelaars controleren
                        gegevens, en aanbieders leveren producten en diensten. Door alle partijen samen te brengen op
                        één platform kunnen samenwerkingsafspraken eenvoudig worden vastgelegd en processen optimaal
                        verlopen. Zo profiteren alle betrokkenen van een effectief en efficiënt sociaal beleid.
                    </div>
                </div>

                <div className="block-social-impact-actions">
                    <StateNavLink name={'roles-main'} className="button button-primary">
                        Lees meer over de werking per rol
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
