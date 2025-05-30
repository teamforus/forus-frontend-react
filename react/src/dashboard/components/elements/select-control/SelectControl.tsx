import React, {
    FunctionComponent,
    HTMLInputAutoCompleteAttribute,
    UIEventHandler,
    useCallback,
    useEffect,
    useState,
} from 'react';
import './styles/ui-select.scss';
import { uniqueId } from 'lodash';
// import SelectControlOptions from './templates/SelectControlOptions';
import SelectControlOptionsFD from './templates/SelectControlOptionsFD';

type SelectControlProps<T> = {
    id?: string;
    options?: Array<T>;
    propKey?: string | null;
    propValue?: string | null;
    strict?: boolean;
    allowSearch?: boolean;
    autoClear?: boolean;
    value?: T | string | number | boolean;
    onChange: CallableFunction;
    onCreate?: CallableFunction;
    onSearchChange?: CallableFunction;
    placeholder?: string | null;
    disabled?: boolean;
    className?: string;
    scrollSize?: number;
    dusk?: string;
    optionsComponent?: FunctionComponent<SelectControlOptionsProp<T>>;
    multiline?: boolean | { selected: boolean; options: boolean };
    searchAutoComplete?: HTMLInputAutoCompleteAttribute;
};

export interface OptionType<T> {
    raw: T;
    id: string;
    label: number;
    _index: number;
    labelFormat?: Array<{ id: number; value: string }>;
}

export type SelectControlOptionsProp<T> = {
    id?: string;
    dusk: string;
    query: string;
    setQuery: (query: string) => void;
    optionsFiltered: Array<OptionType<T>>;
    placeholderValue: string;
    placeholder: string;
    showOptions: boolean;
    selectOption: (option: OptionType<T>) => void;
    allowSearch: boolean;
    visibleCount: number;
    setVisibleCount: (visibleCount: number) => void;
    className?: string;
    onInputClick: (e: React.MouseEvent<HTMLInputElement>) => void;
    modelValue?: { id: string; value: unknown; raw: T };
    searchOption: (e: React.MouseEvent<HTMLElement>) => void;
    setShowOptions?: React.Dispatch<React.SetStateAction<boolean>>;
    searchInputChanged: () => void;
    searchAutoComplete?: HTMLInputAutoCompleteAttribute;
    onOptionsScroll: UIEventHandler;
    disabled?: boolean;
    rawValue?: unknown;
    propKey?: string | null;
    propValue?: string | null;
    multiline?: boolean | { selected: boolean; options: boolean };
};

