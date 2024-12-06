import React, { ReactNode } from 'react';
import TableTopScroller from '../tables/TableTopScroller';
import useConfigurableTable, { ConfigurableTableColumn } from '../../pages/vouchers/hooks/useConfigurableTable';
import { FilterModel, FilterScope } from '../../../modules/filter_next/types/FilterParams';

export default function CardTable({
    columns,
    options,
    children,
}: {
    columns: Array<ConfigurableTableColumn>;
    options?: {
        sortable?: boolean;
        sortableExclude?: Array<string>;
        filter?: FilterScope<FilterModel>;
        trPrepend?: ReactNode;
        hasTooltips?: boolean;
    };
    children: ReactNode | ReactNode[];
}) {
    const { headElement, configsElement } = useConfigurableTable(columns, options);

    return (
        <div className="card-block card-block-table form">
            {configsElement}

            <TableTopScroller>
                <table className="table">
                    {headElement}
                    <tbody>{children}</tbody>
                </table>
            </TableTopScroller>
        </div>
    );
}
