import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useProviderFundService from '../../../services/ProviderFundService';
import ProviderFundsTable from './elements/ProviderFundsTable';
import ProviderFundsAvailableTable from './elements/ProviderFundsAvailableTable';
import ProviderFundInvitationsTable from './elements/ProviderFundInvitationsTable';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import { StringParam, useQueryParam } from 'use-query-params';
import BlockLabelTabs from '../../elements/block-label-tabs/BlockLabelTabs';

export default function ProviderFunds() {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();
    const providerFundService = useProviderFundService();

    const [tabQuery = 'active', setTabQuery] = useQueryParam('tab', StringParam, {
        removeDefaultsFromUrl: true,
    });

    const setTab = useCallback(
        (item: string) => {
            setTabQuery('none');

            // added timeout to wait while components clear filter query params and avoid reset 'tab' param
            setTimeout(() => {
                setTabQuery(item);
            }, 100);
        },
        [setTabQuery],
    );

    const [fundsAvailable, setFundsAvailable] = useState(null);

    const fetchFunds = useCallback(() => {
        providerFundService
            .listAvailableFunds(activeOrganization.id, { per_page: 1 })
            .then((res) => setFundsAvailable(res.data))
            .catch(pushApiError);
    }, [activeOrganization.id, providerFundService, pushApiError]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    if (!fundsAvailable) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="card-heading flex-row">
                <div className="flex-col flex-grow">{translate('provider_funds.title.main')}</div>
                <div className="flex-col">
                    <BlockLabelTabs
                        value={tabQuery}
                        setValue={(tab) => setTab(tab)}
                        tabs={[
                            {
                                value: 'active',
                                label: `${translate('provider_funds.tabs.active')} (${fundsAvailable.meta.totals.active})`,
                                dusk: 'fundsActiveTab',
                            },
                            {
                                value: 'pending_rejected',
                                label: `${translate('provider_funds.tabs.pending_rejected')} (${fundsAvailable.meta.totals.pending})`,
                                dusk: 'fundsPendingTab',
                            },
                            {
                                value: 'available',
                                label: `${translate('provider_funds.tabs.available')} (${fundsAvailable.meta.totals.available})`,
                                dusk: 'fundsAvailableTab',
                            },
                            {
                                value: 'archived',
                                label: `${translate('provider_funds.tabs.archived')} (${fundsAvailable.meta.totals.archived})`,
                                dusk: 'fundsArchivedTab',
                            },
                            {
                                value: 'unsubscribed',
                                label: `${translate('provider_funds.tabs.unsubscribed')} (${fundsAvailable.meta.totals.unsubscribed})`,
                                dusk: 'fundsUnsubscribedTab',
                            },
                        ]}
                    />
                </div>
                <div className="flex-col">
                    <BlockLabelTabs
                        value={tabQuery}
                        setValue={(tab) => setTab(tab)}
                        tabs={[
                            {
                                value: 'invitations',
                                label: `${translate('provider_funds.tabs.invitations')} (${fundsAvailable.meta.totals.invitations})`,
                            },
                            {
                                value: 'invitations_archived',
                                label: `${translate('provider_funds.tabs.invitations_archived')} (${fundsAvailable.meta.totals.invitations_archived})`,
                            },
                        ]}
                    />
                </div>
            </div>

            {tabQuery == 'none' && <LoadingCard />}

            {/* Active funds */}
            {tabQuery == 'active' && (
                <ProviderFundsTable type={'active'} organization={activeOrganization} onChange={fetchFunds} />
            )}

            {/* Pending and rejected funds */}
            {tabQuery == 'pending_rejected' && (
                <ProviderFundsTable type={'pending_rejected'} organization={activeOrganization} onChange={fetchFunds} />
            )}

            {/* Archived funds */}
            {tabQuery == 'archived' && (
                <ProviderFundsTable type={'archived'} organization={activeOrganization} onChange={fetchFunds} />
            )}

            {/* Unsubscribed funds */}
            {tabQuery == 'unsubscribed' && (
                <ProviderFundsTable type={'unsubscribed'} organization={activeOrganization} onChange={fetchFunds} />
            )}

            {/* Available funds */}
            {tabQuery == 'available' && (
                <ProviderFundsAvailableTable
                    organization={activeOrganization}
                    onChange={() => {
                        fetchFunds();
                        setTab('pending_rejected');
                    }}
                />
            )}

            {/* Fund invitations */}
            {tabQuery == 'invitations' && (
                <ProviderFundInvitationsTable
                    type="invitations"
                    organization={activeOrganization}
                    onChange={() => {
                        fetchFunds();
                        setTab('pending_rejected');
                    }}
                />
            )}

            {/* Expired and close funds (archive) */}
            {tabQuery == 'invitations_archived' && (
                <ProviderFundInvitationsTable
                    type="invitations_archived"
                    organization={activeOrganization}
                    onChange={() => {
                        fetchFunds();
                        setTab('pending_rejected');
                    }}
                />
            )}
        </Fragment>
    );
}
