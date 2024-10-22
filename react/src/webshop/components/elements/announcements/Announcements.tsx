import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Announcement from '../../../../dashboard/props/models/Announcement';
import Markdown from '../markdown/Markdown';

export default function Announcements({ announcements }: { announcements: Array<Announcement> }) {
    const [storageKey] = useState('dismissed_announcements');
    const [dismissed, setDismissed] = useState<Array<number>>(null);
    const [listActive, setListActive] = useState<Array<Announcement & { dismissed?: boolean }>>(null);

    const dismiss = useCallback(
        (announcement: Announcement) => {
            const index = listActive.indexOf(announcement);

            listActive[index].dismissed = true;
            setListActive([...listActive]);

            window.setTimeout(() => {
                listActive.splice(index, 1);
                setListActive([...listActive]);

                setDismissed([...dismissed, announcement.id]);
                localStorage.setItem(storageKey, JSON.stringify([...dismissed, announcement.id]));
            }, 400);
        },
        [dismissed, listActive, storageKey],
    );

    useEffect(() => {
        setListActive(announcements.filter((item) => !item.dismissible || !dismissed?.includes(item.id)));
    }, [announcements, dismissed]);

    useEffect(() => {
        try {
            const dismissed = JSON.parse(localStorage.getItem(storageKey));
            setDismissed(Array.isArray(dismissed) ? dismissed : []);
        } catch {
            localStorage.setItem(storageKey, JSON.stringify([]));
            setDismissed([]);
        }
    }, [storageKey]);

    return (
        <Fragment>
            {listActive?.map((announcement) => (
                <div
                    key={announcement.id}
                    className={`block block-announcement ${
                        'announcement-' + announcement.type + (announcement.dismissed ? ' dismissed' : '')
                    }`}>
                    {announcement.title && (
                        <div className="announcement-title">
                            {(announcement.type == 'default' || announcement.type == 'primary') && (
                                <em className="mdi mdi-information" />
                            )}

                            {announcement.type == 'success' && <em className="mdi mdi-check-circle" />}
                            {announcement.type == 'danger' && <em className="mdi mdi-close-circle" />}
                            {announcement.type == 'warning' && <em className="mdi mdi-alert" />}

                            {announcement.title}
                        </div>
                    )}
                    <div className="announcement-description">
                        <Markdown content={announcement.description_html} />
                    </div>
                    <div className="announcement-close mdi mdi-close" onClick={() => dismiss(announcement)} />
                </div>
            ))}
        </Fragment>
    );
}
