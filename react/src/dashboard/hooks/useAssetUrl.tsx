import { useCallback } from 'react';
import useEnvData from './useEnvData';
import { assetUrl } from '../helpers/url';

export default function useAssetUrl() {
    const envData = useEnvData();

    return useCallback((uri?: string) => assetUrl(uri, envData), [envData]);
}
