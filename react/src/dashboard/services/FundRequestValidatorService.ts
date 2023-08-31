import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import FundRequest from '../props/models/FundRequest';
import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import Note from '../props/models/Note';
import File from '../props/models/File';
import FundRequestRecord from '../props/models/FundRequestRecord';
import FundRequestApiPerson from '../props/models/FundRequestApiPerson';

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

    index(organizationId: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/fund-requests`, data);
    }

    export(organizationId: number, data = {}): Promise<ResponseSimple<null>> {
        return this.apiRequest.get(
            `${this.prefix}/${organizationId}/fund-requests/export`,
            data,
            {},
            { responseType: 'arraybuffer' },
        );
    }

    read(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/fund-requests/${id}`);
    }

    assignBySupervisor(organizationId: number, id: number, data: object = {}) {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/fund-requests/${id}/assign-employee`, data);
    }

    resignAllEmployeesAsSupervisor(organizationId: number, id: number) {
        return this.apiRequest.patch<null>(`${this.prefix}/${organizationId}/fund-requests/${id}/resign-employee`);
    }

    assign(organizationId: number, id: number) {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/fund-requests/${id}/assign`);
    }

    resign(organizationId: number, id: number) {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/fund-requests/${id}/resign`);
    }

    approve(organizationId: number, id: number, data: object = {}) {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/fund-requests/${id}/approve`, data);
    }

    decline(organizationId: number, id: number, data: object = {}) {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/fund-requests/${id}/decline`, data);
    }

    disregard(organizationId: number, id: number, data: object = {}) {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/fund-requests/${id}/disregard`, data);
    }

    disregardUndo(organizationId: number, id: number, data: object = {}) {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/fund-requests/${id}/disregard-undo`, data);
    }

    appendRecord(organizationId: number, id: number, data: object = {}): Promise<ApiResponseSingle<FundRequestRecord>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/fund-requests/${id}/records`, data);
    }

    approveRecord(organizationId: number, id: number, record_id: number) {
        return this.apiRequest.patch(
            `${this.prefix}/${organizationId}/fund-requests/${id}/records/${record_id}/approve`,
        );
    }

    declineRecord(organizationId: number, id: number, record_id: number, note: string = null) {
        return this.apiRequest.patch(
            `${this.prefix}/${organizationId}/fund-requests/${id}/records/${record_id}/decline`,
            { note },
        );
    }

    updateRecord(organizationId: number, id: number, record_id: number, data: object = {}) {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/fund-requests/${id}/records/${record_id}`, data);
    }

    requestRecordClarification(organizationId: number, id: number, record_id: number, question: string) {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/fund-requests/${id}/clarifications`, {
            fund_request_record_id: record_id,
            question: question,
        });
    }

    recordClarifications(organizationId: number, id: number, record_id: number) {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/fund-requests/${id}/clarifications`, {
            fund_request_record_id: record_id,
        });
    }

    getPersonBsn(
        organizationId: number,
        id: number,
        data: object = {},
    ): Promise<ApiResponseSingle<FundRequestApiPerson>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/fund-requests/${id}/person`, data);
    }

    notes(organizationId: number, id: number, data: object = {}): Promise<ApiResponse<Note>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/fund-requests/${id}/notes`, data);
    }

    noteDestroy(organizationId: number, id: number, note_id: number): Promise<ApiResponseSingle<null>> {
        return this.apiRequest._delete(`${this.prefix}/${organizationId}/fund-requests/${id}/notes/${note_id}`);
    }

    storeNote(organizationId: number, id: number, data: object = {}): Promise<ApiResponseSingle<Note>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/fund-requests/${id}/notes`, data);
    }

    hasFilePreview(file: File) {
        return ['pdf', 'png', 'jpeg', 'jpg'].includes(file.ext);
    }
}
export function useFundRequestValidatorService(): FundRequestValidatorService {
    const [service] = useState(new FundRequestValidatorService());

    return service;
}
