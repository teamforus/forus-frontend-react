import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
export default function Step5({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-requester/requester-5.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 5</div>
                    <div className="block-with-image-title">Tegoeden ontvangen</div>
                    <div className="block-with-image-description">
                        Het Forus-platform faciliteert de uitgifte van verschillende soorten regelingen. Dit kan
                        bijvoorbeeld een regeling zijn waarbij deelnemers hun tegoed besteden bij gevalideerde
                        aanbieders voor specifieke producten of diensten (zoals de Meedoenregeling of het Kindpakket),
                        of waarbij deelnemers uitbetalingen rechtstreeks op hun rekening ontvangen (zoals de Individuele
                        Inkomenstoeslag). Deelnemers kunnen hun budgetten effectief beheren en besteden dankzij diverse
                        opties.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Betalen met tegoed:</div>
                            Zodra het tegoed geactiveerd is, gebruikt de deelnemer het direct. De deelnemer laat
                            eenvoudig de QR-code scannen met de Me-app (of een geprinte QR-code) en profiteert van de
                            aankopen bij deelnemende aanbieders.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Reserveren:</div>
                            Deelnemers hebben de mogelijkheid om vooraf plannen te maken en op afstand reserveringen te
                            plaatsen voor specifieke diensten. Indien nodig is annulering mogelijk tot 14 dagen na de
                            reservering.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">De fysieke pas:</div>
                            Deelnemers hebben tevens de optie om een fysieke pas te gebruiken. Met de fysieke pas
                            krijgen deelnemers die minder digitaal vaardig zijn een alternatieve manier om toegang te
                            krijgen tot diverse diensten en voorzieningen. De fysieke pas kan eenvoudig worden
                            aangevraagd en geactiveerd via de website.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Kosten terugvragen:</div>
                            In bepaalde gevallen is het mogelijk voor de deelnemer om de kosten terug te vragen via een
                            declaratiefunctionaliteit op de website.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Uitbetalingen:</div>
                            Deelnemers ontvangen een geldbedrag dat rechtstreeks op hun rekening wordt uitbetaald
                            (Individuele Inkomenstoeslag).
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Kwijtscheldingen:</div>
                            Het Forus-systeem faciliteert ook de kwijtschelding van gemeentelijke belastingen, zoals
                            afvalstoffenheffing. Dit betekent dat deelnemers het volledige bedrag niet hoeven te
                            betalen. We zoeken naar gemeenten om dit samen te implementeren.
                        </div>
                        <div className="block-with-image-list-item-actions">
                            <StateNavLink name="book-demo" className="button button-fill button-primary">
                                Ik wil meer weten
                                <em className="mdi mdi-arrow-right icon-end" />
                            </StateNavLink>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
