import { useContext } from 'react';
import { modalsContext } from '../modules/modals/context/ModalContext';

export default function useOpenModal() {
    return useContext(modalsContext).openModal;
}
