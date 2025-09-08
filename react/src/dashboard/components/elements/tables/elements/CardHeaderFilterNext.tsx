import React from 'react';
import FilterScope from '../../../../types/FilterScope';
import FilterModel from '../../../../types/FilterModel';
import CardHeaderFilter from './CardHeaderFilter';

export default function CardHeaderFilterNext({
    filter,
    children,
    searchDusk,
}: {
    filter: FilterScope<FilterModel>;
    children: React.ReactNode | Array<React.ReactNode>;
    searchDusk?: string;
}) {
    return (
        <div className="block block-inline-filters">
            {filter.show && (
                <button
                    className="button button-text"
                    onClick={() => {
                        filter.resetFilters();
                        filter.setShow(false);
                    }}>
                    <em className="mdi mdi-close icon-start" />
                    Wis filter
                </button>
            )}

            {!filter.show && (
                <div className="form">
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-control"
                            data-dusk={searchDusk}
                            value={filter.values.q}
                            onChange={(e) => filter.update({ q: e.target.value })}
                            placeholder={'Zoeken'}
                        />
                    </div>
                </div>
            )}

            <CardHeaderFilter filter={filter}>{children}</CardHeaderFilter>
        </div>
    );
}
