import { useCallback } from 'react';

export default function useFileTypeValidation() {
    return useCallback((file: File, acceptedFiles: Array<string>) => {
        if (!acceptedFiles?.length) {
            return true;
        }

        const accepted = acceptedFiles.map((item) => item.toLowerCase());

        const fileName = file.name.toLowerCase();
        const fileType = (file.type || '').toLowerCase();
        const lastDotIndex = fileName.lastIndexOf('.');
        const extension = lastDotIndex === -1 ? '' : fileName.slice(lastDotIndex);

        return accepted.some((item) => {
            if (item.startsWith('.')) {
                return extension === item;
            }

            if (item.endsWith('/*')) {
                const prefix = item.slice(0, -1);
                return fileType.startsWith(prefix);
            }

            return fileType === item;
        });
    }, []);
}
