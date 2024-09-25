import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step2({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-provider/provider-2.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 2</div>
                    <div className="block-with-image-title">Beschikbare regelingen bekijken</div>
                    <div className="block-with-image-description">
                        Aanbieders bekijken op het platform de beschikbare regelingen om inzicht te krijgen in de
                        subsidieopties en te bepalen of er regelingen zijn die aansluiten bij hun producten of diensten.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">
                                Overzichtspagina van regelingen en voorwaarden voor aanbieders:
                            </div>
                            De overzichtspagina biedt aanbieders gedetailleerde informatie over regelingen en criteria.
                            Op de website kunnen aanbieders inzicht krijgen in de mogelijkheden, regels en uitleg met
                            betrekking tot regelingen. Aanbieders hebben de mogelijkheid om zich aan te melden voor
                            regelingen die aansluiten bij hun producten of diensten, zoals een fietsenwinkel die zich
                            aanmeldt voor een fietsregeling.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
