import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import PrevalidationRequest from '../props/models/PrevalidationRequest';

export class PrevalidationRequestService<T = PrevalidationRequest> {
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

    public list(organization_id: number, filters: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/prevalidation-requests`, filters);
    }

    public storeBatch(
        organization_id: number,
        data: Array<{ [key: string]: string }>,
        fund_id: number = null,
        file?: object,
    ): Promise<T> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/prevalidation-requests/collection`, {
            data: data,
            fund_id: fund_id,
            file,
        });
    }

    public storeBatchValidate(
        organization_id: number,
        data: Array<{ [key: string]: string }>,
        fund_id: number = null,
    ): Promise<ApiResponseSingle<null>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/prevalidation-requests/collection/validate`, {
            data: data,
            fund_id: fund_id,
        });
    }

    public resubmitFailed(organization_id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/prevalidation-requests/resubmit-failed`);
    }

    public resubmit(organization_id: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/prevalidation-requests/${id}/resubmit`);
    }

    public destroy(organization_id: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.delete(`${this.prefix}/${organization_id}/prevalidation-requests/${id}`);
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        const list = ['bsn', 'fund', 'employee', 'state', 'failed_reason'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `prevalidation_requests.labels.${key}`,
            tooltip: {
                key: key,
                title: `prevalidation_requests.labels.${key}`,
                description: `prevalidation_requests.tooltips.${key}`,
            },
        }));
    }
}

export function usePrevalidationRequestService(): PrevalidationRequestService {
    return useState(new PrevalidationRequestService())[0];
}
