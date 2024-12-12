import { PaginationData } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import RecordType from '../props/models/RecordType';

export class RecordTypeService<T = RecordType> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/identity/record-types';

    /**
     * Fetch list
     */
    public list<M = T>(filters: object = {}): Promise<PaginationData<M>> {
        return this.apiRequest.get(`${this.prefix}`, filters);
    }
}

export function useRecordTypeService(): RecordTypeService {
    return useState(new RecordTypeService())[0];
}
