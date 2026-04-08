import React, { Fragment, useCallback, useMemo, useState } from 'react';
import ProductCategory from '../../../../dashboard/props/models/ProductCategory';
import Fund from '../../../props/models/Fund';
import Organization from '../../../../dashboard/props/models/Organization';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import Label from '../label/Label';
import BusinessType from '../../../../dashboard/props/models/BusinessType';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import { FilterModel, FilterScope } from '../../../../dashboard/modules/filter_next/types/FilterParams';

export type BaseTypeFilterProducts = {
    fund_ids: number[];
    organization_id: number;
    product_category_ids: number[];
    postcode: string;
    distance: number;
    from: number;
    to: number;
    qr?: boolean;
    reservation?: boolean;
    extra_payment?: boolean;
    regular?: boolean;
    discount_fixed?: boolean;
    discount_percentage?: boolean;
    free?: boolean;
    informational?: boolean;
    payout?: boolean;
};

export type BaseTypeFilterProviders = {
    fund_ids?: number[];
    business_type_id?: number;
    product_category_ids?: number[];
    postcode?: string;
    distance?: number;
};

type ActiveFilterToggleKey =
    | 'qr'
    | 'reservation'
    | 'extra_payment'
    | 'regular'
    | 'discount_fixed'
    | 'discount_percentage'
    | 'free'
    | 'informational'
    | 'payout';

type ActiveFilterValueKey = 'all' | 'business_type' | 'category' | 'fund' | 'organization' | 'postcode' | 'price';
type ActiveFilterLabelType = ActiveFilterValueKey | ActiveFilterToggleKey;

type ActiveFilterLabel = {
    key?: string | number;
    type: ActiveFilterLabelType;
    label: string;
};

const resetKeysMap: Record<ActiveFilterLabelType, Array<string>> = {
    all: [],
    business_type: ['business_type_id'],
    category: ['product_category_ids'],
    fund: ['fund_ids'],
    organization: ['organization_id'],
    postcode: ['postcode', 'distance'],
    price: ['from', 'to'],
    qr: ['qr'],
    reservation: ['reservation'],
    extra_payment: ['extra_payment'],
    regular: ['regular'],
    discount_fixed: ['discount_fixed'],
    discount_percentage: ['discount_percentage'],
    free: ['free'],
    informational: ['informational'],
    payout: ['payout'],
};

