import React from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import Provider from '../../../../../props/models/Provider';

export default function ProvidersListItemSearch({
    provider,
    stateParams,
}: {
    provider?: Provider;
    stateParams?: object;
}) {
    const assetUrl = useAssetUrl();

    return (
        <StateNavLink
            name={'provider'}
            params={{ id: provider?.id }}
            state={stateParams || null}
            className="search-item search-item-provider">
            <div className="search-media">
                <img
                    src={
                        provider?.logo?.sizes?.thumbnail ||
                        provider?.logo?.sizes?.small ||
                        assetUrl('/assets/img/placeholders/organization-thumbnail.png')
                    }
                    alt=""
                />
            </div>
            <div className="search-content">
                <div className="search-details">
                    <h2 className="search-title">{provider.name}</h2>
                    <div className="search-subtitle">{provider.description}</div>
                </div>
            </div>
        </StateNavLink>
    );
}
