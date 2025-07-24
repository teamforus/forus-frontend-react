import { useState } from 'react';
import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import ApiRequestService from './ApiRequestService';
import ReimbursementCategory from '../props/models/ReimbursementCategory';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';

export class ReimbursementCategoryService<T = ReimbursementCategory> {
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

    public list(organizationId: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/reimbursement-categories`, data);
    }

    public show(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/reimbursement-categories/${id}`);
    }

    public update(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/reimbursement-categories/${id}`, data);
    }

    public store(organizationId: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/reimbursement-categories`, data);
    }

    public destroy(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.delete(`${this.prefix}/${organizationId}/reimbursement-categories/${id}`);
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        const list = ['name', 'organization', 'reimbursements_count'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `reimbursement_categories.labels.${key}`,
            tooltip: {
                key: key,
                title: `reimbursement_categories.labels.${key}`,
                description: `reimbursement_categories.tooltips.${key}`,
            },
        }));
    }
}

export function useReimbursementCategoryService(): ReimbursementCategoryService {
    return useState(new ReimbursementCategoryService())[0];
}
