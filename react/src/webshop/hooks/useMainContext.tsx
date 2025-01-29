import { useContext } from 'react';
import { mainContext } from '../contexts/MainContext';

export default function useMainContext() {
    return useContext(mainContext);
}
