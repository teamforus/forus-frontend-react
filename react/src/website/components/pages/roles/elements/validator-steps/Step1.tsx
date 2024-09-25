import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step1({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-validator/validator-1.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 1</div>
                    <div className="block-with-image-title">Een organisatieaccount aanmaken</div>
                    <div className="block-with-image-description">
                        Beoordelaars hebben de mogelijkheid om een account aan te maken voor hun organisatie en om
                        medewerkers toe te voegen, inclusief hun rollen en rechten.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">
                                Account aanmaken en organisatie inschrijven als beoordelaar:
                            </div>
                            Beoordelaars schrijven hun organisatie gemakkelijk in door een paar eenvoudige stappen te
                            volgen. Ze voegen hun logo en bedrijfsgegevens toe.
                        </div>

                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">
                                Toevoegen van medewerkers en toewijzen van rollen en rechten:
                            </div>
                            Binnen de beheeromgeving voegen beoordelaars meerdere medewerkers toe, wijzen zij rollen en
                            rechten toe en beheren zij het team.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
