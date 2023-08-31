import React, { Fragment } from 'react';
import { OptionType } from '../../SelectControl';

export default function SelectControlOptionItem<T>({
    option,
    selectOption,
}: {
    option: OptionType<T>;
    selectOption: (options: OptionType<T>) => void;
}) {
    return (
        <div
            className={'select-control-option'}
            onClick={(e) => {
                e.stopPropagation();
                selectOption(option);
            }}
            role="option">
            {option.labelFormat?.map((str, index) => (
                <Fragment key={str.id}>{index != 1 ? <span>{str.value}</span> : <strong>{str.value}</strong>}</Fragment>
            ))}
        </div>
    );
}
