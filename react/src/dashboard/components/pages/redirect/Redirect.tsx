import React from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import useAssetUrl from '../../../hooks/useAssetUrl';

export default function Redirect() {
    const [params] = useSearchParams();
    const assetUrl = useAssetUrl();

    if (params.get('target')) {
        return <></>;
    }

    if (params.get('email_confirmed')) {
        return (
            <>
                <div className="block block-email-confirmed">
                    <div className="block-email-confirmed-content">
                        <div className="block-email-confirmed-icon">
                            <img src={assetUrl('/assets/img/confirm-success.svg')} alt="" />
                        </div>
                        <div className="block-email-confirmed-title">Gelukt!</div>
                        <div className="block-email-confirmed-subtitle">Uw e-mailadres is bevestigd</div>
                    </div>

                    <div className="block-email-confirmed-footer">
                        <NavLink
                            to={getStateRouteUrl('organizations')}
                            data-dusk="identityEmailConfirmedButton"
                            className="button button-primary button-lg">
                            Bekijken
                        </NavLink>
                    </div>
                </div>
            </>
        );
    }

    return <></>;
}
