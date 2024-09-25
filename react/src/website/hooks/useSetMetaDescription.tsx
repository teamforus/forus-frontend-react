import { useCallback, useContext } from 'react';
import { mainContext } from '../contexts/MainContext';

export default function useSetMetaDescription() {
    const { setMetaDescription } = useContext(mainContext);

    return useCallback(
        (metaDescription: string) => {
            setTimeout(() => setMetaDescription(metaDescription), 0);
        },
        [setMetaDescription],
    );
}
