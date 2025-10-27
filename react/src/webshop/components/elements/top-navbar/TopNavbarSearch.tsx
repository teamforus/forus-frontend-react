import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigateState, useStateRoutes } from '../../../modules/state_router/Router';
import useAppConfigs from '../../../hooks/useAppConfigs';
import { mainContext } from '../../../contexts/MainContext';
import ClickOutside from '../../../../dashboard/components/elements/click-outside/ClickOutside';
import {
    SearchResult,
    SearchResultGroup,
    SearchResultGroupItem,
    useSearchService,
} from '../../../services/SearchService';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useFilter from '../../../../dashboard/hooks/useFilter';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import IconSearchAll from '../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-search/all.svg';
import IconSearchFunds from '../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-search/funds.svg';
import IconSearchProducts from '../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-search/products.svg';
import IconSearchProviders from '../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-search/providers.svg';
import IconSearchEmptyResult from '../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-search/empty-search.svg';
import TopNavbarSearchResultItem from './TopNavbarSearchResultItem';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import classNames from 'classnames';
import { ResponseError } from '../../../../dashboard/props/ApiResponses';
import usePushDanger from '../../../../dashboard/hooks/usePushDanger';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export type SearchResultGroupLocal = SearchResultGroup & {
    shown?: boolean;
};

export type SearchResultLocal = {
    funds: SearchResultGroupLocal;
    products: SearchResultGroupLocal;
    providers: SearchResultGroupLocal;
};

