import React, { useCallback, useEffect, useState } from 'react';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import FormGroup from '../../../elements/forms/FormGroup';
import FilterSetter from '../../../../../dashboard/types/FilterSetter';
import SelectControl from '../../../../../dashboard/components/elements/select-control/SelectControl';
import Organization from '../../../../../dashboard/props/models/Organization';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import { useOrganizationService } from '../../../../../dashboard/services/OrganizationService';
import ProductsFilterGroup from './base-group/ProductsFilterGroup';

export default function ProductsFilterGroupProviders({
    filterValues,
    filterUpdate,
    errors,
    openByDefault = false,
}: {
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
    const setProgress = useSetProgress();

    const organizationService = useOrganizationService();

    const [organizations, setOrganizations] = useState<Array<Partial<Organization>>>(null);

    const fetchOrganizations = useCallback(() => {
        setProgress(0);

        organizationService
            .list({ type: 'provider', per_page: 300, order_by: 'name' })
            .then((res) => {
                setOrganizations([{ id: null, name: translate('products.filters.all_providers') }, ...res.data.data]);
            })
            .then(() => setProgress(100));
    }, [organizationService, setProgress, translate]);

    useEffect(() => {
        fetchOrganizations();
    }, [fetchOrganizations]);

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
                                    options={organizations || []}
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
