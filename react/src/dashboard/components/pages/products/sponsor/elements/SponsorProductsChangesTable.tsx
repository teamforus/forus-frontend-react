import React from 'react';
import { strLimit } from '../../../../../helpers/string';
import TableRowActions from '../../../../elements/tables/TableRowActions';
import useTranslate from '../../../../../hooks/useTranslate';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import useActiveOrganization from '../../../../../hooks/useActiveOrganization';
import FundProviderProduct from '../../../../../props/models/FundProviderProduct';

export default function SponsorProductsChangesTable({
    products = null,
    groupBy = null,
}: {
    products: Array<FundProviderProduct>;
    groupBy: string;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const activeOrganization = useActiveOrganization();

    return (
        <table className="table">
            <thead>
                <tr>
                    <th className={'nowrap'}>{translate('sponsor_products.labels.name')}</th>

                    <th className={'nowrap'}>{translate('sponsor_products.labels.provider_name')}</th>

                    <th>{translate('sponsor_products.labels.last_updated')}</th>

                    {groupBy != 'per_product' && <th>{translate('sponsor_products.labels.fund')}</th>}

                    {groupBy == 'per_product' && <th>{translate('sponsor_products.labels.nr_changes')}</th>}

                    <th className="text-right nowrap th-narrow" />
                </tr>
            </thead>

            <tbody>
                {products?.map((product, index) => (
                    <tr key={index}>
                        <td>
                            <div className="td-collapsable">
                                <img
                                    className="td-media td-media-sm"
                                    src={
                                        product?.photo?.sizes?.small ||
                                        assetUrl('/assets/img/placeholders/product-small.png')
                                    }
                                    alt={product.name}
                                />
                                <div className="collapsable-content">
                                    <div className="text-primary text-medium">{strLimit(product.name, 50)}</div>
                                </div>
                            </div>
                        </td>

                        <td className="nowrap">{strLimit(product.organization.name, 50)}</td>

                        <td>
                            <div className="text-medium text-primary">{product.updated_at_locale?.split(' - ')[0]}</div>

                            <div className="text-strong text-md text-muted-dark">
                                {product.updated_at_locale?.split(' - ')[1]}
                            </div>
                        </td>

                        {groupBy != 'per_product' && <td>{product.fund.name}</td>}

                        {groupBy == 'per_product' && <td>{product.digest_logs_count}</td>}

                        <td className={'table-td-actions'}>
                            <TableRowActions
                                content={() => (
                                    <div className="dropdown dropdown-actions">
                                        <StateNavLink
                                            className="dropdown-item"
                                            name={'fund-provider-product'}
                                            params={{
                                                organizationId: activeOrganization.id,
                                                fundId: product.fund_id,
                                                fundProviderId: product.fund_provider_id,
                                                id: product.id,
                                            }}>
                                            <em className="mdi mdi-eye icon-start" />
                                            Bekijken
                                        </StateNavLink>

                                        <StateNavLink
                                            className="dropdown-item"
                                            name={'fund-provider-product'}
                                            params={{
                                                organizationId: activeOrganization.id,
                                                fundId: product.fund_id,
                                                fundProviderId: product.fund_provider_id,
                                                id: product.id,
                                            }}
                                            query={{ source_id: product.id }}>
                                            <em className="mdi mdi-content-copy icon-start" />
                                            Kopieren
                                        </StateNavLink>

                                        <StateNavLink
                                            className="dropdown-item"
                                            name={'sponsor-product-logs'}
                                            params={{
                                                organizationId: activeOrganization.id,
                                                fundId: product.fund_id,
                                                fundProviderId: product.fund_provider_id,
                                                id: product.id,
                                            }}>
                                            <em className="mdi mdi-history icon-start" />
                                            Geschiedenis
                                        </StateNavLink>
                                    </div>
                                )}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
