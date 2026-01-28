import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import ClickOutside from '../../../elements/click-outside/ClickOutside';
import { FinancialFilterOptionItem } from '../types/FinancialStatisticTypes';
import useTranslate from '../../../../hooks/useTranslate';
import CheckboxControl from '../../../elements/forms/controls/CheckboxControl';

export default function FinancialFilter({
    type,
    title,
    placeholder,
    optionData,
    shownDropdownType,
    setShownDropdownType,
    selectOption,
}: {
    type: string;
    title: string;
    placeholder: string;
    optionData: Array<FinancialFilterOptionItem>;
    shownDropdownType?: string;
    setShownDropdownType?: (type: string) => void;
    selectOption: (type: string, option: FinancialFilterOptionItem) => void;
}) {
    const translate = useTranslate();

    const [search, setSearch] = useState('');
    const [options, setOptions] = useState(optionData);

    useEffect(() => {
        setOptions(optionData.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase())));
    }, [optionData, search]);

    return (
        <div className="filter-dropdown">
            <div
                className="filter-dropdown-label"
                onClick={(e) => {
                    e.stopPropagation();
                    setShownDropdownType(type);
                }}>
                <div className="filter-dropdown-label-text">{title}</div>
                <em className="mdi mdi-chevron-down" />
            </div>

            {shownDropdownType === type && (
                <ClickOutside
                    onClickOutside={(e) => {
                        e.stopPropagation();
                        setShownDropdownType(null);
                    }}>
                    <div className="filter-dropdown-menu">
                        <div className="filter-dropdown-menu-header">
                            <div className="header-title">{placeholder}</div>
                            <div className="form header-search">
                                <div className="form-group">
                                    <input
                                        className="form-control"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={translate('search')}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="filter-dropdown-menu-body">
                            <div className="form">
                                {options.map((option, index) => (
                                    <div
                                        className={classNames('block-option', option.checked && 'block-option-active')}
                                        key={index}>
                                        <CheckboxControl
                                            id={`${type}_${index}`}
                                            checked={option.checked}
                                            narrow={true}
                                            onChange={() => {
                                                option.checked = !option.checked;
                                                selectOption(type, option);
                                            }}
                                            title={option.name}
                                        />
                                        <div className="block-option-count">{option.transactions}</div>
                                    </div>
                                ))}

                                {!options.length && <div className="block-option-empty">Niks gevonden...</div>}
                            </div>
                        </div>
                    </div>
                </ClickOutside>
            )}
        </div>
    );
}
