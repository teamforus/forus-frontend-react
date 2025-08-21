import ApiResponse, { ResponseSimple } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import EmailLog from '../props/models/EmailLog';

export class EmailLogService<T = EmailLog> {
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
    public list(organizationId: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/email-logs`, data);
    }

    /**
     * Export list
     */
    public export(organizationId: number, id: number): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get(
            `${this.prefix}/${organizationId}/email-logs/${id}/export`,
            {},
            {
                responseType: 'arraybuffer',
            },
        );
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        const list = ['created_at', 'title', 'recipient', 'sender'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `email_logs.labels.${key}`,
            tooltip: {
                key: key,
                title: `email_logs.labels.${key}`,
                description: `email_logs.tooltips.${key}`,
            },
        }));
    }
}

export default function useEmailLogService(): EmailLogService {
    return useState(new EmailLogService())[0];
}
