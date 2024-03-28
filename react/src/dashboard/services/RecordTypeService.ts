import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import RecordType from '../props/models/RecordType';

export class RecordTypeService<T = RecordType> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Fetch list
     */
    public list(data: object = {}): Promise<{ data: Array<RecordType> }> {
        return this.apiRequest.get(`/identity/record-types`, data);
    }
}

export function useRecordTypeService(): RecordTypeService {
    return useState(new RecordTypeService())[0];
}
