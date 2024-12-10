import React from 'react';
import Office from '../../../../dashboard/props/models/Office';
import useAssetUrl from '../../../hooks/useAssetUrl';

export default function MapMarkerProviderOfficeView({ office }: { office: Office }) {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-map-office-card">
            <div className="map-office-photo">
                <img
                    src={
                        office?.photo?.sizes?.thumbnail ||
                        office?.organization?.logo?.sizes?.thumbnail ||
                        assetUrl('assets/img/placeholders/office-thumbnail.png')
                    }
                    alt="office photo"
                />
            </div>
            <div className="map-office-details">
                <div className="map-office-title">{office.organization.name}</div>
                <div className="map-office-info-contacts">
                    <div className="map-office-info">
                        <em className="mdi mdi-map-marker-outline text-muted" />
                        <span className="map-office-info-value">{office.address}</span>
                    </div>

                    {(office.phone || office.organization.phone) && (
                        <div className="map-office-info">
                            <em className="mdi mdi-phone-outline text-muted" />
                            <span className="map-office-info-value">
                                {office.phone ? office.phone : office.organization.phone}
                            </span>
                        </div>
                    )}

                    {office.organization.email && (
                        <div className="map-office-info">
                            <em className="mdi mdi-email-outline text-muted" />
                            <span className="map-office-info-value">{office.organization.email}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
