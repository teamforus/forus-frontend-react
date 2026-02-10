import React, { ReactNode } from 'react';
import TableTopScroller from '../tables/TableTopScroller';
import useConfigurableTable, { ConfigurableTableColumn } from '../../pages/vouchers/hooks/useConfigurableTable';
import { FilterModel, FilterScope } from '../../../modules/filter_next/types/FilterParams';

export type LoaderTableCardSectionOptions = {
    sortable?: boolean;
    sortableExclude?: Array<string>;
    filter?: FilterScope<FilterModel>;
    trPrepend?: ReactNode;
    hasTooltips?: boolean;
};

export default function LoaderTableCardSection({
    columns,
    options,
    children,
    dusk,
}: {
    columns: Array<ConfigurableTableColumn>;
    options?: LoaderTableCardSectionOptions;
    children: ReactNode | ReactNode[];
    dusk?: string;
}) {
    const { headElement, configsElement } = useConfigurableTable(columns, options);

    return (
        <div className="card-section" data-dusk={dusk}>
            <div className="card-block card-block-table form">
                {configsElement}

                <TableTopScroller>
                    <table className="table">
                        {headElement}
                        <tbody>{children}</tbody>
                    </table>
                </TableTopScroller>
            </div>
        </div>
    );
}
