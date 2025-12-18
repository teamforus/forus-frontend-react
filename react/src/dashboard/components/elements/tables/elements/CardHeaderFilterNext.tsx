import React from 'react';
import FilterScope from '../../../../types/FilterScope';
import FilterModel from '../../../../types/FilterModel';
import CardHeaderFilter from './CardHeaderFilter';
import Fund from '../../../../props/models/Fund';
import SelectControl from '../../select-control/SelectControl';
import SelectControlOptionsFund from '../../select-control/templates/SelectControlOptionsFund';
import useTranslate from '../../../../hooks/useTranslate';

export default function CardHeaderFilterNext({
    funds,
    filter,
    children,
    searchDusk,
}: {
    funds?: Fund[];
    filter: FilterScope<FilterModel>;
    children: React.ReactNode | Array<React.ReactNode>;
    searchDusk?: string;
}) {
    const translate = useTranslate();

    return (
        <div className="block block-inline-filters">
            {funds?.length > 0 && (
                <div className="form-group">
                    <SelectControl
                        className="form-control inline-filter-control"
                        propKey={'id'}
                        options={[{ id: null, name: 'Selecteer fonds' }, ...funds]}
                        value={filter.activeValues.fund_id}
                        placeholder={translate('vouchers.labels.fund')}
                        allowSearch={false}
                        onChange={(fund_id: number) => filter.update({ fund_id })}
                        optionsComponent={SelectControlOptionsFund}
                        dusk="prevalidationsSelectFund"
                    />
                </div>
            )}

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
