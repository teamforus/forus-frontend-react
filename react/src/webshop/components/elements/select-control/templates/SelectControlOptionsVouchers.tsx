import React, { Fragment, useMemo, useRef, useState } from 'react';
import { uniqueId } from 'lodash';
import { SelectControlOptionsProp } from '../../../../../dashboard/components/elements/select-control/SelectControl';
import ClickOutside from '../../../../../dashboard/components/elements/click-outside/ClickOutside';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import SelectControlOptionItemVoucher from './elements/SelectControlOptionItemVoucher';

export default function SelectControlOptionsVouchers<T>({
    id,
    dusk,
    query,
    setQuery,
    modelValue,
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
}: SelectControlOptionsProp<T>) {
    const [controlId] = useState('select_control_' + uniqueId());
    const input = useRef(null);
    const assetUrl = useAssetUrl();

    const selectorRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLLabelElement>(null);

    const selectedVoucher = useMemo(() => modelValue?.raw as Voucher, [modelValue]);

    return (
        <div
            id={id}
            className={'select-control ' + (className ? className : '')}
            role="button"
            aria-haspopup="listbox"
            aria-expanded={showOptions}
            aria-labelledby={controlId}
            aria-controls={`${controlId}_options`}
            tabIndex={0}
            ref={selectorRef}
            onKeyDown={(e) => {
                if (e.key == 'Enter') {
                    placeholderRef?.current?.click();
                }

                if (e.key == 'Escape') {
                    setShowOptions(false);
                }
            }}
            onBlur={(e) => {
                if (showOptions && !e.currentTarget.contains(e.relatedTarget)) {
                    selectorRef?.current?.focus();
                }
            }}>
            <div className={['select-control-input', showOptions ? 'options' : ''].filter((item) => item).join(' ')}>
                {/* Placeholder */}
                <label
                    htmlFor={controlId}
                    role="presentation"
                    className={`block block-vouchers block-vouchers-select ${
                        showOptions ? 'block-vouchers-select-open' : ''
                    }`}
                    ref={placeholderRef}
                    data-dusk={dusk || 'voucherSelector'}
                    onClick={searchOption}
                    style={{ display: showOptions && allowSearch ? 'none' : 'block' }}
                    title={placeholderValue || placeholder}>
                    <div className="voucher-item voucher-item-select voucher-item-select-placeholder">
                        <div className="voucher-image">
                            <img
                                src={
                                    selectedVoucher?.fund?.logo?.sizes?.thumbnail ||
                                    selectedVoucher?.fund?.organization?.logo?.sizes?.thumbnail ||
                                    assetUrl('./assets/img/placeholders/fund-thumbnail.png')
                                }
                                alt={''}
                            />
                        </div>
                        <div className="voucher-details">
                            <div className="flex flex-horizontal">
                                <div className="flex flex-vertical flex-grow">
                                    <div className="voucher-name">{selectedVoucher?.fund.name}</div>
                                    <div className="voucher-organization">
                                        {selectedVoucher?.records_title && (
                                            <Fragment>
                                                <span>{selectedVoucher?.records_title}</span>
                                                <span className="text-separator" />
                                            </Fragment>
                                        )}
                                        <span>{selectedVoucher?.fund.organization.name}</span>
                                    </div>
                                </div>
                                <div className="flex flex-vertical text-right">
                                    {selectedVoucher?.fund.type === 'budget' && (
                                        <div className="voucher-value">{selectedVoucher.amount_locale}</div>
                                    )}
                                    <div className="voucher-date">{selectedVoucher?.expire_at_locale}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </label>

                {allowSearch && (
                    <div className="select-control-search-container">
                        {showOptions && (
                            <input
                                id={controlId}
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
                        dataDusk={'voucherSelectorOptions'}
                        id={`${controlId}_options`}
                        role="listbox"
                        onScroll={onOptionsScroll}
                        onClick={null}
                        onClickOutside={(e) => {
                            e.stopPropagation();
                            setShowOptions(false);
                        }}>
                        <div className="block block-vouchers block-vouchers-select">
                            {optionsFiltered
                                .slice(0, visibleCount)
                                ?.map((option) => (
                                    <SelectControlOptionItemVoucher
                                        key={option.id}
                                        option={option}
                                        selectOption={selectOption}
                                    />
                                ))}
                        </div>
                    </ClickOutside>
                )}
            </div>
        </div>
    );
}
