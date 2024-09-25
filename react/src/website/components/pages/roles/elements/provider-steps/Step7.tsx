import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step6({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-provider/provider-7.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 7</div>
                    <div className="block-with-image-title">Communicatie met sponsors en aanvragers</div>
                    <div className="block-with-image-description">
                        Het platform biedt aanbieders de mogelijkheid om te communiceren met sponsors, waardoor ze
                        vragen kunnen beantwoorden en product- en service-informatie kunnen verduidelijken.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">
                                Notificaties, meldingen en communicatie:
                            </div>
                            Aanbieders hebben toegang tot een overzicht van de communicatie en meldingen die zij hebben
                            ontvangen. Dit omvat bijvoorbeeld berichten van de sponsor om aanpassingsverzoeken in hun
                            aanbod te doen. Wanneer er een bericht ontvangen wordt, licht het meldingspictogram rood op.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
