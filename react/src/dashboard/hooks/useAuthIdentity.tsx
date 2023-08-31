import { useContext } from 'react';
import { authContext } from '../contexts/AuthContext';

export default function useAuthIdentity() {
    return useContext(authContext).identity;
}
