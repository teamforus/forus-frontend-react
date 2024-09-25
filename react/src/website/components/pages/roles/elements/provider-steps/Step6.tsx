import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step6({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-provider/provider-6.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 6</div>
                    <div className="block-with-image-title">Transacties controleren</div>
                    <div className="block-with-image-description">
                        Aanbieders monitoren transacties, volgen financiële informatie en voeren boekhoudkundige taken
                        uit met betrekking tot betalingen die via het platform zijn ontvangen. Het transactieoverzicht
                        in de beheeromgeving van het Forus-platform toont aanbieders bijvoorbeeld welke vestiging
                        verantwoordelijk is voor specifieke betalingen.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Transactieoverzicht:</div>
                            Het transactieoverzicht in de beheeromgeving stelt aanbieders in staat om alle transacties
                            te bekijken, inclusief alle relevante informatie. Daarnaast bestaat er ook de mogelijkheid
                            om de gegevens te exporteren.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
