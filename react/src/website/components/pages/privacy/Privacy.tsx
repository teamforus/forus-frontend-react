import React, { Fragment, useEffect } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useSetMetaDescription from '../../../hooks/useSetMetaDescription';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import LearnMore from '../../elements/LearnMore';
import BackgroundCircles from '../../elements/BackgroundCircles';

export default function Privacy() {
    const setTitle = useSetTitle();
    const setMetaDescription = useSetMetaDescription();

    useEffect(() => {
        setTitle('Privacy verklaring | Forus');
        setMetaDescription(
            [
                'Lees onze privacyverklaring waarin we uitleggen hoe Forus persoonsgegevens verwerkt en beschermt. ',
                'Neem contact op voor vragen of opmerkingen',
            ].join(''),
        );
    }, [setMetaDescription, setTitle]);

    return (
        <Fragment>
            <BackgroundCircles
                mainStyles={{ height: '850px' }}
                overlayStyles={{ background: 'linear-gradient(180deg, #F9F9F9 0%, rgba(249, 249, 249, 0.00) 100%)' }}
            />
            <div className="wrapper">
                <div className="block block-privacy">
                    <div className="block-privacy-title">Privacyverklaring Forus</div>
                    <div className="block-privacy-date">Laatst bijgewerkt: 30-04-2024</div>
                    <div className="block-privacy-separator" />

                    <div className="block-privacy-details">
                        <div className="block-privacy-info">
                            <div className="block-privacy-info-description">
                                Forus, gevestigd aan Verlengde Hereweg 161 9721 AN Groningen Nederland, is
                                verantwoordelijk voor de verwerking van persoonsgegevens zoals weergegeven in deze
                                privacyverklaring.
                                <br />
                                Contactgegevens:
                                <br />
                                Website: https://forus.io/
                                <br />
                                Adres: Verlengde Hereweg 161, 9721 AN Groningen Nederland
                                <br />
                                Telefoonnummer: 0850 043 387
                            </div>

                            <div className="block-privacy-info-title">Persoonsgegevens die wij verwerken</div>

                            <div className="block-privacy-info-description">
                                Forus verwerkt uw persoonsgegevens doordat u gebruik maakt van onze diensten en/of omdat
                                u deze zelf aan ons verstrekt. Hieronder vindt u een overzicht van de persoonsgegevens
                                die wij verwerken:
                                <ul>
                                    <li>Voor- en achternaam</li>
                                    <li>Telefoonnummer</li>
                                    <li>E-mailadres</li>
                                    <li>Werkzaam bij organisatie</li>
                                    <li>IP-adres</li>
                                    <li>Locatiegegevens</li>
                                    <li>Gegevens over uw activiteiten op onze website</li>
                                    <li>
                                        Gegevens over uw surfgedrag over verschillende websites heen (bijvoorbeeld omdat
                                        dit bedrijf onderdeel is van een advertentienetwerk)
                                    </li>
                                    <li>Internetbrowser en apparaat type</li>
                                </ul>
                            </div>

                            <div className="block-privacy-info-title">
                                Bijzondere en/of gevoelige persoonsgegevens die wij verwerken
                            </div>

                            <div className="block-privacy-info-description">
                                Onze website heeft niet de intentie gegevens te verzamelen over websitebezoekers die
                                jonger zijn dan 16 jaar. Tenzij ze toestemming hebben van ouders of voogd. We kunnen
                                echter niet controleren of een bezoeker ouder dan 16 is. Wij raden ouders dan ook aan
                                betrokken te zijn bij de online activiteiten van hun kinderen, om zo te voorkomen dat er
                                gegevens over kinderen verzameld worden zonder ouderlijke toestemming. Als u er van
                                overtuigd bent dat wij zonder die toestemming persoonlijke gegevens hebben verzameld
                                over een minderjarige, neem dan contact met ons op via&nbsp;
                                <span className="link">info@forus.io</span>, dan verwijderen wij deze informatie.
                            </div>

                            <div className="block-privacy-info-title">
                                Met welk doel en op basis van welke grondslag wij persoonsgegevens verwerken
                            </div>

                            <div className="block-privacy-info-description">
                                Forus verwerkt uw persoonsgegevens voor de volgende doelen:
                                <ul>
                                    <li>Verzenden van onze nieuwsbrief en/of reclamefolder</li>
                                    <li>
                                        U te kunnen bellen of e-mailen indien dit nodig is om onze dienstverlening uit
                                        te kunnen voeren
                                    </li>
                                    <li>U te informeren over wijzigingen van onze diensten en producten</li>
                                    <li>
                                        Forus analyseert uw gedrag op de website om daarmee de website te verbeteren en
                                        het aanbod van producten en diensten af te stemmen op uw voorkeuren.
                                    </li>
                                </ul>
                                <br />
                                Wij verwerken uw persoonsgegevens uitsluitend op basis van de hierna te noemen
                                wettelijke gronden:
                                <ol>
                                    <li>
                                        <strong>Toestemming</strong>: De betrokkene heeft toestemmingen gegeven voor de
                                        verwerking van zijn persoonsgegevens voor een of meer specifieke doeleinden.
                                    </li>
                                    <li>
                                        <strong>Overeenkomst</strong>: De verwerking is noodzakelijk voor de uitvoering
                                        van een overeenkomst waarbij de betrokkene partij is, of om op verzoek van de
                                        betrokkene vóór de sluiting van een overeenkomst maatregelen te nemen.
                                    </li>
                                    <li>
                                        <strong>Wettelijke verplichting</strong>: De verwerking is noodzakelijk om te
                                        voldoen aan een wettelijke verplichting die op de verwerkingsverantwoordelijke
                                        rust.
                                    </li>
                                    <li>
                                        <strong>Gerechtvaardigd belang</strong>: De verwerking is noodzakelijk voor de
                                        behartiging van de gerechtvaardigde belangen van de verwerkingsverantwoordelijke
                                        of van een derde, behalve wanneer de belangen of de grondrechten en de
                                        fundamentele vrijheden van de betrokkenen die tot bescherming van
                                        persoonsgegevens nopen, zwaarder wegen dan die belangen, met name wanneer de
                                        betrokkene een kind is.
                                    </li>
                                </ol>
                            </div>

                            <div className="block-privacy-info-title">Hoe lang we persoonsgegevens bewaren</div>

                            <div className="block-privacy-info-description">
                                Forus bewaart uw persoonsgegevens niet langer dan strikt nodig is om de doelen te
                                realiseren waarvoor uw gegevens worden verzameld. Wij hanteren de volgende
                                bewaartermijnen voor de volgende (categorieën) van persoonsgegevens:
                            </div>

                            <div className="block-privacy-info-description">
                                <div>Cookie: Google Analytics</div>
                                <div>Naam: _utma _ga</div>
                                <div>Functie: Analytische cookie die websitebezoek meet</div>
                                <div>Bewaartermijn: 26 maanden</div>
                            </div>

                            <div className="block-privacy-info-description">
                                <div>Cookie: Hotjar</div>
                                <div>Naam: _hj</div>
                                <div>Functie: Analytische cookie die het gedrag van bezoekers analyseert</div>
                                <div>Bewaartermijn: 14 maanden</div>
                            </div>

                            <div className="block-privacy-info-title">Delen van persoonsgegevens met derden</div>

                            <div className="block-privacy-info-description">
                                Forus verstrekt uitsluitend aan derden en alleen als dit nodig is voor de uitvoering van
                                onze overeenkomst met u of om te voldoen aan een wettelijke verplichting.
                            </div>

                            <div className="block-privacy-info-title">
                                Cookies, of vergelijkbare technieken, die wij gebruiken
                            </div>

                            <div className="block-privacy-info-description">
                                Forus gebruikt alleen technische, functionele en analytische cookies die geen inbreuk
                                maken op uw privacy. Een cookie is een klein tekstbestand dat bij het eerste bezoek aan
                                deze website wordt opgeslagen op uw computer, tablet of smartphone. De cookies die wij
                                gebruiken zijn noodzakelijk voor de technische werking van de website en uw
                                gebruiksgemak. Ze zorgen ervoor dat de website naar behoren werkt en onthouden
                                bijvoorbeeld uw voorkeursinstellingen. Ook kunnen wij hiermee onze website
                                optimaliseren. U kunt zich afmelden voor cookies door uw internetbrowser zo in te
                                stellen dat deze geen cookies meer opslaat. Daarnaast kunt u ook alle informatie die
                                eerder is opgeslagen via de instellingen van uw browser verwijderen.
                            </div>

                            <div className="block-privacy-info-title">
                                Cookies, of vergelijkbare technieken, die wij gebruiken
                            </div>

                            <div className="block-privacy-info-description">
                                Forus gebruikt functionele, analytische en tracking cookies. Een cookie is een klein
                                tekstbestand dat bij het eerste bezoek aan deze website wordt opgeslagen in de browser
                                van uw computer, tablet of smartphone. Forus gebruikt cookies met een puur technische
                                functionaliteit. Deze zorgen ervoor dat de website naar behoren werkt en dat
                                bijvoorbeeld uw voorkeursinstellingen onthouden worden. Deze cookies worden ook gebruikt
                                om de website goed te laten werken en deze te kunnen optimaliseren. Daarnaast plaatsen
                                we cookies die uw surfgedrag bijhouden zodat we op maat gemaakte content en advertenties
                                kunnen aanbieden. Bij uw eerste bezoek aan onze website hebben wij u al geïnformeerd
                                over deze cookies en toestemming gevraagd voor het plaatsen ervan. U kunt zich afmelden
                                voor cookies door uw internetbrowser zo in te stellen dat deze geen cookies meer
                                opslaat. Daarnaast kunt u ook alle informatie die eerder is opgeslagen via de
                                instellingen van uw browser verwijderen. Zie voor een toelichting:
                                <br />
                                <br />
                                <a
                                    target={'_blank'}
                                    href={
                                        'https://veiliginternetten.nl/themes/situatie/cookies-wat-zijn-het-en-wat-doe-ik-ermee'
                                    }
                                    rel="noreferrer">
                                    https://veiliginternetten.nl/themes/situatie/cookies-wat-zijn-het-en-wat-doe-ik-ermee
                                </a>
                            </div>

                            <div className="block-privacy-info-title">Gegevens inzien, aanpassen of verwijderen</div>

                            <div className="block-privacy-info-description">
                                U heeft het recht om uw persoonsgegevens in te zien, te corrigeren of te verwijderen.
                                Dit kunt u zelf doen via de persoonlijke instellingen van uw account. Daarnaast heeft u
                                het recht om uw eventuele toestemming voor de gegevensverwerking in te trekken of
                                bezwaar te maken tegen de verwerking van uw persoonsgegevens door ons bedrijf en heeft u
                                het recht op gegevensoverdraagbaarheid. Dat betekent dat u bij ons een verzoek kunt
                                indienen om de persoonsgegevens die wij van u beschikken in een computerbestand naar u
                                of een ander, door u genoemde organisatie, te sturen. Wilt u gebruik maken van uw recht
                                op bezwaar en/of recht op gegevensoverdraagbaarheid of heeft u andere vragen/opmerkingen
                                over de gegevensverwerking, stuur dan een gespecificeerd verzoek naar info@forus.io. Om
                                er zeker van te zijn dat het verzoek tot inzage door u is gedaan, vragen wij u een kopie
                                van uw identiteitsbewijs bij het verzoek mee te sturen. Maak in deze kopie uw pasfoto,
                                MRZ (machine readable zone, de strook met nummers onderaan het paspoort), paspoortnummer
                                en Burgerservicenummer (BSN) zwart. Dit ter bescherming van uw privacy. Forus zal zo
                                snel mogelijk, maar in ieder geval binnen vier weken, op uw verzoek reageren. Forus wil
                                u er tevens op wijzen dat u de mogelijkheid hebt om een klacht in te dienen bij de
                                nationale toezichthouder, de Autoriteit Persoonsgegevens. Dat kan via de volgende link:
                                <br />
                                <br />
                                <a
                                    target={'_blank'}
                                    href={
                                        'https://autoriteitpersoonsgegevens.nl/nl/contact-met-de-autoriteit-persoonsgegevens/tip-ons'
                                    }
                                    rel="noreferrer">
                                    https://autoriteitpersoonsgegevens.nl/nl/contact-met-de-autoriteit-persoonsgegevens/tip-ons
                                </a>
                            </div>

                            <div className="block-privacy-info-title">Hoe wij persoonsgegevens beveiligen</div>

                            <div className="block-privacy-info-description">
                                Forus neemt de bescherming van uw gegevens serieus en neemt passende maatregelen om
                                misbruik, verlies, onbevoegde toegang, ongewenste openbaarmaking en ongeoorloofde
                                wijziging tegen te gaan. Als u de indruk heeft dat uw gegevens niet goed beveiligd zijn
                                of er aanwijzingen zijn van misbruik, neem dan contact op met onze klantenservice of
                                via&nbsp;
                                <span className="link">info@forus.io</span>
                            </div>

                            <div className="block-privacy-info-title">Hoe wij persoonsgegevens beveiligen</div>

                            <div className="block-privacy-info-description">
                                Forus neemt de bescherming van uw gegevens serieus en neemt passende maatregelen om
                                misbruik, verlies, onbevoegde toegang, ongewenste openbaarmaking en ongeoorloofde
                                wijziging tegen te gaan. Als u de indruk heeft dat uw gegevens niet goed beveiligd zijn
                                of er zijn aanwijzingen van misbruik, neem dan contact op met onze klantenservice of
                                via&nbsp;
                                <span className="link">info@forus.io</span>
                            </div>
                        </div>

                        <div className="block-privacy-image-wrapper">
                            <div className="block-privacy-image-title">
                                Ervaar het
                                <br />
                                Forus-systeem in actie
                            </div>
                            <div className="block-separator">
                                <div className="line" />
                            </div>

                            <div className="block-privacy-image">
                                <div className="block-privacy-image-media" />
                                <div className="block-privacy-image-overlay" />
                                <div className="block-privacy-image-info">
                                    <div className="block-privacy-image-info-title">
                                        Laten we eens kijken naar het optimale gebruik van ons platform voor uw
                                        organisatie
                                    </div>
                                    <StateNavLink name={'book-demo'} className="block-privacy-image-info-link">
                                        Gratis demo
                                        <em className="mdi mdi-arrow-right" />
                                    </StateNavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="show-sm">
                    <LearnMore
                        title={'Klaar om uw impact te vergroten?'}
                        description={
                            'Laten we eens kijken naar de mogelijkheden en de optimale manier om uw regelingen uit te geven.'
                        }
                    />
                </div>
            </div>
        </Fragment>
    );
}
