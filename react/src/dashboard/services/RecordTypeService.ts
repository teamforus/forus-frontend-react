import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import RecordType from '../props/models/RecordType';
import { ResponseSimple } from '../props/ApiResponses';

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
    public list(data: object = {}): Promise<ResponseSimple<Array<T>>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }
}

export function useRecordTypeService(): RecordTypeService {
    return useState(new RecordTypeService())[0];
}
