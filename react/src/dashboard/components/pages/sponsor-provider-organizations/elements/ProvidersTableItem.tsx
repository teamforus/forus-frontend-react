import React, { useCallback, useEffect, useState } from 'react';
import { strLimit } from '../../../../helpers/string';
import { PaginationData, ResponseError } from '../../../../props/ApiResponses';
import Organization, { SponsorProviderOrganization } from '../../../../props/models/Organization';
import ProvidersTableItemFunds from './ProvidersTableItemFunds';
import { useOrganizationService } from '../../../../services/OrganizationService';
import usePushDanger from '../../../../hooks/usePushDanger';
import useFilter from '../../../../hooks/useFilter';
import FundProvider from '../../../../props/models/FundProvider';
import useSetProgress from '../../../../hooks/useSetProgress';
import useTranslate from '../../../../hooks/useTranslate';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

export default function ProvidersTableItem({
    organization,
    providerOrganization,
}: {
    organization: Organization;
    providerOrganization: SponsorProviderOrganization;
}) {
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();

    const organizationService = useOrganizationService();

    const [fundProviders, setFundProviders] = useState<PaginationData<FundProvider>>(null);
    const [showFundProviders, setShowFundProviders] = useState(false);

    const filter = useFilter({ q: '', per_page: 10, organization_id: providerOrganization.id });

    const fetchFundProviders = useCallback(() => {
        setProgress(0);

        organizationService
            .listProviders(organization.id, filter.activeValues)
            .then((res) => setFundProviders(res.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
            .finally(() => setProgress(100));
    }, [filter.activeValues, organization.id, organizationService, pushDanger, setProgress]);

    useEffect(() => {
        if (showFundProviders) {
            fetchFundProviders();
        }
    }, [fetchFundProviders, showFundProviders]);

    return (
        <tbody>
            <StateNavLink
                name={'sponsor-provider-organization'}
                className={'tr-clickable'}
                customElement={'tr'}
                params={{
                    id: providerOrganization.id,
                    organizationId: organization.id,
                }}>
                <td
                    onClick={(e) => {
                        e?.preventDefault();
                        e?.stopPropagation();

                        setShowFundProviders(!showFundProviders);
                    }}>
                    <div className="td-collapsable clickable">
                        <div className="collapsable-icon">
                            <div
                                className={`mdi icon-collapse ${
                                    showFundProviders ? 'mdi-menu-down' : 'mdi-menu-right'
                                }`}
                            />
                        </div>
                        <div className="collapsable-media">
                            <img
                                className="td-media td-media-sm"
                                src={
                                    providerOrganization.logo?.sizes?.thumbnail ||
                                    './assets/img/placeholders/organization-thumbnail.png'
                                }
                                alt={providerOrganization.name}
                            />
                        </div>
                        <div className="collapsable-content">
                            <div className="text-primary text-medium">{strLimit(providerOrganization.name, 40)}</div>
                        </div>
                    </div>
                </td>
                <td>{providerOrganization.last_activity_locale}</td>
                <td>{providerOrganization.products_count}</td>
                <td>{providerOrganization.funds.length}</td>
                <td className="text-right">
                    <StateNavLink
                        name={'sponsor-provider-organization'}
                        params={{
                            id: providerOrganization.id,
                            organizationId: organization.id,
                        }}
                        className="button button-primary button-sm">
                        <em className="mdi mdi-eye-outline icon-start" />
                        {translate('provider_organizations.buttons.view')}
                    </StateNavLink>
                </td>
            </StateNavLink>

            {showFundProviders && fundProviders && (
                <ProvidersTableItemFunds organization={organization} fundProviders={fundProviders} filter={filter} />
            )}
        </tbody>
    );
}
