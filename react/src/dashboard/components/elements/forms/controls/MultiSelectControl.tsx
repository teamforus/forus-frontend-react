import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { uniq, uniqueId } from 'lodash';
import SelectControl from '../../select-control/SelectControl';
import Label from '../../image_cropper/Label';

export default function MultiSelectControl<T = number>({
    id = uniqueId('multiselect_'),
    label = null,
    value = null,
    options = [],
    placeholder,
    onChange = null,
}: {
    id?: string;
    label: string;
    placeholder?: string;
    options?: Array<{ id: T; name?: string }>;
    value?: Array<T>;
    onChange: (value: Array<T>) => void;
}) {
    const [selected, setSelected] = useState(null);
    const [optionsAvailable, setOptionsAvailable] = useState([]);
    const [placeholderOption] = useState({ id: null, name: placeholder || 'Selecteer categorie' });

    const optionsById = useMemo(() => {
        return options.reduce((list, item) => ({ ...list, [item.id.toString()]: item.name }), {});
    }, [options]);

    const removeItem = useCallback(
        (id: T) => {
            if (value?.includes(id)) {
                value.splice(value?.indexOf(id), 1);
                onChange([...value]);
            }
        },
        [onChange, value],
    );

    const selectOption = useCallback(
        (id: T) => {
            if (id?.toString() in optionsById) {
                onChange(uniq([...(value || []), id]));
                setSelected(null);
            }
        },
        [onChange, optionsById, value],
    );

    useEffect(() => {
        setOptionsAvailable(() => {
            const availableOptions = options.map((option) => {
                return !value?.includes(option.id) ? { id: option.id, name: option.name } : null;
            });

            return [placeholderOption, ...availableOptions.filter((option) => option)];
        });
    }, [options, placeholderOption, value]);

    return (
        <div>
            <div className="form-group">
                <label className="form-label" htmlFor={id}>
                    {label}
                </label>
                <SelectControl propKey={'id'} value={selected} options={optionsAvailable} onChange={selectOption} />
            </div>

            {value?.length > 0 && (
                <div className="form-group">
                    <label className="form-label">&nbsp;</label>

                    {value?.map((id) => (
                        <Label type="primary" key={id.toString()}>
                            {optionsById?.[id.toString()] || ''}
                            <div className="mdi mdi-close label-close" onClick={() => removeItem(id)} />
                        </Label>
                    ))}
                </div>
            )}
        </div>
    );
}
