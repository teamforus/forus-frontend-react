import React, { Fragment, useEffect } from 'react';
import StateNavLink from '../../modules/state_router/StateNavLink';
import useAssetUrl from '../../hooks/useAssetUrl';
import BlockDashedSeparator from '../pages/home/elements/BlockDashedSeparator';
import LearnMore from '../elements/LearnMore';
import { useNavigateState } from '../../modules/state_router/Router';
import { useLocation, useNavigate } from 'react-router-dom';
import AboutUsBlock from '../elements/AboutUsBlock';
import BackgroundCircles from '../elements/BackgroundCircles';

export default function NotFound({ error = '404' }: { error?: string }) {
    const assetUrl = useAssetUrl();
    const navigateState = useNavigateState();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        switch (location.pathname) {
            case '/news':
                navigateState('about-us-innovation');
                break;
            case '/research':
                navigateState('about-us-innovation');
                break;
            case '/systeem':
                navigateState('basic-functions');
                break;
            case '/me':
                navigateState('me-app');
                break;
            case '/nu':
                navigateState('about');
                break;
        }
    }, [location, location.hash, navigateState]);

    return (
        <Fragment>
            <BackgroundCircles />
            <div className="wrapper">
                <div className="block block-error-page">
                    <div className="page-not-found-title">{error}</div>
                    <div className="page-not-found-subtitle">
                        De pagina die u probeert te bereiken bestaat niet (meer).
                    </div>
                    <div className="page-not-found-actions">
                        <div className="button button-primary" onClick={() => navigate(-1)}>
                            <span>Ga terug</span>
                        </div>
                        <StateNavLink name="home" className="button button-dark">
                            <span>Naar home</span>
                        </StateNavLink>
                    </div>
                    <div className="page-not-found-image">
                        <img src={assetUrl('/assets/img/404.svg')} alt="" />
                    </div>
                </div>
            </div>

            <BlockDashedSeparator />

            <div className="wrapper">
                <AboutUsBlock />

                <LearnMore
                    title={'Klaar om uw impact te vergroten?'}
                    hideAboutUsButton={true}
                    description={
                        'Laten we eens kijken naar de mogelijkheden en de optimale manier om uw regelingen uit te geven.'
                    }
                />
            </div>
        </Fragment>
    );
}
