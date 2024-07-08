import React from 'react';

import useAssetUrl from '../../../../hooks/useAssetUrl';

export default function SocialImpact() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-social-impact">
            <div className="block-social-impact-main-info">
                <div className="block-social-impact-label">Wat we doen</div>
                <div className="block-social-impact-title">Samenwerken aan het maximaliseren van sociale impact</div>
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
                <div className="block-social-impact-actions">
                    <div className="button button-primary">Meer informatie over de vier rollen</div>
                </div>
            </div>

            <div className="block-social-impact-details">
                <div className="block-social-impact-list">
                    <div className="block-social-impact-list-item">
                        <div className="block-social-impact-list-item-image">
                            <img src={assetUrl(`/assets/img/requester.svg`)} alt="" />
                        </div>
                        <div className="block-social-impact-list-item-info">
                            <div className="block-social-impact-list-item-title">Deelnemer</div>
                            <div className="block-social-impact-list-item-description">
                                Voor mensen die in aanmerking komen voor een regeling, fonds of potje.
                            </div>
                            <div className="block-social-impact-list-item-read-more">
                                Lees meer
                                <em className={'mdi mdi-arrow-right'} />
                            </div>
                        </div>
                    </div>

                    <div className="block-social-impact-list-item">
                        <div className="block-social-impact-list-item-image">
                            <img src={assetUrl(`/assets/img/provider.svg`)} alt="" />
                        </div>
                        <div className="block-social-impact-list-item-info">
                            <div className="block-social-impact-list-item-title">Aanbieder</div>
                            <div className="block-social-impact-list-item-description">
                                Voor medewerkers van organisaties die aanbod aanbieden in een webshop.
                            </div>
                            <div className="block-social-impact-list-item-read-more">
                                Lees meer
                                <em className={'mdi mdi-arrow-right'} />
                            </div>
                        </div>
                    </div>

                    <div className="block-social-impact-list-item">
                        <div className="block-social-impact-list-item-image">
                            <img src={assetUrl(`/assets/img/sponsor.svg`)} alt="" />
                        </div>
                        <div className="block-social-impact-list-item-info">
                            <div className="block-social-impact-list-item-title">Sponsor</div>
                            <div className="block-social-impact-list-item-description">
                                Voor medewerkers van gemeenten en goede doelen die regelingen uitgeven.
                            </div>
                            <div className="block-social-impact-list-item-read-more">
                                Lees meer
                                <em className={'mdi mdi-arrow-right'} />
                            </div>
                        </div>
                    </div>

                    <div className="block-social-impact-list-item">
                        <div className="block-social-impact-list-item-image">
                            <img src={assetUrl(`/assets/img/validator.svg`)} alt="" />
                        </div>
                        <div className="block-social-impact-list-item-info">
                            <div className="block-social-impact-list-item-title">Beoordelaar</div>
                            <div className="block-social-impact-list-item-description">
                                Voor medewerkers van gemeenten en goede doelen die aanvragen van regelingen beoordelen.
                            </div>
                            <div className="block-social-impact-list-item-read-more">
                                Lees meer
                                <em className={'mdi mdi-arrow-right'} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
