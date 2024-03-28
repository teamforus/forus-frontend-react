import React, { createContext } from 'react';

const CsvUploadContext = createContext(null);

const CsvUploadProvider = ({ children }: { children: React.ReactElement }) => {
    const state = false;

    return <CsvUploadContext.Provider value={{ state }}>{children}</CsvUploadContext.Provider>;
};

export { CsvUploadProvider, CsvUploadContext };
