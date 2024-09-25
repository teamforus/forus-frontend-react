import React from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

export default function SignInBlock() {
    return (
        <div className="block block-info text-left">
            <div className="hide-sm block-info-title block-info-title-sm">Heeft u al een account?</div>
            <div className="show-sm block-info-title">Heeft u al een account?</div>

            <StateNavLink name={'sign-in'} className="hide-sm button button-primary block-info-actions">
                Inloggen
            </StateNavLink>

            <StateNavLink name={'sign-in'} className="show-sm button button-primary button-fill block-info-actions">
                Inloggen
            </StateNavLink>
        </div>
    );
}
