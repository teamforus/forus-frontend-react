import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step3({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-provider/provider-3.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 3</div>
                    <div className="block-with-image-title">Aanmelden voor fondsen</div>
                    <div className="block-with-image-description">
                        Aanbieders melden zich via het platform aan als aangewezen aanbieder voor specifieke fondsen. Zo
                        kunnen zij hun producten of diensten aanbieden aan in aanmerking komende aanvragers en betaling
                        ontvangen via het platform.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Aanmelden voor fondsen:</div>
                            De aanbieders registreren zich voor een fonds via het platform en laten hun aanmelding
                            controleren en goedkeuren door de sponsor.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
