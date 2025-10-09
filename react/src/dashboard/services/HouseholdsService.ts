import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import Household from '../props/models/Sponsor/Household';
import { ExportFieldProp } from '../components/modals/ModalExportDataSelect';

export class HouseholdsService<T = Household> {
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

    public store(organizationId: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/households`, data);
    }

    public list(organizationId: number, query: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/sponsor/households`, query);
    }

    public read(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/sponsor/households/${id}`);
    }

    public update(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/sponsor/households/${id}`, data);
    }

    public delete(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.delete(`${this.prefix}/${organizationId}/sponsor/households/${id}`);
    }

    public export(organizationId: number, filters = {}): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/sponsor/households/export`, filters, {
            responseType: 'arraybuffer',
        });
    }

    public exportFields(organizationId: number): Promise<ApiResponseSingle<Array<ExportFieldProp>>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/sponsor/households/export-fields`);
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        const list = [
            'id',
            'member_count',
            'children_count',
            'parent_count',
            'city',
            'postal_code',
            'house_number',
            'neighborhood',
            'municipality',
        ].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `households.labels.${key}`,
            tooltip: {
                key: key,
                title: `households.labels.${key}`,
                description: `households.tooltips.${key}`,
            },
        }));
    }
}

export default function useHouseholdsService(): HouseholdsService {
    return useState(new HouseholdsService())[0];
}
