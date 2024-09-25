import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step3({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-requester/requester-3.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 3</div>
                    <div className="block-with-image-title">Geschiktheid zelfstandig checken</div>
                    <div className="block-with-image-description">
                        Aanvragers voeren zelf een snelle voorlopige check uit om regelingen te controleren en te
                        filteren, zonder het volledige aanvraagformulier in te vullen. Zo ziet men snel waar men
                        mogelijk recht op heeft.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Regelcheck:</div>
                            Potentiële aanvragers vullen basisgegevens in om te controleren of zij in aanmerking komen
                            voor een specifiek fonds. Nadat zij een paar vragen hebben beantwoord, ontvangen zij een op
                            maat gemaakt advies.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
