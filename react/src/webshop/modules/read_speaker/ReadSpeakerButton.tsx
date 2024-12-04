import React from 'react';
import classNames from 'classnames';
import useReadSpeakerHref from './hooks/useReadSpeakerHref';

export default function ReadSpeakerButton({ className, targetId }: { className?: string; targetId: string }) {
    const href = useReadSpeakerHref(targetId);

    if (!href) {
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
