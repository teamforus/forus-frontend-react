import React, { Fragment, useEffect, useState } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useAssetUrl from '../../../hooks/useAssetUrl';
import LearnMore from '../../elements/LearnMore';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import RolesBanner from './elements/RolesBanner';
import useSetMetaDescription from '../../../hooks/useSetMetaDescription';
import BackgroundCircles from '../../elements/BackgroundCircles';

export default function RolesMain() {
    const setTitle = useSetTitle();
    const assetUrl = useAssetUrl();
    const setMetaDescription = useSetMetaDescription();

    const [bannerTitle] = useState('Vier rollen, één systeem');
    const [bannerDescription] = useState(
        [
            'Het Forus-platform hanteert het vier-rollen model, wat samenwerking tussen overheidsorganisaties, ',
            'goede doelen organisaties, bedrijven en deelnemers mogelijk maakt. ',
            'Dit opent de deur naar het creëren van een positieve en meetbare impact, ',
            'bijvoorbeeld op het gebied van herbruikbaarheid, opschaling en de verbinding tussen gebruikers. ',
            'Wanneer een aanpak succesvol blijkt, kunnen we deze als best practice toepassen bij andere organisaties. ',
            'Elke regeling wordt op basis van deze rollen uitgegeven. Door dit vier-rollen model te gebruiken, ',
            'krijgen sponsors de kans om middelen bij te dragen, kunnen aanvragers hun aanvragen indienen, ',
            'hebben beoordelaars de mogelijkheid om aanvragen te verifiëren, en kunnen aanbieders goederen of diensten leveren.',
        ].join(''),
    );

    useEffect(() => {
        setTitle('Het Forus-platform | Eén systeem, vier rollen');
        setMetaDescription(
            [
                'Het Forus-platform faciliteert samenwerking tussen overheidsinstanties, goede doelen, ',
                'bedrijven en deelnemers door middel van een vier-rol model.\n',
            ].join(''),
        );
    }, [setMetaDescription, setTitle]);

    return (
        <Fragment>
            <BackgroundCircles />
            <RolesBanner
                type={'main'}
                title={bannerTitle}
                description={bannerDescription}
                showActions={false}
                showIcon={false}
            />

            <div className="main-content">
                <div className="wrapper">
                    <div className="block block-overview-list">
                        <div className="block block-overview-list-item">
                            <div className="block block-overview-list-item-image">
                                <img
                                    src={assetUrl(`/assets/img/requester.svg`)}
                                    alt="Icoon van de deelnemersrol in het Forus-systeem"
                                />
                            </div>
                            <div className="block block-overview-list-item-info">
                                <div className="block block-overview-list-item-title">Deelnemer / Aanvrager</div>
                                <div className="block block-overview-list-item-description">
                                    Een persoon die mogelijk recht heeft op ondersteuning of een regeling heeft
                                    aangevraagd. Een aanvrager wordt een deelnemer na toekenning. Deelnemers hebben een
                                    account in het platform en vinden hier waar ze voor in aanmerking komen, kunnen een
                                    aanvraag indienen en budgetten uitgeven.
                                </div>
                                <div className="block block-overview-list-item-read-more">
                                    <StateNavLink className="button button-light button-sm" name={'roles-requester'}>
                                        Lees meer
                                    </StateNavLink>
                                </div>
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
                                    Een organisatie die producten en/of diensten aanbiedt in het Forus-systeem.
                                </div>
                                <div className="block block-overview-list-item-read-more">
                                    <StateNavLink className="button button-light button-sm" name={'roles-provider'}>
                                        Lees meer
                                    </StateNavLink>
                                </div>
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
                                    Een organisatie die financiële steun verleent aan deelnemers. Deze rol kan
                                    uitgevoerd worden door gemeenten (zoals een gemeente die een stadspas of een
                                    kindregeling wilt uitgeven) alsook sociale ketenpartners (zoals een lokaal goed
                                    doel).
                                </div>
                                <div className="block block-overview-list-item-read-more">
                                    <StateNavLink className="button button-light button-sm" name={'roles-sponsor'}>
                                        Lees meer
                                    </StateNavLink>
                                </div>
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
                                    Een instelling die de gegevens van de aanvrager beoordeelt en bepaalt of de aanvraag
                                    toegekend of afgewezen moet worden. Dit kan de gemeente zelf zijn, maar ook andere
                                    organisaties zoals sociale ketenpartners of andere overheidsorganisaties.
                                </div>
                                <div className="block block-overview-list-item-read-more">
                                    <StateNavLink className="button button-light button-sm" name={'roles-sponsor'}>
                                        Lees meer
                                    </StateNavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="wrapper">
                    <LearnMore
                        title={'Klaar om uw impact te vergroten?'}
                        description={
                            'Laten we eens kijken naar de mogelijkheden en de optimale manier om uw regelingen uit te geven.'
                        }
                        buttons={[{ title: 'Gratis demo aanvragen', type: 'primary', stateName: 'book-demo' }]}
                    />
                </div>
            </div>
        </Fragment>
    );
}
