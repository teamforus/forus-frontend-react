import React, { Fragment, useEffect, useState } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import LearnMore from '../../elements/LearnMore';
import RolesSelector from './elements/RolesSelector';
import RolesBanner from './elements/RolesBanner';
import useSetMetaDescription from '../../../hooks/useSetMetaDescription';
import Step1 from './elements/sponsor-steps/Step1';
import Step2 from './elements/sponsor-steps/Step2';
import Step3 from './elements/sponsor-steps/Step3';
import Step4 from './elements/sponsor-steps/Step4';
import Step5 from './elements/sponsor-steps/Step5';
import Step6 from './elements/sponsor-steps/Step6';
import Step7 from './elements/sponsor-steps/Step7';
import Step8 from './elements/sponsor-steps/Step8';
import Step9 from './elements/sponsor-steps/Step9';
import Step10 from './elements/sponsor-steps/Step10';
import BackgroundCircles from '../../elements/BackgroundCircles';

export default function RolesSponsor() {
    const setTitle = useSetTitle();
    const setMetaDescription = useSetMetaDescription();

    const [bannerTitle] = useState('Sponsor');
    const [bannerDescription] = useState(
        [
            'Een organisatie die financiële middelen beschikbaar stelt voor deelnemers in het ',
            'Forus-systeem, zoals gemeenten of sociale ketenpartners. ',
            '<br /><br />Het Forus-platform is ontwikkeld om het volledige proces van regelingenuitgifte te ',
            'faciliteren, van de opzet van de regelingen en aanvraagprocedure tot het monitoren en ',
            'evalueren van de impact.',
        ].join(''),
    );

    useEffect(() => {
        setTitle('Platform voor Sponsors | Effectieve uitgifte van regelingen');
        setMetaDescription(
            'Het Forus platform is zorgvuldig ontworpen om het volledige proces van uitgifte van sociale regelingen te ondersteunen.',
        );
    }, [setMetaDescription, setTitle]);

    return (
        <Fragment>
            <BackgroundCircles />
            <RolesBanner type={'sponsor'} title={bannerTitle} description={bannerDescription} />

            <div className="main-content">
                <div
                    className="background-overlay hide-sm"
                    style={{ backgroundImage: 'url("./assets/img/background-sponsor.svg")' }}
                />

                <div className="wrapper">
                    <RolesSelector activeType={'sponsor'} />

                    <div className="block block-info block-info-overview">
                        <div className="block-info-title block-info-title-sm text-left">
                            Functionaliteiten en overzicht
                        </div>
                        <div className="block-info-separator">
                            <div className="line" />
                        </div>
                    </div>
                </div>

                <div className="wrapper">
                    <div className="block block-image-list hide-sm">
                        <div className="block-image-list-left">
                            <Step1 type={'image'} />
                            <Step2 type={'info'} />
                            <Step3 type={'image'} />
                            <Step4 type={'info'} />
                            <Step5 type={'image'} />
                            <Step6 type={'info'} />
                            <Step7 type={'image'} />
                            <Step8 type={'info'} />
                            <Step9 type={'image'} />
                            <Step10 type={'info'} />
                        </div>
                        <div className="block-image-list-right">
                            <Step1 type={'info'} />
                            <Step2 type={'image'} />
                            <Step3 type={'info'} />
                            <Step4 type={'image'} />
                            <Step5 type={'info'} />
                            <Step6 type={'image'} />
                            <Step7 type={'info'} />
                            <Step8 type={'image'} />
                            <Step9 type={'info'} />
                            <Step10 type={'image'} />
                        </div>
                    </div>

                    <div className="block block-image-list show-sm">
                        <Step1 />
                        <Step2 />
                        <Step3 />
                        <Step4 />
                        <Step5 />
                        <Step6 />
                        <Step7 />
                        <Step8 />
                        <Step9 />
                        <Step10 />
                    </div>
                </div>

                <div className="wrapper">
                    <LearnMore
                        title={'Klaar om uw impact te vergroten?'}
                        description={
                            'Laten we eens kijken naar de mogelijkheden en de optimale manier om uw regelingen uit te geven.'
                        }
                        buttons={[{ title: 'Gratis demo aanvragen', type: 'dark', stateName: 'book-demo' }]}
                        backgroundColor={'#EBE9FE'}
                    />
                </div>
            </div>
        </Fragment>
    );
}
