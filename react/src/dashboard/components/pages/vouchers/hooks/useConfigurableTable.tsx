import React, { useCallback, useMemo, useRef, useState } from 'react';
import TableConfig from '../../../elements/table-config/TableConfig';
import useSetToast from '../../../../hooks/useSetToast';

export type ConfigurableTableColumn = {
    key: string;
    label: string;
    value?: string;
    tooltip: { key: string; title: string; description: string };
};

export default function useConfigurableTable(columns: Array<ConfigurableTableColumn>) {
    const setToast = useSetToast();

    const [activeTooltipKey, setActiveTooltipKey] = useState<string>(null);
    const [tooltipTimeout, setTooltipTimeout] = useState<number>(null);
    const [showTableConfig, setShowTableConfig] = useState<boolean>(false);
    const [tableConfigCategory, setTableConfigCategory] = useState<string>('tooltips');
    const settingsRef = useRef<HTMLDivElement>(null);

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
        (tooltipKey) => {
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

    return {
        columns,
        columnKeys,
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
