import React from 'react';
import useFilterNext from '../../modules/filter_next/useFilterNext';
import { StringParam } from 'use-query-params';
import FormGroup from '../elements/forms/controls/FormGroup';

export default function WIP({
    title = 'Work in progress',
    description = 'This page is under construction.',
}: {
    title?: string;
    description?: string;
}) {
    const [filterValues, filterActiveValues, filtersUpdate] = useFilterNext<{ q?: string }>(
        { q: '' },
        { queryParamsRemoveDefault: true, queryParams: { q: StringParam } },
    );

    const [filterValues2, filterActiveValues2, filtersUpdate2] = useFilterNext<{ q?: string }>(
        { q: '' },
        { queryParamsRemoveDefault: true, queryParams: { q: StringParam }, queryParamsPrefix: '2_' },
    );

    const [filterValues3, filterActiveValues3, filtersUpdate3] = useFilterNext<{ q?: string }>(
        { q: '' },
        { queryParamsRemoveDefault: true, queryParams: { q: StringParam }, queryParamsPrefix: '3_' },
    );

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">{title}</div>
            </div>
            <div className="card-body">
                <div className="card-section">
                    <div className="card-heading">{description}</div>
                </div>

                <div className="card-section form">
                    <FormGroup
                        label={'Search'}
                        input={(id) => (
                            <input
                                className={'form-control'}
                                id={id}
                                type="text"
                                value={filterValues.q}
                                autoComplete={'off'}
                                onChange={(e) => filtersUpdate({ q: e.target.value })}
                            />
                        )}
                    />

                    <p className={'card-heading'}>filterActiveValues is: {JSON.stringify(filterActiveValues)}</p>
                    <p className={'card-heading'}>filterValues is: {JSON.stringify(filterValues)}</p>
                </div>

                <div className="card-section form">
                    <FormGroup
                        label={'Search2'}
                        input={(id) => (
                            <input
                                className={'form-control'}
                                id={id}
                                type="text"
                                value={filterValues2.q}
                                autoComplete={'off'}
                                onChange={(e) => filtersUpdate2({ q: e.target.value })}
                            />
                        )}
                    />

                    <p className={'card-heading'}>filterActiveValues2 is: {JSON.stringify(filterActiveValues2)}</p>
                    <p className={'card-heading'}>filterValues2 is: {JSON.stringify(filterValues2)}</p>
                </div>

                <div className="card-section form">
                    <FormGroup
                        label={'Search3'}
                        input={(id) => (
                            <input
                                className={'form-control'}
                                id={id}
                                type="text"
                                value={filterValues3.q}
                                autoComplete={'off'}
                                onChange={(e) => filtersUpdate3({ q: e.target.value })}
                            />
                        )}
                    />

                    <p className={'card-heading'}>filterActiveValues3 is: {JSON.stringify(filterActiveValues3)}</p>
                    <p className={'card-heading'}>filterValues3 is: {JSON.stringify(filterValues3)}</p>
                </div>
            </div>
        </div>
    );
}
