import React, { Fragment } from 'react';
import { kebabCase } from 'lodash';
import { getStateRouteUrl } from '../../../../modules/state_router/Router';
import { NavLink } from 'react-router';
import OrganizationFeature from '../../../../services/types/OrganizationFeature';
import Organization from '../../../../props/models/Organization';
import useAssetUrl from '../../../../hooks/useAssetUrl';

export default function FeatureList({
    features,
    organization,
}: {
    features: Array<OrganizationFeature>;
    organization: Organization;
}) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            {features?.length > 0 && (
                <div className="features-list">
                    {features.map((feature) => (
                        <NavLink
                            key={feature.key}
                            className={'features-list-item'}
                            to={getStateRouteUrl('feature', {
                                key: kebabCase(feature.key),
                                organizationId: organization.id,
                            })}>
                            <div className="features-list-item-icon">
                                <img
                                    src={assetUrl(`/assets/img/features/icons/${feature.key}.svg`)}
                                    alt={feature.name}
                                />
                                {feature.enabled && (
                                    <div className="features-icon-label">
                                        <div className="mdi mdi-check" />
                                    </div>
                                )}
                            </div>
                            <div className="features-list-item-content">
                                <div className="features-list-item-title">
                                    <span>{feature.name}</span>
                                    {!feature.enabled && <div className="features-label inactive">Uitproberen</div>}
                                </div>
                                <div className="features-list-item-details">{feature.overview_description}</div>
                                <div className="features-labels">
                                    {feature.labels.map((label, index) => (
                                        <div key={index} className="features-label">
                                            {label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </NavLink>
                    ))}
                </div>
            )}
        </Fragment>
    );
}
