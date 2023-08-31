import { useContext } from 'react';
import { mainContext } from '../contexts/MainContext';

export default function useActiveOrganization() {
    return useContext(mainContext).activeOrganization;
}
