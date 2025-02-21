import { useState } from 'react';
import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import ApiRequestService from './ApiRequestService';
import BankConnection from '../props/models/BankConnection';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';

export class BankConnectionService<T = BankConnection> {
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
    public list(organization_id: number, query: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/bank-connections`, query);
    }

    public store(organization_id: number, query: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/bank-connections`, query);
    }

    public show(organization_id: number, connection_id: number, query: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/bank-connections/${connection_id}`, query);
    }

    public update(organization_id: number, connection_id: number, query: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organization_id}/bank-connections/${connection_id}`, query);
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        return [
            {
                key: 'created_at',
                label: 'bank_connections.labels.created_at',
                tooltip: {
                    key: 'created_at',
                    title: 'Datum van toestemming',
                    description: 'bank_connections.tooltips.created_at',
                },
            },
            {
                key: 'bank',
                label: 'bank_connections.labels.bank',
                tooltip: { key: 'bank', title: 'Bank', description: 'bank_connections.tooltips.bank' },
            },
            {
                key: 'expire_at',
                label: 'bank_connections.labels.expire_at',
                tooltip: {
                    key: 'expire_at',
                    title: 'Verloopdatum',
                    description: 'bank_connections.tooltips.expire_at',
                },
            },
            {
                key: 'iban',
                label: 'bank_connections.labels.iban',
                tooltip: {
                    key: 'iban',
                    title: 'Rekening',
                    description: 'bank_connections.tooltips.iban',
                },
            },
            {
                key: 'status',
                label: 'bank_connections.labels.status',
                tooltip: {
                    key: 'status',
                    title: 'Status',
                    description: 'bank_connections.tooltips.status',
                },
            },
        ];
    }
}

export function useBankConnectionService(): BankConnectionService {
    return useState(new BankConnectionService())[0];
}
