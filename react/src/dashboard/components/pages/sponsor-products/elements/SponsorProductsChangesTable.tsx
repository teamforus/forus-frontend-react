import React, { Fragment, ReactNode, useCallback, useRef, useState } from 'react';
import { strLimit } from '../../../../helpers/string';
import TableRowActions from '../../../elements/tables/TableRowActions';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import TableDateTime from '../../../elements/tables/elements/TableDateTime';
import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';
import { ConfigurableTableColumn } from '../../vouchers/hooks/useConfigurableTable';
import ProductMonitoredHistoryCardFunds from '../../sponsor-product/elements/ProductMonitoredHistoryCardFunds';
import TableEntityMain from '../../../elements/tables/elements/TableEntityMain';
import Organization from '../../../../props/models/Organization';
import TableTopScroller from '../../../elements/tables/TableTopScroller';

export default function SponsorProductsChangesTable({
    columns,
    products = null,
    headElement = null,
    activeOrganization,
}: {
    columns: Array<ConfigurableTableColumn>;
    products: Array<SponsorProduct>;
    headElement: ReactNode;
    activeOrganization: Organization;
}) {
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
            <table className="table">
                {headElement}

                <tbody>
                    {products?.map((product, index) => (
                        <Fragment key={index}>
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
                                        mediaSize={'md'}
                                        mediaRound={false}
                                        mediaPlaceholder={'product'}
                                        collapsedClicked={(e) => toggleCollapsed(e, product.id)}
                                        collapsed={!shownIds.includes(product.id)}
                                    />
                                </td>

                                <td>
                                    <TableDateTime value={product.last_monitored_changed_at_locale} />
                                </td>

                                <td>{product.monitored_changes_count}</td>

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

                                <td className={'table-td-actions text-right'}>
                                    <TableRowActions
                                        content={() => (
                                            <div className="dropdown dropdown-actions">
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
