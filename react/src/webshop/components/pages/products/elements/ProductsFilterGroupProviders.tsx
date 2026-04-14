import React from 'react';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import FormGroup from '../../../elements/forms/FormGroup';
import { FilterSetter } from '../../../../../dashboard/modules/filter_next/types/FilterParams';
import SelectControl from '../../../../../dashboard/components/elements/select-control/SelectControl';
import Organization from '../../../../../dashboard/props/models/Organization';
import ProductsFilterGroup from './base-group/ProductsFilterGroup';

export default function ProductsFilterGroupProviders({
    organizations,
    filterValues,
    filterUpdate,
    errors,
    openByDefault = false,
}: {
    organizations: Array<Organization>;
    filterValues: {
        organization_id?: number;
    };
    filterUpdate: FilterSetter<{
        organization_id?: number;
    }>;
    errors?: {
        organization_id?: string;
    };
    openByDefault?: boolean;
}) {
    const translate = useTranslate();

    return (
        <ProductsFilterGroup
            dusk={'productFiltersGroupProviders'}
            title={translate('products.filters.providers')}
            controls={'provider_filters'}
            openByDefault={openByDefault}
            content={(isOpen) => (
                <div
                    id="provider_filters"
                    hidden={!isOpen}
                    className="showcase-aside-group-body"
                    role="group"
                    aria-label={translate('products.filters.price')}>
                    {organizations && (
                        <FormGroup
                            id={'select_provider'}
                            label={translate('products.filters.providers')}
                            error={errors?.organization_id}
                            input={(id) => (
                                <SelectControl
                                    id={id}
                                    value={filterValues.organization_id}
                                    propKey={'id'}
                                    multiline={true}
                                    allowSearch={true}
                                    onChange={(organization_id: number) => filterUpdate({ organization_id })}
                                    options={[
                                        { id: null, name: translate('products.filters.all_providers') },
                                        ...(organizations || []),
                                    ]}
                                    dusk="selectControlOrganizations"
                                />
                            )}
                        />
                    )}
                </div>
            )}
        />
    );
}
