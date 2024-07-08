import { useContext } from 'react';
import { mainContext } from '../contexts/MainContext';

export default function useActiveMenuDropdown() {
    return useContext(mainContext).activeMenuDropdown;
}