export default function TopNavbarSearch({ autoFocus = false }: { autoFocus?: boolean }) {
    const appConfigs = useAppConfigs();
    const { setShowSearchBox } = useContext(mainContext);
    const inputRef = useRef<HTMLInputElement>(null);

    const translate = useTranslate();
    const navigateState = useNavigateState();
    const searchService = useSearchService();

    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();

    const hideSearchDropdown = useRef<boolean>(false);
    const searchingForDropdown = useRef<boolean>(false);

    const [dropdown, setDropdown] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const { route: currentState } = useStateRoutes();

    const [results, setResults] = useState<SearchResultLocal>(null);
    const [resultsAll, setResultsAll] = useState<Array<SearchResultGroupItem>>(null);

    const [groupKey, setGroupKey] = useState('all');
    const [groupKeyList] = useState(['all', 'products', 'funds', 'providers']);

    const [lastQuery, setLastQuery] = useState('');

    const filters = useFilter({
        q: '',
    });

    const { resetFilters } = filters;

    const hideDropDown = useCallback(() => {
        setDropdown(false);
    }, []);

    const showDropDown = useCallback(() => {
        setDropdown(true);
    }, []);

    const clearSearch = useCallback(() => {
        resetFilters();
        setResults(null);
        setResultsAll(null);
        setGroupKey('all');
        hideDropDown();
    }, [hideDropDown, resetFilters]);

    const cancelSearch = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
                clearSearch();
            }
        },
        [clearSearch],
    );

    const toggleGroup = useCallback((e: React.MouseEvent, groupKey: string) => {
        e.preventDefault();
        e.stopPropagation();

        setResults((results) => {
            results[groupKey].shown = !results[groupKey].shown;
            return { ...results };
        });
    }, []);

    const updateResults = useCallback(
        (results: SearchResult) => {
            const listKeys = Object.keys(results);
            const listItems = listKeys.reduce((arr, key) => [...arr, ...results[key].items], []);

            setResults(results);
            setResultsAll(listItems);
            showDropDown();
        },
        [showDropDown],
    );

    const hideSearchBox = useCallback(() => {
        setShowSearchBox(false);
        hideDropDown();
    }, [setShowSearchBox, hideDropDown]);

    useEffect(() => {
        setLastQuery(filters.activeValues.q);

        if (!filters.activeValues.q || filters.activeValues.q?.length == 0) {
            return clearSearch();
        }

        setProgress(0);
        searchingForDropdown.current = true;

        searchService
            .searchWithOverview({ q: filters.activeValues.q, with_external: 1, take: 9 })
            .then((res) => {
                updateResults(res.data.data);

                if (hideSearchDropdown.current) {
                    hideDropDown();
                }
            })
            .catch((err: ResponseError) => {
                pushDanger(translate('push.error'), err.data?.message);
            })
            .finally(() => {
                setProgress(100);
                hideSearchDropdown.current = false;
                searchingForDropdown.current = false;
            });
    }, [
        filters.activeValues.q,
        searchService,
        clearSearch,
        updateResults,
        setProgress,
        hideDropDown,
        pushDanger,
        translate,
    ]);

    useEffect(() => {
        clearSearch();
    }, [currentState?.state?.name, clearSearch]);

    return (
        <div className={classNames(`block block-navbar-search`, dropdown && 'block-navbar-search-results')}>
            <form
                onSubmit={(e) => {
                    e?.preventDefault();
                    e?.stopPropagation();

                    clearSearch();
                    if (searchingForDropdown.current) {
                        hideSearchDropdown.current = true;
                    }

                    navigateState(WebshopRoutes.SEARCH, {}, { q: filters.values.q });
                    document.querySelector<HTMLInputElement>('#main_search')?.focus();
                }}
                className={`search-form form ${resultsAll?.length > 0 ? 'search-form-found' : ''}`}>
                <ClickOutside onClickOutside={hideSearchBox}>
                    <div
                        className="search-area"
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}>
                        <label id="search-label" htmlFor="genericSearch" className="navbar-search-label">
                            {translate(`top_navbar_search.placeholders.search_${appConfigs.communication_type}`)}
                        </label>
                        <div className={classNames('navbar-search-icon', (searchFocused || dropdown) && 'focused')}>
                            <div className="mdi mdi-magnify" />
                        </div>
                        <input
                            id="genericSearch"
                            type="text"
                            ref={inputRef}
                            className={classNames(
                                'form-control',
                                'navbar-search-input',
                                (searchFocused || dropdown) && 'focused',
                            )}
                            autoFocus={autoFocus}
                            autoComplete={'off'}
                            value={filters.values.q}
                            onChange={(e) => filters.update({ q: e.target.value })}
                            onKeyDown={cancelSearch}
                            aria-labelledby="search-label"
                            aria-haspopup={true}
                        />
                        {filters.values.q && (
                            <div
                                className="search-reset"
                                onClick={(e) => {
                                    e?.stopPropagation();
                                    filters.update({ q: '' });
                                    inputRef?.current?.focus();
                                }}
                                onKeyDown={(e) => {
                                    clickOnKeyEnter(e, true);
                                }}
                                tabIndex={0}
                                aria-label={translate('top_navbar_search.aria.close_search')}
                                role="button">
                                <em className="mdi mdi-close" />
                            </div>
                        )}
                    </div>
                    {dropdown && (
                        <div className="search-result" role={'tablist'}>
                            <div className="search-result-sidebar">
                                {groupKeyList.map((itemGroupKey) => (
                                    <h2
                                        key={itemGroupKey}
                                        className={classNames(
                                            'search-result-sidebar-item',
                                            'state-nav-link',
                                            groupKey == itemGroupKey && 'active',
                                        )}
                                        id={`tab-${itemGroupKey}`}
                                        role={'tab'}
                                        aria-selected={groupKey === itemGroupKey}
                                        aria-expanded={groupKey === itemGroupKey}
                                        aria-controls={`panel-${itemGroupKey}`}
                                        tabIndex={0}
                                        onKeyDown={clickOnKeyEnter}
                                        onClick={() => setGroupKey(itemGroupKey)}>
                                        {itemGroupKey === 'all' && (
                                            <div className="search-result-sidebar-item-icon hide-sm" aria-hidden="true">
                                                <IconSearchAll />
                                            </div>
                                        )}

                                        {itemGroupKey === 'funds' && (
                                            <div className="search-result-sidebar-item-icon hide-sm" aria-hidden="true">
                                                <IconSearchFunds />
                                            </div>
                                        )}

                                        {itemGroupKey === 'products' && (
                                            <div className="search-result-sidebar-item-icon hide-sm" aria-hidden="true">
                                                <IconSearchProducts />
                                            </div>
                                        )}

                                        {itemGroupKey === 'providers' && (
                                            <div className="search-result-sidebar-item-icon hide-sm" aria-hidden="true">
                                                <IconSearchProviders />
                                            </div>
                                        )}

                                        <div className="search-result-sidebar-item-name">
                                            {translate(`top_navbar_search.result.${itemGroupKey}_label`)}
                                        </div>

                                        {itemGroupKey == groupKey && (
                                            <div className="search-result-sidebar-item-arrow hide-sm">
                                                <div className="mdi mdi-chevron-right" />
                                            </div>
                                        )}
                                    </h2>
                                ))}
                            </div>
                            <div
                                className="search-result-content"
                                role="tabpanel"
                                id={`panel-${groupKey}`}
                                aria-labelledby={`tab-${groupKey}`}>
                                {groupKeyList
                                    .filter((itemKey) => {
                                        return (
                                            (groupKey == 'all' || groupKey == itemKey) &&
                                            itemKey != 'all' &&
                                            results[itemKey].items.length > 0
                                        );
                                    })
                                    .map((itemKey) => (
                                        <div key={itemKey} className="search-result-section">
                                            <div className="search-result-group-header">
                                                {itemKey === 'funds' && (
                                                    <div
                                                        className="search-result-group-icon hide-sm"
                                                        aria-hidden="true">
                                                        <IconSearchFunds />
                                                    </div>
                                                )}
                                                {itemKey === 'products' && (
                                                    <div
                                                        className="search-result-group-icon hide-sm"
                                                        aria-hidden="true">
                                                        <IconSearchProducts />
                                                    </div>
                                                )}
                                                {itemKey === 'providers' && (
                                                    <div
                                                        className="search-result-group-icon hide-sm"
                                                        aria-hidden="true">
                                                        <IconSearchProviders />
                                                    </div>
                                                )}
                                                <div className="search-result-group-title flex">
                                                    {results[itemKey].shown ? (
                                                        <em
                                                            className="mdi mdi-menu-up show-sm"
                                                            onClick={(e) => toggleGroup(e, itemKey)}
                                                        />
                                                    ) : (
                                                        <em
                                                            className="mdi mdi-menu-down show-sm"
                                                            onClick={(e) => toggleGroup(e, itemKey)}
                                                        />
                                                    )}
                                                    {translate(`top_navbar_search.result.${itemKey}_label`)}
                                                </div>
                                                {results[itemKey].count > 3 && (
                                                    <StateNavLink
                                                        name={WebshopRoutes.SEARCH}
                                                        query={{ q: lastQuery, [itemKey]: 1 }}
                                                        onClick={() => hideSearchBox()}
                                                        className="search-result-group-link hide-sm">
                                                        {translate('top_navbar_search.result.found_results', {
                                                            count: results?.[itemKey]?.count,
                                                        })}
                                                    </StateNavLink>
                                                )}
                                            </div>

                                            {results?.[itemKey] && !results?.[itemKey]?.shown && (
                                                <div className="search-result-items">
                                                    {results[itemKey].items?.map(
                                                        (value: SearchResultGroupItem, index: number) => (
                                                            <StateNavLink
                                                                key={index}
                                                                name={value.item_type}
                                                                params={{ id: value.id }}
                                                                className="search-result-item">
                                                                <TopNavbarSearchResultItem
                                                                    q={filters.activeValues.q}
                                                                    name={value.name}
                                                                />
                                                                <em className="mdi mdi-chevron-right show-sm" />
                                                            </StateNavLink>
                                                        ),
                                                    )}

                                                    {results[itemKey]?.count > 3 && (
                                                        <StateNavLink
                                                            name={WebshopRoutes.SEARCH}
                                                            query={{ q: lastQuery, [itemKey]: 1 }}
                                                            className="search-result-group-link show-sm">
                                                            {translate('top_navbar_search.result.found_results', {
                                                                count: results?.[itemKey]?.count,
                                                            })}
                                                        </StateNavLink>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                <div className="search-result-footer">
                                    {groupKey == 'all' && resultsAll.length > 0 && (
                                        <div className="search-result-actions">
                                            <button
                                                type={'submit'}
                                                name={'search-result'}
                                                className="button button-primary">
                                                {translate('top_navbar_search.result.btn')}
                                                <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {((groupKey == 'all' && !resultsAll.length) ||
                                    (groupKey != 'all' && !results[groupKey].items.length)) && (
                                    <div className="search-no-result">
                                        <div className="search-no-result-icon" aria-hidden="true">
                                            <IconSearchEmptyResult />
                                        </div>
                                        <div className="search-no-result-description">
                                            {translate('top_navbar_search.noresult.subtitle', { query: lastQuery })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </ClickOutside>
            </form>
        </div>
    );
}
