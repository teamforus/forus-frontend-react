import { useContext } from 'react';
import { mainContext } from '../contexts/MainContext';

export default function useAppConfigs() {
    return useContext(mainContext).appConfigs;
}
