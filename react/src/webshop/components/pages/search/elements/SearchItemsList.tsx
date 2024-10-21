import React, { useCallback } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import { useProductService } from '../../../../services/ProductService';
import { strLimit } from '../../../../../dashboard/helpers/string';
import Product from '../../../../props/models/Product';
import ProductsListItem from '../../../elements/lists/products-list/ProductsListItem';
import FundsListItem from '../../../elements/lists/funds-list/FundsListItem';
import Fund from '../../../../props/models/Fund';
import ProvidersListItem from '../../../elements/lists/providers-list/ProvidersListItem';
import Provider from '../../../../props/models/Provider';
import { SearchItem } from '../../../../services/SearchService';

export default function SearchItemsList({
    items,
    display,
    vouchers,
}: {
    items: Array<SearchItem & { searchParams?: object }>;
    display: 'list' | 'grid';
    vouchers: Array<Voucher>;
}) {
    const productService = useProductService();

    const transformProductAlternativeText = (product: Product) => {
        return productService.transformProductAlternativeText(product);
    };

    const getDescription = useCallback((description_text: string) => {
        const el = document.createElement('div');

        el.innerHTML = description_text;

        return strLimit(el.innerText, 120);
    }, []);

    return (
        <div className={`block block-search-results ${display === 'grid' ? 'block-search-results-grid' : ''}`}>
            {items?.map((item, index) => (
                <div className="search-wrapper" key={index}>
                    {item.item_type === 'product' && (
                        <ProductsListItem
                            product={
                                {
                                    ...item.resource,
                                    description: getDescription(item.description_text),
                                    alternative_text: transformProductAlternativeText(item.resource as Product),
                                } as Product
                            }
                            display={'search'}
                            searchParams={item.searchParams || null}
                        />
                    )}

                    {item.item_type === 'fund' && (
                        <FundsListItem
                            fund={{ ...item.resource, description: getDescription(item.description_text) } as Fund}
                            vouchers={vouchers}
                            display={'search'}
                            searchParams={item.searchParams || null}
                        />
                    )}

                    {item.item_type === 'provider' && (
                        <ProvidersListItem
                            provider={
                                {
                                    ...item.resource,
                                    description: getDescription(item.description_text),
                                } as unknown as Provider
                            }
                            display={'search'}
                            searchParams={item.searchParams || null}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
