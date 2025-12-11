import React, { Fragment, useRef, useState } from 'react';
import ClickOutside from '../../click-outside/ClickOutside';
import { uniqueId } from 'lodash';
import { SelectControlOptionsProp } from '../SelectControl';
import classNames from 'classnames';
import useSelectControlKeyEventHandlers from '../hooks/useSelectControlKeyEventHandlers';
import { clickOnKeyEnterOrSpace } from '../../../../helpers/wcag';

export default function SelectControlOptionsLang<T>({
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
    modelValue,
    onInputClick,
    searchOption,
    setShowOptions,
    searchInputChanged,
    onOptionsScroll,
    rawValue,
    disabled,
    propKey,
}: SelectControlOptionsProp<T>) {
    const [controlId] = useState('select_control_' + uniqueId());
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
            id={id}
            className={classNames('block block-lang-control', disabled && 'disabled', className)}
            tabIndex={0}
            role="button"
            data-dusk={dusk}
            aria-haspopup="listbox"
            aria-expanded={showOptions}
            aria-labelledby={allowSearch ? controlId : null}
            aria-controls={`${controlId}_options`}
            ref={selectorRef}
            onKeyDown={onKeyDown}
            onBlur={onBlur}>
            <div className={['lang-control-input', showOptions ? 'options' : ''].filter((item) => item).join(' ')}>
                {/* Placeholder */}
                <label
                    htmlFor={controlId}
                    ref={placeholderRef}
                    className="lang-control-search"
                    onClick={searchOption}
                    style={{ display: showOptions && allowSearch ? 'none' : 'flex' }}
                    title={placeholderValue || placeholder}>
                    <em className="mdi mdi-web lang-control-search-icon" />
                    <span className="lang-control-search-placeholder">
                        {modelValue?.raw[propKey]?.toUpperCase() ||
                            placeholderValue?.toUpperCase() ||
                            rawValue?.toString()?.toUpperCase()}
                    </span>
                    <span className={'lang-control-icon'}>
                        <em className={showOptions ? 'mdi mdi-menu-up' : 'mdi mdi-menu-down'} />
                    </span>
                </label>

                {allowSearch && (
                    <div className="lang-control-search-container">
                        {showOptions && (
                            <input
                                id={controlId}
                                placeholder={placeholder || placeholderValue}
                                ref={input}
                                value={query}
                                tabIndex={0}
                                onClick={onInputClick}
                                onChange={(e) => setQuery(e.target.value)}
                                className="lang-control-search"
                            />
                        )}

                        {query && (
                            <div
                                className="lang-control-search-clear"
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
                        className="lang-control-options"
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
                        {optionsFiltered.slice(0, visibleCount)?.map((option) => (
                            <div
                                className={'lang-control-option'}
                                key={option.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    selectOption(option);
                                }}
                                onKeyDown={clickOnKeyEnterOrSpace}
                                tabIndex={0}
                                role="option">
                                {option.labelFormat?.map((str, index) => (
                                    <Fragment key={str.id}>
                                        {option?.raw?.[propKey]?.toUpperCase() || ''}
                                        <div className="lang-control-option-separator" />
                                        <div
                                            className={classNames(
                                                'lang-control-option-name',
                                                option?.raw?.[propKey]?.toUpperCase() === 'AR' &&
                                                    'lang-control-option-name-right',
                                            )}>
                                            {index != 1 ? <span>{str.value}</span> : <strong>{str.value}</strong>}
                                        </div>
                                        {option.id === modelValue?.id && (
                                            <em className="lang-control-option-check mdi mdi-check" />
                                        )}
                                    </Fragment>
                                ))}
                            </div>
                        ))}
                    </ClickOutside>
                )}
            </div>
        </div>
    );
}
