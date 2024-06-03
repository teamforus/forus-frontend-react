import React, { useCallback } from 'react';
import ClickOutside from '../click-outside/ClickOutside';

export default function TableRowActions(props: {
    actions: Array<unknown>;
    setActions: (actions: Array<unknown>) => void;
    modelItem: { id: number };
    children: React.ReactElement;
}) {
    const toggleActions = useCallback(
        (e, item) => {
            e.stopPropagation();

            if (props.actions.indexOf(item.id) !== -1) {
                props.actions.splice(props.actions.indexOf(item.id), 1);
            } else {
                props.actions.push(item.id);
            }

            props.setActions([...props.actions]);
        },
        [props],
    );

    return (
        <div
            className="button button-text button-icon button-menu pull-right active"
            onClick={(e) => toggleActions(e, props.modelItem)}>
            <em className="mdi mdi-dots-horizontal" />
            {props.actions.indexOf(props.modelItem.id) !== -1 && (
                <ClickOutside
                    onClick={null}
                    onClickOutside={(e) => toggleActions(e, props.modelItem)}
                    className="menu-dropdown">
                    <div className="menu-dropdown-arrow"></div>
                    {props.children}
                </ClickOutside>
            )}
        </div>
    );
}
