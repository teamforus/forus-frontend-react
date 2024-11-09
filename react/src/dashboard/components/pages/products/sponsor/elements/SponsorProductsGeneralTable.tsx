import React from 'react';
import { strLimit } from '../../../../../helpers/string';
import TableRowActions from '../../../../elements/tables/TableRowActions';
import useTranslate from '../../../../../hooks/useTranslate';
import Product from '../../../../../props/models/Product';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import useActiveOrganization from '../../../../../hooks/useActiveOrganization';

export default function SponsorProductsGeneralTable({ products = null }: { products: Array<Product> }) {
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
                    <tr key={product.id}>
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

                        <td>{product.funds.length}</td>

                        <td>{product.price_locale}</td>

                        {product.unlimited_stock ? (
                            <td>{translate('product_edit.labels.unlimited')}</td>
                        ) : (
                            <td>{product.stock_amount}</td>
                        )}

                        <td>{product.product_category.name}</td>

                        <td>
                            <div className="text-medium text-primary">{product.created_at_locale?.split(' - ')[0]}</div>

                            <div className="text-strong text-md text-muted-dark">
                                {product.created_at_locale?.split(' - ')[1]}
                            </div>
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
                                            Bekijken
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
