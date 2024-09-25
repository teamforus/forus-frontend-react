import { useContext } from 'react';
import { mainContext } from '../contexts/MainContext';

export default function useUserAuthDropdown() {
    return useContext(mainContext).showUserAuthDropdown;
}
