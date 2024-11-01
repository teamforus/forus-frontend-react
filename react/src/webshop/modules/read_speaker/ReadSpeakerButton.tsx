import React, { useMemo } from 'react';
import classNames from 'classnames';
import useEnvData from '../../hooks/useEnvData';

export default function ReadSpeakerButton({ className, targetId }: { className?: string; targetId: string }) {
    const envData = useEnvData();
    const { read_speaker_id, read_speaker_region } = envData?.config || {};

    const href = useMemo(() => {
        const url = new URL('https://app-eu.readspeaker.com/cgi-bin/rsent');

        url.searchParams.append('customerid', read_speaker_id);
        url.searchParams.append('lang', 'nl_nl');
        url.searchParams.append('voice', 'Alex');
        url.searchParams.append('readid', targetId);

        return url.toString();
    }, [read_speaker_id, targetId]);

    if (!read_speaker_region || !read_speaker_id || !href) {
        return null;
    }

    return (
        <div className={classNames('rs_skip', 'rsbtn', 'rs_preserve', className)}>
            <a
                rel="nofollow"
                className="rsbtn_play"
                title="Laat de tekst voorlezen met ReadSpeaker webReader"
                href={href}>
                <span className="rsbtn_left rsimg rspart">
                    <span className="rsbtn_text">
                        <span>Lees voor</span>
                    </span>
                </span>
                <span className="rsbtn_right rsimg rsplay rspart" />
            </a>
        </div>
    );
}
