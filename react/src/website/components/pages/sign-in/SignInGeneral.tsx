import React, { Fragment, useEffect } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useSetMetaDescription from '../../../hooks/useSetMetaDescription';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import SignUpBlock from './elements/SignUpBlock';
import LearnMore from '../../elements/LearnMore';
import BackgroundCircles from '../../elements/BackgroundCircles';

export default function SignInGeneral() {
    const setTitle = useSetTitle();
    const setMetaDescription = useSetMetaDescription();

    useEffect(() => {
        setTitle('Login | Het Forus-platform');
        setMetaDescription('Inloggen op het Forus-platform als aanbieder, beoordelaar of sponsor.');
    }, [setMetaDescription, setTitle]);

    return (
        <Fragment>
            <BackgroundCircles mainStyles={{ height: '650px' }} />
            <div className="wrapper">
                <div className="block block-breadcrumbs hide-sm">
                    <StateNavLink name={'home'} className="breadcrumb-item">
                        Home
                    </StateNavLink>
                    <a className="breadcrumb-item active" aria-current="location">
                        Inloggen
                    </a>
                </div>

                <div className="block block-login-type-select">
                    <div className="block-login-type-select-title">Inloggen</div>
                    <div className="block-login-type-select-description">
                        Afhankelijk van uw rol kunt u inloggen in de beheeromgeving als sponsor, aanbieder of
                        beoordelaar. Heeft u nog geen account? Meld u dan hieronder aan.
                    </div>

                    <div className="block-login-type-select-options">
                        <div className="block-login-type-select-option block-login-type-select-option-provider">
                            <StateNavLink
                                name={'sign-in-as-role'}
                                params={{ role: 'provider' }}
                                className="block-login-type-select-option-link">
                                <div className="block-login-type-select-option-icon" />
                                <div className="block-login-type-select-option-text">
                                    <div className="block-login-type-select-option-subtitle">Ik wil inloggen als</div>
                                    <div className="block-login-type-select-option-title">Aanbieder</div>
                                </div>
                            </StateNavLink>
                        </div>

                        <div className="block-login-type-select-option block-login-type-select-option-sponsor">
                            <StateNavLink
                                name={'sign-in-as-role'}
                                params={{ role: 'sponsor' }}
                                className="block-login-type-select-option-link">
                                <div className="block-login-type-select-option-icon" />
                                <div className="block-login-type-select-option-text">
                                    <div className="block-login-type-select-option-subtitle">Ik wil inloggen als</div>
                                    <div className="block-login-type-select-option-title">Sponsor</div>
                                </div>
                            </StateNavLink>
                        </div>

                        <div className="block-login-type-select-option block-login-type-select-option-validator">
                            <StateNavLink
                                name={'sign-in-as-role'}
                                params={{ role: 'validator' }}
                                className="block-login-type-select-option-link">
                                <div className="block-login-type-select-option-icon" />
                                <div className="block-login-type-select-option-text">
                                    <div className="block-login-type-select-option-subtitle">Ik wil inloggen als</div>
                                    <div className="block-login-type-select-option-title">Beoordelaar</div>
                                </div>
                            </StateNavLink>
                        </div>
                    </div>
                </div>

                <SignUpBlock />

                <div className="show-sm">
                    <br />
                    <br />
                    <LearnMore
                        title={'Klaar om uw impact te vergroten?'}
                        description={
                            'Laten we eens kijken naar de mogelijkheden en de optimale manier om uw regelingen uit te geven.'
                        }
                        buttons={[{ title: 'Gratis demo aanvragen', type: 'primary', stateName: 'book-demo' }]}
                    />
                </div>
            </div>
        </Fragment>
    );
}
