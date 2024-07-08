import React from 'react';
import useAssetUrl from '../../hooks/useAssetUrl';

export default function PreviewPageFooter() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block-page-list-footer">
            <div className="block-page-list-footer-icon">
                <img src={assetUrl(`/assets/img/email-icon.svg`)} alt="" />
            </div>

            <div className="block-page-list-footer-info">
                <div className="block-page-list-footer-title">Vragen of aanvullende informatie?</div>
                <div className="block-page-list-footer-subtitle">
                    Mocht u nog vragen hebben of wilt u aanvullende informatie dan kunt u ons bellen op:
                    <br />
                    <strong>+31 (0) 85 004 33 87</strong> of contact opnemen via e-mail{' '}
                    <strong>support@forus.io</strong>
                </div>
            </div>

            <div className="block-page-list-footer-auth">
                <div className="block-page-list-footer-auth-option">
                    <img src={assetUrl(`/assets/img/login-icon.svg`)} alt="" />
                    Inloggen
                </div>

                <div className="block-page-list-footer-auth-option">
                    <img src={assetUrl(`/assets/img/demo-icon.svg`)} alt="" />
                    Gratis demo
                </div>
            </div>
        </div>
    );
}
