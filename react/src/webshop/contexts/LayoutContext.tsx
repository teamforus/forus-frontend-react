import React, { ReactNode } from 'react';
import { createContext, useState, useMemo, useCallback } from 'react';

interface LayoutData {
    layoutType?: string;
    filtersVariantCollapse?: boolean;
    headerVariant?: boolean;
}

const layoutStore = createContext<{
    layoutData?: LayoutData;
    setLayoutData: (data: LayoutData | ((a: LayoutData | null) => LayoutData | null)) => void;
    setLayoutType: (layoutType: string) => void;
}>(null);

const { Provider } = layoutStore;

const defaultLayoutData = {
    filtersVariantCollapse: false,
    headerVariant: false,
};

const LayoutProvider = ({ children }: { children: ReactNode }) => {
    const [layoutData, setLayoutData] = useState<LayoutData>({ ...defaultLayoutData });

    const setData = useCallback((data: LayoutData | ((a: LayoutData) => LayoutData)) => {
        setLayoutData((old) => ({ ...old, ...defaultLayoutData, ...data }));
    }, []);

    const setLayoutType = useCallback((layoutType: string) => setData({ layoutType }), [setData]);

    const layoutMemo = useMemo(
        () => ({
            layoutData: layoutData,
            setLayoutData: setData,
            setLayoutType: setLayoutType,
        }),
        [setLayoutType, layoutData, setData],
    );

    return <Provider value={layoutMemo}>{children}</Provider>;
};

export { LayoutProvider, layoutStore };
