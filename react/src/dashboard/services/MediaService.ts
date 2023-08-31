import { useState } from 'react';
import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import ApiRequestService from './ApiRequestService';
import Media from '../props/models/Media';

export class MediaService<T = Media> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/medias';

    /**
     * Fetch list
     */
    public list(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }

    public store(
        type: string,
        file: File | Blob,
        sync_presets?: Array<string> | string,
    ): Promise<ApiResponseSingle<T>> {
        const formData = new FormData();

        formData.append('file', file, file['name']);
        formData.append('type', type);

        if (Array.isArray(sync_presets) || typeof sync_presets === 'string') {
            (typeof sync_presets === 'string' ? [sync_presets] : sync_presets).forEach((preset) => {
                formData.append('sync_presets[]', preset);
            });
        }

        return this.apiRequest.post(
            this.prefix,
            formData /*, {
            'Content-Type': undefined
        }*/,
        );
    }

    public read(id: string): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${id}`);
    }

    public clone(uid: string, sync_presets = null): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${uid}/clone`, {
            sync_presets: !sync_presets || Array.isArray(sync_presets) ? sync_presets : [sync_presets],
        });
    }

    public delete(uid: string): Promise<null> {
        return this.apiRequest._delete(`${this.prefix}/${uid}`);
    }
}

export function useMediaService(): MediaService {
    const [service] = useState(new MediaService());

    return service;
}
