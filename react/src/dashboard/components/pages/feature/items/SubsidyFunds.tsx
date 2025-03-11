import React, { Fragment } from 'react';
import OrganizationFeature from '../../../../services/types/OrganizationFeature';
import Organization from '../../../../props/models/Organization';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import AdditionalFeatureList from '../elements/AdditionalFeatureList';
import FaqItem from '../elements/FaqItem';
import IconFeature1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/subsidy-funds/icon-1.svg';
import IconFeature2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/subsidy-funds/icon-2.svg';
import IconFeature3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/subsidy-funds/icon-3.svg';
import IconFeature4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/subsidy-funds/icon-4.svg';

export default function SubsidyFunds({
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
                            Het product fonds biedt de mogelijkheid om tegoeden uit te geven voor specifieke producten
                            of diensten. In bepaalde gevallen zoals de kinderfietsenregeling kunnen deze fondsen
                            bijzonder handig zijn, omdat ze deelnemers in staat stellen hun tegoeden alleen te besteden
                            aan vooraf bepaalde producten, zoals bijvoorbeeld een kinderfiets.
                        </p>

                        <img
                            src={assetUrl('assets/img/features/img/subsidy-funds/banner.jpg')}
                            alt={`${feature.name} banner`}
                        />

                        <h3>Belangrijkste voordelen</h3>

                        <div className="block block-feature-icons">
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature1 />
                                </div>
                                <h4>Toegankelijkheid</h4>
                                <p>
                                    Product fonds biedt een laagdrempelige en gebruiksvriendelijke manier voor
                                    deelnemers om tegoeden te ontvangen en te besteden.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature2 />
                                </div>
                                <h4>Gerichte besteding</h4>
                                <p>
                                    Product fonds zorgt ervoor dat digitale tegoeden alleen gebruikt worden voor
                                    specifieke producten of diensten, wat bijdraagt aan een doelgerichte ondersteuning
                                    van deelnemers.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature3 />
                                </div>
                                <h4>Investeren in lokale gemeenschappen.</h4>
                                <p>
                                    Door specifieke producten of diensten toegankelijk te maken, stimuleert Product
                                    fonds de participatie van deelnemers in lokale economieën en
                                    gemeenschapsinitiatieven.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature4 />
                                </div>
                                <h4>Transparantie</h4>
                                <p>
                                    Het Forus-systeem biedt volledige transparantie over waar en hoe tegoeden worden
                                    besteed, waardoor organisaties inzicht krijgen in de effectiviteit van hun beleid.
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
                        <FaqItem title="Kan ik als organisatie zelf een product fonds opzetten?">
                            <p>
                                Het fonds wordt in samenwerking met Forus opgezet. Er wordt gekeken welke voorwaarden
                                voor het fonds van toepassing zijn en welk aanbod van welke aanbieder dient te worden
                                uitgekeerd aan de rechthebbenden.
                            </p>
                        </FaqItem>

                        <FaqItem title="Wat is het verschil tussen een product fonds en een budget fonds?">
                            <p>
                                Een product fonds werkt in principe hetzelfde als een budget fonds. Voor zowel een
                                product fonds, als een budget fonds, zijn voorwaarden ingesteld waar de deelnemer aan
                                moet voldoen om in aanmerking te komen. Het enige verschil is, dat het resultaat van een
                                product fonds een vast bedrag bevat dat alleen uit te geven is bij een specifieke
                                aanbieder.
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
                                '/assets/img/features/img/subsidy-funds/banner-action-bg.jpg',
                            )}`,
                        }}>
                        <div className="features-demo-banner-info-wrapper">
                            <div className="features-demo-banner-info">
                                <div className="features-demo-banner-title">Product fonds uitproberen</div>
                                <div className="features-demo-banner-details">
                                    Wilt u zien hoe Product fonds werkt? Neem dan contact met ons op voor een
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
