import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Product from '../props/models/Product';
import ProductFund from '../props/models/ProductFund';
import SponsorProduct from '../props/models/Sponsor/SponsorProduct';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';

export class ProductService<T = Product> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/organizations';

    /**
     * Url prefix
     *
     * @param data
     */
    public prefixPublic = '/platform';

    /**
     * Fetch list
     */
    public list(
        organizationId: number,
        data: object = {},
    ): Promise<ApiResponse<T, { total_archived: number; total_provider: number; total_sponsor: number }>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/products`, data);
    }

    /**
     * Fetch list
     */
    public listAll(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefixPublic}/products`, data);
    }

    /**
     * Fetch list sponsor products
     */
    public sponsorProducts(sponsor_organization_id: number, data = {}): Promise<ApiResponse<SponsorProduct>> {
        return this.apiRequest.get(`${this.prefix}/${sponsor_organization_id}/sponsor/products`, data);
    }

    /**
     * Fetch list sponsor products
     */
    public sponsorProduct(
        sponsor_organization_id: number,
        id: number,
        data = {},
    ): Promise<ApiResponseSingle<SponsorProduct>> {
        return this.apiRequest.get(`${this.prefix}/${sponsor_organization_id}/sponsor/products/${id}`, data);
    }

    /**
     * Fetch the list of product funds
     */
    public listProductFunds(organization_id: number, id: number, data: object = {}): Promise<ApiResponse<ProductFund>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/products/${id}/funds`, data);
    }

    /**
     * Store product
     */
    public store(organizationId: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/products`, data);
    }

    /**
     * Update product
     */
    public update(organizationId: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/products/${id}`, data);
    }

    /**
     * Update product fund exclusions
     */
    public updateExclusions(organizationId: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/products/${id}/exclusions`, data);
    }

    /**
     * Read product
     */
    public read(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/products/${id}`);
    }

    /**
     * Read product
     */
    public readPublic(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefixPublic}/products/${id}`);
    }

    /**
     * Read product
     */
    public destroy(organizationId: number, id: number): Promise<ApiResponse<null>> {
        return this.apiRequest.delete(`${this.prefix}/${organizationId}/products/${id}`);
    }

    public apiResourceToForm(apiResource: Product | SponsorProduct) {
        return {
            name: apiResource.name,
            description: apiResource.description,
            description_html: apiResource.description_html,
            alternative_text: apiResource.alternative_text,

            price: parseFloat(apiResource.price),
            price_type: apiResource.price_type,
            price_discount: apiResource.price_discount !== null ? parseFloat(apiResource.price_discount) : null,

            ean: apiResource.ean,
            sku: apiResource.sku,

            expire_at: apiResource.expire_at,
            total_amount: apiResource.total_amount,
            stock_amount: apiResource.stock_amount,
            unlimited_stock: apiResource.unlimited_stock,
            sold_amount: apiResource.total_amount - apiResource.stock_amount,
            product_category_id: apiResource.product_category_id,

            reservation_enabled: apiResource.reservation_enabled,
            reservation_policy: apiResource.reservation_policy,

            reservation_fields: apiResource.reservation_fields,
            reservation_phone: apiResource.reservation_phone,
            reservation_address: apiResource.reservation_address,
            reservation_birth_date: apiResource.reservation_birth_date,
            reservation_extra_payments: apiResource.reservation_extra_payments,
        };
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        const list = ['id', 'name', 'stock_amount', 'price', 'expire_at', 'expired_at'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `products.labels.${key}`,
            tooltip: {
                key: key,
                title: `products.labels.${key}`,
                description: `products.tooltips.${key}`,
            },
        }));
    }

    public getColumnsSponsor(tab: 'products' | 'history' = 'products'): Array<ConfigurableTableColumn> {
        const productsList = ['name', 'last_updated', 'nr_funds', 'price', 'stock_amount', 'category', 'created_at'];
        const historyList = ['name', 'last_updated', 'nr_changes', 'fund'];

        const list = (tab === 'products' ? productsList : historyList).filter((item) => item);

        return list.map((key) => ({
            key,
            label: `sponsor_products.labels.${key}`,
            tooltip: {
                key: key,
                title: `sponsor_products.labels.${key}`,
                description: `sponsor_products.tooltips.${key}`,
            },
        }));
    }

    public getFundsColumns(product: Product): Array<ConfigurableTableColumn> {
        const list = ['fund', 'approved', !product?.sponsor_organization ? 'fund_exclusion' : null, 'chat'].filter(
            (item) => item,
        );

        return list.map((key) => ({
            key,
            label: `product_funds.labels.${key}`,
            tooltip: {
                key: key,
                title: `product_funds.labels.${key}`,
                description: `product_funds.tooltips.${key}`,
            },
        }));
    }
}

export default function useProductService(): ProductService {
    return useState(new ProductService())[0];
}
