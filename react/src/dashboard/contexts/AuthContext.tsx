import React, { useCallback, useState } from 'react';
import { createContext, useEffect } from 'react';
import Identity from '../props/models/Identity';
import Employee from '../props/models/Employee';
import { useAuthService } from '../services/AuthService';
import { getStateRouteUrl, useStateRoutes } from '../modules/state_router/Router';
import { useNavigate } from 'react-router';
import events from '../helpers/events';
import { ResponseError } from '../props/ApiResponses';
import Identity2FAState from '../props/models/Identity2FAState';
import { useIdentity2FAService } from '../services/Identity2FAService';
import useSetProgress from '../hooks/useSetProgress';
import { DashboardRoutes } from '../modules/state_router/RouterBuilder';

interface AuthMemoProps {
    token?: string;
    signOut?: () => void;
    setIdentity?: React.Dispatch<Identity>;
    identity?: Identity;
    identity2FAState?: Identity2FAState;
    identityEmployee?: Employee;
    setIdentity2FAState?: React.Dispatch<Identity2FAState>;
    setIdentityEmployee?: React.Dispatch<Employee>;
    hasToken?: boolean;
    setToken?: (token: string) => void;
    updateIdentity?: () => Promise<{ identity: Identity; identity2FAState: Identity2FAState }>;
}

const authContext = createContext<AuthMemoProps>(null);
const { Provider } = authContext;

const getToken = () => {
    const token = localStorage?.getItem('active_account');

    return token && token != 'null' ? token : null;
};

const AuthProvider = ({ children }: { children: React.ReactElement }) => {
    const authService = useAuthService();
    const identity2FAService = useIdentity2FAService();
    const { route } = useStateRoutes();
    const [token, setToken] = useState(getToken());
    const [identity, setIdentity] = useState<Identity>(null);
    const [identity2FAState, setIdentity2FAState] = useState<Identity2FAState>(null);
    const [identityEmployee, setIdentityEmployee] = useState<Employee>(null);
    const navigate = useNavigate();
    const setProgress = useSetProgress();

    const signOut = useCallback(() => {
        setToken(null);
        setIdentity(null);
        setIdentity2FAState(null);
        setIdentityEmployee(null);
    }, []);

    const fetchIdentity = useCallback(async () => {
        const identity = token
            ? await authService
                  .identity()
                  .then((res) => res.data)
                  .catch(() => null)
            : null;

        setIdentity(identity);

        return identity;
    }, [authService, token]);

    const fetchIdentity2FA = useCallback(async () => {
        const identity2FAState = token
            ? await identity2FAService
                  .status()
                  .then((res) => res.data.data)
                  .catch(() => null)
            : null;

        setIdentity2FAState(identity2FAState);

        return identity2FAState;
    }, [identity2FAService, token]);

    const updateIdentity = useCallback(async () => {
        const identity = await fetchIdentity();
        const identity2FAState = await fetchIdentity2FA();

        return { identity, identity2FAState };
    }, [fetchIdentity, fetchIdentity2FA]);

    useEffect(() => {
        localStorage.active_account = token;
    }, [token]);

    useEffect(() => {
        if (token && !identity) {
            updateIdentity().then();
            return;
        }

        if (!token && route?.state?.protected) {
            navigate(getStateRouteUrl(DashboardRoutes.SIGN_IN));
            return;
        }
    }, [updateIdentity, token, navigate, signOut, identity, route?.state?.name, route?.state?.protected]);

    useEffect(() => {
        const callback = (data: CustomEvent<ResponseError<{ error?: string }>>) => {
            if (data.detail.status != 401) {
                return;
            }

            setProgress(100);

            if (data.detail.data.error === '2fa') {
                setIdentity(null);
                fetchIdentity2FA().then(() => navigate(getStateRouteUrl(DashboardRoutes.AUTH_2FA)));
                return;
            }

            return navigate(getStateRouteUrl(DashboardRoutes.SIGN_OUT));
        };

        events.subscribe('api-response:401', callback);

        return () => events.unsubscribe('api-response:401', callback);
    }, [fetchIdentity2FA, navigate, setProgress]);

    return (
        <Provider
            value={{
                token,
                setToken,
                hasToken: !!token,
                identity,
                identity2FAState,
                identityEmployee,
                setIdentity,
                setIdentityEmployee,
                setIdentity2FAState,
                updateIdentity,
                signOut,
            }}>
            {children}
        </Provider>
    );
};

export { AuthProvider, authContext };
