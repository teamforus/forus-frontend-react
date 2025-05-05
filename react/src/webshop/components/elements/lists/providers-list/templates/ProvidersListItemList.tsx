import React, { useState } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import Provider from '../../../../../props/models/Provider';
import { clickOnKeyEnter } from '../../../../../../dashboard/helpers/wcag';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';

export default function ProvidersListItemList({
    provider,
    stateParams,
}: {
    provider?: Provider;
    stateParams?: object;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const [showOffices, setShowOffices] = useState(false);

    return (
        <div className="organization-item">
            <div className={`organization-pane`}>
                <StateNavLink
                    name="provider"
                    params={{ id: provider.id }}
                    state={stateParams || null}
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
                            {translate('list_blocks.provider_item_list.open_provider')}
                            <em className="mdi mdi-chevron-right" />
                        </div>
                    </div>
                </StateNavLink>
                <div
                    className="organization-pane-collapse"
                    aria-expanded={showOffices}
                    aria-controls={'organization-offices-list'}
                    onClick={() => setShowOffices(!showOffices)}
                    onKeyDown={clickOnKeyEnter}
                    role="button"
                    tabIndex={0}>
                    <div className="organization-chevron">
                        <em className={`mdi ${showOffices ? 'mdi-chevron-up' : 'mdi-chevron-down'}`} />
                    </div>
                    <div className="organization-total-offices">
                        {translate('list_blocks.provider_item_list.show_locations')}
                    </div>
                    <div className={`organization-total-offices-count ${showOffices ? 'active' : ''}`}>
                        {provider.offices.length}
                    </div>
                </div>
            </div>
            {showOffices && (
                <div className="organization-offices" id="organization-offices-list">
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
                                                    {provider.business_type.name ||
                                                        translate('list_blocks.provider_item_list.no_data')}
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
