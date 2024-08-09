import React, { Fragment, useEffect } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import SocialImpact from './elements/SocialImpact';
import SocialDomain from './elements/SocialDomain';
import PlatformAspects from './elements/PlatformAspects';
import Strategy from './elements/Strategy';
import Municipalities from './elements/Municipalities';
import Collaborations from './elements/Collaborations';
import LearnMore from '../../elements/LearnMore';
import BlockMainBanner from './elements/BlockMainBanner';
import BlockProject from './elements/BlockProject';
import BlockDashedSeparator from './elements/BlockDashedSeparator';

export default function Home() {
    const setTitle = useSetTitle();

    useEffect(() => {
        setTitle('Home page.');
    }, [setTitle]);

    return (
        <Fragment>
            <BlockMainBanner />

            <div className="wrapper">
                <BlockProject />
                <SocialImpact />
            </div>

            <BlockDashedSeparator />

            <div className="wrapper">
                <SocialDomain />
                <PlatformAspects />
                <Strategy />
                <Municipalities />
            </div>

            <Collaborations />

            <div className="wrapper">
                <LearnMore
                    title={'Klaar om uw impact te vergroten?'}
                    description={
                        'Laten we samen kijken naar de mogelijkheden en de optimale manier om uw regelingen uit te geven.'
                    }
                />
            </div>
        </Fragment>
    );
}
