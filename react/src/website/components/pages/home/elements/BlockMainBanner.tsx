import React from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

export default function BlockMainBanner() {
    return (
        <div className="block block-main-banner">
            <div className="banner-content">
                <div className="banner-info">
                    <div className="banner-title">Het platform voor sociale regelingen</div>
                    <div className="banner-description">
                        Forus biedt een modulair platform dat het gehele uitgifteproces van sociale regelingen
                        faciliteert voor inwoners, gemeenten, goede doelen, ondernemers en andere partijen. Ons
                        gezamenlijke doel: mensen helpen door processen te versimpelen, zelfredzaamheid te bevorderen en
                        een laagdrempelige toegang tot sociale initiatieven te bieden.
                    </div>
                </div>
                <div className="banner-actions">
                    <StateNavLink name={'book-demo'} className="button button-primary">
                        Gratis demo
                    </StateNavLink>
                    <StateNavLink name={'basic-functions'} className="button button-dark">
                        Ontdek de functies van ons platform
                    </StateNavLink>
                </div>
            </div>

            <div className="banner-media">
                <div className="banner-media-image" />
            </div>
        </div>
    );
}