export default function ActiveFilterLabels({
    filter,
    categories,
    funds,
    organizations,
    businessTypes,
    priceMax,
    initialValues,
}: {
    filter: FilterScope<BaseTypeFilterProviders & BaseTypeFilterProducts>;
    categories: Array<ProductCategory>;
    funds: Array<Fund>;
    organizations?: Array<Organization>;
    businessTypes?: Array<BusinessType>;
    priceMax?: number;
    initialValues?: Partial<FilterModel & BaseTypeFilterProviders & BaseTypeFilterProducts>;
}) {
    const translate = useTranslate();

    const [toggleKeys] = useState<ActiveFilterLabelType[]>([
        'qr',
        'reservation',
        'extra_payment',
        'regular',
        'discount_fixed',
        'discount_percentage',
        'free',
        'informational',
        'payout',
    ]);

    const makeLabel = useCallback(
        (type: ActiveFilterLabelType, firstValue?: string | number, secondValue?: string | number): string => {
            if (type === 'category') {
                return categories?.find((category) => category.id === firstValue)?.name || '';
            }

            if (type === 'business_type') {
                return businessTypes?.find((businessType) => businessType.id === firstValue)?.name || '';
            }

            if (type === 'fund') {
                return funds?.find((fund) => fund.id === firstValue)?.name || '';
            }

            if (type === 'organization') {
                return organizations?.find((organization) => organization.id === firstValue)?.name || '';
            }

            if (type === 'postcode') {
                return `${firstValue} ${
                    secondValue === null
                        ? '- ' + translate('products.active_filters.distances.everywhere')
                        : translate(`products.active_filters.distances.${secondValue}`)
                }`;
            }

            if (['qr', 'reservation', 'extra_payment'].includes(type)) {
                return translate('products.filters.payment_option_' + type);
            }

            if (
                ['regular', 'discount_fixed', 'discount_percentage', 'free', 'informational', 'payout'].includes(type)
            ) {
                return translate(`products.active_filters.price_type_option.${type}`);
            }

            if (type === 'price') {
                return (
                    `€ ${firstValue ?? 0} ${translate('products.active_filters.price.to')} ` +
                    `€ ${secondValue ?? priceMax}`
                );
            }

            if (type === 'all') {
                return translate('products.active_filters.reset_all');
            }

            return '';
        },
        [businessTypes, categories, funds, organizations, priceMax, translate],
    );

    const labels = useMemo<Array<ActiveFilterLabel>>(() => {
        const labels = [];

        const pushLabel = (type: ActiveFilterLabelType, key?: string | number, label?: string) => {
            if (!label) {
                return;
            }

            labels.push({ type, key, label });
        };

        filter.activeValues.product_category_ids?.forEach((id) => {
            pushLabel('category', id, makeLabel('category', id));
        });

        filter.activeValues.fund_ids?.forEach((id) => {
            pushLabel('fund', id, makeLabel('fund', id));
        });

        if (filter.activeValues.postcode) {
            labels.push({
                type: 'postcode',
                key: null,
                label: makeLabel('postcode', filter.activeValues.postcode, filter.activeValues.distance),
            });
        }

        if (filter.activeValues.organization_id) {
            pushLabel(
                'organization',
                filter.activeValues.organization_id,
                makeLabel('organization', filter.activeValues.organization_id),
            );
        }

        if (filter.activeValues.business_type_id) {
            pushLabel(
                'business_type',
                filter.activeValues.business_type_id,
                makeLabel('business_type', filter.activeValues.business_type_id),
            );
        }

        if (filter.activeValues.from || (filter.activeValues.to && filter.activeValues.to !== priceMax)) {
            labels.push({
                type: 'price',
                key: null,
                label: makeLabel('price', filter.activeValues.from, filter.activeValues.to),
            });
        }

        toggleKeys.forEach((key) => {
            if (filter.activeValues[key]) {
                labels.push({ type: key, key: null, label: makeLabel(key) });
            }
        });

        if (labels.length) {
            labels.sort((a, b) => a.label.length - b.label.length);
            labels.unshift({ type: 'all', key: null, label: makeLabel('all') });
        }

        return labels;
    }, [filter.activeValues, makeLabel, priceMax, toggleKeys]);

    const resetLabel = useCallback(
        (label: ActiveFilterLabel) => {
            if (label.type === 'category') {
                filter.update({
                    product_category_ids:
                        filter.activeValues.product_category_ids?.filter((id) => id !== label.key) || [],
                });
            }

            if (label.type === 'fund') {
                filter.update({
                    fund_ids: filter.activeValues.fund_ids?.filter((id) => id !== label.key) || [],
                });
            }

            if (label.type === 'organization') {
                filter.update({ organization_id: null });
            }

            if (label.type === 'business_type') {
                filter.update({ business_type_id: null });
            }

            if (label.type === 'postcode') {
                filter.update({ postcode: '', distance: null });
            }

            if (label.type === 'price') {
                filter.update({ from: null, to: null });
            }

            if (toggleKeys.includes(label.type)) {
                filter.update({ [label.type]: null });
            }

            if (label.type === 'all') {
                if (initialValues) {
                    filter.update(
                        labels
                            .filter((item) => item.type !== 'all')
                            .flatMap((item) => resetKeysMap[item.type])
                            .reduce<Partial<FilterModel & BaseTypeFilterProviders & BaseTypeFilterProducts>>(
                                (values, key) => {
                                    if (key in initialValues) {
                                        values[key] = initialValues[key];
                                    }

                                    return values;
                                },
                                {},
                            ),
                    );
                } else {
                    filter.resetFilters();
                }
            }
        },
        [filter, initialValues, labels, toggleKeys],
    );

    if (labels.length === 0) {
        return null;
    }

    return (
        <div className="showcase-aside-group">
            <div className="showcase-aside-group-title">{translate('products.filters.active_filters')}</div>

            <div className="label-group">
                {labels.map((label, index) => (
                    <Label
                        key={index}
                        type={`${label.type === 'all' ? 'light' : 'primary'}`}
                        size="md"
                        dusk={`activeFilter_${label.type}_${label.key || ''}`}>
                        <Fragment>
                            <span>{label.label}</span>
                            <em
                                className="mdi mdi-close clickable"
                                data-dusk="closeActiveFilter"
                                tabIndex={0}
                                onKeyDown={clickOnKeyEnter}
                                role="button"
                                onClick={() => resetLabel(label)}
                            />
                        </Fragment>
                    </Label>
                ))}
            </div>
        </div>
    );
}
