import { useMemo } from 'react';
import useEnvData from '../../../hooks/useEnvData';

export default function useReadSpeakerHref(targetId: string) {
    const envData = useEnvData();
    const { read_speaker_id, read_speaker_region } = envData?.config || {};

    return useMemo(() => {
        if (!read_speaker_region || !read_speaker_id) {
            return null;
        }

        const url = new URL('https://app-eu.readspeaker.com/cgi-bin/rsent');

        url.searchParams.append('customerid', read_speaker_id);
        url.searchParams.append('lang', 'nl_nl');
        url.searchParams.append('voice', 'Alex');
        url.searchParams.append('readid', targetId);

        return url.toString();
    }, [read_speaker_id, read_speaker_region, targetId]);
}
