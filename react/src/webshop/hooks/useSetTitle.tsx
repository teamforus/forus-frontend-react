import { useCallback, useContext } from 'react';
import { titleContext } from '../contexts/TitleContext';

export default function useSetTitle() {
    const { setTitle } = useContext(titleContext);

    return useCallback(
        (title: string) => {
            setTimeout(() => setTitle(title), 0);
        },
        [setTitle],
    );
}
