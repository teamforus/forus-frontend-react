import React, { Fragment, useEffect } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useAssetUrl from '../../../hooks/useAssetUrl';
import SocialImpact from './elements/SocialImpact';
import SocialDomain from './elements/SocialDomain';
import PlatformAspects from './elements/PlatformAspects';
import Strategy from './elements/Strategy';
import Municipalities from './elements/Municipalities';
import Collaborations from './elements/Collaborations';
import LearnMore from './elements/LearnMore';

export default function Home() {
    const setTitle = useSetTitle();

    const assetUrl = useAssetUrl();

    useEffect(() => {
        setTitle('Home page.');
    }, [setTitle]);

    return (
        <Fragment>
            <header className="section section-header">
                <div className="wrapper">
                    <div className="header-content">
                        <div className="header-info">
                            <div className="header-title">Het platform voor sociale regelingen</div>
                            <div className="header-description">
                                Forus biedt een flexibel, modulair platform dat het gehele uitgifteproces van sociale
                                regelingen faciliteert. Ons doel is om de toegang tot hulp laagdrempeliger te maken en
                                zelfredzaamheid te bevorderen.
                            </div>
                        </div>
                        <div className="header-actions">
                            <div className="button-group hide-sm">
                                <div className="button button-primary button-sm">Gratis demo</div>
                                <div className="button button-dark button-sm">Ontdek de functies van ons platform</div>
                            </div>

                            <div className="button-group show-sm-flex">
                                <div className="button button-primary">Gratis demo</div>
                                <div className="button button-dark">Ontdek de functies van ons platform</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="main-content">
                <div className="wrapper">
                    <div className="block block-project">
                        <div className="block-project-main-content">
                            <div className="block-project-label">Nieuws</div>
                            <div className="block-project-title">Naar een merkbaar en meetbaar verschil!</div>
                            <div className="block-project-description">
                                Project gefinancierd door het Innovatiebudget 2023 in samenwerking met Gemeente
                                Eemsdelta en Gemeente Westerkwartier.
                            </div>
                            <div className="block-project-actions">
                                <div className="button button-light-outline">Lees meer</div>
                            </div>
                        </div>

                        <div className="block-project-image">
                            <img src={assetUrl(`/assets/img/project-block.png`)} alt="" />
                        </div>
                    </div>
                </div>

                <div className="wrapper">
                    <SocialImpact />
                </div>

                <div className="wrapper">
                    <div className="separator-dashed">
                        <img src={assetUrl(`/assets/img/icon-forus.svg`)} alt="" />
                    </div>
                </div>

                <div className="wrapper">
                    <PlatformAspects />
                </div>

                <div className="wrapper">
                    <SocialDomain />
                </div>

                <div className="wrapper">
                    <Strategy />
                </div>

                <div className="wrapper">
                    <Municipalities />
                </div>

                <Collaborations />

                <div className="wrapper">
                    <LearnMore />
                </div>
            </div>
        </Fragment>
    );
}
