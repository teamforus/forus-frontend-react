import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import FundProvider from '../props/models/FundProvider';
import Fund from '../props/models/Fund';
import Organization from '../props/models/Organization';
import Tag from '../props/models/Tag';
import Implementation from '../props/models/Implementation';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';

export class ProviderFundService<T = FundProvider> {
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
     * Fetch list
     */
    public listAvailableFunds(
        organizationId: number,
        data: object = {},
    ): Promise<
        ApiResponse<Fund> & {
            data: {
                meta: {
                    totals: {
                        active: number;
                        pending: number;
                        available: number;
                        archived: number;
                        invitations: number;
                        unsubscribed: number;
                        invitations_archived: number;
                    };
                    tags: Array<Tag>;
                    organizations: Array<Organization>;
                    implementations: Array<Implementation>;
                };
            };
        }
    > {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/provider/funds-available`, data);
    }

    public listFundsProviderProductsRequired(organizationId: number, query: object = {}): Promise<ApiResponse<Fund>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/provider/funds-product-required`, {
            per_page: 100,
            ...query,
        });
    }

    /**
     * Fetch list
     */
    public listFunds(organizationId: number, data: object = {}): Promise<ApiResponse<FundProvider>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/provider/funds`, data);
    }

    /**
     * Fetch list
     */
    public readFundProvider(organizationId: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/provider/funds/${id}`, data);
    }

    /**
     * Fetch list
     */
    public applyForFund(organizationId: number, fund_id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/provider/funds`, { fund_id });
    }

    /**
     * Fetch list
     */
    public cancelApplication(organizationId: number, id: number, data: object = {}): Promise<null> {
        return this.apiRequest.delete(`${this.prefix}/${organizationId}/provider/funds/${id}`, data);
    }

    /**
     * Unsubscribe fund
     */
    public unsubscribe(organizationId: number, id: number, data: object = {}): Promise<null> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/provider/funds/${id}/unsubscribe`, data);
    }

    public getColumns(
        type: 'active' | 'pending_rejected' | 'archived' | 'unsubscribed',
    ): Array<ConfigurableTableColumn> {
        const list = [
            'name',
            'organization_name',
            'start_date',
            'end_date',
            type === 'active' ? 'max_amount' : null,
            'allow_budget',
            'allow_products',
            'status',
        ].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `provider_funds.labels.${key}`,
            tooltip: {
                key: key,
                title: `provider_funds.labels.${key}`,
                description: `provider_funds.tooltips.${key}`,
            },
        }));
    }

    public getColumnsAvailable(): Array<ConfigurableTableColumn> {
        const list = ['name', 'organization_name', 'start_date', 'end_date'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `provider_funds.labels.${key}`,
            tooltip: {
                key: key,
                title: `provider_funds.labels.${key}`,
                description: `provider_funds.tooltips.${key}`,
            },
        }));
    }

    public getProductsRequiredColumns(): Array<ConfigurableTableColumn> {
        const list = ['name', 'type', 'implementation'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `components.organization_funds.labels.${key}`,
            tooltip: {
                key: key,
                title: `components.organization_funds.labels.${key}`,
                description: `components.organization_funds.tooltips.${key}`,
            },
        }));
    }
}

export default function useProviderFundService(): ProviderFundService {
    return useState(new ProviderFundService())[0];
}
