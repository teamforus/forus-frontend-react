import React, { Fragment, useRef, useState } from 'react';
import ClickOutside from '../../click-outside/ClickOutside';
import { uniqueId } from 'lodash';
import { SelectControlOptionsProp } from '../SelectControl';
import Fund from '../../../../props/models/Fund';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import classNames from 'classnames';
import useSelectControlKeyEventHandlers from '../hooks/useSelectControlKeyEventHandlers';

export default function SelectControlOptionsFund<T>({
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
}: SelectControlOptionsProp<T>) {
    const [controlId] = useState('select_control_' + uniqueId());
    const input = useRef(null);
    const selectorRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLLabelElement>(null);
    const assetUrl = useAssetUrl();

    const { onKeyDown, onBlur } = useSelectControlKeyEventHandlers(
        selectorRef,
        placeholderRef,
        showOptions,
        setShowOptions,
    );

    return (
        <div
            id={id}
            className={classNames(
                'select-control',
                'select-control-lg',
                'select-control-funds',
                disabled && 'disabled',
                className,
            )}
            tabIndex={0}
            role="button"
            data-dusk={dusk}
            aria-haspopup="listbox"
            aria-expanded={showOptions}
            aria-labelledby={controlId}
            aria-controls={`${controlId}_options`}
            ref={selectorRef}
            onKeyDown={onKeyDown}
            onBlur={onBlur}>
            <div
                className={classNames('select-control-input', showOptions && 'options')}
                data-dusk="selectControlFunds">
                {/* Placeholder */}
                <label
                    htmlFor={controlId}
                    role="presentation"
                    ref={placeholderRef}
                    className="select-control-search form-control"
                    onClick={searchOption}
                    style={{ display: showOptions && allowSearch ? 'none' : 'block' }}
                    title={placeholderValue || placeholder}>
                    <div className="select-control-search-placeholder">
                        <div className="select-control-search-placeholder-media">
                            <img
                                src={
                                    (modelValue?.raw as Fund)?.logo?.sizes?.thumbnail ||
                                    assetUrl('/assets/img/menu/icon-my_funds.svg')
                                }
                                alt=""
                            />
                        </div>
                        <span className="ellipsis">{placeholderValue || placeholder}</span>
                    </div>
                    <div className={'select-control-icon'}>
                        <em className={showOptions ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'} />
                    </div>
                </label>

                {allowSearch && (
                    <div className="select-control-search-container">
                        {showOptions && (
                            <input
                                id={controlId}
                                placeholder={placeholder || placeholderValue}
                                ref={input}
                                value={query}
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
                            onScroll: onOptionsScroll,
                            onClick: null,
                        }}
                        onClickOutside={(e) => {
                            e.stopPropagation();
                            setShowOptions(false);
                        }}>
                        {optionsFiltered.slice(0, visibleCount)?.map((option) => (
                            <div
                                key={option.id}
                                className={'select-control-option'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    selectOption(option);
                                }}
                                onKeyDown={(e) => (e.key === 'Enter' ? e.currentTarget.click() : null)}
                                tabIndex={0}
                                data-dusk={`selectControlFundItem${(option.raw as Fund).id}`}
                                role="option">
                                <div className="select-control-option-media">
                                    <img
                                        src={
                                            (option.raw as Fund)?.logo?.sizes?.thumbnail ||
                                            assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                                        }
                                        alt=""
                                    />
                                </div>
                                {option.labelFormat?.map((str, index) => (
                                    <Fragment key={str.id}>
                                        {index != 1 ? <span>{str.value}</span> : <strong>{str.value}</strong>}
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
