import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step10({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-sponsor/sponsor-10.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 10</div>
                    <div className="block-with-image-title">Toegang tot support en nieuws</div>
                    <div className="block-with-image-description">
                        Sponsors hebben toegang tot de support en het helpcenter van Forus, en worden op de hoogte
                        gehouden van alle nieuwe ontwikkelingen via onze nieuwsbrief.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Forus Support:</div>
                            Forus biedt ondersteuning in het systeem. Sponsor kunt de chatfunctie openen door op het
                            chatpictogram te klikken. Daarnaast hebben de sponsors ook een helpcentrum beschikbaar voor
                            meer informatie en ondersteuning.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Nieuwsbrief:</div>
                            Met onze nieuwsbrief blijft de sponsor op de hoogte van nieuwe ontwikkelingen en
                            veranderingen in het systeem.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
