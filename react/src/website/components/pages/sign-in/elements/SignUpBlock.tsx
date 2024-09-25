import React from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

export default function SignUpBlock() {
    return (
        <div className="block block-info text-left">
            <div className="hide-sm block-info-title block-info-title-sm">Nog geen account?</div>
            <div className="show-sm block-info-title">Nog geen account?</div>

            <StateNavLink
                name={'sign-up'}
                className="hide-sm button button-primary block-info-actions block-info-actions-lg">
                Aanmelden
            </StateNavLink>

            <StateNavLink
                name={'sign-up'}
                className="show-sm button button-fill button-primary block-info-actions block-info-actions-lg">
                Aanmelden
            </StateNavLink>
        </div>
    );
}
