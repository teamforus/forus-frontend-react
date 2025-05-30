import React, { useRef, useState } from 'react';
import ClickOutside from '../../click-outside/ClickOutside';
import { uniqueId } from 'lodash';
import { SelectControlOptionsProp } from '../SelectControl';
import SelectControlOptionItem from './elements/SelectControlOptionItem';
import useSelectControlKeyEventHandlers from '../hooks/useSelectControlKeyEventHandlers';

export default function SelectControlOptionsCountryCodes<T>({
    query,
    setQuery,
    optionsFiltered,
    placeholderValue,
    placeholder,
    selectOption,
    showOptions,
    visibleCount,
    className,
    modelValue,
    onInputClick,
    searchOption,
    setShowOptions,
    searchInputChanged,
    onOptionsScroll,
}: SelectControlOptionsProp<T>) {
    const [controlId] = useState(uniqueId('select_control_'));
    const input = useRef(null);
    const selectorRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLLabelElement>(null);

    const { onKeyDown, onBlur } = useSelectControlKeyEventHandlers(
        selectorRef,
        placeholderRef,
        showOptions,
        setShowOptions,
    );

    return (
        <div
            className={'select-control select-control-country-codes ' + (className ? className : '')}
            tabIndex={0}
            role="button"
            aria-haspopup="listbox"
            aria-expanded={showOptions}
            aria-labelledby={controlId}
            aria-controls={`${controlId}_options`}
            ref={selectorRef}
            onKeyDown={onKeyDown}
            onBlur={onBlur}>
            <div className={['select-control-input', showOptions ? 'options' : ''].filter((item) => item).join(' ')}>
                {/* Placeholder */}
                <label
                    htmlFor={controlId}
                    ref={placeholderRef}
                    className="select-control-search form-control"
                    onClick={searchOption}
                    title={placeholderValue || placeholder}>
                    <span className="select-control-search-placeholder">
                        {modelValue?.raw['code'] + ' +' + modelValue?.raw['dialCode']}
                    </span>
                    <span className={'select-control-icon'}>
                        <em className={showOptions ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'} />
                    </span>
                </label>
                {showOptions && (
                    <div className="select-control-container">
                        <div className="select-control-search-container">
                            <input
                                id={controlId}
                                placeholder={'Zoeken'}
                                ref={input}
                                value={query}
                                onClick={onInputClick}
                                onChange={(e) => setQuery(e.target.value)}
                                className="select-control-search form-control"
                            />

                            {query ? (
                                <div
                                    className="select-control-search-clear"
                                    onClick={() => {
                                        setQuery('');
                                        searchInputChanged();
                                    }}
                                    aria-label="Annuleren">
                                    <em className="mdi mdi-close-circle" />
                                </div>
                            ) : (
                                <div className="select-control-search-icon">
                                    <em className="mdi mdi-magnify" />
                                </div>
                            )}
                        </div>
                        <ClickOutside
                            className="select-control-options"
                            attr={{
                                id: `${controlId}_options`,
                                role: 'listbox',
                                onScroll: onOptionsScroll,
                                onClick: null,
                            }}
                            onClickOutside={(e) => {
                                e.stopPropagation();
                                setShowOptions(false);
                            }}>
                            {optionsFiltered
                                .slice(0, visibleCount)
                                ?.map((option) => (
                                    <SelectControlOptionItem
                                        key={option.id}
                                        option={option}
                                        selectOption={selectOption}
                                    />
                                ))}
                        </ClickOutside>
                    </div>
                )}
            </div>
        </div>
    );
}
