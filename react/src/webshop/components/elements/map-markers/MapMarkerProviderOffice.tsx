import React from 'react';
import Office from '../../../../dashboard/props/models/Office';
import useAssetUrl from '../../../hooks/useAssetUrl';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import StateNavLink from '../../../modules/state_router/StateNavLink';

export default function MapMarkerProviderOffice({ office }: { office: Office }) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    return (
        <div className="map-card">
            <div className="map-card-img">
                <img
                    src={
                        office?.photo?.sizes?.thumbnail ||
                        office?.organization?.logo?.sizes?.thumbnail ||
                        assetUrl('assets/img/placeholders/office-thumbnail.png')
                    }
                    alt=""
                />
            </div>
            <div className="map-card-content">
                <div className="map-card-title">{office?.organization?.name}</div>
                <div className="map-card-description">
                    <div className={'map-card-description-row'}>
                        <strong>{translate('global.map_marker.address')}:</strong>
                        {office.address}
                    </div>
                    {office?.organization?.business_type?.name && (
                        <div className={'map-card-description-row'}>
                            <strong>{translate('global.map_marker.organization_type')}:</strong>
                            {office.organization.business_type.name}
                        </div>
                    )}
                    {(office?.phone || office?.organization?.phone) && (
                        <div className={'map-card-description-row'}>
                            <strong>{translate('global.map_marker.phone')}:</strong>
                            {office.phone ? office.phone : office.organization.phone}
                        </div>
                    )}
                    {office?.organization?.email && (
                        <div className={'map-card-description-row'}>
                            <strong>{translate('global.map_marker.email')}:</strong>
                            {office?.organization?.email}
                        </div>
                    )}
                </div>
                <StateNavLink
                    name={'provider-office'}
                    params={{ organization_id: office.organization_id, id: office.id }}
                    className="map-card-button">
                    {translate('global.map_marker.view_details')}
                    <em className="mdi mdi-arrow-right" aria-hidden="true" />
                </StateNavLink>
            </div>
        </div>
    );
}
