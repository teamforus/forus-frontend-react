import React, { useCallback, useEffect, useState } from 'react';
import { strLimit } from '../../../../helpers/string';
import { PaginationData } from '../../../../props/ApiResponses';
import Organization, { SponsorProviderOrganization } from '../../../../props/models/Organization';
import ProvidersTableItemFunds from './ProvidersTableItemFunds';
import { useOrganizationService } from '../../../../services/OrganizationService';
import FundProvider from '../../../../props/models/FundProvider';
import useSetProgress from '../../../../hooks/useSetProgress';
import useTranslate from '../../../../hooks/useTranslate';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import TableRowActions from '../../../elements/tables/TableRowActions';
import usePushApiError from '../../../../hooks/usePushApiError';
import classNames from 'classnames';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';

export default function ProvidersTableItem({
    organization,
    providerOrganization,
}: {
    organization: Organization;
    providerOrganization: SponsorProviderOrganization;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const organizationService = useOrganizationService();

    const [fundProviders, setFundProviders] = useState<PaginationData<FundProvider>>(null);
    const [showFundProviders, setShowFundProviders] = useState(false);

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        per_page?: number;
        organization_id?: number;
    }>({
        per_page: 10,
        organization_id: providerOrganization.id,
    });

    const fetchFundProviders = useCallback(() => {
        setProgress(0);

        organizationService
            .listProviders(organization.id, filterValuesActive)
            .then((res) => setFundProviders(res.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [filterValuesActive, organization.id, organizationService, pushApiError, setProgress]);

    useEffect(() => {
        if (showFundProviders) {
            fetchFundProviders();
        }
    }, [fetchFundProviders, showFundProviders]);

    return (
        <tbody>
            <StateNavLink
                name={DashboardRoutes.SPONSOR_PROVIDER_ORGANIZATION}
                className={'tr-clickable'}
                customElement={'tr'}
                dataDusk={`tableProviderRow${providerOrganization.id}`}
                params={{
                    id: providerOrganization.id,
                    organizationId: organization.id,
                }}>
                <td>
                    <div className="td-collapsable clickable">
                        <div
                            className="collapsable-icon"
                            onClick={(e) => {
                                e?.preventDefault();
                                e?.stopPropagation();

                                setShowFundProviders(!showFundProviders);
                            }}>
                            <em
                                className={classNames(
                                    'mdi',
                                    'icon-collapse',
                                    showFundProviders ? 'mdi-menu-down' : 'mdi-menu-right',
                                )}
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
                            <div className="text-primary text-semibold">{strLimit(providerOrganization.name, 40)}</div>
                        </div>
                    </div>
                </td>
                <td>{providerOrganization.last_activity_locale}</td>
                <td>{providerOrganization.products_count}</td>
                <td>{providerOrganization.funds.length}</td>
                <td className={'table-td-actions text-right'}>
                    <TableRowActions
                        content={() => (
                            <div className="dropdown dropdown-actions">
                                <StateNavLink
                                    name={DashboardRoutes.SPONSOR_PROVIDER_ORGANIZATION}
                                    params={{
                                        id: providerOrganization.id,
                                        organizationId: organization.id,
                                    }}
                                    className="dropdown-item">
                                    <em className="mdi mdi-eye-outline icon-start" />
                                    {translate('provider_organizations.buttons.view')}
                                </StateNavLink>
                            </div>
                        )}
                    />
                </td>
            </StateNavLink>

            {showFundProviders && fundProviders && (
                <ProvidersTableItemFunds
                    organization={organization}
                    fundProviders={fundProviders}
                    filterValues={filterValues}
                    filterUpdate={filterUpdate}
                />
            )}
        </tbody>
    );
}
