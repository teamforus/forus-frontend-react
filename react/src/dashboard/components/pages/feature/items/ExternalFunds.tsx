import React, { Fragment } from 'react';
import OrganizationFeature from '../../../../services/types/OrganizationFeature';
import Organization from '../../../../props/models/Organization';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import AdditionalFeatureList from '../elements/AdditionalFeatureList';
import FaqItem from '../elements/FaqItem';
import IconFeature1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/external-funds/icon-1.svg';
import IconFeature2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/external-funds/icon-2.svg';
import IconFeature3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/external-funds/icon-3.svg';
import IconFeature4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/external-funds/icon-4.svg';

export default function ExternalFunds({
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
                            Het toevoegen van een informatief fonds stelt organisaties in staat om alle beschikbare
                            regelingen overzichtelijk bijeen te brengen. Hiermee kunnen allerlei regelingen en
                            voorzieningen op één plek worden samengebracht. Voor dit type fonds kan er een link naar een
                            externe website worden ingesteld waar meer informatie te vinden is.
                        </p>

                        <img
                            src={assetUrl('assets/img/features/img/external-funds/banner.jpg')}
                            alt={`${feature.name} banner`}
                        />

                        <h3>Belangrijkste voordelen</h3>

                        <div className="block block-feature-icons">
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature1 />
                                </div>
                                <h4>Eén vindplek voor alle regelingen</h4>
                                <p>
                                    Soms worden regelingen uitgegeven via verschillende systemen. Door alle regelingen
                                    samen te brengen in één overzicht, kunnen aanvragers sneller en efficiënter geholpen
                                    worden.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature2 />
                                </div>
                                <h4>Laagdrempelig gebruik van het Forus platform</h4>
                                <p>
                                    Het Informatieve fonds is zodanig ontworpen dat organisaties niet belast worden met
                                    het instellen van een bankrekening of specifieke voorwaarden; het Forus-platform is
                                    dus gebruiksvriendelijk voor alle soorten organisaties.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature3 />
                                </div>
                                <h4>Aangepaste informatieverstrekking</h4>
                                <p>
                                    Sponsors hebben de mogelijkheid om cruciale, op maat gemaakte informatie in het
                                    systeem in te voeren, waaronder paginatypen (intern of extern tabblad),
                                    gedetailleerde beschrijvingen en de positionering van de content.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature4 />
                                </div>
                                <h4>Aanvullende toegangsoptie</h4>
                                <p>
                                    Voor organisaties die hun eigen aanvraagprocedures hebben en deze wensen te
                                    behouden, biedt het platform een extra toegangspunt om aan deze behoefte te voldoen.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-info">
                    <div className="card-info-icon mdi mdi-headset" />
                    <div className="card-info-details">
                        <span>
                            Mocht u nog vragen hebben of wilt u aanvullende informatie dan kunt u ons bellen op:{' '}
                            <strong>+31 (0) 85 004 33 87</strong> of contact opnemen via e-mail{' '}
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
                        <FaqItem title="Wat is het voordeel van een informatief fonds?">
                            <p>
                                Tussen de vele regelingen, met elk hun voorwaarden en aanvraagprocedures, raken veel
                                mensen het overzicht kwijt. Met het opzetten van een informatief fonds kan de
                                organisatie de deelnemer één toegangspoort bieden voor een helder overzicht van welke
                                regelingen er eigenlijk allemaal aan te vragen zijn.
                            </p>
                        </FaqItem>

                        <FaqItem title="Kan ik als organisatie zelf een informatief fonds opzetten?">
                            <p>
                                Het fonds kan via de beheeromgeving worden ingesteld. Het fonds staat dan echter nog
                                niet online. Forus zal na overleg met de organisatie het fonds online brengen.
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
                                '/assets/img/features/img/external-funds/banner-action-bg.jpg',
                            )}`,
                        }}>
                        <div className="features-demo-banner-info-wrapper">
                            <div className="features-demo-banner-info">
                                <div className="features-demo-banner-title">Informatief fonds uitproberen</div>
                                <div className="features-demo-banner-details">
                                    Wilt u zien hoe het Informatieve fonds werkt? Neem dan contact met ons op voor een
                                    persoonlijke demonstratie. We laten u graag zien hoe het voor uw kan werken.
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
