import React, { createContext, ReactNode, useState } from 'react';

interface LayoutContextProps {
    navbarHeaderHeight: number;
    setNavbarHeaderHeight: (h: number) => void;
}

export const layoutContext = createContext<LayoutContextProps>({
    navbarHeaderHeight: 0,
    setNavbarHeaderHeight: () => {},
});

interface LayoutProviderProps {
    children: ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
    const [desktopHeaderHeight, setDesktopHeaderHeight] = useState(0);

    return (
        <layoutContext.Provider
            value={{ navbarHeaderHeight: desktopHeaderHeight, setNavbarHeaderHeight: setDesktopHeaderHeight }}>
            {children}
        </layoutContext.Provider>
    );
};
