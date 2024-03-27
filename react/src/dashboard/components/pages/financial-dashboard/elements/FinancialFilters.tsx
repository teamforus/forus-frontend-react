import React, { Fragment, useCallback, useEffect, useState } from 'react';
import FinancialFilter from './FinancialFilter';
import {
    addMonths,
    addQuarters,
    endOfMonth,
    endOfQuarter,
    endOfYear,
    format,
    getYear,
    isFuture,
    startOfYear,
    subYears,
} from 'date-fns';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import { strLimit } from '../../../../helpers/string';
import {
    ProviderFinancialFilterOptions,
    FinancialFilterOptionItem,
} from '../../../../services/types/ProviderFinancialStatistics';

interface SelectionItem {
    ids?: Array<number>;
    name: string;
    type: string;
    items?: Array<FinancialFilterOptionItem>;
    names?: string;
    checked?: boolean;
    noSelection: string;
    transactions?: number;
}

interface Selections {
    funds: SelectionItem;
    postcodes: SelectionItem;
    providers: SelectionItem;
    product_categories: SelectionItem;
    business_types: SelectionItem;
}

interface SearchQuery {
    fund_ids?: Array<number>;
    postcodes?: Array<string>;
    provider_ids?: Array<number>;
    product_category_ids?: Array<number>;
    business_type_ids?: Array<number>;
}

interface TimeSearchQuery {
    type?: string;
    type_value?: string;
    from?: string;
    to?: string;
}

interface Year {
    date: Date;
    year: number;
    value: string;
    title: string;
    from: string;
    to: string;
}

interface Month extends Year {
    active: boolean;
    subtitle: string;
}

interface Quarter extends Year {
    active: boolean;
    subtitle: string;
}

