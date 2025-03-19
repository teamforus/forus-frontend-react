import React, { useMemo, useRef, useState } from 'react';
import { uniqueId } from 'lodash';
import { SelectControlOptionsProp } from '../SelectControl';
import classNames from 'classnames';
import FDTargetClick from '../../../../modules/frame_director/components/targets/FDTargetClick';
import FDTargetContainerSelect from '../../../../modules/frame_director/components/target-containers/FDTargetContainerSelect';
import SelectControlOptionItem from './elements/SelectControlOptionItem';
import useSelectControlKeyEventFDHandlers from '../hooks/useSelectControlKeyEventFDHandlers';

export default function SelectControlOptionsFD<T>({
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
    multiline = { selected: false, options: true },
}: SelectControlOptionsProp<T>) {
    const [controlId] = useState('select_control_' + uniqueId());
    const input = useRef(null);
    const selectorRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLLabelElement>(null);

    const multilineSelected = useMemo(() => {
        return multiline === true || (typeof multiline === 'object' && multiline?.selected === true);
    }, [multiline]);

    const multilineOptions = useMemo(() => {
        return multiline === true || (typeof multiline === 'object' && multiline?.options === true);
    }, [multiline]);

    const { onKeyDown, onBlur } = useSelectControlKeyEventFDHandlers(
        selectorRef,
        optionsRef,
        placeholderRef,
        showOptions,
        setShowOptions,
    );

    return (
        <div
            id={id}
            className={classNames('form-control', 'select-control', disabled && 'disabled', className)}
            tabIndex={0}
            role="button"
            data-dusk={dusk}
            aria-haspopup="listbox"
            aria-expanded={showOptions}
            aria-labelledby={controlId}
            aria-controls={`${controlId}_options`}
            ref={selectorRef}
            onKeyDown={(e) => onKeyDown(e)}
            onBlur={onBlur}>
            <FDTargetClick
                contentContainer={FDTargetContainerSelect}
                content={(e) => {
                    if (!showOptions) {
                        return null;
                    }

                    return (
                        <div
                            className={classNames(
                                'select-control-options',
                                'select-control-options-fd',
                                e.item?.offset?.position === 'top' && 'select-control-options-fd-top',
                                e.item?.offset?.position === 'right' && 'select-control-options-fd-right',
                                e.item?.offset?.position === 'bottom' && 'select-control-options-fd-bottom',
                                e.item?.offset?.position === 'left' && 'select-control-options-fd-left',
                            )}
                            id={`${controlId}_options`}
                            role={'listbox'}
                            onClick={null}
                            ref={optionsRef}
                            style={{ width: `${e.item.observedRect.width}px` }}
                            onKeyDown={(e) => onKeyDown(e)}
                            onScroll={onOptionsScroll}>
                            {optionsFiltered.slice(0, visibleCount)?.map((option) => (
                                <SelectControlOptionItem
                                    key={option.id}
                                    option={option}
                                    selectOption={(option) => {
                                        selectOption(option);
                                        selectorRef?.current?.focus();
                                        e.close();
                                    }}
                                />
                            ))}
                        </div>
                    );
                }}
                align={'start'}
                position={'bottom'}
                showExternal
                show={showOptions}
                setShow={setShowOptions}>
                <div
                    className={classNames(
                        'select-control-input',
                        showOptions && 'options',
                        multilineOptions && 'multiline-options',
                        multilineSelected && 'multiline-selected',
                    )}>
                    {/* Placeholder */}
                    <label
                        htmlFor={controlId}
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
                    </label>

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
                </div>
            </FDTargetClick>
        </div>
    );
}
