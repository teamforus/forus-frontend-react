import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step2({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-sponsor/sponsor-2.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 2</div>
                    <div className="block-with-image-title">Een account voor de organisatie aanmaken</div>
                    <div className="block-with-image-description">
                        De sponsor maakt een account aan voor hun organisatie binnen het platform en voegt medewerkers
                        toe, inclusief hun rollen en rechten.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">
                                Account aanmaken en organisatie inschrijven als sponsor:
                            </div>
                            De sponsor schrijft hun organisatie eenvoudig in met behulp van een paar stappen. Ze hebben
                            de mogelijkheid om hun logo en bedrijfsgegevens toe te voegen.
                        </div>

                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">
                                Toevoegen van medewerkers en toewijzen van rollen en rechten:
                            </div>
                            In de beheeromgeving kunnen sponsors meerdere medewerkers toevoegen, rollen en rechten
                            toewijzen en het team beheren.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
