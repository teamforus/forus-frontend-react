import { useState, useEffect } from 'react';

export function usePinnedMenuGroups(key = 'pinnedMenuGroups') {
    const [pinnedGroups, setPinnedGroups] = useState(() => {
        try {
            const savedValue = localStorage.getItem(key);
            return savedValue ? JSON.parse(savedValue) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(pinnedGroups));
        } catch {
            // Do nothing on storage error
        }
    }, [key, pinnedGroups]);

    return [pinnedGroups, setPinnedGroups];
}
