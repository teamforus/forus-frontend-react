import React from 'react';
import useAssetUrl from '../../hooks/useAssetUrl';
import StateNavLink from '../../modules/state_router/StateNavLink';
import useSetActiveMenuDropdown from '../../hooks/useSetActiveMenuDropdown';
import useAuthIdentity from '../../hooks/useAuthIdentity';

export default function PreviewPageFooter() {
    const assetUrl = useAssetUrl();
    const authIdentity = useAuthIdentity();
    const setActiveMenuDropdown = useSetActiveMenuDropdown();

    return (
        <div className="block-page-list-footer">
            <div className="block-page-list-footer-icon">
                <img src={assetUrl(`/assets/img/email-icon.svg`)} alt="" />
            </div>

            <div className="block-page-list-footer-info">
                <div className="block-page-list-footer-title">Vragen of meer informatie ontvangen?</div>
                <div className="block-page-list-footer-subtitle">
                    Mocht u nog vragen hebben of wilt u aanvullende informatie ontvangen, dan kunt u ons bellen op:
                    <br />
                    <strong>+31 (0) 85 004 33 87</strong> of contact opnemen via e-mail{' '}
                    <strong>support@forus.io</strong>
                </div>
            </div>

            <div className="block-page-list-footer-auth">
                {!authIdentity && (
                    <StateNavLink
                        name={'sign-in'}
                        className="block-page-list-footer-auth-option"
                        onClick={() => setActiveMenuDropdown(null)}>
                        <img src={assetUrl(`/assets/img/login-icon.svg`)} alt="" />
                        Inloggen
                    </StateNavLink>
                )}

                <StateNavLink
                    name={'book-demo'}
                    className="block-page-list-footer-auth-option"
                    onClick={() => setActiveMenuDropdown(null)}>
                    <img src={assetUrl(`/assets/img/demo-icon.svg`)} alt="" />
                    Gratis demo
                </StateNavLink>
            </div>
        </div>
    );
}
