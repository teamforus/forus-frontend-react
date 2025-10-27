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

type GridItem = {
    key: string;
    icon: string;
    name: string;
    description: string;
    state?: string;
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
                title: 'Content en lokalisatie',
                items: [
                    {
                        key: 'banner',
                        icon: 'mdi-image-area',
                        name: 'Homepage-banner',
                        description: 'Pas de hero-banner en kopteksten van de webshop aan.',
                        state: 'implementation-view-banner',
                    },
                    {
                        key: 'pages',
                        icon: 'mdi-file-document-multiple-outline',
                        name: "Pagina's",
                        description: "Beheer pagina's en blokken die zichtbaar zijn voor bezoekers.",
                        state: 'implementation-view-pages',
                    },
                    showTranslations
                        ? {
                              key: 'translations',
                              icon: 'mdi-translate',
                              name: 'Talen en vertalingen',
                              description: 'Beheer beschikbare talen en vertalingen voor de webshop.',
                              state: 'implementations-translations',
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
                        state: 'implementations-cookies',
                    },
                    {
                        key: 'terms-privacy',
                        icon: 'mdi-shield-check-outline',
                        name: 'Privacy en voorwaarden',
                        description:
                            'Schakel de toestemmingsvinkjes voor privacy en voorwaarden op de webshop in of uit.',
                        state: 'implementation-terms-privacy',
                    },
                    {
                        key: 'announcements',
                        icon: 'mdi-bullhorn-outline',
                        name: 'Aankondigingen',
                        description: 'Publiceer aankondigingen om belangrijke updates op de webshop uit te lichten.',
                        state: 'implementation-announcements',
                    },
                    {
                        key: 'email-settings',
                        icon: 'mdi-email-outline',
                        name: 'E-mailinstellingen',
                        description: 'Stel de afzendernaam en het afzenderadres voor webshopmails in.',
                        state: 'implementations-email',
                    },
                    {
                        key: 'social-settings',
                        icon: 'mdi-share-variant-outline',
                        name: 'Socialmediakanalen',
                        description: 'Beheer de socialmedia-links van de webshop.',
                        state: 'implementations-social-media',
                    },
                ].filter((item) => item),
            },
            {
                title: 'Integraties en beheer',
                items: [
                    {
                        key: 'webshop-settings',
                        icon: 'mdi-cog-outline',
                        name: 'Webshopinstellingen',
                        description: 'Beheer contactgegevens en algemene configuratiewaarden.',
                        state: 'implementations-config',
                    },
                    {
                        key: 'digid-settings',
                        icon: 'mdi-shield-key-outline',
                        name: 'DigiD-instellingen',
                        description: 'Beheer de DigiD-inloggegevens en schakel webshoptoegang in of uit.',
                        state: 'implementations-digid',
                    },
                    {
                        key: 'funds',
                        icon: 'mdi-link-variant',
                        name: 'Gekoppelde fondsen',
                        description: 'Bekijk gekoppelde fondsen en beheer hun backoffice-integratie-instellingen.',
                        state: 'implementation-funds',
                    },
                    {
                        key: 'notifications',
                        icon: 'mdi-message-alert-outline',
                        name: 'Systeemmeldingen',
                        description: 'Bekijk en bewerk systeemmeldingen van de implementatie.',
                        state: 'implementation-notifications',
                    },
                    showPreCheck
                        ? {
                              key: 'precheck',
                              icon: 'mdi-text-box-search-outline',
                              name: 'Precheck-instellingen voor fondsen',
                              description: 'Configureer precheckvereisten voor fondsen binnen de implementatie.',
                              state: 'implementation-pre-check',
                          }
                        : null,
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
                <div className="card-title flex flex-grow">Instellingenoverzicht</div>
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
                                    name={item.state || 'implementation-view'}
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
