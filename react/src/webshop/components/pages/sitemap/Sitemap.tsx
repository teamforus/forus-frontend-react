import React from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useEnvData from '../../../hooks/useEnvData';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import Section from '../../elements/sections/Section';

export default function Sitemap() {
    const envData = useEnvData();
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();

    const translate = useTranslate();

    return (
        <BlockShowcase
            breadcrumbItems={[
                { name: translate('sitemap.breadcrumbs.home'), state: 'home' },
                { name: translate('sitemap.breadcrumbs.sitemap') },
            ]}>
            <Section type={'default'}>
                <div className="block block-sitemap">
                    <h1>{translate('sitemap.title')}</h1>
                    <ul>
                        <li>
                            <StateNavLink name="home">{translate('top_navbar.items.home')}</StateNavLink>
                        </li>
                        {envData.config.flags.fundsMenu &&
                            (authIdentity || envData.config.flags.fundsMenuIfLoggedOut) && (
                                <li>
                                    <StateNavLink name="funds">
                                        {translate(
                                            `top_navbar.items.${envData.client_key}.funds`,
                                            null,
                                            'top_navbar.items.funds',
                                        )}
                                    </StateNavLink>
                                </li>
                            )}
                        {appConfigs?.has_internal_funds &&
                            appConfigs?.products.list &&
                            (envData.config.flags.productsMenu || authIdentity) && (
                                <li>
                                    <StateNavLink name="products">
                                        {translate('top_navbar.items.products')}
                                    </StateNavLink>
                                </li>
                            )}

                        {envData.config.flags.providersMenu && (
                            <li>
                                <StateNavLink name="providers">{translate('top_navbar.items.providers')}</StateNavLink>
                            </li>
                        )}

                        <li>
                            <StateNavLink
                                name="explanation"
                                target={appConfigs?.pages?.explanation?.external ? '_blank' : '_self'}>
                                {translate('top_navbar.items.explanation')}
                            </StateNavLink>
                        </li>
                        <li>
                            <StateNavLink name="me-app">{translate('profile_menu.buttons.me_app')}</StateNavLink>
                        </li>
                        <li>
                            <StateNavLink name="sign-up">
                                {translate('profile_menu.buttons.provider_sign_up')}
                            </StateNavLink>
                        </li>
                    </ul>
                    {authIdentity && (
                        <ul>
                            <li>
                                <StateNavLink name="vouchers">
                                    {translate('profile_menu.buttons.vouchers')}
                                </StateNavLink>
                            </li>

                            <li>
                                <StateNavLink name="reservations">
                                    {translate('profile_menu.buttons.reservations')}
                                </StateNavLink>
                            </li>

                            {appConfigs?.records.list && (
                                <li>
                                    <StateNavLink name="records">
                                        {translate('profile_menu.buttons.records')}
                                    </StateNavLink>
                                </li>
                            )}

                            <li>
                                <StateNavLink name="notifications">
                                    {translate('profile_menu.buttons.notifications')}
                                </StateNavLink>
                            </li>
                            <li>
                                <StateNavLink name="preferences-notifications">
                                    {translate('profile_menu.buttons.notification_preferences')}
                                </StateNavLink>
                            </li>
                            {envData.config.sessions && (
                                <li>
                                    <StateNavLink name="security-sessions">
                                        {translate('profile_menu.buttons.sessions')}
                                    </StateNavLink>
                                </li>
                            )}
                            <li>
                                <StateNavLink name="identity-emails">
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
