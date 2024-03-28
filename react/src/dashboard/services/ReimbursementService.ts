import { useState } from 'react';
import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import ApiRequestService from './ApiRequestService';
import Reimbursement from '../props/models/Reimbursement';
import { ExportFieldProp } from '../components/modals/ModalExportDataSelect';

export class ReimbursementService<T = Reimbursement> {
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
        return this.apiRequest.get(`${this.prefix}/${organizationId}/reimbursements`, data);
    }

    /**
     * Fetch list
     */
    public show(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/reimbursements/${id}`);
    }

    /**
     * Fetch by id
     */
    public update(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/reimbursements/${id}`, data);
    }

    public assign(organizationId: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/reimbursements/${id}/assign`, data);
    }

    public resign(organizationId: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/reimbursements/${id}/resign`, data);
    }

    public approve(organizationId: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/reimbursements/${id}/approve`, data);
    }

    public decline(organizationId: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/reimbursements/${id}/decline`, data);
    }

    public export(organizationId: number, data: object = {}): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/reimbursements/export`, data, {
            responseType: 'arraybuffer',
        });
    }

    // get export fields
    public exportFields(organizationId: number): Promise<ApiResponseSingle<Array<ExportFieldProp>>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/reimbursements/export-fields`);
    }

    public getStateOptions(): Array<{ value: string; name: string }> {
        return [
            { value: null, name: 'Alle' },
            { value: 'pending', name: 'In afwachting' },
            { value: 'approved', name: 'Geaccepteerd' },
            { value: 'declined', name: 'Geweigerd' },
        ];
    }

    public getExpiredOptions(): Array<{ value: number; name: string }> {
        return [
            { value: null, name: 'Alle' },
            { value: 1, name: 'Verlopen' },
            { value: 0, name: 'Niet verlopen' },
        ];
    }

    public getDeactivatedOptions(): Array<{ value: number; name: string }> {
        return [
            { value: null, name: 'Alle' },
            { value: 1, name: 'Voucher deactivated' },
            { value: 0, name: 'Voucher not deactivated' },
        ];
    }

    public getArchivedOptions(): Array<{ value: number; name: string }> {
        return [
            { value: 0, name: 'Actief' },
            { value: 1, name: 'Archief' },
        ];
    }

    public notes(organizationId: number, id: number, data: object): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/reimbursements/${id}/notes`, data);
    }

    public noteDestroy(organizationId: number, id: number, note_id: number): Promise<ApiResponseSingle<null>> {
        return this.apiRequest.delete(`${this.prefix}/${organizationId}/reimbursements/${id}/notes/${note_id}`);
    }

    public storeNote(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/reimbursements/${id}/notes`, data);
    }
}

export function useReimbursementsService(): ReimbursementService {
    return useState(new ReimbursementService())[0];
}
