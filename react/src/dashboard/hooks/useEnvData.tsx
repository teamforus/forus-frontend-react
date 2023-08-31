import { useContext } from 'react';
import { mainContext } from '../contexts/MainContext';

export default function useEnvData() {
    return useContext(mainContext).envData;
}