export default function SelectControl<T>({
    id = null,
    propKey = null,
    propValue = 'name',
    options = [],
    strict = false,
    allowSearch = false,
    autoClear = true,
    value = null,
    placeholder = null,
    onChange = null,
    onSearchChange = null,
    disabled = false,
    className = null,
    scrollSize = 50,
    optionsComponent = SelectControlOptionsFD,
    searchAutoComplete = 'off',
    dusk = null,
    multiline,
}: SelectControlProps<T>) {
    const [query, setQuery] = useState('');
    const [modelValue, setModelValue] = useState(null);
    const [showOptions, setShowOptions] = useState(false);
    const [visibleCount, setVisibleCount] = useState(scrollSize);
    const [optionsPrepared, setOptionsPrepared] = useState([]);
    const [optionsFiltered, setOptionsFiltered] = useState([]);
    const [scrollEndThreshold] = useState(10);

    const [placeholderValue, setPlaceholderValue] = useState('');

    const findValue = useCallback(
        (value: T | string | number | boolean) => {
            return optionsPrepared.find((option) => {
                if (strict) {
                    return propKey ? option.raw[propKey] === value : option.raw == value;
                }

                return propKey ? option.raw[propKey] == value : option.raw == value;
            });
        },
        [optionsPrepared, propKey, strict],
    );

    const prepareOptions = useCallback(
        (search: string) => {
            const options = optionsPrepared
                .map((option) => ({ ...option, _index: option.label.indexOf(search) }))
                .filter((option) => option._index > -1);

            if (search) {
                options.sort((a, b) => a._index - b._index);
            }

            return options;
        },
        [optionsPrepared],
    );

    const buildSearchedOptions = useCallback(() => {
        const search = query.toLowerCase().trim();
        const search_len = search.length;
        const options = allowSearch ? prepareOptions(search) : optionsPrepared;

        setOptionsFiltered(
            options.map((option: OptionType<T>) => {
                const end = -(option.raw[propValue]?.length - (option._index + search_len));
                const labelFormat = allowSearch
                    ? [
                          { id: uniqueId(), value: option.raw[propValue].slice(0, option._index) },
                          {
                              id: uniqueId(),
                              value: option.raw[propValue].slice(option._index, option._index + search_len),
                          },
                          { id: uniqueId(), value: end < 0 ? option.raw[propValue].slice(end) : '' },
                      ]
                    : [{ id: uniqueId(), value: option.raw[propValue] }];

                return { ...option, labelFormat };
            }),
        );
    }, [query, allowSearch, prepareOptions, optionsPrepared, propValue]);

    const searchInputChanged = useCallback(() => {
        buildSearchedOptions();
    }, [buildSearchedOptions]);

    const onInputClick = useCallback(
        (e: React.MouseEvent<HTMLInputElement>) => {
            e.stopPropagation();

            if (allowSearch && autoClear) {
                setQuery('');
            }

            searchInputChanged();
        },
        [allowSearch, autoClear, searchInputChanged],
    );

    const searchOption = useCallback(() => {
        if (disabled || showOptions) {
            setShowOptions(false);
            return;
        }

        setShowOptions(true);

        if (allowSearch && strict && modelValue && modelValue[propValue]) {
            setQuery(modelValue[propValue]);
        }

        buildSearchedOptions();
    }, [disabled, showOptions, allowSearch, strict, modelValue, propValue, buildSearchedOptions]);

    const selectOption = useCallback(
        (option: OptionType<T>) => {
            setModelValue(option);
            setQuery('');
            onChange(propKey ? option.raw[propKey] : option.raw);

            setShowOptions(false);

            if (onSearchChange) {
                onSearchChange();
            }
        },
        [onChange, onSearchChange, propKey],
    );

    const onOptionsScroll: UIEventHandler = useCallback(
        (e) => {
            const top = e.currentTarget.scrollTop + e.currentTarget.clientHeight;

            if (top >= e.currentTarget.scrollHeight - scrollEndThreshold) {
                setVisibleCount((visibleCount) => visibleCount + scrollEndThreshold);
            }
        },
        [scrollEndThreshold],
    );

    useEffect(() => {
        setOptionsPrepared(
            options?.map((option) => ({
                id: uniqueId(),
                label: option[propValue]?.toString()?.toLowerCase() || '',
                value: null,
                raw: option,
            })) || [],
        );
    }, [options, propValue]);

    useEffect(() => {
        setModelValue((oldValue: T) => {
            const newValue = findValue(value);
            return oldValue != newValue ? newValue : oldValue;
        });
    }, [findValue, value]);

    useEffect(() => {
        if (modelValue) {
            setPlaceholderValue(propValue ? modelValue.raw[propValue] : modelValue.label);
        }
    }, [modelValue, propValue]);

    useEffect(() => {
        searchInputChanged();
        setVisibleCount(scrollSize);
    }, [query, scrollSize, searchInputChanged]);

    return React.createElement(optionsComponent, {
        id,
        dusk,
        optionsFiltered,
        selectOption,
        placeholder,
        placeholderValue,
        showOptions,
        allowSearch,
        visibleCount,
        setVisibleCount,
        onInputClick,
        query,
        setQuery,
        searchOption,
        setShowOptions,
        searchInputChanged,
        onOptionsScroll,
        modelValue,
        className,
        rawValue: value,
        disabled,
        propKey,
        propValue,
        multiline,
        searchAutoComplete,
    });
}
