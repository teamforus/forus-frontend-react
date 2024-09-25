import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
export default function Step5({ type = 'all' }: { type?: 'image' | 'info' | 'all' }) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {(type === 'image' || type == 'all') && (
                <div className="block-with-image-image">
                    <img src={assetUrl('/assets/img/role-provider/provider-5.jpg')} alt="" />
                </div>
            )}

            {(type === 'info' || type == 'all') && (
                <div className="block-with-image-info">
                    <div className="block-with-image-label block-with-image-label-sm">Stap 5</div>
                    <div className="block-with-image-title">
                        Betaling ontvangen voor geleverde producten of diensten
                    </div>
                    <div className="block-with-image-description">
                        Aanbieders ontvangen betalingen van de sponsor voor de producten of diensten die ze aan
                        deelnemers leveren. Het betalingsproces wordt gefaciliteerd via het platform.
                    </div>

                    <div className="block-with-image-list">
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">
                                Downloaden en installeren van de Me-app:
                            </div>
                            Aanbieders downloaden de Me-app om QR-codes van de deelnemers te scannen.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Beheer van reserveringen:</div>
                            Aanbieders kunnen deelnemers de mogelijkheid bieden om een reservering te maken. De
                            aanbieders kunnen deze reserveringen vervolgens accepteren of weigeren in de beheeromgeving.
                        </div>
                        <div className="block-with-image-list-item">
                            <div className="block-with-image-list-item-title">Beheren van transacties:</div>
                            Aanbieders houden hun betalingen bij en controleren de status van transacties in de
                            beheeromgeving.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
