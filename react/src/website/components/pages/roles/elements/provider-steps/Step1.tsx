import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step1({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-provider/provider-1.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 1</div>
                    <div className="block-with-image-title">Een account voor de organisatie aanmaken</div>
                    <div className="block-with-image-description">
                        Aanbieders maken een account aan voor hun organisatie en voegen medewerkers toe, samen met hun
                        rollen en rechten.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">
                                Account aanmaken en organisatie aanmelden als aanbieder:
                            </div>
                            Aanbieders kunnen hun organisatie eenvoudig aanmelden met behulp van een paar stappen. Ze
                            hebben de mogelijkheid om hun logo toe te voegen, het KvK-nummer en de bedrijfsgegevens in
                            te vullen, het adres te verifiëren en meerdere vestigingen toe te voegen. Dit is vooral
                            handig voor grote, landelijke winkelketens met meerdere vestigingen, omdat aanbieders
                            gemakkelijk kunnen zien welke vestiging verantwoordelijk is voor specifieke betalingen.
                            Hierdoor kunnen ze efficiënter opereren en hun financiële processen beter automatiseren.
                        </div>

                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">
                                Toevoegen van medewerkers en toewijzen van rollen en rechten:
                            </div>
                            Binnen de beheeromgeving voegen aanbieders meerdere medewerkers toe, wijzen zij rollen en
                            rechten toe en beheren zij het team.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
