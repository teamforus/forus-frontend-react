import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import FundRequest, { FundRequestFormula } from '../props/models/FundRequest';
import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import Note from '../props/models/Note';
import File from '../props/models/File';
import FundRequestRecord from '../props/models/FundRequestRecord';
import FundRequestApiPerson from '../props/models/FundRequestApiPerson';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import { ExportFieldProp } from '../components/modals/ModalExportDataSelect';

export type FundRequestTotals = {
    all: number;
    pending: number;
    assigned: number;
    resolved: number;
};

export class FundRequestValidatorService<T = FundRequest> {
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

    public index(
        organizationId: number,
        data: object = {},
    ): Promise<ApiResponse<FundRequest, { totals: FundRequestTotals }>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/fund-requests`, data);
    }

    public exportFields(organization_id: number): Promise<ApiResponseSingle<Array<ExportFieldProp>>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/fund-requests/export-fields`);
    }

    public export(organizationId: number, data: object = {}): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/fund-requests/export`, data, {
            responseType: 'arraybuffer',
        });
    }

    public read(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/fund-requests/${id}`);
    }

    public assignBySupervisor(organizationId: number, id: number, data: object = {}) {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/fund-requests/${id}/assign-employee`, data);
    }

    public resignAllEmployeesAsSupervisor(organizationId: number, id: number) {
        return this.apiRequest.patch<null>(`${this.prefix}/${organizationId}/fund-requests/${id}/resign-employee`);
    }

    public assign(organizationId: number, id: number) {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/fund-requests/${id}/assign`);
    }

    public resign(organizationId: number, id: number) {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/fund-requests/${id}/resign`);
    }

    public approve(organizationId: number, id: number, data: object = {}) {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/fund-requests/${id}/approve`, data);
    }

    public formula(organizationId: number, id: number, data: object = {}): Promise<ResponseSimple<FundRequestFormula>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/fund-requests/${id}/formula`, data);
    }

    public decline(organizationId: number, id: number, data: object = {}) {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/fund-requests/${id}/decline`, data);
    }

    public disregard(organizationId: number, id: number, data: object = {}) {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/fund-requests/${id}/disregard`, data);
    }

    public disregardUndo(organizationId: number, id: number, data: object = {}) {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/fund-requests/${id}/disregard-undo`, data);
    }

    public appendRecord(
        organizationId: number,
        id: number,
        data: object = {},
    ): Promise<ApiResponseSingle<FundRequestRecord>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/fund-requests/${id}/records`, data);
    }

    public updateRecord(organizationId: number, id: number, record_id: number, data: object = {}) {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/fund-requests/${id}/records/${record_id}`, data);
    }

    public requestRecordClarification(organizationId: number, id: number, record_id: number, question: string) {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/fund-requests/${id}/clarifications`, {
            fund_request_record_id: record_id,
            question: question,
        });
    }

    public recordClarifications(organizationId: number, id: number, record_id: number) {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/fund-requests/${id}/clarifications`, {
            fund_request_record_id: record_id,
        });
    }

    public getPersonBsn(
        organizationId: number,
        id: number,
        data: object = {},
    ): Promise<ApiResponseSingle<FundRequestApiPerson>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/fund-requests/${id}/person`, data);
    }

    public notes(organizationId: number, id: number, data: object = {}): Promise<ApiResponse<Note>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/fund-requests/${id}/notes`, data);
    }

    public noteDestroy(organizationId: number, id: number, note_id: number): Promise<ApiResponseSingle<null>> {
        return this.apiRequest.delete(`${this.prefix}/${organizationId}/fund-requests/${id}/notes/${note_id}`);
    }

    public storeNote(organizationId: number, id: number, data: object = {}): Promise<ApiResponseSingle<Note>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/fund-requests/${id}/notes`, data);
    }

    public hasFilePreview(file: File) {
        return ['pdf', 'png', 'jpeg', 'jpg'].includes(file.ext);
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        const list = ['id', 'requester_email', 'fund_name', 'created_at', 'assignee_email', 'state'].filter(
            (item) => item,
        );

        return list.map((key) => ({
            key,
            label: `validation_requests.labels.${key}`,
            tooltip: {
                key: key,
                title: `validation_requests.labels.${key}`,
                description: `validation_requests.tooltips.${key}`,
            },
        }));
    }

    public getRecordsColumns(): Array<ConfigurableTableColumn> {
        const list = ['type', 'value', 'date'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `validation_requests.labels.${key}`,
            tooltip: {
                key: key,
                title: `validation_requests.labels.${key}`,
                description: `validation_requests.tooltips.${key}`,
            },
        }));
    }

    public getRecordChangesColumns(): Array<ConfigurableTableColumn> {
        const list = ['new_value', 'old_value', 'employee', 'date_changed'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `validation_request_details.labels.${key}`,
            tooltip: {
                key: key,
                title: `validation_request_details.labels.${key}`,
                description: `validation_request_details.tooltips.${key}`,
            },
        }));
    }
}
export function useFundRequestValidatorService(): FundRequestValidatorService {
    return useState(new FundRequestValidatorService())[0];
}
