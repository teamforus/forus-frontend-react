import React from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useEnvData from '../../../hooks/useEnvData';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import Section from '../../elements/sections/Section';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function Sitemap() {
    const envData = useEnvData();
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();

    const translate = useTranslate();

    return (
        <BlockShowcase
            breadcrumbItems={[
                { name: translate('sitemap.breadcrumbs.home'), state: WebshopRoutes.HOME },
                { name: translate('sitemap.breadcrumbs.sitemap') },
            ]}>
            <Section type={'default'}>
                <div className="block block-sitemap">
                    <h1>{translate('sitemap.title')}</h1>
                    <ul>
                        <li>
                            <StateNavLink name={WebshopRoutes.HOME}>{translate('top_navbar.items.home')}</StateNavLink>
                        </li>
                        {envData.config.flags.fundsMenu &&
                            (authIdentity || envData.config.flags.fundsMenuIfLoggedOut) && (
                                <li>
                                    <StateNavLink name={WebshopRoutes.FUNDS}>
                                        {translate(
                                            `top_navbar.items.${envData.client_key}.funds`,
                                            null,
                                            'top_navbar.items.funds',
                                        )}
                                    </StateNavLink>
                                </li>
                            )}

                        {appConfigs?.has_internal_funds && (envData.config.flags.productsMenu || authIdentity) && (
                            <li>
                                <StateNavLink name={WebshopRoutes.PRODUCTS}>
                                    {translate('top_navbar.items.products')}
                                </StateNavLink>
                            </li>
                        )}

                        {envData.config.flags.providersMenu && (
                            <li>
                                <StateNavLink name={WebshopRoutes.PROVIDERS}>
                                    {translate('top_navbar.items.providers')}
                                </StateNavLink>
                            </li>
                        )}

                        <li>
                            <StateNavLink
                                name={WebshopRoutes.EXPLANATION}
                                target={appConfigs?.pages?.explanation?.external ? '_blank' : '_self'}>
                                {translate('top_navbar.items.explanation')}
                            </StateNavLink>
                        </li>
                        <li>
                            <StateNavLink name={WebshopRoutes.ME_APP}>
                                {translate('profile_menu.buttons.me_app')}
                            </StateNavLink>
                        </li>
                        <li>
                            <StateNavLink name={WebshopRoutes.SIGN_UP}>
                                {translate('profile_menu.buttons.provider_sign_up')}
                            </StateNavLink>
                        </li>
                    </ul>
                    {authIdentity && (
                        <ul>
                            <li>
                                <StateNavLink name={WebshopRoutes.VOUCHERS}>
                                    {translate('profile_menu.buttons.vouchers')}
                                </StateNavLink>
                            </li>

                            <li>
                                <StateNavLink name={WebshopRoutes.RESERVATIONS}>
                                    {translate('profile_menu.buttons.reservations')}
                                </StateNavLink>
                            </li>

                            <li>
                                <StateNavLink name={WebshopRoutes.NOTIFICATIONS}>
                                    {translate('profile_menu.buttons.notifications')}
                                </StateNavLink>
                            </li>
                            <li>
                                <StateNavLink name={WebshopRoutes.PREFERENCE_NOTIFICATIONS}>
                                    {translate('profile_menu.buttons.notification_preferences')}
                                </StateNavLink>
                            </li>
                            {envData.config.sessions && (
                                <li>
                                    <StateNavLink name={WebshopRoutes.SECURITY_SESSIONS}>
                                        {translate('profile_menu.buttons.sessions')}
                                    </StateNavLink>
                                </li>
                            )}
                            <li>
                                <StateNavLink name={WebshopRoutes.IDENTITY_EMAILS}>
                                    {translate('profile_menu.buttons.email_settings')}
                                </StateNavLink>
                            </li>
                        </ul>
                    )}
                </div>
            </Section>
        </BlockShowcase>
    );
}
