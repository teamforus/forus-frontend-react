import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import ProductCategory from '../../../../../dashboard/props/models/ProductCategory';
import useProductCategoryService from '../../../../../dashboard/services/ProductCategoryService';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import ProductsFilterGroup from './base-group/ProductsFilterGroup';

export default function ProductsFilterGroupProductCategories({
    value,
    setValue,
    openByDefault = false,
}: {
    value: number[];
    setValue: (selected: number[]) => void;
    openByDefault?: boolean;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const [productCategories, setProductCategories] = useState<Array<ProductCategory>>(null);

    const productCategoryService = useProductCategoryService();

    const iconMap = {
        'learning-and-courses': <em className="mdi mdi-laptop" />,
        'art-and-culture': <em className="mdi mdi-music" />,
        'trips-and-attractions': <em className="mdi mdi-nature-people-outline" />,
        'sports-and-exercise': <em className="mdi mdi-soccer" />,
        'wellbeing-and-care': <em className="mdi mdi-face-man-shimmer-outline" />,
        'clothing-and-fashion': <em className="mdi mdi-tshirt-crew-outline" />,
        'family-and-care': <em className="mdi mdi-human-male-female-child" />,
        'kids-and-fun': <em className="mdi mdi-teddy-bear" />,
        electronics: <em className="mdi mdi-television-classic" />,
        'hobbies-and-leisure': <em className="mdi mdi-palette-outline" />,
        'library-and-reading': <em className="mdi mdi-book-open-blank-variant-outline" />,
        'bicycle-and-transport': <em className="mdi mdi-bicycle" />,
        animals: <em className="mdi mdi-paw" />,
        education: <em className="mdi mdi-school-outline" />,
        'participation-and-socializing': <em className="mdi mdi-crowd" />,
        'help-and-advice': <em className="mdi mdi-handshake" />,
        appliances: <em className="mdi mdi-fridge-outline" />,
        shopping: <em className="mdi mdi-shopping-outline" />,
    };

    const fetchProductCategories = useCallback(() => {
        setProgress(0);

        productCategoryService
            .list({ parent_id: 'null', used: 1, per_page: 1000 })
            .then((res) => setProductCategories(res.data.data))
            .finally(() => setProgress(100));
    }, [productCategoryService, setProgress]);

    useEffect(() => {
        fetchProductCategories();
    }, [fetchProductCategories]);

    return (
        <ProductsFilterGroup
            dusk={'productFilterGroupProductCategories'}
            title={translate('products.filters.category')}
            controls={'product_categories'}
            openByDefault={openByDefault}
            content={(isOpen) => (
                <div
                    id="product_categories"
                    className="showcase-aside-group-body"
                    role="group"
                    aria-label={translate('products.filters.category')}
                    hidden={!isOpen}>
                    <div className="block block-product-category-filter">
                        {productCategories?.map((category) => {
                            const isActive = value.includes(category.id);

                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={classNames(
                                        'category-filter-item',
                                        isActive && 'category-filter-item-active',
                                    )}
                                    data-dusk={'productCategoryFilterOption' + category.id}
                                    aria-pressed={isActive}
                                    aria-label={category.name}
                                    onClick={() =>
                                        setValue(
                                            isActive
                                                ? value.filter((id) => id !== category.id)
                                                : [...value, category.id],
                                        )
                                    }>
                                    <span aria-hidden="true" className="category-filter-item-icon">
                                        {iconMap[category.key]}
                                    </span>
                                    <span className="category-filter-item-name">{category.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        />
    );
}
