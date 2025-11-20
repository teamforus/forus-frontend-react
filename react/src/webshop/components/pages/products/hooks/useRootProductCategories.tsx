import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ProductCategory from '../../../../../dashboard/props/models/ProductCategory';
import useProductCategoryService from '../../../../../dashboard/services/ProductCategoryService';

export default function useRootProductCategories() {
    const setProgress = useSetProgress();
    const appConfig = useAppConfigs();
    const [productCategories, setProductCategories] = useState<Array<ProductCategory>>(null);

    const productCategoryService = useProductCategoryService();

    const productCategoriesIconMap = useMemo(() => {
        if (appConfig?.implementation?.root_product_category_id) {
            return null;
        }

        return {
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
    }, [appConfig?.implementation?.root_product_category_id]);

    const fetchProductCategories = useCallback(() => {
        setProgress(0);

        productCategoryService
            .list({
                parent_id: appConfig?.implementation?.root_product_category_id ?? 'null',
                per_page: 1000,
                used: 1,
            })
            .then((res) => setProductCategories(res.data.data))
            .finally(() => setProgress(100));
    }, [appConfig?.implementation?.root_product_category_id, productCategoryService, setProgress]);

    useEffect(() => {
        fetchProductCategories();
    }, [fetchProductCategories]);

    return useMemo(() => {
        return { productCategoriesIconMap, productCategories };
    }, [productCategoriesIconMap, productCategories]);
}
