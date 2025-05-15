import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import Prevalidation from '../props/models/Prevalidation';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import { ExportFieldProp } from '../components/modals/ModalExportDataSelect';

export class PrevalidationService<T = Prevalidation> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/prevalidations';

    public list(filters: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, filters);
    }

    public submit(data: object = {}, fund_id: number = null): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}`, {
            data: data,
            fund_id: fund_id,
        });
    }

    public submitCollection(
        data: Array<{ [key: string]: string }>,
        fund_id: number = null,
        overwrite: Array<string> = [],
        file?: object,
    ): Promise<T> {
        return this.apiRequest.post(`${this.prefix}/collection`, {
            data: data,
            fund_id: fund_id,
            overwrite: overwrite,
            file,
        });
    }

    public submitCollectionCheck(
        data: Array<string>,
        fund_id: number = null,
        overwrite: Array<string> = [],
    ): Promise<{
        data: {
            collection: Array<{ uid_hash: string; records_hash: string; data: { [key: string]: string } }>;
            db: Array<{ uid_hash: string; records_hash: string }>;
        };
    }> {
        return this.apiRequest.post(`${this.prefix}/collection/hash`, {
            data: data,
            fund_id: fund_id,
            overwrite: overwrite,
        });
    }

    public destroy(code: string): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.delete(`${this.prefix}/${code}`);
    }

    public exportFields(): Promise<ApiResponseSingle<Array<ExportFieldProp>>> {
        return this.apiRequest.get(`${this.prefix}/export-fields`);
    }

    public export(filters: object = {}): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get(`${this.prefix}/export`, filters, {
            responseType: 'arraybuffer',
        });
    }

    public getColumns(headers: Array<string>, typesByKey: object): Array<ConfigurableTableColumn> {
        const list = ['code', 'employee', ...headers, 'active', 'exported'];

        return list.map((key) => ({
            key,
            label: typesByKey[key] || `prevalidated_table.labels.${key}`,
            tooltip: {
                key: key,
                title: typesByKey[key] || `prevalidated_table.labels.${key}`,
                description: typesByKey[key] || `prevalidated_table.tooltips.${key}`,
            },
        }));
    }
}

export function usePrevalidationService(): PrevalidationService {
    return useState(new PrevalidationService())[0];
}
