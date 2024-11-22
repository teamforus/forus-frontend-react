import { useEffect } from 'react';
import EnvDataWebshopProp from '../../../props/EnvDataWebshopProp';

export default function ReadSpeakerScript({ envData }: { envData: EnvDataWebshopProp }) {
    const { read_speaker_id, read_speaker_region } = envData?.config || {};

    useEffect(() => {
        if (!read_speaker_id || !read_speaker_region) {
            return;
        }

        window['rsConf'] = {
            params: `//cdn-${read_speaker_region}.readspeaker.com/script/${read_speaker_id}/webReader/webReader.js?pids=wr`,
            general: { usePost: true, cookieLifetime: null },
        };

        const script = document.createElement('script');

        script.type = 'text/javascript';
        script.src = `//cdn-${read_speaker_region}.readspeaker.com/script/${read_speaker_id}/webReader/webReader.js`;
        script.id = 'rs_req_Init';

        document.head.appendChild(script);
    }, [read_speaker_id, read_speaker_region]);

    return null;
}
