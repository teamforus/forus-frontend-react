import React, { useMemo } from 'react';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import FormGroup from '../../../elements/forms/FormGroup';
import SelectControl from '../../../../../dashboard/components/elements/select-control/SelectControl';
import BusinessType from '../../../../../dashboard/props/models/BusinessType';
import ProductsFilterGroup from './base-group/ProductsFilterGroup';

export default function ProvidersFilterGroupBusinessTypes({
    value,
    businessTypes,
    setValue,
    error,
    openByDefault = false,
}: {
    value: number;
    businessTypes: Array<BusinessType>;
    setValue: (value: number) => void;
    error?: string | string[];
    openByDefault?: boolean;
}) {
    const translate = useTranslate();

    const businessTypeOptions = useMemo(() => {
        return [{ id: null, name: translate('providers.filters.all_types') }, ...(businessTypes || [])];
    }, [businessTypes, translate]);

    return (
        <ProductsFilterGroup
            dusk={'productFilterGroupBusinessTypes'}
            title={translate('providers.filters.provider_type')}
            controls={'provider_type_filter'}
            openByDefault={openByDefault}
            content={(isOpen) => (
                <div
                    id="provider_type_filter"
                    hidden={!isOpen}
                    className="showcase-aside-group-body"
                    role="group"
                    aria-label={translate('providers.filters.provider_type')}>
                    {businessTypes && (
                        <FormGroup
                            id={'business_type_id'}
                            label={translate('providers.filters.provider_type')}
                            error={error}
                            input={(id) => (
                                <SelectControl
                                    id={id}
                                    propKey={'id'}
                                    options={businessTypeOptions}
                                    value={value}
                                    onChange={setValue}
                                    multiline={true}
                                    allowSearch={false}
                                    dusk="selectControlBusinessTypes"
                                />
                            )}
                        />
                    )}
                </div>
            )}
        />
    );
}
