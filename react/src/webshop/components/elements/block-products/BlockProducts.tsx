import React from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Product from '../../../../dashboard/props/models/Product';
import EmptyBlock from '../empty-block/EmptyBlock';
import ProductsList from '../lists/products-list/ProductsList';
import CmsBlocks from '../cms-blocks/CmsBlocks';
import useAppConfigs from '../../../hooks/useAppConfigs';
import Section from '../sections/Section';

export default function BlockProducts({
    type = 'budget',
    display = 'grid',
    filters = {},
    products = null,
    setProducts = null,
    showLoadMore = true,
    showCustomDescription = false,
}: {
    type: 'budget' | 'subsidies';
    display?: 'grid' | 'list';
    filters?: object;
    products?: Array<Product>;
    setProducts?: (products: Array<Product>) => void;
    showLoadMore?: boolean;
    showCustomDescription?: boolean;
}) {
    const translate = useTranslate();
    const appConfigs = useAppConfigs();
    const cmsBlock = showCustomDescription && appConfigs?.pages?.home ? appConfigs?.pages?.block_home_products : null;

    return (
        <Section type="products" id="products">
            {products?.length > 0 && (
                <h2 className={'section-title'}>
                    <StateNavLink name={type == 'budget' ? 'products' : 'actions'} params={filters}>
                        {cmsBlock?.title || translate(`block_products.header.title_${type}`)}
                    </StateNavLink>
                </h2>
            )}

            {cmsBlock && <CmsBlocks page={cmsBlock} />}

            {products?.length > 0 ? (
                <ProductsList type={type} display={display} products={products} setProducts={setProducts} />
            ) : (
                <EmptyBlock
                    title={translate(`block_products.labels.title`)}
                    description={translate(`block_products.labels.subtitle`)}
                    svgIcon="reimbursements"
                    hideLink={true}
                />
            )}

            {showLoadMore && (
                <div className="block block-show-more">
                    <StateNavLink
                        className="button button-primary show-more-button"
                        name={type == 'budget' ? 'products' : 'actions'}
                        params={filters}>
                        {translate(`block_products.buttons.more`)}
                        <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                    </StateNavLink>
                </div>
            )}
        </Section>
    );
}
