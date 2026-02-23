import React from 'react';
import { FilterModel, FilterScope } from '../../../../modules/filter_next/types/FilterParams';
import CardHeaderFilter from './CardHeaderFilter';
import Fund from '../../../../props/models/Fund';
import SelectControl from '../../select-control/SelectControl';
import SelectControlOptionsFund from '../../select-control/templates/SelectControlOptionsFund';
import useTranslate from '../../../../hooks/useTranslate';
import FormGroup from '../../forms/elements/FormGroup';

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
                <FormGroup
                    input={(id) => (
                        <SelectControl
                            id={id}
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
                    )}
                />
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
                <FormGroup
                    input={() => (
                        <input
                            type="text"
                            className="form-control"
                            data-dusk={searchDusk}
                            value={filter.values.q}
                            onChange={(e) => filter.update({ q: e.target.value })}
                            placeholder={'Zoeken'}
                        />
                    )}
                />
            )}

            <CardHeaderFilter filter={filter}>{children}</CardHeaderFilter>
        </div>
    );
}