export default function FinancialFilters({
    options,
    onQueryChange,
}: {
    options: ProviderFinancialFilterOptions;
    onQueryChange: (query: SearchQuery) => void;
}) {
    const [filterType, setFilterType] = useState('year');
    const [shownDropdownType, setShownDropdownType] = useState(null);

    const [startYear] = useState(2015);
    const [endYear] = useState(parseInt(format(new Date(), 'yyyy')));
    const [year, setYear] = useState<Year>(null);
    const [month, setMonth] = useState<Month>(null);
    const [quarter, setQuarter] = useState<Quarter>(null);

    const [years, setYears] = useState<Array<Year>>([]);
    const [months, setMonths] = useState<Array<Month>>([]);
    const [quarters, setQuarters] = useState<Array<Quarter>>([]);

    const [yearsList, setYearsList] = useState<Array<Year>>([]);
    const [monthsList, setMonthsList] = useState<Array<Month>>([]);
    const [quartersList, setQuartersList] = useState<Array<Quarter>>([]);
    const [yearDirection, setYearDirection] = useState('prev');

    const [queryList, setQueryList] = useState<SearchQuery>(null);
    const [timeQueryList, setTimeQueryList] = useState<TimeSearchQuery>(null);
    const [optionsList, setOptionsList] = useState<ProviderFinancialFilterOptions>(null);
    const [selections, setSelections] = useState<Selections>({
        funds: {
            ids: null,
            items: [],
            type: 'funds',
            name: 'Alle fondsen',
            names: 'Alle fondsen',
            noSelection: 'Alle fondsen',
        },
        providers: {
            ids: null,
            items: [],
            type: 'providers',
            name: 'Alle aanbieders',
            names: 'Alle aanbieders',
            noSelection: 'Alle aanbieders',
        },
        postcodes: {
            ids: null,
            items: [],
            type: 'postcodes',
            name: 'Alle postcodes',
            names: 'Alle postcodes',
            noSelection: 'Alle postcodes',
        },
        product_categories: {
            ids: null,
            items: [],
            type: 'product_categories',
            name: 'Alle categorieën',
            names: 'Alle categorieën',
            noSelection: 'Alle categorieën',
        },
        business_types: {
            ids: null,
            items: [],
            type: 'business_types',
            name: 'Alle organisatie type',
            names: 'Alle organisatie type',
            noSelection: 'Alle organisatie type',
        },
    });

    const selectOption = useCallback(
        (type: string, option: FinancialFilterOptionItem) => {
            const items: Array<FinancialFilterOptionItem> = optionsList[type];
            const optionAll = items.filter((item: FinancialFilterOptionItem) => item.id == null)[0];
            const optionItems = items.filter((item: FinancialFilterOptionItem) => item.id != null);

            //- Select all options if 'all'
            if (option.id == null) {
                optionItems.forEach((item) => (item.checked = option.checked));
            }

            optionAll.checked = optionItems.filter((item) => item.checked).length === optionItems.length;

            const selectedItems = optionAll.checked ? null : optionItems.filter((item) => item.checked);
            const list = { ...selections };

            list[type]['items'] = selectedItems ? selectedItems : [];
            list[type]['names'] = selectedItems
                ? selectedItems.map((item) => item.name).join(', ')
                : list[type]['noSelection'];
            list[type]['ids'] = selectedItems ? selectedItems.map((item) => item.id) : null;

            setSelections(list);
        },
        [optionsList, selections],
    );

    const resetSelection = useCallback(
        (type: string) => {
            const items: Array<FinancialFilterOptionItem> = optionsList[type];
            const optionAll = items.filter((item: FinancialFilterOptionItem) => item.id == null)[0];

            selectOption(type, {
                ...optionAll,
                checked: true,
            });
        },
        [optionsList, selectOption],
    );

    const setOptions = useCallback(() => {
        let { funds, postcodes, providers, product_categories, business_types } = options;

        funds = funds.map((fund) => ({ ...fund, checked: true }));
        postcodes = postcodes.map((postcode) => ({ ...postcode, checked: true }));
        providers = providers.map((provider) => ({ ...provider, checked: true }));
        product_categories = product_categories.map((category) => ({ ...category, checked: true }));
        business_types = business_types.map((type) => ({ ...type, checked: true }));

        postcodes.sort();

        funds.unshift({
            id: null,
            name: 'Alle fondsen',
            transactions: funds.reduce((total, fund) => total + fund.transactions, 0),
            checked: true,
        });

        providers.unshift({
            id: null,
            name: 'Alle aanbieders',
            transactions: providers.reduce((total, fund) => total + fund.transactions, 0),
            checked: true,
        });

        postcodes.unshift({
            id: null,
            name: 'Alle postcodes',
            transactions: postcodes.reduce((total, fund) => total + fund.transactions, 0),
            checked: true,
        });

        product_categories.unshift({
            id: null,
            name: 'Alle categorieën',
            checked: true,
        });

        business_types.unshift({
            id: null,
            name: 'Alle organisatie type',
            checked: true,
        });

        setOptionsList({
            funds,
            postcodes,
            providers,
            product_categories,
            business_types,
        });
    }, [options]);

    const makeYears = useCallback(() => {
        return [...new Array(getYear(new Date()) - startYear).keys()].map((years) => {
            const date = subYears(new Date(), years);
            const yearStart = startOfYear(date);
            const yearEnd = endOfYear(date);

            return {
                date: yearStart,
                year: parseInt(format(yearStart, 'yyyy')),
                value: format(yearStart, 'yyyy-MM-dd'),
                title: format(yearStart, 'yyyy'),
                from: format(yearStart, 'yyyy-MM-dd'),
                to: format(yearEnd, 'yyyy-MM-dd'),
            };
        });
    }, [startYear]);

    const makeMonths = useCallback((years: Array<Year>) => {
        return years
            .map((year) => {
                const date = year.date;
                const months = [...new Array(12).keys()];

                return {
                    months: months
                        .map((month) => 12 - month)
                        .map((month) => {
                            const monthStartDate = addMonths(new Date(date), month);
                            const monthEndDate = endOfMonth(monthStartDate);

                            return {
                                active: !isFuture(monthStartDate),
                                year: parseInt(format(monthStartDate, 'yyyy')),
                                title: format(monthStartDate, 'yyyy'),
                                subtitle: format(monthStartDate, 'MMMM'),
                                value: format(monthStartDate, 'yyyy-MM-dd'),
                                from: format(monthStartDate, 'yyyy-MM-dd'),
                                to: format(monthEndDate, 'yyyy-MM-dd'),
                            };
                        }),
                };
            })
            .reduce((acc, year) => [...acc, ...year.months], []);
    }, []);

    const makeQuarters = useCallback((years: Array<Year>) => {
        return years
            .map((year) => {
                const date = year.date;
                const quarters = [...new Array(4).keys()];

                return {
                    quarters: quarters
                        .map((quarter) => 3 - quarter)
                        .map((quarter) => {
                            const quarterStartDate = addQuarters(new Date(date), quarter);
                            const quarterEndDate = endOfQuarter(quarterStartDate);

                            return {
                                active: !isFuture(quarterStartDate),
                                year: parseInt(format(quarterStartDate, 'yyyy')),
                                title: format(quarterStartDate, 'yyyy'),
                                subtitle: format(quarterStartDate, 'MMMM'),
                                value: format(quarterStartDate, 'yyyy-MM-dd'),
                                from: format(quarterStartDate, 'yyyy-MM-dd'),
                                to: format(quarterEndDate, 'yyyy-MM-dd'),
                            };
                        }),
                };
            })
            .reduce((acc, year) => [...acc, ...year.quarters], []);
    }, []);

    const updateLists = useCallback(() => {
        const yearsList = [...years].reverse();
        const monthsList = [...months].filter((month) => month.year === year.year).reverse();
        const quartersList = [...quarters].filter((quarter) => quarter.year === year.year).reverse();

        setYearsList(yearsList);
        setMonthsList(monthsList);
        setQuartersList(quartersList);

        const activeMonths = monthsList.filter((month) => month.active);
        const activeQuarters = quartersList.filter((quarter) => quarter.active);

        if (yearDirection === 'prev') {
            setMonth(activeMonths[activeMonths.length - 1] || null);
            setQuarter(activeQuarters[activeQuarters.length - 1] || null);
        } else {
            setMonth(activeMonths[0] || null);
            setQuarter(activeQuarters[0] || null);
        }
    }, [months, quarters, year?.year, yearDirection, years]);

    const prevPage = useCallback(() => {
        if (yearsList.indexOf(year) > 0) {
            setYear(yearsList[yearsList.indexOf(year) - 1]);
            setYearDirection('prev');
        }
    }, [year, yearsList]);

    const nextPage = useCallback(() => {
        if (yearsList.indexOf(year) < yearsList.length - 1) {
            setYear(yearsList[yearsList.indexOf(year) + 1]);
            setYearDirection('next');
        }
    }, [year, yearsList]);

    useEffect(() => {
        setOptions();
    }, [setOptions]);

    useEffect(() => {
        const years = makeYears();
        setYears(years);
        setMonths(makeMonths(years));
        setQuarters(makeQuarters(years));

        setYear(years[0]);
    }, [makeMonths, makeQuarters, makeYears]);

    useEffect(() => {
        updateLists();
    }, [updateLists, year]);

    useEffect(() => {
        setQueryList({
            fund_ids: selections.funds.ids,
            postcodes: selections.postcodes.items.map((item) => item.name),
            provider_ids: selections.providers.ids,
            product_category_ids: selections.product_categories.ids,
            business_type_ids: selections.business_types.ids,
        });
    }, [selections]);

    useEffect(() => {
        if (year && filterType === 'year') {
            setTimeQueryList({
                type: filterType,
                type_value: year.value,
                from: year.from,
                to: year.to,
            });
        }
    }, [filterType, year]);

    useEffect(() => {
        if (quarter && filterType === 'quarter') {
            setTimeQueryList({
                type: filterType,
                type_value: quarter.value,
                from: quarter.from,
                to: quarter.to,
            });
        }
    }, [filterType, quarter]);

    useEffect(() => {
        if (month && filterType === 'month') {
            setTimeQueryList({
                type: filterType,
                type_value: month.value,
                from: month.from,
                to: month.to,
            });
        }
    }, [filterType, month]);

    useEffect(() => {
        if (queryList && timeQueryList) {
            onQueryChange({
                ...queryList,
                ...timeQueryList,
            });
        }
    }, [onQueryChange, queryList, timeQueryList]);

    if (!optionsList) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-section card-section-narrow">
                <div className="financial-filters">
                    <div className="filter-dropdowns">
                        <FinancialFilter
                            type="funds"
                            title="Fondsen"
                            placeholder="Selecteer fondsen"
                            optionData={optionsList.funds}
                            selectOption={selectOption}
                            shownDropdownType={shownDropdownType}
                            setShownDropdownType={(type) => setShownDropdownType(type)}
                        />

                        <FinancialFilter
                            type="providers"
                            title="Aanbieders"
                            placeholder="Selecteer aanbieders"
                            optionData={optionsList.providers}
                            selectOption={selectOption}
                            shownDropdownType={shownDropdownType}
                            setShownDropdownType={(type) => setShownDropdownType(type)}
                        />

                        <FinancialFilter
                            type="postcodes"
                            title="Postcodes"
                            placeholder="Selecteer postcodes"
                            optionData={optionsList.postcodes}
                            selectOption={selectOption}
                            shownDropdownType={shownDropdownType}
                            setShownDropdownType={(type) => setShownDropdownType(type)}
                        />

                        <FinancialFilter
                            type="product_categories"
                            title="Categorie"
                            placeholder="Zook voor een categorie"
                            optionData={optionsList.product_categories}
                            selectOption={selectOption}
                            shownDropdownType={shownDropdownType}
                            setShownDropdownType={(type) => setShownDropdownType(type)}
                        />

                        <FinancialFilter
                            type="business_types"
                            title="Organisatie type"
                            placeholder="Zook voor een organisatie type"
                            optionData={optionsList.business_types}
                            selectOption={selectOption}
                            shownDropdownType={shownDropdownType}
                            setShownDropdownType={(type) => setShownDropdownType(type)}
                        />
                    </div>

                    <div className="block block-label-tabs">
                        <div
                            className={`label-tab ${filterType == 'month' ? 'active' : ''}`}
                            onClick={() => setFilterType('month')}>
                            Maand
                        </div>
                        <div
                            className={`label-tab ${filterType == 'quarter' ? 'active' : ''}`}
                            onClick={() => setFilterType('quarter')}>
                            Kwartaal
                        </div>
                        <div
                            className={`label-tab ${filterType == 'year' ? 'active' : ''}`}
                            onClick={() => setFilterType('year')}>
                            Jaar
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-section">
                <div className="card-heading">Actieve filters:</div>
                <div className="label-group">
                    {Object.values(selections).map((selection) => (
                        <Fragment key={selection.type}>
                            {(!selection.ids || selection.ids.length > 0) && (
                                <div
                                    className={`label label-primary-light label-round label-lg ${
                                        selection.items.length == 0 ? 'disabled' : ''
                                    }`}>
                                    <span>{strLimit(selection.names, 60)}</span>
                                    {selection.items.length > 0 && (
                                        <em
                                            className="label-close mdi mdi-close"
                                            onClick={() => resetSelection(selection.type)}
                                        />
                                    )}
                                </div>
                            )}
                        </Fragment>
                    ))}
                </div>
            </div>

            {filterType === 'year' && (
                <div className="card-section">
                    <div className="block block-timeframes">
                        <div className="timeframe-item timeframe-item-disabled">
                            <em className="mdi mdi-chevron-left" />
                        </div>
                        {yearsList.map((item, index) => (
                            <div
                                key={index}
                                className={`timeframe-item ${year === item ? 'timeframe-item-active' : ''}`}
                                onClick={() => setYear(item)}>
                                <div className="timeframe-item-title">{item.title}</div>
                            </div>
                        ))}

                        <div className="timeframe-item timeframe-item-disabled">
                            <em className="mdi mdi-chevron-right" />
                        </div>
                    </div>
                </div>
            )}

            {filterType === 'quarter' && (
                <div className="card-section">
                    <div className="block block-timeframes">
                        <div
                            className={`timeframe-item ${year.year - 1 <= startYear ? 'timeframe-item-disabled' : ''}`}
                            onClick={() => prevPage()}>
                            <em className="mdi mdi-chevron-left" />
                        </div>
                        {quartersList.map((item, index) => (
                            <div
                                key={index}
                                className={`timeframe-item ${quarter === item ? 'timeframe-item-active' : ''} ${
                                    !item.active ? 'timeframe-item-disabled' : ''
                                }`}
                                onClick={() => setQuarter(item)}>
                                <div className="timeframe-item-title">{item.title}</div>
                                <div className="timeframe-item-subtitle">{item.subtitle}</div>
                            </div>
                        ))}
                        <div
                            className={`timeframe-item ${year.year >= endYear ? 'timeframe-item-disabled' : ''}`}
                            onClick={() => nextPage()}>
                            <em className="mdi mdi-chevron-right" />
                        </div>
                    </div>
                </div>
            )}

            {filterType === 'month' && (
                <div className="card-section">
                    <div className="block block-timeframes">
                        <div
                            className={`timeframe-item ${year.year - 1 <= startYear ? 'timeframe-item-disabled' : ''}`}
                            onClick={() => prevPage()}>
                            <em className="mdi mdi-chevron-left" />
                        </div>
                        {monthsList.map((item, index) => (
                            <div
                                key={index}
                                className={`timeframe-item ${month === item ? 'timeframe-item-active' : ''} ${
                                    !item.active ? 'timeframe-item-disabled' : ''
                                }`}
                                onClick={() => setMonth(item)}>
                                <div className="timeframe-item-title">{item.title}</div>
                                <div className="timeframe-item-subtitle">{item.subtitle}</div>
                            </div>
                        ))}
                        <div
                            className={`timeframe-item ${year.year >= endYear ? 'timeframe-item-disabled' : ''}`}
                            onClick={() => nextPage()}>
                            <em className="mdi mdi-chevron-right" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
