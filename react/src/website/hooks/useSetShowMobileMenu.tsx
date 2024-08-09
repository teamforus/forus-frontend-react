import { useCallback, useContext } from 'react';
import { mainContext } from '../contexts/MainContext';

export default function useSetShowMobileMenu() {
    const { setShowMobileMenu } = useContext(mainContext);

    return useCallback(
        (showMobileMenu: boolean) => {
            setTimeout(() => setShowMobileMenu(showMobileMenu), 0);
        },
        [setShowMobileMenu],
    );
}
