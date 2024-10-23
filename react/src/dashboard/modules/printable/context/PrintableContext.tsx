import React, { useState, useCallback, useEffect } from 'react';
import { createContext } from 'react';
import { uniqueId } from 'lodash';

export interface PrintableConfig {
    onClosed?: (printable?: PrintableState) => void;
    disableAutoLoader?: boolean;
}

export interface Printable extends PrintableConfig {
    builder?: (printable: PrintableState) => React.ReactElement;
}

export interface PrintableState extends Printable {
    id?: string;
    close?: () => void;
}

export type PrintableOpener = (
    builder: (printable: PrintableState) => React.ReactElement,
    config?: PrintableConfig,
) => PrintableState;

interface PrintableMemo {
    printableItems: Array<PrintableState>;
    openPrintable: PrintableOpener;
    closePrintable: (printable: PrintableState) => void;
}

const printableContext = createContext<PrintableMemo>(null);
const { Provider } = printableContext;

const PrintableProvider = ({ children }: { children: React.ReactElement }) => {
    const [printableItems, setPrintableItems] = useState<Array<PrintableState>>([]);

    const closePrintable = useCallback((printable: PrintableState) => {
        setTimeout(() => {
            setPrintableItems((printableItems) => [...printableItems.filter((item) => item !== printable)]);
            printable?.onClosed?.(printable);
        }, 200);
    }, []);

    const openPrintable = useCallback(
        (builder, config: PrintableConfig = {}) => {
            const id = uniqueId();
            const printableState: PrintableState = { ...config, id };

            printableState.builder = builder;
            printableState.close = () => closePrintable(printableState);

            setPrintableItems((printableItems) => [...printableItems, printableState]);

            return printableState;
        },
        [closePrintable],
    );

    useEffect(() => {
        if (printableItems && printableItems.length > 0) {
            if (!document.body.classList.contains('printable-only')) {
                document.body.classList.add('printable-only');
            }
        } else {
            document.body.classList.remove('printable-only');
        }
    }, [printableItems]);

    return (
        <Provider
            value={{
                printableItems,
                closePrintable,
                openPrintable,
            }}>
            {children}
        </Provider>
    );
};

export { PrintableProvider, printableContext };
