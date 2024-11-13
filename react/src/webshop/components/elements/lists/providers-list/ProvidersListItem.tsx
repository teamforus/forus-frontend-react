import React, { Fragment } from 'react';
import ProvidersListItemList from './templates/ProvidersListItemList';
import ProvidersListItemSearch from './templates/ProvidersListItemSearch';
import Provider from '../../../../props/models/Provider';

export default function ProvidersListItem({
    provider,
    display = 'list',
    stateParams = null,
}: {
    provider: Provider;
    display: 'list' | 'search';
    stateParams?: object;
}) {
    return (
        <Fragment>
            {display === 'list' && <ProvidersListItemList stateParams={stateParams} provider={provider} />}
            {display === 'search' && <ProvidersListItemSearch stateParams={stateParams} provider={provider} />}
        </Fragment>
    );
}
