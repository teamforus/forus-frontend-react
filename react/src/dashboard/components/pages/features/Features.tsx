import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useOrganizationService } from '../../../services/OrganizationService';
import { useFeatureService } from '../../../services/FeaturesService';
import useFilter from '../../../hooks/useFilter';
import useAssetUrl from '../../../hooks/useAssetUrl';
import OrganizationFeature from '../../../services/types/OrganizationFeature';
import FeatureList from './elements/FeatureList';
import useEnvData from '../../../hooks/useEnvData';
import ModalFeatureContact from '../../modals/ModalFeatureContact';
import useOpenModal from '../../../hooks/useOpenModal';
import useTranslate from '../../../hooks/useTranslate';

export default function Features() {
    const translate = useTranslate();

    const assetUrl = useAssetUrl();
    const envData = useEnvData();
    const openModal = useOpenModal();

    const featureService = useFeatureService();
    const activeOrganization = useActiveOrganization();
    const organizationService = useOrganizationService();

    const [features, setFeatures] = useState([]);
    const [featuresAfter, setFeaturesAfter] = useState([]);
    const [featureStatuses, setFeatureStatuses] = useState({});
    const [activeOptions, setActiveOptions] = useState<Array<{ value: string; name: string }>>([]);
    const allFeatures = useMemo(() => featureService.list(), [featureService]);

    const previewList = useMemo(
        () => [featureService.previewList().slice(0, 2), featureService.previewList().slice(2)],
        [featureService],
    );

    const filter = useFilter({
        q: '',
        state: 'all',
    });

    const filterByName = useCallback((item: OrganizationFeature, q: string) => item.name.toLowerCase().includes(q), []);
    const filterByDescription = useCallback(
        (item: OrganizationFeature, q: string) => item.description.toLowerCase().includes(q),
        [],
    );

    const filterByLabel = useCallback(
        (item: OrganizationFeature, q: string) => item.labels.filter((label) => label.toLowerCase().includes(q)).length,
        [],
    );

    const filterByState = useCallback(
        (item: OrganizationFeature, state: string) =>
            state === 'all' || (state === 'active' ? item.enabled : !item.enabled),
        [],
    );

    const setActiveCounts = useCallback((features: Array<OrganizationFeature>) => {
        const active = features.filter((feature) => feature.enabled).length;
        const notActive = features.filter((feature) => !feature.enabled).length;

        setActiveOptions([
            { value: 'all', name: 'Alle' },
            { value: 'active', name: `Actief (${active})` },
            { value: 'available', name: `Niet Actief (${notActive})` },
        ]);
    }, []);

    const filterFeatures = useCallback(
        (features: Array<OrganizationFeature>, value: { q: string; state: string }) => {
            const q = value.q.toLowerCase();

            const filteredListBySearch = features
                .filter((item) => filterByName(item, q) || filterByDescription(item, q) || filterByLabel(item, q))
                .map((feature) => ({
                    ...feature,
                    enabled: featureStatuses[feature.key] || false,
                }));

            setActiveCounts(filteredListBySearch);

            const list = filteredListBySearch.filter((item) => filterByState(item, value.state?.toString()));

            setFeatures(list.slice(0, 4));
            setFeaturesAfter(list.slice(4));
        },
        [featureStatuses, filterByDescription, filterByLabel, filterByName, filterByState, setActiveCounts],
    );

    const openContactModal = useCallback(() => {
        openModal((modal) => <ModalFeatureContact modal={modal} />);
    }, [openModal]);

    useEffect(() => {
        organizationService
            .getFeatures(activeOrganization.id)
            .then((res) => setFeatureStatuses(res.data.data.statuses));
    }, [activeOrganization.id, organizationService]);

    useEffect(() => {
        filterFeatures(allFeatures, filter.activeValues);
    }, [allFeatures, filter.activeValues, filterFeatures]);

    return (
        <Fragment>
            <div className="card">
                <div className="card-section card-section-padless">
                    <div className="block block-features-overview">
                        <div className="overview-details">
                            <div className="overview-details-title">
                                Veelzijdige functionaliteiten voor een optimale gebruikerservaring
                            </div>
                            <div className="overview-details-description">
                                <p>
                                    Met onze functionaliteiten kunt u een optimale gebruikerservaring creëren voor
                                    aanvragers, aanbieders en medewerkers.
                                </p>
                                <p>
                                    Forus biedt een breed scala aan functies, van bankkoppeling voor efficiënte
                                    financiële verwerking tot het exporteren van gegevens met behulp van onze
                                    BI-tooling. Heeft u hulp nodig bij het maken van een keuze?
                                </p>
                                {envData.config.features_contact_email && (
                                    <div className="overview-details-contacts">
                                        Contact:<span>{envData.config.features_contact_email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="overview-list">
                            <div className="overview-list-wrapper">
                                {previewList?.map((column, index) => (
                                    <div className="overview-list-col" key={index}>
                                        {column.map((feature) => (
                                            <div className="overview-list-item" key={feature.key}>
                                                <div className="overview-list-item-icon">
                                                    <img
                                                        src={assetUrl(
                                                            `/assets/img/features/icons/sm/${feature.key}.svg`,
                                                        )}
                                                        alt={feature.name}
                                                    />
                                                </div>
                                                <div className="overview-list-item-title">{feature.name}</div>
                                                <div className="overview-list-item-description">
                                                    {feature.description}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-header">
                    <div className="flex">
                        <div className="flex flex-grow">
                            <div className="card-title">Onze functionaliteiten</div>
                        </div>
                        <div className="flex">
                            <div className="flex-row">
                                <div className="block block-inline-filters">
                                    <div className="form">
                                        <div className="block block-label-tabs">
                                            <div className="label-tab-set">
                                                {activeOptions?.map((viewType) => (
                                                    <div
                                                        key={viewType.value}
                                                        className={`label-tab label-tab-sm ${
                                                            filter.values.state == viewType.value ? 'active' : ''
                                                        }`}
                                                        onClick={() => filter.update({ state: viewType.value })}>
                                                        {viewType.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form">
                                        <div className="form-group">
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={filter.values.q}
                                                placeholder={translate('features.labels.search')}
                                                onChange={(e) => filter.update({ q: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-section">
                    <div className="block block-features">
                        <div className="features-description">
                            Deze functionaliteiten kunnen aan- of uitgezet worden. Elke functionaliteit laat zien of
                            deze actief is voor uw organisatie en gebruikers. Er zijn waarschijnlijk veel functies die u
                            nog niet kende.
                        </div>
                        <div className="features-separator" />
                        <FeatureList features={features} organization={activeOrganization} />
                        <div
                            className="block block-features-demo-banner block-features-demo-banner-sm"
                            style={{
                                backgroundImage: `url(${assetUrl(
                                    '/assets/img/features/img/banner-list-action-bg.jpg',
                                )}`,
                            }}>
                            <div className="features-demo-banner-info-wrapper">
                                <div className="features-demo-banner-info">
                                    <div className="features-demo-banner-title">
                                        Nieuwe functionaliteiten uitproberen
                                    </div>
                                    <div className="features-demo-banner-details">
                                        Wilt u zien hoe de nieuwe functionaliteiten werken? Neem dan contact met ons op
                                        voor een persoonlijke demonstratie. We laten u graag zien hoe het voor uw kan
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
                        <FeatureList features={featuresAfter} organization={activeOrganization} />
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
        </Fragment>
    );
}
