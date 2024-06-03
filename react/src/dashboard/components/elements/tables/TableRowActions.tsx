import React, { useCallback } from 'react';
import ClickOutside from '../click-outside/ClickOutside';

export default function TableRowActions<T = number>({
    activeId,
    setActiveId,
    id,
    children,
}: {
    activeId: T;
    setActiveId: React.Dispatch<React.SetStateAction<T>>;
    id: T;
    children: React.ReactElement;
}) {
    const toggleActions = useCallback(
        (e, id: T) => {
            e.stopPropagation();
            setActiveId((activeId) => (activeId === id ? null : id));
        },
        [setActiveId],
    );

    return (
        <div className="button button-text button-menu" onClick={(e) => toggleActions(e, id)}>
            <em className="mdi mdi-dots-horizontal" />
            {id === activeId && (
                <ClickOutside
                    onClick={(e) => e.stopPropagation()}
                    onClickOutside={(e) => toggleActions(e, id)}
                    className="menu-dropdown">
                    <div className="menu-dropdown-arrow" />
                    {children}
                </ClickOutside>
            )}
        </div>
    );
}
