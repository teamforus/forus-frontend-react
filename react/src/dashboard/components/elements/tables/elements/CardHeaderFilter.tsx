import React from 'react';
import ClickOutside from '../../click-outside/ClickOutside';
import FilterScope from '../../../../types/FilterScope';
import FilterModel from '../../../../types/FilterModel';

export default function CardHeaderFilter({
    children,
    filter,
}: {
    children: React.ReactElement;
    filter: FilterScope<FilterModel>;
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
