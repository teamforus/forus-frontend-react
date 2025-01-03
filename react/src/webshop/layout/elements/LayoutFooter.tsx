import React, { useContext, useMemo, useState } from 'react';
import useAppConfigs from '../../hooks/useAppConfigs';
import { mainContext } from '../../contexts/MainContext';
import StateNavLink from '../../modules/state_router/StateNavLink';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import Markdown from '../../components/elements/markdown/Markdown';
import useEnvData from '../../hooks/useEnvData';
import useAssetUrl from '../../hooks/useAssetUrl';
import AppLinks from '../../components/elements/app-links/AppLinks';
import Icon from '../../../../assets/forus-webshop/resources/_webshop-common/assets/img/me-logo.svg';

export default function LayoutFooter() {
    const translate = useTranslate();

    const envData = useEnvData();
    const appConfigs = useAppConfigs();
    const assetUrl = useAssetUrl();

    const { mobileMenuOpened } = useContext(mainContext);
    const [footerPageKeys] = useState(['privacy', 'accessibility', 'terms_and_conditions']);

    const pageLinks = useMemo(() => {
        return Object.values(appConfigs?.pages || {}).filter((page) => {
            return footerPageKeys.includes(page.page_type);
        });
    }, [appConfigs?.pages, footerPageKeys]);

    if (!appConfigs || mobileMenuOpened) {
        return null;
    }

    return (
        <footer className="section section-footer" id="footer">
            <div className="wrapper">
                <div className="block block-footer">
                    <div className="row">
                        <h2 className="sr-only">Site informatie</h2>
                        <div className="col col-md-4">
                            {appConfigs?.pages?.footer_contact_details?.description_html && (
                                <Markdown content={appConfigs?.pages?.footer_contact_details?.description_html || ''} />
                            )}
                            {appConfigs.social_medias.length > 0 && (
                                <div className="footer-social-medias">
                                    <div className="footer-social-media-title">Volg ons op:</div>
                                    <div className="footer-social-media-icons flex">
                                        {appConfigs.social_medias?.map((social_media, index) => (
                                            <a
                                                key={`social_media${social_media.type}_${index}`}
                                                className="footer-social-media-icon"
                                                href={social_media.url}
                                                title={social_media.title}
                                                target="_blank"
                                                rel="noreferrer">
                                                <em className={`mdi mdi-${social_media.type}`} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {appConfigs?.pages?.footer_opening_times?.description_html && (
                            <div className="col col-md-4">
                                <Markdown content={appConfigs?.pages?.footer_opening_times?.description_html || ''} />
                            </div>
                        )}

                        <div
                            className={`col ${
                                appConfigs?.pages?.footer_opening_times?.description_html ? 'col-md-3' : 'col-md-4'
                            }`}>
                            {appConfigs.pages.provider && (
                                <div className="block block-markdown">
                                    <h3>{translate('app_footer.columns.links')}</h3>
                                    <nav className="footer-nav">
                                        <div className="footer-nav-item">
                                            <StateNavLink name="sign-up" target="_self">
                                                {translate('app_footer.provider_sign_up')}
                                            </StateNavLink>
                                        </div>
                                    </nav>
                                </div>
                            )}
                        </div>

                        <div className="col col-md-3">
                            <div
                                className={`flex flex-vertical ${
                                    appConfigs?.pages?.footer_app_info?.description_position == 'after'
                                        ? 'flex-vertical-reverse'
                                        : ''
                                }`}>
                                {appConfigs?.pages?.footer_app_info?.description_html && (
                                    <div className="block block-markdown">
                                        <Markdown content={appConfigs?.pages?.footer_app_info?.description_html} />
                                    </div>
                                )}
                                {(!appConfigs?.pages?.footer_app_info?.description_html ||
                                    appConfigs?.pages?.footer_app_info?.description_position !== 'replace') && (
                                    <div>
                                        {appConfigs && (
                                            <div className="block block-markdown">
                                                <h3>{translate('app_footer.columns.me_app')}</h3>
                                                <AppLinks
                                                    theme={envData.config?.flags.useLightAppIcons ? 'light' : 'dark'}
                                                />
                                                <nav className="footer-nav">
                                                    <div className="footer-nav-item">
                                                        <div className="flex">
                                                            <span aria-hidden="true">
                                                                <Icon />
                                                            </span>
                                                            <StateNavLink name="me-app" target="_blank">
                                                                {translate('app_footer.me_app_more_info')}
                                                            </StateNavLink>
                                                        </div>
                                                    </div>
                                                </nav>
                                            </div>
                                        )}
                                        <div className="footer-sponsor-logo">
                                            {envData.config.flags.showFooterSponsorLogo && (
                                                <img
                                                    className="footer-sponsor-logo-img"
                                                    alt="Sponsor logo"
                                                    src={assetUrl('/assets/img/logo-footer.png')}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="block block-copyrights">
                <div className="wrapper">
                    <div className="copyrights"></div>
                    <div className="links">
                        {pageLinks?.map((pageLink, index) => (
                            <div className="link-item" key={index}>
                                <StateNavLink name={pageLink.page_type} target={pageLink.external ? '_blank' : '_self'}>
                                    {translate(`app_footer.links.${pageLink.page_type}`)}
                                </StateNavLink>
                            </div>
                        ))}
                        <div className="link-item">
                            <StateNavLink name="sitemap" target="_self">
                                {translate('app_footer.links.sitemap')}
                            </StateNavLink>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
