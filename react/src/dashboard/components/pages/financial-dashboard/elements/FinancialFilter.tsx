import React, { useEffect, useState } from 'react';
import ClickOutside from '../../../elements/click-outside/ClickOutside';
import { useTranslation } from 'react-i18next';
import { FinancialFilterOptionItem } from '../../../../services/types/ProviderFinancialStatistics';

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
    const { t } = useTranslation();

    const [search, setSearch] = useState('');
    const [options, setOptions] = useState(optionData);

    useEffect(() => {
        setOptions(optionData.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())));
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
                                        placeholder={t('search')}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="filter-dropdown-menu-body">
                            <div className="form">
                                {options.map((option, index) => (
                                    <div className="block-option" key={index}>
                                        <label className="checkbox checkbox-narrow" htmlFor={`${type}_${index}`}>
                                            <input
                                                type="checkbox"
                                                id={`${type}_${index}`}
                                                checked={option.checked}
                                                onChange={() => {
                                                    option.checked = !option.checked;
                                                    selectOption(type, option);
                                                }}
                                            />
                                            <div className={`checkbox-label ${option.checked ? 'active' : ''}`}>
                                                <div className="checkbox-box">
                                                    <em className="mdi mdi-check" />
                                                </div>
                                                <span>{option.name}</span>
                                            </div>
                                        </label>
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
