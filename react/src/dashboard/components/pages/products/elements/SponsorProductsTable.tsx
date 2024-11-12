import React from 'react';
import { strLimit } from '../../../../helpers/string';
import TableRowActions from '../../../elements/tables/TableRowActions';
import useTranslate from '../../../../hooks/useTranslate';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';
import TableDateTime from '../../../elements/tables/elements/TableDateTime';

export default function SponsorProductsTable({ products = null }: { products: Array<SponsorProduct> }) {
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
                    <th>{translate('sponsor_products.labels.nr_funds')}</th>
                    <th>{translate('sponsor_products.labels.price')}</th>
                    <th>{translate('sponsor_products.labels.stock_amount')}</th>
                    <th>{translate('sponsor_products.labels.category')}</th>
                    <th>{translate('sponsor_products.labels.created_at')}</th>
                    <th className="text-right nowrap th-narrow" />
                </tr>
            </thead>

            <tbody>
                {products?.map((product) => (
                    <StateNavLink
                        name={'sponsor-provider-organization'}
                        params={{
                            organizationId: activeOrganization.id,
                            id: product.organization_id,
                        }}
                        className={'tr-clickable'}
                        customElement={'tr'}
                        key={product.id}>
                        <td title={product.name}>
                            <div className="td-collapsable">
                                <img
                                    className="td-media td-media-sm"
                                    src={
                                        product?.photo?.sizes?.thumbnail ||
                                        assetUrl('/assets/img/placeholders/product-thumbnail.png')
                                    }
                                    alt={product.name}
                                />
                                <div className="collapsable-content">
                                    <div className="text-primary text-medium">{strLimit(product.name, 64)}</div>
                                </div>
                            </div>
                        </td>

                        <td className="nowrap" title={product.organization.name}>
                            {strLimit(product.organization.name, 32)}
                        </td>

                        <td>
                            <TableDateTime value={product.last_monitored_changed_at_locale} />
                        </td>

                        <td>{product.funds.length}</td>
                        <td>{product.price_locale}</td>

                        {product.unlimited_stock ? (
                            <td>{translate('product_edit.labels.unlimited')}</td>
                        ) : (
                            <td>{product.stock_amount}</td>
                        )}

                        <td>{product.product_category.name}</td>

                        <td>
                            <TableDateTime value={product.created_at_locale} />
                        </td>

                        <td className={'table-td-actions'}>
                            <TableRowActions
                                content={() => (
                                    <div className="dropdown dropdown-actions">
                                        <StateNavLink
                                            className="dropdown-item"
                                            name={'sponsor-provider-organization'}
                                            params={{
                                                organizationId: activeOrganization.id,
                                                id: product.organization_id,
                                            }}>
                                            <em className="mdi mdi-eye icon-start" />
                                            Bekijk aanbieder
                                        </StateNavLink>
                                        <StateNavLink
                                            className="dropdown-item"
                                            name={'sponsor-product-history'}
                                            params={{
                                                id: product?.id,
                                                organizationId: activeOrganization.id,
                                            }}>
                                            <em className="mdi mdi-history icon-start" />
                                            Bekijk geschiedenis
                                        </StateNavLink>
                                    </div>
                                )}
                            />
                        </td>
                    </StateNavLink>
                ))}
            </tbody>
        </table>
    );
}
