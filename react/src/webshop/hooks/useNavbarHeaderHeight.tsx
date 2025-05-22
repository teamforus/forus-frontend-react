import { useContext } from 'react';
import { layoutContext } from '../contexts/LayoutContext';

export const useNavbarHeaderHeight = (): number => {
    return useContext(layoutContext).navbarHeaderHeight;
};
