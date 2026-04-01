import React, { Fragment, useCallback, useMemo } from 'react';
import { BaseTypeFilterProducts } from '../components/pages/products/Products';
import { FilterScope } from '../../dashboard/modules/filter_next/types/FilterParams';
import ProductCategory from '../../dashboard/props/models/ProductCategory';
import Fund from '../props/models/Fund';
import Organization from '../../dashboard/props/models/Organization';
import useTranslate from '../../dashboard/hooks/useTranslate';
import Label from '../components/elements/label/Label';
import { BaseTypeFilterProviders } from '../components/pages/providers/Providers';
import BusinessType from '../../dashboard/props/models/BusinessType';
import { clickOnKeyEnter } from '../../dashboard/helpers/wcag';

type Label = {
    key?: string | number;
    type: string;
    label: string;
};

export default function useLabelFilters(
    filter: FilterScope<BaseTypeFilterProducts & BaseTypeFilterProviders>,
    categories: Array<ProductCategory>,
    funds: Array<Fund>,
    organizations?: Array<Organization>,
    businessTypes?: Array<BusinessType>,
    priceMax?: number,
) {
    const translate = useTranslate();

    const makeLabel = useCallback(
        (type: string, firstValue?: string | number, secondValue?: string | number): string => {
            if (type === 'category') {
                return categories?.filter((category) => category.id === firstValue)[0].name || '';
            }

            if (type === 'business_type') {
                return businessTypes?.filter((type) => type.id === firstValue)[0].name || '';
            }

            if (type === 'fund') {
                return funds?.filter((fund) => fund.id === firstValue)[0].name || '';
            }

            if (type === 'organization') {
                return organizations?.filter((organization) => organization.id === firstValue)[0].name || '';
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
                return `€ ${firstValue ?? 0} ${translate('products.active_filters.price.to')} € ${secondValue ?? priceMax}`;
            }

            if (type === 'all') {
                return translate('products.active_filters.reset_all');
            }

            return '';
        },
        [businessTypes, categories, funds, organizations, priceMax, translate],
    );

    const labels: Array<Label> = useMemo(() => {
        if (!categories || !funds || !(organizations || businessTypes)) {
            return [];
        }

        const labels = [];

        if (filter.activeValues.product_category_ids) {
            filter.activeValues.product_category_ids.forEach((id) => {
                labels.push({
                    type: 'category',
                    key: id,
                    label: makeLabel('category', id),
                });
            });
        }

        if (filter.activeValues.fund_ids) {
            filter.activeValues.fund_ids.forEach((id) => {
                labels.push({
                    type: 'fund',
                    key: id,
                    label: makeLabel('fund', id),
                });
            });
        }

        if (filter.activeValues.postcode) {
            labels.push({
                type: 'postcode',
                key: null,
                label: makeLabel('postcode', filter.activeValues.postcode, filter.activeValues.distance),
            });
        }

        if (filter.activeValues.organization_id) {
            labels.push({
                type: 'organization',
                key: filter.activeValues.organization_id,
                label: makeLabel('organization', filter.activeValues.organization_id),
            });
        }

        if (filter.activeValues.business_type_id) {
            labels.push({
                type: 'business_type',
                key: filter.activeValues.business_type_id,
                label: makeLabel('business_type', filter.activeValues.business_type_id),
            });
        }

        if (filter.activeValues.from || (filter.activeValues.to && filter.activeValues.to !== priceMax)) {
            labels.push({
                type: 'price',
                key: null,
                label: makeLabel('price', filter.activeValues.from, filter.activeValues.to),
            });
        }

        // bool keys
        const keys = [
            'qr',
            'reservation',
            'extra_payment',
            'regular',
            'discount_fixed',
            'discount_percentage',
            'free',
            'informational',
            'payout',
        ];

        keys.forEach((key) => {
            const value = filter.activeValues[key];

            if (value) {
                labels.push({
                    type: key,
                    key: null,
                    label: makeLabel(key),
                });
            }
        });

        if (labels.length) {
            labels.sort((a, b) => a.label.length - b.label.length);

            labels.unshift({
                type: 'all',
                key: null,
                label: makeLabel('all'),
            });
        }

        return labels;
    }, [filter.activeValues, categories, funds, organizations, businessTypes, priceMax, makeLabel]);

    const resetLabel = useCallback(
        (label: Label) => {
            if (label.type === 'category') {
                filter.update({
                    product_category_ids: filter.activeValues.product_category_ids.filter((id) => id !== label.key),
                });
            }

            if (label.type === 'fund') {
                filter.update({
                    fund_ids: filter.activeValues.fund_ids.filter((id) => id !== label.key),
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

            if (
                [
                    'qr',
                    'reservation',
                    'extra_payment',
                    'regular',
                    'discount_fixed',
                    'discount_percentage',
                    'free',
                    'informational',
                    'payout',
                ].includes(label.type)
            ) {
                filter.update({ [label.type]: null });
            }

            if (label.type === 'all') {
                filter.resetFilters();
            }
        },
        [filter],
    );

    const labelsBlock = useMemo(() => {
        return (
            labels.length > 0 && (
                <div className="showcase-aside-group">
                    <div className="showcase-aside-group-title">{translate('products.filters.active_filters')}</div>

                    <div className="label-group">
                        {labels.map((label, index) => (
                            <Label
                                key={index}
                                type="primary-light"
                                size="xl"
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
            )
        );
    }, [labels, resetLabel, translate]);

    return { labels, resetLabel, labelsBlock };
}
