import React, { useCallback, useState } from 'react';
import { createContext, useEffect } from 'react';
import Identity from '../props/models/Identity';
import Employee from '../props/models/Employee';
import { useAuthService } from '../services/AuthService';
import { getStateRouteUrl, useStateRoutes } from '../modules/state_router/Router';
import { useNavigate } from 'react-router-dom';
import events from '../helpers/events';
import { ResponseError } from '../props/ApiResponses';

interface AuthMemoProps {
    token?: string;
    signOut?: () => void;
    setIdentity?: (identity: Identity) => void;
    identity?: Identity;
    identityEmployee?: Employee;
    setIdentityEmployee?: (employee: Employee) => void;
    isSignedIn?: boolean;
    setToken?: (token: string) => void;
}

const authContext = createContext<AuthMemoProps>(null);
const { Provider } = authContext;

const getToken = () => {
    const token = localStorage?.getItem('active_account');

    return token && token != 'null' ? token : null;
};

const AuthProvider = ({ children }: { children: React.ReactElement }) => {
    const authService = useAuthService();
    const { route } = useStateRoutes();
    const [token, setToken] = useState(getToken());
    const [identity, setIdentity] = useState<Identity>(null);
    const [identityEmployee, setIdentityEmployee] = useState<Employee>(null);
    const navigate = useNavigate();

    const signOut = useCallback(() => {
        setToken(null);
        setIdentity(null);
        setIdentityEmployee(null);
    }, []);

    useEffect(() => {
        localStorage.active_account = token;
    }, [token]);

    useEffect(() => {
        if (token && !identity) {
            authService.identity().then((res) => {
                setIdentity(res.data);
                setIdentityEmployee(null);
            });

            return;
        }

        if (!token && route?.state?.protected) {
            navigate(getStateRouteUrl('sign-in'));
            return;
        }
    }, [authService, token, navigate, signOut, identity, route?.state?.name, route?.state?.protected]);

    useEffect(() => {
        const callback = (data: CustomEvent<ResponseError<{ error?: string }>>) => {
            if (data.detail.status != 401) {
                return;
            }

            if (data.detail.data.error === '2fa') {
                return navigate(getStateRouteUrl('auth-2fa'));
            }

            return navigate(getStateRouteUrl('sign-out'));
        };

        events.subscribe('api-response:401', callback);

        return () => events.unsubscribe('api-response:401', callback);
    }, [navigate]);

    return (
        <Provider
            value={{
                token,
                setToken,
                identity,
                identityEmployee,
                setIdentity,
                setIdentityEmployee,
                signOut,
            }}>
            {children}
        </Provider>
    );
};

export { AuthProvider, authContext };
