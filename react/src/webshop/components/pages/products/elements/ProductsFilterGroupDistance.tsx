import React, { useMemo } from 'react';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import FormGroup from '../../../elements/forms/FormGroup';
import SelectControl from '../../../../../dashboard/components/elements/select-control/SelectControl';
import { FilterSetter } from '../../../../../dashboard/modules/filter_next/types/FilterParams';
import ProductsFilterGroup from './base-group/ProductsFilterGroup';

export default function ProductsFilterGroupDistance({
    values,
    setValues,
    errors,
    openByDefault = false,
}: {
    values: {
        postcode?: string;
        distance?: number;
    };
    setValues: FilterSetter<{
        postcode?: string;
        distance?: number;
    }>;
    errors?: {
        postcode?: string;
        distance?: string;
    };
    openByDefault?: boolean;
}) {
    const translate = useTranslate();

    const distances = useMemo(() => {
        return [
            { id: null, name: translate('products.distances.everywhere') },
            { id: 3, name: translate('products.distances.3') },
            { id: 5, name: translate('products.distances.5') },
            { id: 10, name: translate('products.distances.10') },
            { id: 15, name: translate('products.distances.15') },
            { id: 25, name: translate('products.distances.25') },
            { id: 50, name: translate('products.distances.50') },
            { id: 75, name: translate('products.distances.75') },
        ];
    }, [translate]);

    return (
        <ProductsFilterGroup
            dusk={'productFilterGroupDistance'}
            title={translate('products.filters.distance')}
            controls={'distance_filters'}
            openByDefault={openByDefault}
            content={(isOpen) => (
                <div
                    id="distance_filters"
                    hidden={!isOpen}
                    className="showcase-aside-group-body"
                    role="group"
                    aria-label={translate('products.filters.distance')}>
                    <div className="row">
                        <div className="col col-md-6">
                            <FormGroup
                                id={'postcode'}
                                label={translate('products.filters.postcode')}
                                error={errors?.postcode}
                                input={(id) => (
                                    <input
                                        id={id}
                                        className="form-control"
                                        value={values.postcode}
                                        onChange={(e) => setValues({ postcode: e.target.value })}
                                        type="text"
                                        aria-label={translate('products.filters.postcode')}
                                        data-dusk="inputPostcode"
                                    />
                                )}
                            />
                        </div>
                        <div className="col col-md-6">
                            <FormGroup
                                id={'distance'}
                                label={translate('products.filters.distance')}
                                error={errors?.distance}
                                input={(id) => (
                                    <SelectControl
                                        id={id}
                                        propKey={'id'}
                                        value={values.distance}
                                        multiline={true}
                                        allowSearch={true}
                                        onChange={(distance: number) => setValues({ distance })}
                                        options={distances || []}
                                        dusk="selectControlDistances"
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            )}
        />
    );
}
