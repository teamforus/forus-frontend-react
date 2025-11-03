import React, { Fragment, useEffect, useRef, useState } from 'react';
import IconCookies from '../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-search/cookies.svg';
import classNames from 'classnames';
import CookieBannerToggle from './CookieBannerToggle';
import StateNavLink from '../state_router/StateNavLink';
import EnvDataWebshopProp from '../../../props/EnvDataWebshopProp';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import { WebshopRoutes } from '../state_router/RouterBuilder';

export default function CookieBanner({
    envData,
    setAllowOptionalCookies,
}: {
    envData: EnvDataWebshopProp;
    setAllowOptionalCookies: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const translate = useTranslate();
    const { matomo_url, matomo_site_id, site_improve_analytics_id, aws_rum } = envData?.config || {};
    const { disable_cookie_banner } = envData?.config || {};
    const [showConfigs, setShowConfigs] = useState(false);

    const [functionalAccepted, setFunctionalAccepted] = useState(true);
    const [optionalAccepted, setOptionalAccepted] = useState(true);

    const [cookiesAccepted, setCookiesAccepted] = useState(
        disable_cookie_banner ? 'all' : localStorage.getItem('cookiesAccepted'),
    );

    const closeRef = useRef<HTMLDivElement>(null);

    const onAcceptAll = () => {
        localStorage.setItem('cookiesAccepted', 'all');
        setCookiesAccepted('all');
    };

    const onDisableOptional = () => {
        localStorage.setItem('cookiesAccepted', 'functional');
        setCookiesAccepted('functional');
    };

    useEffect(() => {
        setAllowOptionalCookies(cookiesAccepted === 'all');
    }, [cookiesAccepted, setAllowOptionalCookies]);

    if (!matomo_url && !matomo_site_id && !site_improve_analytics_id && !aws_rum?.allowCookies) {
        return null;
    }

    if (cookiesAccepted) {
        return null;
    }

    return (
        <div className={classNames('block', 'block-cookie-banner', showConfigs && 'block-cookie-banner-config')}>
            {!showConfigs ? (
                <Fragment>
                    <div className="cookie-banner-icon">
                        <IconCookies />
                    </div>
                    <div className="cookie-banner-title">{translate('cookie_banner.title')}</div>
                    <div className="cookie-banner-description">
                        {translate('cookie_banner.description')}
                        <br />
                        <br />
                        {translate('cookie_banner.view')}
                        <StateNavLink
                            name={WebshopRoutes.PRIVACY}
                            target={'_blank'}
                            className={'cookie-banner-description-link'}
                            tabIndex={1}>
                            <strong>{translate('cookie_banner.privacy_policy')}</strong>
                        </StateNavLink>
                        .
                    </div>
                    <div className="cookie-banner-actions">
                        <button
                            className="button button-primary button-sm cookie-banner-button"
                            onClick={onAcceptAll}
                            tabIndex={1}>
                            {translate('cookie_banner.accept_all')}
                        </button>
                        <button
                            className="button button-light button-sm cookie-banner-button"
                            onClick={onDisableOptional}
                            tabIndex={1}>
                            {translate('cookie_banner.functional_only')}
                        </button>
                    </div>
                    <div
                        role={'button'}
                        tabIndex={1}
                        onKeyDown={clickOnKeyEnter}
                        onClick={() => {
                            setShowConfigs(true);
                            setTimeout(() => closeRef.current?.focus());
                        }}
                        className="cookie-banner-config">
                        {translate('cookie_banner.manage_cookies')}
                        <em className="mdi mdi-open-in-new" />
                    </div>
                </Fragment>
            ) : (
                <div className={'cookie-configs form'}>
                    <div className="cookie-configs-header">
                        <div className="cookie-configs-wrapper">
                            <div className="cookie-configs-header-title">
                                {translate('cookie_banner.settings')}
                                <div
                                    tabIndex={1}
                                    ref={closeRef}
                                    onKeyDown={clickOnKeyEnter}
                                    className="mdi mdi-close cookie-configs-header-close"
                                    onClick={() => setShowConfigs(!showConfigs)}
                                />
                            </div>
                            <div className="cookie-configs-header-description">
                                {translate('cookie_banner.settings_description')}
                            </div>
                        </div>
                    </div>
                    <div className="cookie-configs-body">
                        <div className="cookie-configs-wrapper">
                            <div className="cookie-configs-body-title">{translate('cookie_banner.storage_info')}</div>

                            <div className="cookie-configs-toggles">
                                <CookieBannerToggle
                                    disabled={true}
                                    accepted={functionalAccepted}
                                    setAccepted={setFunctionalAccepted}
                                    title={translate('cookie_banner.local_storage')}
                                    description={translate('cookie_banner.local_storage_description')}
                                />
                                <div className="cookie-configs-toggle-separator" />
                                <CookieBannerToggle
                                    disabled={false}
                                    accepted={optionalAccepted}
                                    setAccepted={setOptionalAccepted}
                                    title={translate('cookie_banner.analytics')}
                                    description={translate('cookie_banner.analytics_description')}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="cookie-configs-footer">
                        <div className="cookie-configs-wrapper">
                            {functionalAccepted && (
                                <button
                                    className="button button-primary button-sm cookie-banner-button"
                                    onClick={onAcceptAll}
                                    tabIndex={1}>
                                    {translate('cookie_banner.accept_all')}
                                </button>
                            )}

                            <button
                                className="button button-light button-sm cookie-banner-button"
                                onClick={onDisableOptional}
                                tabIndex={1}>
                                {translate('cookie_banner.functional_only')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
