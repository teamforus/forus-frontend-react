import React, { ReactNode, useState } from 'react';
import { createContext } from 'react';

interface LoadingBarMemo {
    progress: number;
    setProgress: (value: number) => void;
}

const loadingBarContext = createContext<LoadingBarMemo>(null);
const { Provider } = loadingBarContext;

const LoadingBarProvider = ({ children }: { children: ReactNode | ReactNode[] }) => {
    const [progress, setProgress] = useState(100);

    return <Provider value={{ progress, setProgress }}>{children}</Provider>;
};

export { LoadingBarProvider, loadingBarContext };
