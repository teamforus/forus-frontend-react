import React, { useState } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import Provider from '../../../../../props/models/Provider';

export default function ProvidersListItemList({
    provider,
    searchParams,
}: {
    provider?: Provider;
    searchParams?: object;
}) {
    const assetUrl = useAssetUrl();
    const [showOffices, setShowOffices] = useState(false);

    return (
        <div className="organization-item">
            <div className={`organization-pane ${showOffices ? 'active' : ''}`}>
                <StateNavLink
                    name="provider"
                    params={{ id: provider.id }}
                    state={{ searchParams: searchParams || null }}
                    className="organization-pane-info"
                    role="link">
                    <div className="organization-logo" role="none" tabIndex={-1}>
                        <img
                            className="organization-logo-img"
                            src={
                                provider?.logo?.sizes?.thumbnail ||
                                provider?.logo?.sizes?.small ||
                                assetUrl('/assets/img/placeholders/organization-thumbnail.png')
                            }
                            alt=""
                        />
                    </div>
                    <div className="organization-title">
                        <span className="organization-title-value">{provider.name}</span>
                        <div className="organization-page-link">
                            Open aanbieder
                            <em className="mdi mdi-chevron-right" />
                        </div>
                    </div>
                </StateNavLink>
                <div
                    className="organization-pane-collapse"
                    aria-expanded={showOffices}
                    onClick={() => setShowOffices(!showOffices)}
                    role="button">
                    <div className="organization-chevron">
                        <em className={`mdi ${showOffices ? 'mdi-chevron-up' : 'mdi-chevron-down'}`} />
                    </div>
                    <div className="organization-total-offices">Toon locaties</div>
                    <div className={`organization-total-offices-count ${showOffices ? 'active' : ''}`}>
                        {provider.offices.length}
                    </div>
                </div>
            </div>
            {showOffices && (
                <div className="organization-offices">
                    <div className="block block-offices">
                        {provider.offices?.map((office) => (
                            <StateNavLink
                                key={office.id}
                                params={{ organization_id: office.organization_id, id: office.id }}
                                name={'provider-office'}
                                className="office-item">
                                <div className="office-item-map-icon">
                                    <em className="mdi mdi-map-marker" />
                                </div>
                                <div className="office-pane">
                                    <div className="office-pane-block">
                                        <div className="office-logo">
                                            <img
                                                className="office-logo-img"
                                                src={
                                                    office?.photo?.sizes?.thumbnail ||
                                                    assetUrl('/assets/img/placeholders/office-thumbnail.png')
                                                }
                                                alt=""
                                            />
                                        </div>
                                        <div className="office-details">
                                            <div className="office-title">{office.address}</div>
                                            <div className="office-labels">
                                                <div className="label label-default">
                                                    {provider.business_type.name || 'Geen data'}
                                                </div>
                                            </div>
                                            {(office.phone || provider.phone || provider.email) && (
                                                <div>
                                                    {(office.phone || provider.phone) && (
                                                        <div className="office-info office-info-inline">
                                                            <em className="mdi mdi-phone-outline" />
                                                            {office.phone ? office.phone : provider.phone}
                                                        </div>
                                                    )}
                                                    {provider.email && (
                                                        <div className="office-info office-info-inline">
                                                            <em className="mdi mdi-email-outline" />
                                                            {provider.email}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="office-chevron">
                                            <em className="mdi mdi-chevron-right" />
                                        </div>
                                    </div>
                                </div>
                            </StateNavLink>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
