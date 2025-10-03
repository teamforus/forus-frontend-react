import React from 'react';
import ClickOutside from '../../click-outside/ClickOutside';
import { FilterModel, FilterScope } from '../../../../modules/filter_next/types/FilterParams';

export default function CardHeaderFilter({
    filter,
    children,
}: {
    filter: FilterScope<FilterModel>;
    children: React.ReactElement | Array<React.ReactElement>;
}) {
    return (
        <div className="form inline-filters-dropdown pull-right">
            {filter.show && (
                <ClickOutside onClickOutside={() => filter.setShow(false)}>
                    <div className="inline-filters-dropdown-content" onClick={(e) => e.stopPropagation()}>
                        <div className="arrow-box bg-dim">
                            <em className="arrow" />
                        </div>
                        <div className="form">{children}</div>
                    </div>
                </ClickOutside>
            )}

            <button
                data-dusk={filter.show ? 'hideFilters' : 'showFilters'}
                className="button button-default button-icon"
                onClick={(e) => {
                    e.stopPropagation();
                    filter.setShow(!filter.show);
                }}>
                <em className="mdi mdi-filter-outline" />
            </button>
        </div>
    );
}
