import React, { useCallback, useEffect, useState } from 'react';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import FormGroup from '../../../elements/forms/FormGroup';
import SelectControl from '../../../../../dashboard/components/elements/select-control/SelectControl';
import BusinessType from '../../../../../dashboard/props/models/BusinessType';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import { useBusinessTypeService } from '../../../../../dashboard/services/BusinessTypeService';
import ProductsFilterGroup from './base-group/ProductsFilterGroup';

export default function ProvidersFilterGroupBusinessTypes({
    value,
    setValue,
    error,
    openByDefault = false,
}: {
    value: number;
    setValue: (value: number) => void;
    error?: string | string[];
    openByDefault?: boolean;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const businessTypeService = useBusinessTypeService();

    const [businessTypes, setBusinessTypes] = useState<Array<Partial<BusinessType>>>(null);

    const fetchBusinessTypes = useCallback(() => {
        setProgress(0);

        businessTypeService
            .list({ parent_id: 'null', per_page: 9999, used: 1 })
            .then((res) =>
                setBusinessTypes([{ id: null, name: translate('providers.filters.all_types') }, ...res.data.data]),
            )
            .finally(() => setProgress(100));
    }, [businessTypeService, setProgress, translate]);

    useEffect(() => {
        fetchBusinessTypes();
    }, [fetchBusinessTypes]);

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
                                    options={businessTypes}
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
