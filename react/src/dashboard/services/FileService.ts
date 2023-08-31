import { useState } from 'react';
import Employee from '../props/models/Employee';
import ApiRequestService from './ApiRequestService';
import { saveAs } from 'file-saver';
import File from '../props/models/File';
import { ResponseSimple } from '../props/ApiResponses';

export class FileService<T = Employee> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/files';

    /**
     * Fetch list
     */
    downloadFile = (name: string, data: Blob | ArrayBuffer, contentType = 'text/csv;charset=utf-8;') => {
        const blob = data instanceof Blob ? data : new Blob([data], { type: contentType });

        saveAs(blob, name);
    };

    base64ToBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);

            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            byteArrays.push(new Uint8Array(byteNumbers));
        }

        return new Blob(byteArrays, { type: contentType });
    };

    download(file: File): Promise<ResponseSimple<null>> {
        return this.apiRequest.get(`${this.prefix}/${file.uid}/download`, {}, {}, { responseType: 'arraybuffer' });
    }

    downloadUrl(file: File) {
        return this.apiRequest.endpointToUrl(`${this.prefix}/${file.uid}/download`);
    }

    store(file) {
        const formData = new FormData();

        formData.append('file', file);

        return this.apiRequest.post(this.prefix, formData, {
            'Content-Type': undefined,
        });
    }

    storeValidate(file) {
        const formData = new FormData();

        formData.append('file', file);

        return this.apiRequest.post(`${this.prefix}/validate`, formData, {
            'Content-Type': undefined,
        });
    }

    storeAll(files) {
        return Promise.all(files.map(this.store));
    }

    storeValidateAll(files) {
        return Promise.all(files.map(this.storeValidate));
    }
}
export function useFileService(): FileService {
    const [service] = useState(new FileService());

    return service;
}
