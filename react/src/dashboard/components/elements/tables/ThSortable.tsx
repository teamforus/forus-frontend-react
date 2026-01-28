import React, { CSSProperties, MouseEventHandler, useCallback } from 'react';
import classNames from 'classnames';
import { FilterModel, FilterScope } from '../../../modules/filter_next/types/FilterParams';

enum OrderDir {
    asc = 'asc',
    desc = 'desc',
}

export default function ThSortable({
    label,
    value,
    filter = null,
    onMouseOver,
    onMouseLeave,
    disabled = false,
    className,
    style = null,
}: {
    label: string;
    value?: string;
    filter?: FilterScope<FilterModel>;
    onMouseOver?: MouseEventHandler<HTMLTableCellElement>;
    onMouseLeave?: MouseEventHandler<HTMLTableCellElement>;
    disabled?: boolean;
    className?: string;
    style?: CSSProperties;
}) {
    const orderBy = useCallback(
        (value) => {
            if (value === filter?.values.order_by) {
                return filter?.update({
                    order_by: value,
                    order_dir: filter?.values.order_dir === OrderDir.asc ? OrderDir.desc : OrderDir.asc,
                });
            }

            return filter?.update({
                order_by: value,
                order_dir: OrderDir.desc,
            });
        },
        [filter],
    );

    return (
        <th className={classNames(className)} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave} style={style}>
            {disabled || !value ? (
                label
            ) : (
                <div
                    className={classNames(
                        'th-sort',
                        value && 'th-sort-enabled',
                        value == filter?.values.order_by && 'th-sort-active',
                    )}
                    onClick={() => orderBy(value)}>
                    <div className="th-sort-label">{label}</div>

                    <div className="th-sort-icon">
                        {filter?.values.order_by != value || filter?.values.order_dir === 'desc' ? (
                            <em className="mdi mdi-menu-down" />
                        ) : (
                            <em className="mdi mdi-menu-up" />
                        )}
                    </div>
                </div>
            )}
        </th>
    );
}
