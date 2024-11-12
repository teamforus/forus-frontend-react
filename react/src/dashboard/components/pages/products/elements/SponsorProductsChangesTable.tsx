import React, { ReactNode } from 'react';
import { strLimit } from '../../../../helpers/string';
import TableRowActions from '../../../elements/tables/TableRowActions';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import TableDateTime from '../../../elements/tables/elements/TableDateTime';
import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';

export default function SponsorProductsChangesTable({
    products = null,
    headElement = null,
}: {
    products: Array<SponsorProduct>;
    headElement: ReactNode;
}) {
    const assetUrl = useAssetUrl();
    const activeOrganization = useActiveOrganization();

    return (
        <table className="table">
            {headElement}

            <tbody>
                {products?.map((product, index) => (
                    <StateNavLink
                        name={'sponsor-product-history'}
                        params={{
                            id: product?.id,
                            organizationId: activeOrganization.id,
                        }}
                        className={'tr-clickable'}
                        customElement={'tr'}
                        key={index}>
                        <td>
                            <div className="td-collapsable">
                                <img
                                    className="td-media td-media-sm"
                                    src={
                                        product?.photo?.sizes?.thumbnail ||
                                        assetUrl('/assets/img/placeholders/product-thumbnail.png')
                                    }
                                    alt={product?.name}
                                />
                                <div className="collapsable-content">
                                    <div className="text-primary text-medium">{strLimit(product?.name, 64)}</div>
                                </div>
                            </div>
                        </td>

                        <td className="nowrap">{strLimit(product?.organization.name, 32)}</td>

                        <td>
                            <TableDateTime value={product.last_monitored_changed_at_locale} />
                        </td>

                        <td>{product.monitored_changes_count}</td>

                        <td title={product.funds.map((fund) => fund.name)?.join(', ')}>
                            <div className={'text-primary text-medium'}>{product.funds.length}</div>
                        </td>

                        <td className={'table-td-actions'}>
                            <TableRowActions
                                content={() => (
                                    <div className="dropdown dropdown-actions">
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
