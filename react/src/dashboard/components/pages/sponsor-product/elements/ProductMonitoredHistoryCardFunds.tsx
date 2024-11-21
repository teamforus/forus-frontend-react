import React from 'react';
import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';
import TableEntityMain from '../../../elements/tables/elements/TableEntityMain';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import TableRowActions from '../../../elements/tables/TableRowActions';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import { useFundService } from '../../../../services/FundService';
import Organization from '../../../../props/models/Organization';
import classNames from 'classnames';

export default function ProductMonitoredHistoryCardFunds({
    type = 'card',
    product,
    activeOrganization,
}: {
    type: 'card' | 'table';
    product: SponsorProduct;
    activeOrganization: Organization;
}) {
    const fundService = useFundService();
    const { headElement, configsElement } = useConfigurableTable(fundService.getColumnsProductFunds(), {
        hasTooltips: type === 'table' ? false : undefined,
    });

    const tableElement = (
        <TableTopScroller>
            <table className="table">
                {headElement}

                <tbody>
                    {product.funds?.map((fund) => (
                        <StateNavLink
                            name={'fund-provider-product'}
                            params={{
                                id: product.id,
                                fundId: fund.id,
                                fundProviderId: fund.fund_provider_id,
                                organizationId: fund.organization_id,
                            }}
                            className={classNames(
                                'tr-clickable',
                                type === 'table' && 'tr-gray',
                                type === 'table' && 'tr-narrow',
                            )}
                            customElement={'tr'}
                            key={fund.id}>
                            <td>
                                <TableEntityMain
                                    title={fund.name}
                                    mediaPlaceholder={'fund'}
                                    subtitle={fund.type_locale}
                                    media={fund?.logo}
                                />
                            </td>
                            <td>
                                {fund.state === 'approved' && (
                                    <a
                                        title={'Bekijk aanbod op webshop'}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-primary text-medium flex flex-gap-sm text-underline"
                                        href={fund.url_product}
                                        target={'_blank'}
                                        rel="noreferrer">
                                        {fund.implementation?.name}
                                        <em className="mdi mdi-link-variant icon-end" />
                                    </a>
                                )}

                                {fund.state === 'pending' && fund.implementation?.name}
                            </td>
                            <td>
                                {fund.state === 'approved' && (
                                    <span className="label label-success">{fund.state_locale}</span>
                                )}

                                {fund.state === 'pending' && (
                                    <span className="label label-default">{fund.state_locale}</span>
                                )}
                            </td>
                            <td className="table-td-actions">
                                <TableRowActions
                                    content={() => (
                                        <div className="dropdown dropdown-actions">
                                            <StateNavLink
                                                name={'fund-provider-product'}
                                                params={{
                                                    id: product.id,
                                                    fundId: fund.id,
                                                    fundProviderId: fund.fund_provider_id,
                                                    organizationId: fund.organization_id,
                                                }}
                                                className="dropdown-item">
                                                Bekijken
                                            </StateNavLink>
                                            <StateNavLink
                                                name={'fund-provider'}
                                                params={{
                                                    id: fund.fund_provider_id,
                                                    fundId: fund.id,
                                                    organizationId: fund.organization_id,
                                                }}
                                                className="dropdown-item">
                                                Bekijken aanbieder
                                            </StateNavLink>

                                            {fund.state === 'approved' && (
                                                <a
                                                    className="dropdown-item"
                                                    href={fund.url_product}
                                                    target={'_blank'}
                                                    rel="noreferrer">
                                                    Bekijk aanbod op webshop
                                                </a>
                                            )}
                                        </div>
                                    )}
                                />
                            </td>
                        </StateNavLink>
                    ))}
                </tbody>
            </table>
        </TableTopScroller>
    );

    if (type === 'table') {
        return tableElement;
    }

    return (
        <div className="card">
            <div className="card-header card-header-next">
                <div className="card-title flex flex-grow">Funds</div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <StateNavLink
                            className="button button-primary"
                            name={'sponsor-provider-organization'}
                            params={{ organizationId: activeOrganization.id, id: product.organization_id }}>
                            <em className="mdi mdi-store-outline icon-start" />
                            Bekijk fondsen van de aanbieder
                        </StateNavLink>
                    </div>
                </div>
            </div>
            <div className="card-section">
                <div className="card-block card-block-table">
                    {configsElement}
                    {tableElement}
                </div>
            </div>
        </div>
    );
}
