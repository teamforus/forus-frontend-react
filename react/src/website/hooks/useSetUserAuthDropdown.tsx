import { useCallback, useContext } from 'react';
import { mainContext } from '../contexts/MainContext';

export default function useSetUserAuthDropdown() {
    const { setShowUserAuthDropdown } = useContext(mainContext);

    return useCallback(
        (showUserAuthDropdown: boolean) => {
            setTimeout(() => setShowUserAuthDropdown(showUserAuthDropdown), 0);
        },
        [setShowUserAuthDropdown],
    );
}
