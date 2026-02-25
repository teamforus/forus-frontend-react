import React from 'react';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import FormGroup from '../../../elements/forms/FormGroup';
import { FilterSetter } from '../../../../../dashboard/modules/filter_next/types/FilterParams';
import RangeControl from '../../../elements/forms/RangeControl';
import ProductsFilterGroup from './base-group/ProductsFilterGroup';

export default function ProductsFilterGroupPrice({
    filterValues,
    filterUpdate,
    errors,
    toMax,
    openByDefault = false,
}: {
    filterValues: {
        from?: number;
        to?: number;
    };
    filterUpdate: FilterSetter<{
        from?: number;
        to?: number;
    }>;
    errors?: {
        from?: string;
        to?: string;
    };
    toMax?: number;
    openByDefault?: boolean;
}) {
    const translate = useTranslate();

    return (
        <ProductsFilterGroup
            dusk={'productFilterGroupPrice'}
            title={translate('products.filters.price')}
            controls={'price_filters'}
            openByDefault={openByDefault}
            content={(isOpen) => (
                <div
                    id="price_filters"
                    hidden={!isOpen}
                    className="showcase-aside-group-body"
                    role="group"
                    aria-label={translate('products.filters.price')}>
                    <div className="row">
                        <div className="col col-md-5">
                            <FormGroup
                                id={'from'}
                                label={translate('products.filters.price_from')}
                                error={errors?.from}
                                input={(id) => (
                                    <input
                                        className="form-control"
                                        id={id}
                                        min={0}
                                        max={toMax}
                                        value={filterValues.from || ''}
                                        onChange={(e) =>
                                            filterUpdate({
                                                from: Math.min(Math.max(parseFloat(e.target.value) || 0, 0), toMax),
                                            })
                                        }
                                        type="number"
                                        aria-label={translate('products.filters.price_from')}
                                        data-dusk="inputPriceFrom"
                                    />
                                )}
                            />
                        </div>
                        <div className="col col-md-2" />
                        <div className="col col-md-5">
                            <FormGroup
                                id={'to'}
                                label={translate('products.filters.price_to')}
                                error={errors?.to}
                                input={(id) => (
                                    <input
                                        className="form-control"
                                        id={id}
                                        min={0}
                                        max={toMax}
                                        value={filterValues.to || toMax}
                                        placeholder={translate('products.filters.price_to')}
                                        onChange={(e) =>
                                            filterUpdate({
                                                to: Math.min(Math.max(parseFloat(e.target.value) || toMax, 0), toMax),
                                            })
                                        }
                                        type="number"
                                        aria-label={translate('products.filters.price_to')}
                                        data-dusk="inputPriceTo"
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <FormGroup
                        input={() => (
                            <RangeControl
                                min={0}
                                max={toMax}
                                from={filterValues.from || 0}
                                to={filterValues.to || toMax}
                                setFrom={(from) => filterUpdate({ from })}
                                setTo={(to) => filterUpdate({ to })}
                                prefix={'€ '}
                            />
                        )}
                    />
                </div>
            )}
        />
    );
}
