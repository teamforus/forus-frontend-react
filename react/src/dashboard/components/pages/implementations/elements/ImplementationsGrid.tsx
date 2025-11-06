import React, { useMemo, useState } from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import { useParams } from 'react-router';
import FormPane from '../../../elements/forms/elements/FormPane';
import CmsMenuBackgroundIcon from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/cms-menu-background.svg';
import FormGroup from '../../../elements/forms/elements/FormGroup';
import FormPaneContainer from '../../../elements/forms/elements/FormPaneContainer';
import { hasPermission } from '../../../../helpers/utils';
import { Permission } from '../../../../props/models/Organization';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

type GridItem = {
    key: string;
    icon: string;
    name: string;
    description: string;
    state?: DashboardRoutes;
    disabled?: boolean;
};

type GridSection = {
    title: string;
    items: GridItem[];
};

export default function ImplementationsGrid() {
    const activeOrganization = useActiveOrganization();
    const { id } = useParams();
    const [search, setSearch] = useState<string>(null);

    const sections = useMemo<GridSection[] | null>(() => {
        const canManageImplementation = hasPermission(activeOrganization, Permission.MANAGE_IMPLEMENTATION);
        const showTranslations = activeOrganization.allow_translations && canManageImplementation;
        const showPreCheck = activeOrganization.allow_pre_checks && canManageImplementation;

        const allSections: GridSection[] = [
            {
                title: 'Content',
                items: [
                    {
                        key: 'banner',
                        icon: 'mdi-image-area',
                        name: 'Homepagina banner',
                        description: 'Pas de homepagina banner en kopteksten van de website aan.',
                        state: DashboardRoutes.IMPLEMENTATION_VIEW_BANNER,
                    },
                    {
                        key: 'pages',
                        icon: 'mdi-file-document-multiple-outline',
                        name: "Pagina's",
                        description: "Beheer pagina's en blokken die zichtbaar zijn op de website.",
                        state: DashboardRoutes.IMPLEMENTATION_VIEW_PAGES,
                    },
                    {
                        key: 'webshop-settings',
                        icon: 'mdi-cog-outline',
                        name: 'Website instellingen',
                        description: 'Kies welke onderdelen op de website te zien zijn.',
                        state: DashboardRoutes.IMPLEMENTATION_CONFIG,
                    },
                    showPreCheck
                        ? {
                              key: 'precheck',
                              icon: 'mdi-text-box-search-outline',
                              name: 'Regelingencheck',
                              description:
                                  'Stel in of de banner op de website zichtbaar is, welke vragen worden getoond en hoe de voorwaarden meetellen in het advies.',
                              state: DashboardRoutes.IMPLEMENTATION_PRE_CHECK,
                          }
                        : null,
                ].filter((item) => item),
            },
            {
                title: 'Toestemming en communicatie',
                items: [
                    {
                        key: 'cookie-notification',
                        icon: 'mdi-cookie-alert-outline',
                        name: 'Cookiemelding',
                        description: 'Toon cookie-informatie en beheer toestemmingen.',
                        state: DashboardRoutes.IMPLEMENTATION_COOKIES,
                    },
                    {
                        key: 'terms-privacy',
                        icon: 'mdi-shield-check-outline',
                        name: 'Privacy en voorwaarden',
                        description:
                            'Schakel in of de deelnemer akkoord moet gaan met de privacy en voorwaarden bij het aanmaken van een account.',
                        state: DashboardRoutes.IMPLEMENTATION_TERMS_PRIVACY,
                    },
                    {
                        key: 'announcements',
                        icon: 'mdi-bullhorn-outline',
                        name: 'Aankondigingen',
                        description: 'Plaats berichten op belangrijke updates op de website te laten zien.',
                        state: DashboardRoutes.IMPLEMENTATION_ANNOUNCEMENTS,
                    },
                    {
                        key: 'notifications',
                        icon: 'mdi-message-alert-outline',
                        name: 'Systeemberichten',
                        description: 'Bekijk en bewerk de systeemberichten van de website per fonds.',
                        state: DashboardRoutes.IMPLEMENTATION_NOTIFICATIONS,
                    },
                    {
                        key: 'social-settings',
                        icon: 'mdi-share-variant-outline',
                        name: 'Social media',
                        description: 'Beheer de links naar de social media accounts.',
                        state: DashboardRoutes.IMPLEMENTATION_SOCIAL_MEDIA,
                    },
                    showTranslations
                        ? {
                              key: 'translations',
                              icon: 'mdi-translate',
                              name: 'Talen en vertalingen',
                              description: 'Beheer beschikbare talen en vertalingen voor de website.',
                              state: DashboardRoutes.IMPLEMENTATION_TRANSLATIONS,
                          }
                        : null,
                ].filter((item) => item),
            },
            {
                title: 'Integraties en beheer',
                items: [
                    {
                        key: 'digid-settings',
                        icon: 'mdi-shield-key-outline',
                        name: 'DigiD-instellingen',
                        description: 'Beheer de DigiD gegevens en instellingen die horen bij de koppeling.',
                        state: DashboardRoutes.IMPLEMENTATION_DIGID,
                    },
                    {
                        key: 'funds',
                        icon: 'mdi-link-variant',
                        name: 'Gekoppelde fondsen',
                        description:
                            'Bekijk gekoppelde fondsen en beheer de instellingen voor de backoffice koppeling.',
                        state: DashboardRoutes.IMPLEMENTATION_FUNDS,
                    },
                    {
                        key: 'email-settings',
                        icon: 'mdi-email-outline',
                        name: 'E-mailinstellingen',
                        description: 'Stel de afzendernaam en het afzenderadres in voor e-mails uit het systeem.',
                        state: DashboardRoutes.IMPLEMENTATION_EMAIL,
                    },
                    {
                        key: 'notifications',
                        icon: 'mdi-message-alert-outline',
                        name: 'Systeemberichten',
                        description: 'Bekijk en bewerk de systeemberichten van de website per fonds.',
                        state: DashboardRoutes.IMPLEMENTATION_NOTIFICATIONS,
                    },
                ].filter((item) => item),
            },
        ];

        const normalizedSearch = (search || '').trim().toLowerCase();

        if (!normalizedSearch) {
            return allSections;
        }

        const filteredSections = allSections
            .map((section) => ({
                ...section,
                items: section.items.filter((item) => {
                    const name = item.name.toLowerCase();
                    const description = item.description.toLowerCase();

                    return name.includes(normalizedSearch) || description.includes(normalizedSearch);
                }),
            }))
            .filter((section) => section.items.length > 0);

        return filteredSections.length > 0 ? filteredSections : null;
    }, [activeOrganization, search]);

    return (
        <div className="card form">
            <div className="card-header">
                <div className="card-title flex flex-grow">Overzicht van instellingen</div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <FormGroup
                            input={() => (
                                <input
                                    className="form-control"
                                    type="text"
                                    value={search || ''}
                                    placeholder="Zoeken"
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>
            <FormPaneContainer className="card-section">
                {sections?.map((section) => (
                    <FormPane title={section.title} key={section.title}>
                        <div className="block block-cms-menu">
                            {section.items.map((item) => (
                                <StateNavLink
                                    key={item.key}
                                    name={item.state || DashboardRoutes.IMPLEMENTATION}
                                    params={{
                                        organizationId: activeOrganization.id,
                                        id: id,
                                    }}
                                    className={'block-cms-menu-item'}>
                                    <span className="block-cms-menu-icon">
                                        <CmsMenuBackgroundIcon />
                                        <em className={`mdi ${item.icon}`} />
                                    </span>
                                    <span className="block-cms-menu-content">
                                        <span className="block-cms-menu-name">
                                            {item.name}
                                            {item?.disabled && ' <stub>'}
                                        </span>
                                        <span className="block-cms-menu-description">{item.description}</span>
                                    </span>
                                </StateNavLink>
                            ))}
                        </div>
                    </FormPane>
                ))}

                {sections?.length === 0 && <EmptyCard type={'card-section'} title={'Geen resultaten gevonden.'} />}
            </FormPaneContainer>
        </div>
    );
}
