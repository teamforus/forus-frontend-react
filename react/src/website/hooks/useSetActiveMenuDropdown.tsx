import { useCallback, useContext } from 'react';
import { mainContext } from '../contexts/MainContext';

export default function useSetActiveMenuDropdown() {
    const { setActiveMenuDropdown } = useContext(mainContext);

    return useCallback(
        (activeMenuDropdown: string) => {
            setTimeout(() => setActiveMenuDropdown(activeMenuDropdown), 0);
        },
        [setActiveMenuDropdown],
    );
}
