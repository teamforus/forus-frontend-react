import React, { Fragment, useEffect, useState } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import LearnMore from '../../elements/LearnMore';
import RolesSelector from './elements/RolesSelector';
import RolesBanner from './elements/RolesBanner';
import useSetMetaDescription from '../../../hooks/useSetMetaDescription';
import Step1 from './elements/requester-steps/Step1';
import Step2 from './elements/requester-steps/Step2';
import Step3 from './elements/requester-steps/Step3';
import Step4 from './elements/requester-steps/Step4';
import Step5 from './elements/requester-steps/Step5';
import Step6 from './elements/requester-steps/Step6';
import BackgroundCircles from '../../elements/BackgroundCircles';

export default function RolesRequester() {
    const setTitle = useSetTitle();
    const setMetaDescription = useSetMetaDescription();

    const [bannerTitle] = useState('Aanvrager /Deelnemer');
    const [bannerDescription] = useState(
        [
            "Binnen het Forus-systeem wordt iemand die een aanvraag voor een regeling indient, gezien als een <i>'aanvrager'</i>. ",
            "Zodra deze aanvraag is goedgekeurd, verandert de status van deze persoon in het systeem naar <i>'deelnemer'</i>.",
        ].join(''),
    );

    useEffect(() => {
        setTitle('Platform voor Deelnemers | Laagdrempelige toegang tot hulp');
        setMetaDescription(
            'Met het Forus-platform krijgen deelnemers makkelijk en snel toegang tot de hulp die ze nodig hebben.',
        );
    }, [setMetaDescription, setTitle]);

    return (
        <Fragment>
            <BackgroundCircles />
            <RolesBanner type={'requester'} title={bannerTitle} description={bannerDescription} />

            <div className="main-content">
                <div
                    className="background-overlay hide-sm"
                    style={{ backgroundImage: 'url("./assets/img/background-requester.svg")' }}
                />

                <div className="wrapper">
                    <RolesSelector activeType={'requester'} />

                    <div className="block block-info block-info-overview">
                        <div className="block-info-title block-info-title-sm text-left">
                            Functionaliteiten en overzicht
                        </div>
                        <div className="block-info-separator">
                            <div className="line" />
                        </div>
                        <div className="block-info-description text-left">
                            Mensen raken door de vele initiatieven, zoals tegemoetkomingen en regelingen, het overzicht
                            kwijt. Ingewikkelde aanvraagprocedures leiden vaak tot stress en onnodig niet-gebruik van
                            deze voorzieningen.
                            <br />
                            <br />
                            Vaak moet men voor elke regeling opnieuw aantonen dat ze in aanmerking komen, wat een
                            pijnlijk proces is. Forus wil dit voorkomen door hergebruik van gegevens mogelijk te maken.
                            Ons streven is dat mensen één keer bewijzen dat ze recht hebben, waarna ze alles ontvangen
                            waarvoor ze in aanmerking komen.
                            <br />
                            <br />
                            Ons systeem is ontwikkeld met de focus op de gebruiker. We hebben specifieke
                            functionaliteiten ontworpen om mensen effectief te ondersteunen gedurende dit proces.
                        </div>
                    </div>
                </div>

                <div className="wrapper">
                    <div className="block block-image-list hide-sm">
                        <div className="block-image-list-left">
                            <Step1 type={'info'} />
                            <Step2 type={'image'} />
                            <Step3 type={'info'} />
                            <Step4 type={'image'} />
                            <Step5 type={'info'} />
                            <Step6 type={'image'} />
                        </div>
                        <div className="block-image-list-right">
                            <Step1 type={'image'} />
                            <Step2 type={'info'} />
                            <Step3 type={'image'} />
                            <Step4 type={'info'} />
                            <Step5 type={'image'} />
                            <Step6 type={'info'} />
                        </div>
                    </div>

                    <div className="block block-image-list show-sm">
                        <Step1 />
                        <Step2 />
                        <Step3 />
                        <Step4 />
                        <Step5 />
                        <Step6 />
                    </div>
                </div>

                <div className="wrapper">
                    <LearnMore
                        title={'Klaar om uw impact te vergroten?'}
                        description={
                            'Laten we eens kijken naar de mogelijkheden en de optimale manier om uw regelingen uit te geven.'
                        }
                        buttons={[{ title: 'Gratis demo aanvragen', type: 'dark', stateName: 'book-demo' }]}
                        backgroundColor={'#E0F4FF'}
                    />
                </div>
            </div>
        </Fragment>
    );
}
