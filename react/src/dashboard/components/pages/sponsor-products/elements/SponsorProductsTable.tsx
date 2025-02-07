import React, { Fragment, ReactNode, useCallback, useRef, useState } from 'react';
import { strLimit } from '../../../../helpers/string';
import TableRowActions from '../../../elements/tables/TableRowActions';
import useTranslate from '../../../../hooks/useTranslate';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';
import TableDateTime from '../../../elements/tables/elements/TableDateTime';
import EmptyValue from '../../../../../webshop/components/elements/empty-value/EmptyValue';
import TableEntityMain from '../../../elements/tables/elements/TableEntityMain';
import { ConfigurableTableColumn } from '../../vouchers/hooks/useConfigurableTable';
import ProductMonitoredHistoryCardFunds from '../../sponsor-product/elements/ProductMonitoredHistoryCardFunds';
import Organization from '../../../../props/models/Organization';
import TableTopScroller from '../../../elements/tables/TableTopScroller';

export default function SponsorProductsTable({
    columns = null,
    products = null,
    headElement = null,
    activeOrganization,
}: {
    columns: Array<ConfigurableTableColumn>;
    products: Array<SponsorProduct>;
    headElement: ReactNode;
    activeOrganization: Organization;
}) {
    const translate = useTranslate();
    const [shownIds, setShownIds] = useState<Array<number>>([]);
    const tableRef = useRef<HTMLTableElement>(null);

    const toggleCollapsed = useCallback((e: { stopPropagation: () => void }, id: number) => {
        e.stopPropagation();

        setShownIds((ids) => {
            return ids.includes(id) ? ids.filter((shownId) => shownId !== id) : [...ids, id];
        });
    }, []);

    return (
        <TableTopScroller onScroll={() => tableRef.current?.click()}>
            <table className="table" ref={tableRef}>
                {headElement}

                <tbody>
                    {products?.map((product) => (
                        <Fragment key={product.id}>
                            <StateNavLink
                                name={'sponsor-product'}
                                params={{ productId: product?.id, organizationId: activeOrganization.id }}
                                className={'tr-clickable'}
                                customElement={'tr'}>
                                <td title={product.name}>
                                    <TableEntityMain
                                        title={strLimit(product.name, 64)}
                                        subtitle={strLimit(product.organization.name, 64)}
                                        media={product.photo}
                                        mediaRound={false}
                                        mediaSize={'md'}
                                        mediaPlaceholder={'product'}
                                        collapsedClicked={(e) => toggleCollapsed(e, product.id)}
                                        collapsed={!shownIds.includes(product.id)}
                                    />
                                </td>

                                <td>
                                    <TableDateTime value={product.last_monitored_changed_at_locale} />
                                </td>

                                <td
                                    title={product.funds
                                        .filter((item) => item.state === 'approved')
                                        .map((fund) => fund.name)
                                        ?.join(', ')}>
                                    <div className={'text-primary text-semibold'}>
                                        {product.funds.filter((item) => item.state === 'approved').length}/
                                        {product.funds.length}
                                    </div>
                                </td>

                                <td>{product.price_locale}</td>

                                {product.unlimited_stock ? (
                                    <td>{translate('product_edit.labels.unlimited')}</td>
                                ) : (
                                    <td>{product.stock_amount}</td>
                                )}

                                <td>{product.product_category?.name || <EmptyValue />}</td>

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
                                                    name={'sponsor-product'}
                                                    params={{
                                                        productId: product?.id,
                                                        organizationId: activeOrganization.id,
                                                    }}>
                                                    <em className="mdi mdi-history icon-start" />
                                                    Bekijk aanbod
                                                </StateNavLink>
                                            </div>
                                        )}
                                    />
                                </td>
                            </StateNavLink>

                            {shownIds?.includes(product.id) && (
                                <tr>
                                    <td colSpan={columns.length + 1} className={'td-paddless'}>
                                        <ProductMonitoredHistoryCardFunds
                                            type={'table'}
                                            product={product}
                                            activeOrganization={activeOrganization}
                                        />
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    ))}
                </tbody>
            </table>
        </TableTopScroller>
    );
}
