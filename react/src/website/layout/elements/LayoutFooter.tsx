import React from 'react';
import useAppConfigs from '../../hooks/useAppConfigs';
import useAssetUrl from '../../hooks/useAssetUrl';
import StateNavLink from '../../modules/state_router/StateNavLink';
import useEnvData from '../../hooks/useEnvData';
import useSetActiveMenuDropdown from '../../hooks/useSetActiveMenuDropdown';
import { useLocation } from 'react-router-dom';
import { lowerCase } from 'lodash';

export default function LayoutFooter() {
    const envData = useEnvData();
    const appConfigs = useAppConfigs();
    const location = useLocation();

    const assetUrl = useAssetUrl();
    const setActiveMenuDropdown = useSetActiveMenuDropdown();

    if (!appConfigs) {
        return null;
    }

    return (
        <div className={`layout-footer ${lowerCase(location.pathname) === 'dl' ? 'layout-footer-no-apps' : ''}`}>
            <div className="wrapper">
                <div className="block block-footer-apps">
                    <StateNavLink
                        name={'home'}
                        className="footer-apps-logo"
                        onClick={() => setActiveMenuDropdown(null)}>
                        <img src={assetUrl('/assets/img/logo.svg')} alt="" />
                    </StateNavLink>

                    <div className="footer-apps-details">
                        <div className="footer-apps-details-label">Download de Me-app</div>
                        <div className="footer-apps-detail-links">
                            <a
                                className="footer-apps-details-link footer-apps-details-link-android"
                                href={envData?.config?.android_link}
                                target={'_blank'}
                                rel="noreferrer"
                            />
                            <a
                                className="footer-apps-details-link footer-apps-details-link-ios"
                                href={envData?.config?.ios_iphone_link}
                                target={'_blank'}
                                rel="noreferrer"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="layout-footer-separator" />

            <div className="wrapper">
                <div className="block block-footer-menu">
                    <div className="footer-menu-col">
                        <div className="footer-menu-col-title">Contact</div>
                        <div className="footer-menu-col-item">
                            <div className="footer-menu-col-item-content">
                                <div className="footer-menu-col-item-title">
                                    <img src={assetUrl('/assets/img/footer-menu/footer-icon-location.svg')} alt={''} />
                                    Adres
                                </div>
                                <div className="footer-menu-col-item-subtitle">
                                    Verlengde Hereweg 161,
                                    <br />
                                    9721 AN, Groningen
                                </div>
                            </div>
                        </div>
                        <div className="footer-menu-col-item">
                            <div className="footer-menu-col-item-content">
                                <div className="footer-menu-col-item-title">
                                    <img src={assetUrl('/assets/img/footer-menu/footer-icon-support.svg')} alt={''} />
                                    Contactgegevens
                                </div>
                                <div className="footer-menu-col-item-subtitle">
                                    info@forus.io
                                    <br />
                                    +31 (0) 85 004 33 87
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer-menu-col">
                        <div className="footer-menu-col-title">Platform</div>
                        <StateNavLink name={'basic-functions'} className="footer-menu-col-item">
                            Basisfuncties
                        </StateNavLink>
                        <StateNavLink name={'roles-main'} className="footer-menu-col-item">
                            Rollen
                        </StateNavLink>
                    </div>
                    <div className="footer-menu-col">
                        <div className="footer-menu-col-title">Over ons</div>
                        <StateNavLink name={'about-us'} className="footer-menu-col-item">
                            Ons verhaal
                        </StateNavLink>
                        <StateNavLink name={'about-us-innovation'} className="footer-menu-col-item">
                            Project Innovatiebudget 2023
                        </StateNavLink>
                        <StateNavLink name={'contacts'} className="footer-menu-col-item">
                            Contact pagina
                        </StateNavLink>
                    </div>
                    <div className="footer-menu-col">
                        <div className="footer-menu-col-title">Social</div>
                        <a
                            href="https://nl.linkedin.com/company/stichtingforus"
                            className="footer-menu-col-item"
                            target="_blank"
                            rel="noreferrer">
                            <img src={assetUrl('/assets/img/footer-menu/footer-social-linkedin.svg')} alt={''} />
                            LinkedIn
                        </a>
                        <a
                            href="https://github.com/teamforus"
                            className="footer-menu-col-item"
                            target="_blank"
                            rel="noreferrer">
                            <img src={assetUrl('/assets/img/footer-menu/footer-social-github.svg')} alt={''} />
                            Github
                        </a>
                        <a
                            href="https://discord.forus.io"
                            className="footer-menu-col-item"
                            target="_blank"
                            rel="noreferrer">
                            <img src={assetUrl('/assets/img/footer-menu/footer-social-discord.svg')} alt={''} />
                            Discord
                        </a>
                    </div>
                </div>
            </div>

            <div className="block block-footer-copyright">
                <div className="footer-copyright-wrapper">
                    <div className="footer-copyright-value">© 2024 Forus</div>
                    <StateNavLink name={'privacy'} className="footer-copyright-privacy">
                        Privacyverklaring
                    </StateNavLink>
                </div>
            </div>
        </div>
    );
}
