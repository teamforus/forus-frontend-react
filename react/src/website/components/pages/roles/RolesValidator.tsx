import React, { Fragment, useEffect, useState } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useAssetUrl from '../../../hooks/useAssetUrl';
import LearnMore from '../../elements/LearnMore';
import RolesSelector from './elements/RolesSelector';
import RolesBanner from './elements/RolesBanner';
import useSetMetaDescription from '../../../hooks/useSetMetaDescription';
import Step1 from './elements/validator-steps/Step1';
import Step2 from './elements/validator-steps/Step2';
import Step3 from './elements/validator-steps/Step3';
import Step4 from './elements/validator-steps/Step4';
import Step5 from './elements/validator-steps/Step5';
import Step6 from './elements/validator-steps/Step6';
import Step7 from './elements/validator-steps/Step7';
import Step8 from './elements/validator-steps/Step8';
import BackgroundCircles from '../../elements/BackgroundCircles';

export default function RolesValidator() {
    const setTitle = useSetTitle();
    const setMetaDescription = useSetMetaDescription();

    const assetUrl = useAssetUrl();

    const [bannerTitle] = useState('Beoordelaar');
    const [bannerDescription] = useState(
        [
            'Een organisatie die de gegevens van de aanvrager doorneemt om te beslissen of een aanvraag ',
            'toegekend of afgewezen wordt. Dit is een belangrijke taak waarbij gekeken wordt naar alle ',
            'details om te bepalen of iemand recht heeft op wat hij of zij aanvraagt. Deze rol kan door ',
            'de gemeente zelf vervuld worden, maar soms komt het ook voor dat andere partijen zoals ',
            'sociale ketenpartners of andere overheidsorganisaties deze taak op zich nemen.',
        ].join(''),
    );

    useEffect(() => {
        setTitle('Platform voor Beoordelaars | Efficiënt beheer van aanvragen');
        setMetaDescription(
            'Het Forus-platform faciliteert beoordelaars bij het controleren van deelnemersgegevens en het goedkeuren of afwijzen van aanvragen.',
        );
    }, [setMetaDescription, setTitle]);

    return (
        <Fragment>
            <BackgroundCircles />
            <RolesBanner type={'validator'} title={bannerTitle} description={bannerDescription} />

            <div className="main-content">
                <div
                    className="background-overlay hide-sm"
                    style={{ backgroundImage: 'url("./assets/img/background-validator.svg")' }}
                />

                <div className="wrapper">
                    <RolesSelector activeType={'validator'} />

                    <div className="block block-info block-info-overview">
                        <div className="block-info-title block-info-title-sm">Functionaliteiten en overzicht</div>
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
                        </div>

                        <div className="block-image-list-right">
                            <Step1 type="info" />
                            <Step2 type="image" />
                            <Step3 type="info" />
                            <Step4 type="image" />
                        </div>
                    </div>

                    <div className="block block-image-list show-sm">
                        <Step1 />
                        <Step2 />
                        <Step3 />
                        <Step4 />
                    </div>

                    <div className="separator-image full-width">
                        <img
                            className="full-width"
                            src={assetUrl('/assets/img/role-validator/validator-separator.jpg')}
                            alt=""
                        />
                    </div>

                    <div className="block block-image-list hide-sm">
                        <div className="block-image-list-left">
                            <Step5 type="image" />
                            <Step6 type="info" />
                            <Step7 type="image" />
                            <Step8 type="info" />
                        </div>
                        <div className="block-image-list-right">
                            <Step5 type="info" />
                            <Step6 type="image" />
                            <Step7 type="info" />
                            <Step8 type="image" />
                        </div>
                    </div>

                    <div className="block block-image-list show-sm">
                        <Step5 />
                        <Step6 />
                        <Step7 />
                        <Step8 />
                    </div>
                </div>

                <div className="wrapper">
                    <LearnMore
                        title={'Klaar om uw impact te vergroten?'}
                        description={
                            'Laten we eens kijken naar de mogelijkheden en de optimale manier om uw regelingen uit te geven.'
                        }
                        buttons={[{ title: 'Gratis demo aanvragen', type: 'dark', stateName: 'book-demo' }]}
                        backgroundColor={'#DEF5DF'}
                    />
                </div>
            </div>
        </Fragment>
    );
}
