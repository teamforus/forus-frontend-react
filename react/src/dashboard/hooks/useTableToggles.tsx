import React, { useCallback, useState } from 'react';

export default function useTableToggles<T = number>(multiselect: boolean = true) {
    const [selected, setSelected] = useState<T[]>([]);

    const toggleAll = useCallback(
        (e: React.MouseEvent, items: Array<{ id: T }>) => {
            e?.stopPropagation();

            setSelected(() => {
                return items.length === selected.length ? [] : items.map((item) => item.id);
            });
        },
        [selected],
    );

    const toggle = useCallback(
        (e, item: { id: T }) => {
            e?.stopPropagation();

            setSelected((selected) => {
                if (!multiselect) {
                    return [item.id];
                }

                if (selected.includes(item.id)) {
                    selected.splice(selected.indexOf(item.id), 1);
                } else {
                    selected.push(item.id);
                }

                return [...selected];
            });
        },
        [multiselect],
    );

    return {
        selected,
        setSelected,
        toggleAll,
        toggle,
    };
}
