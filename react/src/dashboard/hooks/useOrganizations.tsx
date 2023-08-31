import { useContext } from 'react';
import { mainContext } from '../contexts/MainContext';

export default function useOrganization() {
    return useContext(mainContext).organizations;
}
