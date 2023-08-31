import React, { useState, useCallback } from 'react';
import { createContext } from 'react';
import { uniqueId } from 'lodash';

export interface ModalConfig {
    onClosed?: (modal?: ModalState) => void;
    disableAutoLoader?: boolean;
}

export interface Modal extends ModalConfig {
    builder?: (modal: ModalState) => React.ReactElement;
}

export interface ModalState extends Modal {
    id?: string;
    hidden?: boolean;
    loading?: boolean;
    loadingTimer?: number;
    close?: () => void;
    setLoading?: (loaded: boolean) => void;
    setHidden?: (hidden: boolean) => void;
}

export type ModalOpener = (builder: (modal: ModalState) => React.ReactElement, config?: ModalConfig) => ModalState;

interface ModalsMemo {
    modals: Array<ModalState>;
    openModal: ModalOpener;
    closeModal: (modal: ModalState) => void;
}

const modalsContext = createContext<ModalsMemo>(null);
const { Provider } = modalsContext;

const ModalsProvider = ({ children }: { children: React.ReactElement }) => {
    const [modals, setModals] = useState<Array<ModalState>>([]);

    const setLoading = useCallback((id: string, loading: boolean) => {
        setModals((modals) => {
            return [...modals.map((item) => Object.assign(item, item.id == id ? { loading } : {}))];
        });
    }, []);

    const setHidden = useCallback((id: string, hidden: boolean) => {
        setModals((modals) => {
            return [...modals.map((item) => Object.assign(item, item.id == id ? { hidden } : {}))];
        });
    }, []);

    const closeModal = useCallback(
        (modal: ModalState) => {
            setLoading(modal.id, true);

            setTimeout(() => {
                setModals((modals) => [...modals.filter((item) => item !== modal)]);
                modal?.onClosed && modal?.onClosed(modal);
            }, 200);
        },
        [setLoading],
    );

    const openModal = useCallback(
        (builder, config: ModalConfig = {}) => {
            const id = uniqueId();
            const loadingTimer = config.disableAutoLoader ? null : window.setTimeout(() => setLoading(id, false), 200);
            const modalState: ModalState = { ...config, id, loadingTimer };

            modalState.loading = true;
            modalState.builder = builder;
            modalState.close = () => closeModal(modalState);
            modalState.setHidden = (loaded: boolean) => setHidden(modalState.id, loaded);
            modalState.setLoading = (loading: boolean) => setLoading(modalState.id, loading);

            setModals((modals) => [...modals, modalState]);

            return modalState;
        },
        [closeModal, setLoading, setHidden],
    );

    return (
        <Provider
            value={{
                modals,
                closeModal,
                openModal,
            }}>
            {children}
        </Provider>
    );
};

export { ModalsProvider, modalsContext };
