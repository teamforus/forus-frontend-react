import React, { useMemo } from 'react';
import useAssetUrl from '../../../hooks/useAssetUrl';
import { NavLink } from 'react-router';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { get } from 'lodash';
import Fund from '../../../props/models/Fund';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function Auth2FARestriction({
    type,
    items,
    itemName,
    itemThumbnail,
    defaultThumbnail,
}: {
    type: 'sessions' | 'emails' | 'reimbursements';
    items: Array<Partial<Fund>>;
    itemName: string;
    itemThumbnail: string;
    defaultThumbnail: string;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    const itemsList = useMemo(() => {
        return items.map((item) => ({
            id: item.id,
            name: get(item, itemName),
            thumbnail: get(item, itemThumbnail),
        }));
    }, [itemName, itemThumbnail, items]);

    return (
        <div className="block block-2fa-restriction">
            <div className="restriction-hero">
                <div className="restriction-hero-media">
                    <img src={assetUrl('/assets/img/icon-2fa-restriction.svg')} alt="" />
                </div>
                {type == 'emails' && (
                    <div className="restriction-hero-details">
                        <div className="restriction-hero-title">{translate('global.2fa_restriction.emails.title')}</div>
                        <div className="restriction-hero-description">
                            {translate('global.2fa_restriction.emails.description')}
                        </div>
                        <div className="button-group">
                            <NavLink
                                className="button button-primary button-sm"
                                to={getStateRouteUrl(WebshopRoutes.SECURITY_2FA)}>
                                <div className="icon-start mdi mdi-lock-outline" />
                                {translate('global.2fa_restriction.emails.button')}
                            </NavLink>
                        </div>
                    </div>
                )}

                {type == 'sessions' && (
                    <div className="restriction-hero-details">
                        <div className="restriction-hero-title">
                            {translate('global.2fa_restriction.sessions.title')}
                        </div>
                        <div className="restriction-hero-description">
                            {translate('global.2fa_restriction.sessions.description')}
                        </div>
                        <div className="button-group">
                            <NavLink
                                className="button button-primary button-sm"
                                to={getStateRouteUrl(WebshopRoutes.SECURITY_2FA)}>
                                <div className="icon-start mdi mdi-lock-outline" />
                                {translate('global.2fa_restriction.sessions.button')}
                            </NavLink>
                        </div>
                    </div>
                )}

                {type == 'reimbursements' && (
                    <div className="restriction-hero-details">
                        <div className="restriction-hero-title">
                            {translate('global.2fa_restriction.reimbursements.title')}
                        </div>
                        <div className="restriction-hero-description">
                            {translate('global.2fa_restriction.reimbursements.description')}
                        </div>
                        <div className="button-group">
                            <NavLink
                                className="button button-primary button-sm"
                                to={getStateRouteUrl(WebshopRoutes.SECURITY_2FA)}>
                                <div className="icon-start mdi mdi-lock-outline" />
                                {translate('global.2fa_restriction.reimbursements.button')}
                            </NavLink>
                        </div>
                    </div>
                )}
            </div>

            <div className="restriction-reasons">
                {type == 'emails' && (
                    <div className="restriction-details">
                        <div className="restriction-title">{translate('global.2fa_restriction.reasons.title')}</div>
                        <div className="restriction-description">
                            {translate('global.2fa_restriction.reasons.description')}
                        </div>
                    </div>
                )}

                {type == 'sessions' && (
                    <div className="restriction-details">
                        <div className="restriction-title">{translate('global.2fa_restriction.reasons.title')}</div>
                        <div className="restriction-description">
                            {translate('global.2fa_restriction.reasons.description')}
                        </div>
                    </div>
                )}

                {type == 'reimbursements' && (
                    <div className="restriction-details">
                        <div className="restriction-title">{translate('global.2fa_restriction.reasons.title')}</div>
                        <div className="restriction-description">
                            {translate('global.2fa_restriction.reasons.description')}
                        </div>
                    </div>
                )}

                {itemsList?.map((item) => (
                    <div key={item.id} className="restriction-item">
                        <div className="restriction-item-media">
                            <img
                                src={item.thumbnail || assetUrl(`/assets/img/placeholders/${defaultThumbnail}.png`)}
                                alt={''}
                            />
                        </div>
                        <div className="restriction-item-name">{item.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
