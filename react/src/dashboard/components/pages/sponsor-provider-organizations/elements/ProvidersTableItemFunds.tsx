import React, { Fragment } from 'react';
import { strLimit } from '../../../../helpers/string';
import Paginator from '../../../../modules/paginator/components/Paginator';
import { PaginationData } from '../../../../props/ApiResponses';
import Organization from '../../../../props/models/Organization';
import FundProvider from '../../../../props/models/FundProvider';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import FundStateLabels from '../../../elements/resource-states/FundStateLabels';
import TableRowActions from '../../../elements/tables/TableRowActions';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import { useOrganizationService } from '../../../../services/OrganizationService';
import { FilterModel, FilterSetter } from '../../../../modules/filter_next/types/FilterParams';

export default function ProvidersTableItemFunds({
    filterValues,
    filterUpdate,
    organization,
    fundProviders,
}: {
    filterValues: FilterModel;
    filterUpdate: FilterSetter;
    organization: Organization;
    fundProviders: PaginationData<FundProvider>;
}) {
    const organizationService = useOrganizationService();

    const { headElement, configsElement } = useConfigurableTable(organizationService.getProviderFundsColumns());

    return (
        <tr>
            <td className="td-paddless relative" colSpan={5}>
                {fundProviders.meta.total > 0 && (
                    <Fragment>
                        {configsElement}

                        <table className="table table-embed">
                            {headElement}

                            <tbody>
                                {fundProviders.data.map((fundProvider) => (
                                    <StateNavLink
                                        name={'fund-provider'}
                                        params={{
                                            id: fundProvider.id,
                                            fundId: fundProvider.fund_id,
                                            organizationId: organization.id,
                                        }}
                                        key={fundProvider.id}
                                        className={'tr-clickable'}
                                        customElement={'tr'}>
                                        <td>
                                            <div className="td-collapsable">
                                                <div className="collapsable-icon">
                                                    <div className="mdi">&nbsp;</div>
                                                </div>
                                                <div className="collapsable-media">
                                                    <img
                                                        className="td-media td-media-sm"
                                                        src={
                                                            fundProvider.fund.logo?.sizes?.thumbnail ||
                                                            './assets/img/placeholders/fund-thumbnail.png'
                                                        }
                                                        alt={fundProvider.fund.name}
                                                    />
                                                </div>
                                                <div className="collapsable-content">
                                                    <div className="text-primary text-semibold">
                                                        {strLimit(fundProvider.fund.name, 40)}
                                                    </div>
                                                    <div className="text-strong text-md text-muted-dark">
                                                        {strLimit(fundProvider.fund.implementation?.name, 40)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div
                                                className={`label label-${
                                                    {
                                                        accepted: 'success',
                                                        pending: 'default',
                                                        rejected: 'danger',
                                                    }[fundProvider.state]
                                                }`}>
                                                {fundProvider.state_locale}
                                            </div>
                                        </td>
                                        <td>
                                            <FundStateLabels fund={fundProvider.fund} />
                                        </td>
                                        <td className={'table-td-actions text-right'}>
                                            <TableRowActions
                                                content={() => (
                                                    <div className="dropdown dropdown-actions">
                                                        <StateNavLink
                                                            name={'fund-provider'}
                                                            params={{
                                                                id: fundProvider.id,
                                                                fundId: fundProvider.fund_id,
                                                                organizationId: organization.id,
                                                            }}
                                                            className="dropdown-item">
                                                            <em className="mdi mdi-eye-outline icon-start" />
                                                            Bekijk
                                                        </StateNavLink>
                                                    </div>
                                                )}
                                            />
                                        </td>
                                    </StateNavLink>
                                ))}
                            </tbody>
                            <tbody>
                                <tr>
                                    <td colSpan={5}>
                                        <Paginator
                                            meta={fundProviders.meta}
                                            filters={filterValues}
                                            updateFilters={filterUpdate}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Fragment>
                )}
            </td>
        </tr>
    );
}
