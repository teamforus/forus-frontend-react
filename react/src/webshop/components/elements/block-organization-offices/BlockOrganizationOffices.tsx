import React, { useState } from 'react';
import Provider from '../../../props/models/Provider';
import useAssetUrl from '../../../hooks/useAssetUrl';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import classNames from 'classnames';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function BlockOrganizationOffices({ provider }: { provider: Provider }) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const [showOffices, setShowOffices] = useState(false);

    return (
        <div className="block block-organization-offices">
            <div className={`organization-pane`}>
                <div className="organization-pane-info">
                    <div className="organization-logo">
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
                        <StateNavLink
                            name={WebshopRoutes.PROVIDER}
                            params={{ id: provider.id }}
                            state={null}
                            className="organization-page-link"
                            role="link">
                            {translate('list_blocks.provider_item_list.open_provider')}
                            <em className="mdi mdi-chevron-right" />
                        </StateNavLink>
                    </div>
                </div>
                <button
                    type="button"
                    className="organization-pane-collapse"
                    aria-expanded={showOffices}
                    aria-controls={'organization-offices-list'}
                    onClick={() => setShowOffices(!showOffices)}>
                    <div className="organization-chevron">
                        <em className={`mdi ${showOffices ? 'mdi-chevron-up' : 'mdi-chevron-right'}`} />
                    </div>
                    <div className="organization-total-offices">
                        {translate('list_blocks.provider_item_list.show_locations')}
                    </div>
                    <div className={classNames(`organization-total-offices-count`, showOffices && 'active')}>
                        {provider.offices.length}
                    </div>
                </button>
            </div>
            {showOffices && (
                <div className="organization-offices" id="organization-offices-list">
                    {provider.offices?.map((office) => (
                        <StateNavLink
                            key={office.id}
                            params={{ organization_id: office.organization_id, id: office.id }}
                            name={WebshopRoutes.PROVIDER_OFFICE}
                            className="organization-office-item">
                            <div className="organization-office-item-map-icon">
                                <em className="mdi mdi-map-marker" />
                            </div>
                            <div className="office-pane">
                                <div className="office-pane-block">
                                    <div className="office-details">
                                        <div className="office-title">{office.address}</div>
                                        {(office.phone || provider.phone || provider.email) && (
                                            <div className={'office-props'}>
                                                {(office.phone || provider.phone) && (
                                                    <div className="office-prop-item">
                                                        <em className="mdi mdi-phone-outline" />
                                                        {office.phone ? office.phone : provider.phone}
                                                    </div>
                                                )}
                                                <div className="office-prop-separator" />
                                                {provider.email && (
                                                    <div className="office-prop-item">
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
            )}
        </div>
    );
}
