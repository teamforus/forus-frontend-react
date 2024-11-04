import React from 'react';
import { strLimit } from '../../../../../helpers/string';
import TableRowActions from '../../../../elements/tables/TableRowActions';
import useTranslate from '../../../../../hooks/useTranslate';
import Product from '../../../../../props/models/Product';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import useActiveOrganization from '../../../../../hooks/useActiveOrganization';

export default function SponsorProductsChangesTable({
    products = null,
    groupBy = null,
}: {
    products: Array<Product>;
    groupBy: string;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const activeOrganization = useActiveOrganization();

    console.log('provider id: ', products[0].funds?.[0].fund_providers[0]?.id);
    console.log('fund id: ', products[0].funds?.[0].id);

    return (
        <table className="table">
            <thead>
                <tr>
                    <th className={'nowrap'}>{translate('sponsor_products.labels.name')}</th>

                    <th className={'nowrap'}>{translate('sponsor_products.labels.provider_name')}</th>

                    <th>{translate('sponsor_products.labels.last_updated')}</th>

                    <th>{translate('sponsor_products.labels.fund')}</th>

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

                        <td>{product.funds.map((fund) => fund.name).join(', ')}</td>

                        {groupBy == 'per_product' && <td>{product.digest_logs_count}</td>}

                        <td className={'table-td-actions'}>
                            <TableRowActions
                                content={() => (
                                    <div className="dropdown dropdown-actions">
                                        <div className="dropdown-item">
                                            <em className={'mdi mdi-eye icon-start'} />
                                            Bekijken
                                        </div>
                                        <div className="dropdown-item">
                                            <em className="mdi mdi-content-copy icon-start" />
                                            Kopieren
                                        </div>
                                        <StateNavLink
                                            className="dropdown-item"
                                            name={'sponsor-product-logs'}
                                            params={{
                                                organizationId: activeOrganization.id,
                                                fundId: product.funds?.[0].id,
                                                fundProviderId: product.funds?.[0]?.fund_providers?.[0]?.id,
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
