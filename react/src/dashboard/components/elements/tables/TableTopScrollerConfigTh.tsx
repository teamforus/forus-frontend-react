import React from 'react';
import classNames from 'classnames';

export default function TableTopScrollerConfigTh({
    hidden = false,
    showTableConfig,
    displayTableConfig,
    tableConfigCategory,
}: {
    hidden?: boolean;
    showTableConfig: boolean;
    displayTableConfig: (key: string) => void;
    tableConfigCategory: string;
}) {
    return (
        !hidden && (
            <th className="table-th-actions table-th-actions-with-list">
                <div className="table-th-actions-list">
                    <div
                        className={classNames(
                            'table-th-action',
                            showTableConfig && tableConfigCategory == 'tooltips' && 'active',
                        )}
                        onClick={() => displayTableConfig('tooltips')}>
                        <em className="mdi mdi-information-variant-circle" />
                    </div>
                </div>
            </th>
        )
    );
}
