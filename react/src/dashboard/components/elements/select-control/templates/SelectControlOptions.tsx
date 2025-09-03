import React, { useMemo, useRef, useState } from 'react';
import ClickOutside from '../../click-outside/ClickOutside';
import { uniqueId } from 'lodash';
import { SelectControlOptionsProp } from '../SelectControl';
import SelectControlOptionItem from './elements/SelectControlOptionItem';
import classNames from 'classnames';
import useSelectControlKeyEventHandlers from '../hooks/useSelectControlKeyEventHandlers';

export default function SelectControlOptions<T>({
    id,
    dusk,
    query,
    setQuery,
    optionsFiltered,
    placeholderValue,
    placeholder,
    selectOption,
    allowSearch,
    showOptions,
    visibleCount,
    className,
    onInputClick,
    searchOption,
    setShowOptions,
    searchInputChanged,
    onOptionsScroll,
    disabled,
    modelValue,
    ariaLabelledby,
    multiline = { selected: false, options: true },
}: SelectControlOptionsProp<T>) {
    const [controlId] = useState('select_control_' + uniqueId());
    const input = useRef(null);
    const selectorRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLLabelElement>(null);

    const multilineSelected = useMemo(() => {
        return multiline === true || (typeof multiline === 'object' && multiline?.selected === true);
    }, [multiline]);

    const multilineOptions = useMemo(() => {
        return multiline === true || (typeof multiline === 'object' && multiline?.options === true);
    }, [multiline]);

    const { onKeyDown, onBlur } = useSelectControlKeyEventHandlers(
        selectorRef,
        placeholderRef,
        showOptions,
        setShowOptions,
    );

    return (
        <div
            id={id}
            className={classNames('form-control', 'select-control', disabled && 'disabled', className)}
            tabIndex={disabled ? -1 : 0}
            role="combobox"
            data-dusk={dusk}
            aria-haspopup="listbox"
            aria-expanded={showOptions}
            aria-labelledby={ariaLabelledby || controlId}
            aria-controls={`${controlId}_options`}
            aria-activedescendant={modelValue ? `option_${modelValue.id}` : null}
            ref={selectorRef}
            onKeyDown={(e) => (disabled ? null : onKeyDown(e))}
            onBlur={onBlur}>
            <div
                className={classNames(
                    'select-control-input',
                    showOptions && 'options',
                    multilineOptions && 'multiline-options',
                    multilineSelected && 'multiline-selected',
                )}>
                {/* Placeholder */}
                <span
                    role="presentation"
                    ref={placeholderRef}
                    className="select-control-search form-control"
                    onClick={searchOption}
                    style={{ display: showOptions && allowSearch ? 'none' : 'block' }}
                    title={placeholderValue || placeholder}>
                    <span className="select-control-search-placeholder">{placeholderValue || placeholder}</span>
                    <span className={'select-control-icon'}>
                        <em className={showOptions ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'} />
                    </span>
                </span>

                {allowSearch && (
                    <div className="select-control-search-container">
                        {showOptions && (
                            <input
                                id={controlId}
                                placeholder={placeholder || placeholderValue}
                                ref={input}
                                value={query}
                                tabIndex={0}
                                onClick={onInputClick}
                                onChange={(e) => setQuery(e.target.value)}
                                className="select-control-search form-control"
                            />
                        )}

                        {query && (
                            <div
                                className="select-control-search-clear"
                                onClick={() => {
                                    setQuery('');
                                    searchInputChanged();
                                }}
                                aria-label="Annuleren">
                                <em className="mdi mdi-close-circle" />
                            </div>
                        )}
                    </div>
                )}

                {showOptions && (
                    <ClickOutside
                        className="select-control-options"
                        attr={{
                            id: `${controlId}_options`,
                            role: 'listbox',
                            onClick: null,
                            onScroll: onOptionsScroll,
                        }}
                        onClickOutside={(e) => {
                            e.stopPropagation();
                            setShowOptions(false);
                        }}>
                        {optionsFiltered
                            .slice(0, visibleCount)
                            ?.map((option) => (
                                <SelectControlOptionItem key={option.id} option={option} selectOption={selectOption} />
                            ))}
                    </ClickOutside>
                )}
            </div>
        </div>
    );
}
