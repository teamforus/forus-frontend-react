import React, { useCallback, useEffect, useState } from 'react';
import Announcement from '../../../props/models/Announcement';

export const Announcements = ({ announcements }: { announcements: Array<Announcement> }) => {
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
        } catch (_) {
            localStorage.setItem(storageKey, JSON.stringify([]));
            setDismissed([]);
        }
    }, [storageKey]);

    return (
        <div className="block block-announcements">
            {listActive?.map((announcement) => (
                <div
                    key={announcement.id}
                    className={`announcement announcement-${announcement.type} ${
                        announcement.dismissed ? ' dismissed' : ''
                    }`}>
                    <div className="announcement-wrapper">
                        <div className="title">{announcement.title}</div>
                        <div className="description">
                            <div
                                className="block block-markdown"
                                dangerouslySetInnerHTML={{ __html: announcement.description_html }}
                            />
                        </div>
                        {announcement.dismissible && (
                            <em className="announcement-close mdi mdi-close" onClick={() => dismiss(announcement)} />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
