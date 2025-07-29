import React, { useCallback, useEffect, useState } from 'react';
import FormError from '../../../elements/forms/errors/FormError';
import ProductCategory from '../../../../props/models/ProductCategory';
import SelectControl from '../../../elements/select-control/SelectControl';
import useProductCategoryService from '../../../../services/ProductCategoryService';
import useTranslate from '../../../../hooks/useTranslate';
import FormPane from '../../../elements/forms/elements/FormPane';

export default function ProductCategoriesControl({
    value,
    errors,
    onChange,
    disabled = false,
}: {
    value?: number;
    errors: string | Array<string>;
    onChange: (value: number) => void;
    disabled?: boolean;
}) {
    const translate = useTranslate();
    const [ready, setReady] = useState(false);
    const [categoriesValues, setCategoriesValues] = useState<Array<number | null>>([]);
    const [categoriesHierarchy, setCategoriesHierarchy] = useState<Array<Array<Partial<ProductCategory>>>>([]);

    const productCategoryService = useProductCategoryService();

    const loadCategories = useCallback(
        async (index: number, parent_id = null, loadOnlyTarget = false): Promise<Array<Partial<ProductCategory>>> => {
            if (!loadOnlyTarget) {
                categoriesHierarchy.splice(index);
                categoriesValues.splice(index);

                setCategoriesHierarchy([...categoriesHierarchy]);
                setCategoriesValues([...categoriesValues]);
            }

            if (index > 0 && parent_id === null) {
                return [];
            }

            const res = await productCategoryService.list({
                parent_id: parent_id === null ? 'null' : parent_id,
                per_page: 1000,
            });

            const categories = [{ id: null, name: 'Selecteer categorie...' }, ...res.data.data];

            if (categories.length > 1) {
                categoriesHierarchy[index] = categories;
                setCategoriesHierarchy([...categoriesHierarchy]);

                if (!loadOnlyTarget) {
                    categoriesValues[index] = categories[0].id;
                    setCategoriesValues([...categoriesValues]);
                }
            }
            return categories;
        },
        [categoriesHierarchy, categoriesValues, productCategoryService],
    );

    const changeCategory = useCallback(
        (index: number, value: number | false = false) => {
            if (value !== false) {
                categoriesValues[index] = value;
                setCategoriesValues([...categoriesValues]);
            }

            loadCategories(index + 1, categoriesValues[index]).then(() => {
                onChange(categoriesValues.findLast((category) => category != null));
            });
        },
        [categoriesValues, loadCategories, onChange],
    );

    const loadProductCategoriesParent = useCallback(
        async (category_id, ids) => {
            if (category_id === null) {
                return ids;
            }

            ids.push(category_id);

            return productCategoryService.read(category_id).then((res) => {
                return loadProductCategoriesParent(res.data.data.parent_id, ids);
            });
        },
        [productCategoryService],
    );

    const loadProductCategories = useCallback(async () => {
        loadProductCategoriesParent(value, []).then((values: Array<number>) => {
            setCategoriesValues([...values].reverse());

            loadCategories(0, null, true).then(() => {
                [...values]?.reverse()?.forEach((value?: number, index?: number) => {
                    loadCategories(index + 1, value, true).then();
                });
            });
        });
    }, [loadCategories, loadProductCategoriesParent, value]);

    useEffect(() => {
        if (ready) {
            return;
        }

        setReady(true);

        if (value) {
            loadProductCategories().then();
        } else {
            changeCategory(-1);
        }
    }, [changeCategory, loadProductCategories, value, ready]);
    return (
        <FormPane title={'Categories'}>
            {[...categoriesHierarchy.keys()].map((index) => (
                <div className="form-group" key={categoriesHierarchy.length + '-' + index}>
                    {index == 0 ? (
                        <label className="form-label form-label-required">
                            {translate('product_edit.labels.category')}
                        </label>
                    ) : null}

                    <SelectControl
                        className="form-control"
                        propKey="id"
                        options={categoriesHierarchy[index]}
                        value={categoriesValues[index]}
                        onChange={(value?: number) => changeCategory(index, value)}
                        disabled={disabled}
                        placeholder="Selecteer categorie..."
                    />

                    {index == categoriesHierarchy.length - 1 && <FormError error={errors} />}
                </div>
            ))}
        </FormPane>
    );
}
