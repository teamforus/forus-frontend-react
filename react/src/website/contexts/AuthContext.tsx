import React, { useCallback, useEffect, useState, createContext } from 'react';
import Identity from '../../dashboard/props/models/Identity';
import { useAuthService } from '../../dashboard/services/AuthService';
import { useStateRoutes } from '../modules/state_router/Router';
import events from '../../dashboard/helpers/events';
import { ResponseError } from '../../dashboard/props/ApiResponses';
import Identity2FAState from '../../dashboard/props/models/Identity2FAState';
import { useIdentity2FAService } from '../../dashboard/services/Identity2FAService';
import useSetProgress from '../../dashboard/hooks/useSetProgress';
import { useIdentityService } from '../../dashboard/services/IdentityService';
import { useNavigateState } from '../modules/state_router/Router';

interface AuthMemoProps {
    token?: string;
    signOut?: (
        e?: React.MouseEvent,
        needConfirmation?: boolean,
        deleteToken?: boolean,
        redirect?: boolean | string | (() => void),
    ) => void;
    setIdentity?: React.Dispatch<Identity>;
    identity?: Identity;
    identity2FAState?: Identity2FAState;
    setIdentity2FAState?: React.Dispatch<Identity2FAState>;
    isSignedIn?: boolean;
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
    const identityService = useIdentityService();
    const [identity2FAState, setIdentity2FAState] = useState<Identity2FAState>(null);
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const signOut = useCallback(
        (
            e: React.MouseEvent = null,
            needConfirmation = false,
            deleteToken = true,
            redirect: boolean | string | CallableFunction = 'home',
        ) => {
            e?.preventDefault();
            e?.stopPropagation();

            if (needConfirmation) {
                if (confirm('Log out?')) {
                    signOut();
                }
            }

            if (deleteToken) {
                identityService.deleteToken().then();
            }

            setToken(null);
            setIdentity(null);
            setIdentity2FAState(null);

            if (redirect && typeof redirect == 'function') {
                redirect();
            }

            if (redirect && typeof redirect == 'string') {
                navigateState(redirect);
            }
        },
        [identityService, navigateState],
    );

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
            navigateState('start');
            return;
        }
    }, [updateIdentity, token, navigateState, signOut, identity, route?.state?.name, route?.state?.protected]);

    useEffect(() => {
        const callback = (
            data: CustomEvent<{ reject: () => void } & ResponseError<{ error?: string; message?: string }>>,
        ) => {
            setProgress(100);

            if (data.detail.data.error === '2fa') {
                if (route?.state?.name !== 'auth-2fa') {
                    setIdentity(null);
                    fetchIdentity2FA().then();
                    navigateState('auth-2fa');
                }

                return;
            }

            navigateState('sign-out', null, null, {
                state: { session_expired: data.detail.data.message == 'session_expired' },
            });
        };

        events.subscribe('api-response:401', callback);

        return () => events.unsubscribe('api-response:401', callback);
    }, [fetchIdentity2FA, navigateState, route?.state?.name, setProgress, updateIdentity]);

    return (
        <Provider
            value={{
                token,
                setToken,
                identity,
                identity2FAState,
                setIdentity,
                setIdentity2FAState,
                updateIdentity,
                signOut,
            }}>
            {children}
        </Provider>
    );
};

export { AuthProvider, authContext };
