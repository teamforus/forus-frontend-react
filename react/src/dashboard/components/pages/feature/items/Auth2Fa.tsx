import React, { Fragment } from 'react';
import OrganizationFeature from '../../../../services/types/OrganizationFeature';
import Organization from '../../../../props/models/Organization';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import AdditionalFeatureList from '../elements/AdditionalFeatureList';
import FaqItem from '../elements/FaqItem';
import IconFeature1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/auth-2-fa/icon-1.svg';
import IconFeature2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/auth-2-fa/icon-2.svg';
import IconFeature3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/auth-2-fa/icon-3.svg';
import IconFeature4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/auth-2-fa/icon-4.svg';

export default function Auth2Fa({
    feature,
    additionalFeatures,
    organization,
    openContactModal,
}: {
    feature: OrganizationFeature;
    additionalFeatures: Array<OrganizationFeature>;
    organization: Organization;
    openContactModal: () => void;
}) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Beschrijving</div>
                </div>
                <div className="card-section">
                    <div className="block block-content">
                        <p>
                            Tweefactorauthenticatie (2FA) is een essentiële beveiligingsmaatregel om ongeoorloofde
                            toegang tot accounts te voorkomen. Met 2FA wordt een extra laag van beveiliging toegevoegd
                            door het vereisen van twee stappen om toegang te krijgen tot een systeem. Dit minimaliseert
                            het risico op ongeoorloofde toegang en beschermt gevoelige gegevens van gebruikers.
                        </p>
                        <p>
                            Het gebruik van 2FA wordt sterk aanbevolen en is zelfs opgenomen in de BIO-normen voor
                            informatiebeveiliging van de overheid. Hierdoor kunnen gebruikersaccounts op een aanpasbare
                            en robuuste manier worden beveiligd.
                        </p>
                        <p>2FA kan op twee manieren worden ingesteld: via een Authenticator-app en via sms.</p>

                        <img
                            src={assetUrl('assets/img/features/img/auth-2-fa/banner.jpg')}
                            alt={`${feature.name} banner`}
                        />

                        <h3>Belangrijkste voordelen</h3>

                        <div className="block block-feature-icons">
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature1 />
                                </div>
                                <h4>Verminder de kans op ongeoorloofde toegang</h4>
                                <p>
                                    Met 2FA wordt het moeilijker voor aanvallers om toegang te krijgen tot de accounts
                                    van uw gebruikers.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature2 />
                                </div>
                                <h4>Flexibele oplossing</h4>
                                <p>
                                    Tweefactorauthenticatie kan verplicht of optioneel worden gemaakt voor verschillende
                                    doelgroepen en/of functionaliteiten.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature3 />
                                </div>
                                <h4>Voldoe aan de eisen</h4>
                                <p>
                                    Veel instanties (bijv. BIO-normen van de overheid) eisen strikte richtlijnen om
                                    gegevens te beschermen.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature4 />
                                </div>
                                <h4>Verbeter de gebruikerservaring</h4>
                                <p>
                                    Hoewel 2FA extra stappen toevoegt aan het inlogproces, verbetert het de
                                    gebruikerservaring. Het vergroot het gevoel van veiligheid en vertrouwen in
                                    Forus-platform.
                                </p>
                            </div>
                        </div>

                        <hr />

                        <h3>Aanpasbare accountbeveiliging</h3>
                        <p>
                            Niet alle doelgroepen hebben dezelfde digitale vaardigheden. Met de flexibele 2FA-oplossing
                            van Forus kunt u per doelgroep en functionaliteit 2FA instellen. U kunt het verplicht
                            stellen voor iedereen of specifieke doelgroepen, of het als optionele mogelijkheid aanbieden
                            zodat gebruikers hun eigen accounts beter kunnen beveiligen.
                        </p>

                        <div className="block block-feature-text-image-columns">
                            <div className="block-feature-text-image-columns-description">
                                <h4>Over 2FA</h4>
                                <p>
                                    Tweefactorauthenticatie, vaak afgekort als 2FA, is een methode van
                                    accountbeveiliging waarbij de gebruiker twee verschillende authenticatiefactoren
                                    moet verstrekken om zijn identiteit te bevestigen. Dit betekent dat zelfs als iemand
                                    het wachtwoord van een gebruiker kent, hij of zij zonder de tweede factor nog steeds
                                    geen toegang kan krijgen tot het account. De tweede factor kan iets zijn dat de
                                    gebruiker kent (zoals een pincode), iets dat de gebruiker heeft (zoals een fysieke
                                    sleutel of een smartphone), of iets dat de gebruiker is (zoals een vingerafdruk of
                                    een ander biometrisch kenmerk). Door deze dubbele laag van beveiliging wordt de kans
                                    op ongeoorloofde toegang tot het account aanzienlijk verminderd.
                                </p>
                            </div>
                            <div className="block-feature-text-image-columns-img">
                                <img
                                    src={assetUrl('assets/img/features/img/auth-2-fa/image-text-block.jpg')}
                                    alt={`${feature.name} banner`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-info">
                    <div className="card-info-icon mdi mdi-headset" />
                    <div className="card-info-details">
                        <span>
                            Mocht u vragen hebben of aanvullende informatie willen ontvangen, dan kunt u ons bellen op:{' '}
                            <strong>+31 (0) 85 004 33 87</strong> of een e-mail sturen naar{' '}
                            <strong>info@forus.io</strong>
                        </span>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">Veelgestelde vragen</div>
                </div>
                <div className="card-section card-section-padless">
                    <div className="block block-feature-faq">
                        <FaqItem title="Wat is twee- factor-authenticatie (2FA)?">
                            <p>
                                Twee- factor-authenticatie is een beveiligingsmethode waarbij je naast het reguliere
                                inlogproces een tweede verificatiestap moet voltooien om toegang te krijgen tot je
                                account. Dit kan bijvoorbeeld een verificatiecode via sms of een Authenticator-app zijn.
                            </p>
                        </FaqItem>

                        <FaqItem title="Waarom zou ik 2FA gebruiken?">
                            <p>
                                Het gebruik van 2FA verbetert de beveiliging van je accounts aanzienlijk. Zelfs als
                                iemand toegang heeft tot een inloglink, voorkomt 2FA dat die persoon toegang krijgt tot
                                je account, omdat ze ook de tweede verificatiestap moeten voltooien. Hierdoor wordt de
                                kans op ongeoorloofde toegang tot je account sterk verminderd.
                            </p>
                        </FaqItem>

                        <FaqItem title="Hoe schakel ik 2FA in voor mijn account?">
                            <p>
                                In het Helpcentrum artikel:{' '}
                                <a
                                    href="https://forusoperations.zendesk.com/hc/nl-nl/articles/29420407098001-Tweefactorauthenticatie-sponsor"
                                    target="_blank"
                                    rel="noreferrer">
                                    2FA instellen
                                </a>{' '}
                                wordt uitgelegd hoe je 2FA kan inschakelen voor je eigen account, voor medewerkers en
                                voor de deelnemers.
                            </p>
                        </FaqItem>

                        <FaqItem title="Kan de sponsor 2FA verplicht stellen voor aanbieders?">
                            <p>
                                Nee, dit is niet mogelijk. Aanbieders hebben zelf de keuze of ze 2FA willen instellen.
                                De eigenaar van het aanbiederaccount kan echter wel 2FA verplicht stellen voor zijn
                                medewerkers.
                            </p>
                        </FaqItem>

                        <FaqItem title="Welke Authenticator-apps worden ondersteund?">
                            <p>
                                Bijna alle Authenticator-apps worden ondersteund. Werkt een specifieke app niet, neem
                                dan contact op met Forus. Voorbeelden van Authenticator-apps zijn:
                            </p>
                            <ul>
                                <li>Google Authenticator</li>
                                <li>Microsoft Authenticator</li>
                                <li>LastPass Authenticator</li>
                                <li>1Password Authenticator</li>
                            </ul>
                        </FaqItem>

                        <FaqItem title="Ik ben mijn telefoon kwijtgeraakt en ik heb geen toegang meer tot mijn SMS codes of Authenticator-app?">
                            <p>
                                Neem contact op met Forus. Indien er een goede verificatie gedaan kan worden, wordt 2FA
                                gereset en kun je 2FA opnieuw instellen.
                            </p>
                        </FaqItem>

                        <FaqItem title="Een deelnemer is zijn telefoon kwijtgeraakt of heeft geen toegang meer tot zijn Authenticator-app?">
                            <p>
                                Een deelnemer dient dit aangeven bij de Sponsor. De sponsor doet een goede verificatie
                                en stuurt vervolgens een verzoek per e-mail aan Forus om 2FA te resetten.
                            </p>
                        </FaqItem>

                        <FaqItem title="Kan ik 2FA uitschakelen nadat ik het heb ingeschakeld?">
                            <p>
                                Ja, dit is mogelijk nadat je bent ingelogd op je account. Je kunt 2FA alleen
                                uitschakelen als dit niet verplicht is gesteld. De eigenaar van het account bepaalt of
                                2FA al dan niet verplicht is.
                            </p>
                        </FaqItem>

                        <FaqItem title="Is het onveilig als ik 2FA niet activeer?">
                            <p>
                                Het inschakelen van 2FA versterkt de beveiliging van je account door een extra
                                verificatiestap toe te voegen. Hoewel het niet inschakelen van 2FA de veiligheid kan
                                verminderen, betekent dit niet direct dat het onveilig is.
                            </p>
                        </FaqItem>

                        <FaqItem title="Ik heb geen mogelijkheid om 2FA in te stellen, hoe kan dat?">
                            <p>
                                De 2FA functionaliteit is optioneel en staat standaard uit. Neem contact op met Forus
                                voor meer informatie.
                            </p>
                        </FaqItem>
                    </div>
                </div>
            </div>

            <div className="card">
                <AdditionalFeatureList additionalFeatures={additionalFeatures} organization={organization} />

                <div className="card-section">
                    <div
                        className="block block-features-demo-banner"
                        style={{
                            backgroundImage: `url(${assetUrl(
                                '/assets/img/features/img/auth-2-fa/banner-action-bg.jpg',
                            )}`,
                        }}>
                        <div className="features-demo-banner-info-wrapper">
                            <div className="features-demo-banner-info">
                                <div className="features-demo-banner-title">2FA uitproberen</div>
                                <div className="features-demo-banner-details">
                                    Wilt u zien hoe de Tweefactorauthenticatie werkt? Neem dan contact met ons op voor
                                    een persoonlijke demonstratie. We laten u graag zien hoe het voor uw kan werken.
                                </div>
                            </div>
                            <div className="features-demo-banner-action">
                                <div className="button button-primary" onClick={() => openContactModal()}>
                                    Demo aanvragen
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
