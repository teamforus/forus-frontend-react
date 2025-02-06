import React from 'react';
import classNames from 'classnames';
import useReadSpeakerHref from './hooks/useReadSpeakerHref';
import useTranslate from '../../../dashboard/hooks/useTranslate';

export default function ReadSpeakerButton({ className, targetId }: { className?: string; targetId: string }) {
    const translate = useTranslate();
    const href = useReadSpeakerHref(targetId);

    if (!href) {
        return null;
    }

    return (
        <div className={classNames('rs_skip', 'rsbtn', 'rs_preserve', className)}>
            <a rel="nofollow" className="rsbtn_play" title={translate('read_speaker.tooltip')} href={href}>
                <span className="rsbtn_left rsimg rspart">
                    <span className="rsbtn_text">
                        <span>{translate('read_speaker.read_aloud')}</span>
                    </span>
                </span>
                <span className="rsbtn_right rsimg rsplay rspart" />
            </a>
        </div>
    );
}
