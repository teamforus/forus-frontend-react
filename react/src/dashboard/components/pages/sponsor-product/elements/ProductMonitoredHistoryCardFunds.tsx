import React, { Fragment } from 'react';
import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';
import TableEntityMain from '../../../elements/tables/elements/TableEntityMain';
import TableRowActions from '../../../elements/tables/TableRowActions';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { useFundService } from '../../../../services/FundService';
import Organization from '../../../../props/models/Organization';
import classNames from 'classnames';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import Label from '../../../elements/label/Label';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';

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

    const tableElement = (
        <LoaderTableCard
            empty={product.funds?.length === 0}
            emptyTitle={'Geen fondsen'}
            columns={fundService.getColumnsProductFunds()}
            tableOptions={{ hasTooltips: type !== 'table' }}>
            {product.funds?.map((fund) => (
                <StateNavLink
                    disabled={!fund.fund_provider_id}
                    name={DashboardRoutes.FUND_PROVIDER_PRODUCT}
                    params={{
                        id: product.id,
                        fundId: fund.id,
                        fundProviderId: fund.fund_provider_id,
                        organizationId: fund.organization_id,
                    }}
                    className={classNames(
                        fund.fund_provider_id && 'tr-clickable',
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
                        {fund.implementation ? (
                            <Fragment>
                                {fund.state === 'approved' ? (
                                    <a
                                        title={'Bekijk aanbod op webshop'}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-primary text-semibold flex flex-gap-sm text-underline"
                                        href={fund.url_product}
                                        target={'_blank'}
                                        rel="noreferrer">
                                        {fund.implementation?.name}
                                        <em className="mdi mdi-link-variant icon-end" />
                                    </a>
                                ) : (
                                    fund.implementation?.name
                                )}
                            </Fragment>
                        ) : (
                            <TableEmptyValue />
                        )}
                    </td>
                    <td>
                        {fund.state === 'approved' && <Label type="success">{fund.state_locale}</Label>}
                        {fund.state === 'pending' && <Label type="default">{fund.state_locale}</Label>}
                        {fund.state === 'not_applied' && <Label type="warning">{fund.state_locale}</Label>}
                    </td>
                    <td className={'table-td-actions text-right'}>
                        <TableRowActions
                            disabled={!fund.fund_provider_id && !(fund.state === 'approved' && fund.url_product)}
                            content={() => (
                                <div className="dropdown dropdown-actions">
                                    {fund.fund_provider_id && (
                                        <StateNavLink
                                            name={DashboardRoutes.FUND_PROVIDER_PRODUCT}
                                            params={{
                                                id: product.id,
                                                fundId: fund.id,
                                                fundProviderId: fund.fund_provider_id,
                                                organizationId: fund.organization_id,
                                            }}
                                            className="dropdown-item">
                                            Bekijk aanbod
                                        </StateNavLink>
                                    )}

                                    {fund.fund_provider_id && (
                                        <StateNavLink
                                            name={DashboardRoutes.FUND_PROVIDER}
                                            params={{
                                                id: fund.fund_provider_id,
                                                fundId: fund.id,
                                                organizationId: fund.organization_id,
                                            }}
                                            className="dropdown-item">
                                            Bekijk aanbieder
                                        </StateNavLink>
                                    )}

                                    {fund.state === 'approved' && fund.url_product && (
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
        </LoaderTableCard>
    );

    if (type === 'table') {
        return tableElement;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">Fondsen</div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <StateNavLink
                            className="button button-primary"
                            name={DashboardRoutes.SPONSOR_PROVIDER_ORGANIZATION}
                            params={{ organizationId: activeOrganization.id, id: product.organization_id }}>
                            <em className="mdi mdi-store-outline icon-start" />
                            Bekijk fondsen van de aanbieder
                        </StateNavLink>
                    </div>
                </div>
            </div>
            {tableElement}
        </div>
    );
}
