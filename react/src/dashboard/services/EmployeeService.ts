import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import { useState } from 'react';
import Employee from '../props/models/Employee';
import ApiRequestService from './ApiRequestService';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import { ExportFieldProp } from '../components/modals/ModalExportDataSelect';

export class EmployeeService<T = Employee> {
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
        return this.apiRequest.get(`${this.prefix}/${organizationId}/employees`, data);
    }

    /**
     * Store notification by id
     */
    public store(organizationId: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/employees`, data);
    }

    /**
     * Fetch by id
     */
    public read(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/employees/${id}`);
    }

    /**
     * Update by id
     */
    public update(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/employees/${id}`, data);
    }

    /**
     * Delete by id
     */
    public delete(organizationId: number, id: number): Promise<null> {
        return this.apiRequest.delete(`${this.prefix}/${organizationId}/employees/${id}`);
    }

    public exportFields(organization_id: number): Promise<ApiResponseSingle<Array<ExportFieldProp>>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/employees/export-fields`);
    }

    public export(organizationId: number, data: object = {}): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/employees/export`, data, {
            responseType: 'arraybuffer',
        });
    }

    public getColumns(isProviderPanel: boolean): Array<ConfigurableTableColumn> {
        const list = [
            'email',
            isProviderPanel ? 'branch_name_id' : null,
            isProviderPanel ? 'branch_number' : null,
            'auth_2fa',
        ].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `organization_employees.labels.${key}`,
            tooltip: {
                key: key,
                title: `organization_employees.labels.${key}`,
                description: `organization_employees.tooltips.${key}`,
            },
        }));
    }
}

export function useEmployeeService(): EmployeeService {
    return useState(new EmployeeService())[0];
}
