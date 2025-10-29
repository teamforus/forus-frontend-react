import React from 'react';
import useRootProductCategories from '../../pages/products/hooks/useRootProductCategories';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import classNames from 'classnames';
import SVGShapeTop from '../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/product-categories-shape-top.svg';
import SVGShapeBottom from '../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/product-categories-shape-bottom.svg';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useTranslate from '../../../../dashboard/hooks/useTranslate';

export default function BlockProductCategories() {
    const appConfigs = useAppConfigs();
    const translate = useTranslate();
    const cmsBlock = appConfigs?.pages?.block_home_product_categories;

    const { productCategories, productCategoriesIconMap } = useRootProductCategories();

    return (
        <section className="block block-product-categories" aria-labelledby="product-categories-title">
            <div className="product-categories-shape" aria-hidden="true">
                <SVGShapeTop />
            </div>

            <div className="product-categories-content">
                <div className="wrapper">
                    <h2 id="product-categories-title" className="product-categories-title">
                        {cmsBlock?.title || translate(`block_product_categories.title`)}
                    </h2>

                    <p className="product-categories-description">
                        {cmsBlock?.description || translate(`block_product_categories.description`)}
                    </p>

                    <div
                        className={classNames(
                            'product-category-items',
                            !productCategoriesIconMap && 'product-category-items-no-icons',
                        )}
                        role="list">
                        {productCategories?.map((category) => (
                            <StateNavLink
                                name="products"
                                query={{ product_category_ids: category.id }}
                                className="product-category-item"
                                key={category.id}
                                role="listitem"
                                aria-label={`Bekijk producten in categorie ${category.name}`}>
                                {productCategoriesIconMap?.[category.key] && (
                                    <div className="product-category-item-icon" aria-hidden="true">
                                        {productCategoriesIconMap[category.key]}
                                    </div>
                                )}
                                <span className="product-category-item-name">{category.name}</span>
                            </StateNavLink>
                        ))}
                    </div>
                </div>
            </div>

            <div className="product-categories-shape" aria-hidden="true">
                <SVGShapeBottom />
            </div>
        </section>
    );
}
