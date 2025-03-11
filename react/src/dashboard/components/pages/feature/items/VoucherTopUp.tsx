import React, { Fragment } from 'react';
import OrganizationFeature from '../../../../services/types/OrganizationFeature';
import Organization from '../../../../props/models/Organization';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import AdditionalFeatureList from '../elements/AdditionalFeatureList';
import IconFeature1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/voucher-top-up/icon-1.svg';
import IconFeature2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/voucher-top-up/icon-2.svg';
import IconFeature3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/voucher-top-up/icon-3.svg';
import IconFeature4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/voucher-top-up/icon-4.svg';

export default function VoucherTopUp({
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
                            Gebruik deze functionaliteit om de tegoeden voor deelnemers te verhogen. U kunt gemakkelijk
                            een extra bedrag toevoegen aan bestaande tegoeden zonder een nieuw tegoed aan te maken, en u
                            kunt zelf de hoogte van het bedrag bepalen.
                        </p>

                        <div className="block block-feature-list block-feature-list-tertiary">
                            <h3>Hier zijn enkele situaties waarin dit van nut kan zijn:</h3>
                            <div className="block-feature-list-items-wrapper">
                                <div className="block-feature-list-items">
                                    <div className="block-feature-list-item">
                                        Extra budget wordt toegekend aan de deelnemer.
                                    </div>
                                    <div className="block-feature-list-item">
                                        Een betaling is teruggestort door de aanbieder, deze kunt u via opwaardering
                                        weer terugzetten op het tegoed.
                                    </div>
                                    <div className="block-feature-list-item">Uit coulance.</div>
                                </div>
                            </div>
                        </div>

                        <img
                            src={assetUrl('assets/img/features/img/voucher-top-up/banner.jpg')}
                            alt={`${feature.name} banner`}
                        />

                        <h3>Belangrijkste voordelen</h3>

                        <div className="block block-feature-icons">
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature1 />
                                </div>
                                <h4>Maatwerkoplossing</h4>
                                <p>
                                    De mogelijkheid om bedragen handmatig op te waarderen geeft sponsors meer
                                    flexibiliteit. Het zorgt ervoor dat er in specifieke situaties maatwerk geboden kan
                                    worden.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature2 />
                                </div>
                                <h4>Terugbetalingen en correcties</h4>
                                <p>
                                    Het opwaarderen van tegoeden biedt een handige manier om eventuele terugbetalingen
                                    van de aanbieder snel terug te zetten op het tegoed van de deelnemer.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature3 />
                                </div>
                                <h4>Tijdsbesparing</h4>
                                <p>
                                    Het handmatig opwaarderen versnelt het proces om financiële middelen beschikbaar te
                                    stellen zonder een nieuw tegoed aan te maken, waardoor administratieve handelingen
                                    minder tijd in beslag nemen.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature4 />
                                </div>
                                <h4>Verbeterde gebruikerstevredenheid</h4>
                                <p>
                                    Snelle en eenvoudige opwaardering van tegoeden draagt bij aan een positievere
                                    ervaring voor de deelnemers, wat leidt tot verhoogde tevredenheid.
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
                <AdditionalFeatureList additionalFeatures={additionalFeatures} organization={organization} />

                <div className="card-section">
                    <div
                        className="block block-features-demo-banner"
                        style={{
                            backgroundImage: `url(${assetUrl(
                                '/assets/img/features/img/voucher-top-up/banner-action-bg.jpg',
                            )}`,
                        }}>
                        <div className="features-demo-banner-info-wrapper">
                            <div className="features-demo-banner-info">
                                <div className="features-demo-banner-title">Tegoed opwaarderen uitproberen</div>
                                <div className="features-demo-banner-details">
                                    Wilt u zien hoe Tegoed opwaarderen functionaliteit werkt? Neem dan contact met ons
                                    op voor een persoonlijke demonstratie. We laten u graag zien hoe het voor uw kan
                                    werken.
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
