import React, { Fragment, useEffect } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useSetMetaDescription from '../../../hooks/useSetMetaDescription';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useAppConfigs from '../../../hooks/useAppConfigs';
import SignInBlock from './elements/SignInBlock';
import LearnMore from '../../elements/LearnMore';

export default function SignUp() {
    const appConfigs = useAppConfigs();
    const setTitle = useSetTitle();
    const setMetaDescription = useSetMetaDescription();

    useEffect(() => {
        setTitle('Maak een nieuw account | Het Forus-platform');
        setMetaDescription('Maak een nieuw account op het Forus-platform als aanbieder, beoordelaar of sponsor.');
    }, [setMetaDescription, setTitle]);

    return (
        <Fragment>
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
                    <div className="block-login-type-select-title">Maak een nieuw account aan</div>
                    <div className="block-login-type-select-description">
                        Afhankelijk van uw rol kunt u aanmelden in de beheeromgeving als sponsor, aanbieder of
                        beoordelaar. Heeft u al een account? Log dan hieronder in.
                    </div>

                    <div className="block-login-type-select-options">
                        <div className="block-login-type-select-option block-login-type-select-option-provider">
                            <a
                                href={appConfigs.fronts?.url_provider}
                                target="_blank"
                                className="block-login-type-select-option-link"
                                rel="noreferrer">
                                <div className="block-login-type-select-option-icon" />
                                <div className="block-login-type-select-option-text">
                                    <div className="block-login-type-select-option-subtitle">
                                        Ik wil me aanmelden als
                                    </div>
                                    <div className="block-login-type-select-option-title">Aanbieder</div>
                                </div>
                            </a>
                        </div>

                        <div className="block-login-type-select-option block-login-type-select-option-sponsor">
                            <a
                                href={appConfigs.fronts?.url_sponsor}
                                target="_blank"
                                className="block-login-type-select-option-link"
                                rel="noreferrer">
                                <div className="block-login-type-select-option-icon" />
                                <div className="block-login-type-select-option-text">
                                    <div className="block-login-type-select-option-subtitle">
                                        Ik wil me aanmelden als
                                    </div>
                                    <div className="block-login-type-select-option-title">Sponsor</div>
                                </div>
                            </a>
                        </div>

                        <div className="block-login-type-select-option block-login-type-select-option-validator">
                            <a
                                href={appConfigs.fronts?.url_validator}
                                target="_blank"
                                className="block-login-type-select-option-link"
                                rel="noreferrer">
                                <div className="block-login-type-select-option-icon" />
                                <div className="block-login-type-select-option-text">
                                    <div className="block-login-type-select-option-subtitle">
                                        Ik wil me aanmelden als
                                    </div>
                                    <div className="block-login-type-select-option-title">Beoordelaar</div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                <SignInBlock />

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
