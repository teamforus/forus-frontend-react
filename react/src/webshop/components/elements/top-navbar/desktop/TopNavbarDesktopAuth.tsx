import React, { useContext } from 'react';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import useAuthIdentity from '../../../../hooks/useAuthIdentity';
import { strLimit } from '../../../../../dashboard/helpers/string';
import { authContext } from '../../../../contexts/AuthContext';

export const TopNavbarDesktopAuth = () => {
    const { signOut } = useContext(authContext);

    const translate = useTranslate();
    const authIdentity = useAuthIdentity();

    if (!authIdentity) {
        return null;
    }

    return (
        <div className="navbar-desktop-auth">
            {authIdentity?.email && (
                <span className="navbar-desktop-auth-email" data-dusk="identityEmail">
                    {strLimit(authIdentity?.email, 27)}
                </span>
            )}

            <div className="navbar-desktop-auth-separator" />

            <a
                role="button"
                className={'state-nav-link navbar-desktop-auth-logout'}
                tabIndex={0}
                onClick={(e) => signOut(e, true)}>
                <span className="navbar-item">{translate('top_navbar.buttons.logout')}</span>
                <em className="mdi mdi-logout" />
            </a>
        </div>
    );
};
