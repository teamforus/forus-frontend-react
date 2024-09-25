import React, { Fragment, useEffect, useState } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import LearnMore from '../../elements/LearnMore';
import RolesSelector from './elements/RolesSelector';
import RolesBanner from './elements/RolesBanner';
import useSetMetaDescription from '../../../hooks/useSetMetaDescription';
import Step1 from './elements/provider-steps/Step1';
import Step2 from './elements/provider-steps/Step2';
import Step3 from './elements/provider-steps/Step3';
import Step4 from './elements/provider-steps/Step4';
import Step5 from './elements/provider-steps/Step5';
import Step6 from './elements/provider-steps/Step6';
import Step7 from './elements/provider-steps/Step7';
import BackgroundCircles from '../../elements/BackgroundCircles';

export default function RolesProvider() {
    const setTitle = useSetTitle();
    const setMetaDescription = useSetMetaDescription();

    const [bannerTitle] = useState('Aanbieder');
    const [bannerDescription] = useState(
        [
            'Een organisatie die producten of diensten aanbiedt in het Forus-systeem kan zowel een lokale',
            'onderneming als een landelijke winkelketen zijn. ',
            '<br /><br />Het Forus-systeem is ontworpen om aanbieders in staat te stellen zelfstandig te werken. Door ',
            'toegang te bieden tot een beheeromgeving voor hun organisatie kunnen ze bijv. zelf aanbod ',
            'opstellen, transacties uitvoeren en monitoren.',
        ].join(''),
    );

    useEffect(() => {
        setTitle('Platform voor Aanbieders | Efficiënt beheer van producten & transacties');
        setMetaDescription(
            'Het Forus-platform biedt aanbieders de mogelijkheid om zelfstandig hun producten of diensten aan te bieden en te beheren.',
        );
    }, [setMetaDescription, setTitle]);

    return (
        <Fragment>
            <BackgroundCircles />
            <RolesBanner type={'provider'} title={bannerTitle} description={bannerDescription} />

            <div className="main-content">
                <div
                    className="background-overlay hide-sm"
                    style={{ backgroundImage: 'url("./assets/img/background-provider.svg")' }}
                />

                <div className="wrapper">
                    <RolesSelector activeType={'provider'} />

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
                            <Step1 type="image" />
                            <Step2 type="info" />
                            <Step3 type="image" />
                            <Step4 type="info" />
                            <Step5 type="image" />
                            <Step6 type="info" />
                            <Step7 type="image" />
                            <Step7 type="info" />
                        </div>
                        <div className="block-image-list-right">
                            <Step1 type="info" />
                            <Step2 type="image" />
                            <Step3 type="info" />
                            <Step4 type="image" />
                            <Step5 type="info" />
                            <Step6 type="image" />
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
                    </div>
                </div>

                <div className="wrapper">
                    <LearnMore
                        title={'Klaar om uw impact te vergroten?'}
                        description={
                            'Laten we eens kijken naar de mogelijkheden en de optimale manier om uw regelingen uit te geven.'
                        }
                        buttons={[{ title: 'Gratis demo aanvragen', type: 'dark', stateName: 'book-demo' }]}
                        backgroundColor={'#F9F3DD'}
                    />
                </div>
            </div>
        </Fragment>
    );
}
