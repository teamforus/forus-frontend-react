import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TableConfig from '../../../elements/table-config/TableConfig';
import useSetToast from '../../../../hooks/useSetToast';
import ThSortable from '../../../elements/tables/ThSortable';
import TableTopScrollerConfigTh from '../../../elements/tables/TableTopScrollerConfigTh';
import useTranslate from '../../../../hooks/useTranslate';
import { FilterModel, FilterScope } from '../../../../modules/filter_next/types/FilterParams';

export type ConfigurableTableColumn = {
    key: string;
    label: string;
    value?: string;
    tooltip?: { key: string; title: string; description: string };
};

export default function useConfigurableTable(
    columns: Array<ConfigurableTableColumn>,
    options?: {
        sortable?: boolean;
        sortableExclude?: Array<string>;
        filter?: FilterScope<FilterModel>;
        trPrepend?: ReactNode;
        hasTooltips?: boolean;
    },
) {
    const setToast = useSetToast();

    const translate = useTranslate();
    const [activeTooltipKey, setActiveTooltipKey] = useState<string>(null);
    const [tooltipTimeout, setTooltipTimeout] = useState<number>(null);
    const [showTableConfig, setShowTableConfig] = useState<boolean>(false);
    const [tableConfigCategory, setTableConfigCategory] = useState<string>('tooltips');
    const settingsRef = useRef<HTMLDivElement>(null);

    const {
        sortable = false,
        sortableExclude = [],
        filter = null,
        trPrepend = null,
        hasTooltips = true,
    } = options || {};

    const [columnsCached, setColumnsCached] = useState<Array<ConfigurableTableColumn>>(columns);

    useEffect(() => {
        setColumnsCached((value) => {
            return JSON.stringify(columns) != JSON.stringify(value) ? columns : value;
        });
    }, [columns]);

    const displayTableConfig = useCallback(
        (key: string) => {
            if ((showTableConfig && tableConfigCategory == key) || !key) {
                setShowTableConfig(false);
                return;
            }

            setShowTableConfig(true);
            setTableConfigCategory(key);
        },
        [showTableConfig, tableConfigCategory],
    );

    const showTableTooltip = useCallback(
        (tooltipKey?: string) => {
            setActiveTooltipKey(null);

            if (!tooltipKey) {
                return;
            }

            if (showTableConfig && tableConfigCategory == 'tooltips') {
                // scroll into view
                setTooltipTimeout(
                    window.setTimeout(() => {
                        setActiveTooltipKey(tooltipKey);

                        settingsRef.current
                            ?.querySelector(`[data-table-tooltip="${tooltipKey || 'status'}"]`)
                            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 200),
                );
            } else {
                setToast(`Klik op het informatie icoon rechtsboven in de tabel voor meer uitleg over deze pagina.`);
            }
        },
        [setToast, showTableConfig, tableConfigCategory],
    );

    const hideTableTooltip = useCallback(() => {
        window.clearTimeout(tooltipTimeout);
        setToast(null);
    }, [setToast, tooltipTimeout]);

    const columnKeys = useMemo(() => {
        return columns.map((column) => column.key);
    }, [columns]);

    const tooltips = useMemo(() => {
        return columns.filter((column) => column.tooltip).reduce((val, item) => [...val, item.tooltip], []);
    }, [columns]);

    const configsElement = useMemo(() => {
        return (
            showTableConfig && (
                <TableConfig
                    settingsRef={settingsRef}
                    tooltips={tooltips}
                    selectedCategory={tableConfigCategory}
                    activeTooltipKey={activeTooltipKey}
                    setSelectedCategory={setTableConfigCategory}
                    onClose={() => setShowTableConfig(false)}
                />
            )
        );
    }, [activeTooltipKey, showTableConfig, tableConfigCategory, tooltips]);

    const headElement = useMemo(() => {
        return (
            <thead>
                <tr>
                    {trPrepend}

                    {columns.map((column, index: number) =>
                        sortable ? (
                            <ThSortable
                                key={index}
                                onMouseOver={() => (hasTooltips ? showTableTooltip(column.tooltip?.key) : null)}
                                onMouseLeave={() => (hasTooltips ? hideTableTooltip() : null)}
                                filter={filter}
                                value={sortableExclude?.includes(column.key) ? null : column.key}
                                label={translate(column.label)}
                            />
                        ) : (
                            <ThSortable
                                key={index}
                                label={translate(column.label)}
                                onMouseOver={() => (hasTooltips ? showTableTooltip(column.tooltip?.key) : null)}
                                onMouseLeave={() => (hasTooltips ? hideTableTooltip() : null)}
                            />
                        ),
                    )}

                    <TableTopScrollerConfigTh
                        hidden={!hasTooltips}
                        showTableConfig={showTableConfig}
                        displayTableConfig={displayTableConfig}
                        tableConfigCategory={tableConfigCategory}
                    />
                </tr>
            </thead>
        );
    }, [
        columns,
        showTableConfig,
        displayTableConfig,
        tableConfigCategory,
        sortable,
        sortableExclude,
        filter,
        translate,
        showTableTooltip,
        hideTableTooltip,
        trPrepend,
        hasTooltips,
    ]);

    return {
        columns: columnsCached,
        columnKeys,
        headElement,
        configsElement,
        tableConfigCategory,
        activeTooltipKey,
        setTableConfigCategory,
        showTableTooltip,
        hideTableTooltip,
        showTableConfig,
        displayTableConfig,
    };
}
