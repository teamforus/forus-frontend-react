import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import FundForm from '../props/models/FundForm';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';

export class FundFormService<T = FundForm> {
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
    public list(
        organization_id: number,
        query: object = {},
    ): Promise<ApiResponse<T, { unarchived_funds_total: number; archived_funds_total: number }>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/fund-forms`, query);
    }

    public read(organization_id: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/fund-forms/${id}`);
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        const list = ['name', 'created_at', 'fund', 'implementation', 'steps', 'status'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `components.organization_funds_forms.columns.${key}`,
            tooltip: {
                key: key,
                title: `components.organization_funds_forms.columns.${key}`,
                description: `components.organization_funds_forms.tooltips.${key}`,
            },
        }));
    }
}

export function useFundFormService(): FundFormService {
    return useState(new FundFormService())[0];
}
