import { useContext } from 'react';
import { authContext } from '../contexts/AuthContext';

export default function useAuthIdentityEmployee() {
    return useContext(authContext).identityEmployee;
}
