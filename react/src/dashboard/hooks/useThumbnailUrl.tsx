import { useCallback } from 'react';
import useEnvData from './useEnvData';
import { thumbnailUrl } from '../helpers/url';

export default function useThumbnailUrl() {
    const envData = useEnvData();

    return useCallback((type: string) => thumbnailUrl(type, envData), [envData]);
}
