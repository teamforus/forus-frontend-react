import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useAppConfigs from '../../../hooks/useAppConfigs';
import Markdown from '../markdown/Markdown';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useEnvData from '../../../hooks/useEnvData';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { useVoucherService } from '../../../services/VoucherService';
import Voucher from '../../../../dashboard/props/models/Voucher';
import classNames from 'classnames';
import { hexToHsva } from '@uiw/color-convert';
import ReadSpeakerButton from '../../../modules/read_speaker/ReadSpeakerButton';
import Fund from '../../../props/models/Fund';

export default function BlockBanner({
    funds,
    config,
}: {
    funds?: Fund[];
    config?: {
        wide: boolean;
        collapse: boolean;
        position: 'left' | 'center' | 'right';
        banner_color?: string;
        banner_background?: string;
        background_image?: string;
    };
}) {
    const envData = useEnvData();
    const translate = useTranslate();
    const appConfigs = useAppConfigs();
    const setProgress = useSetProgress();
    const authIdentity = useAuthIdentity();

    const voucherService = useVoucherService();

    const [vouchers, setVouchers] = useState<Array<Voucher>>(null);
    const [dataConfig, setDataConfig] = useState<{
        wide: boolean;
        collapse: boolean;
        position: 'left' | 'center' | 'right';
        banner_color?: string;
        banner_background?: string;
        banner_background_mobile?: boolean;
        background_image?: string;
    }>(null);

    const fetchVouchers = useCallback(() => {
        setProgress(0);

        voucherService
            .list()
            .then((res) => setVouchers(res.data.data))
            .catch((e) => console.error(e))
            .finally(() => setProgress(100));
    }, [voucherService, setProgress]);

    useEffect(() => {
        if (authIdentity) {
            fetchVouchers();
        } else {
            setVouchers(null);
        }
    }, [fetchVouchers, authIdentity]);

    useEffect(() => {
        if (config) {
            setDataConfig(config);
        } else {
            setDataConfig({
                wide: appConfigs.settings?.banner_wide,
                collapse: appConfigs.settings?.banner_collapse,
                position: appConfigs.settings?.banner_position,
                banner_color: appConfigs.settings?.banner_color,
                banner_background: appConfigs.settings?.banner_background,
                banner_background_mobile: appConfigs.settings?.banner_background_mobile,
                background_image: appConfigs.settings?.background_image,
            });
        }
    }, [config, appConfigs?.settings]);

    if (!dataConfig) {
        return;
    }

    return (
        <div
            data-dusk={'header'}
            className={classNames(
                'block block-banner',
                dataConfig?.wide && 'block-banner-wide',
                dataConfig?.collapse && 'block-banner-collapse',
                !appConfigs.banner?.sizes && 'block-banner-background-empty',
                dataConfig?.position === 'left' && 'block-banner-position-left',
                dataConfig?.position === 'right' && 'block-banner-position-right',
                dataConfig?.position === 'center' && 'block-banner-position-center',
                !dataConfig?.banner_background_mobile && 'block-banner-background-mobile-hide',
                hexToHsva(dataConfig?.banner_background)?.a === 0 && 'block-banner-transparent',
            )}>
            <div
                className={'banner-background'}
                style={appConfigs.banner ? { backgroundImage: `url(${appConfigs?.banner?.sizes?.large})` } : {}}>
                {appConfigs.settings.overlay_enabled && (
                    <div
                        className={classNames(
                            `banner-background-pattern`,
                            appConfigs.settings.overlay_type != 'color' && 'header-overlay-pattern',
                        )}
                        style={{
                            opacity: appConfigs.settings.overlay_opacity,
                            backgroundImage:
                                appConfigs.settings.overlay_type == 'color'
                                    ? 'none'
                                    : `url("assets/img/banner-patterns/${appConfigs.settings.overlay_type}.svg")`,
                            backgroundColor: appConfigs.settings.overlay_type == 'color' ? '#000' : `none`,
                        }}
                    />
                )}
            </div>
            <div className="banner-container">
                <div className="banner-container-wrapper">
                    <div
                        className="banner-container-wrapper-pane"
                        style={{ background: dataConfig.banner_background, color: dataConfig.banner_color }}>
                        <ReadSpeakerButton className={'header-read-speaker'} targetId={'main-content'} />
                        <h1 data-dusk="headerTitle" className={'banner-title'}>
                            {appConfigs.settings.title
                                ? appConfigs.settings.title
                                : translate(
                                      `home.header.${envData.client_key}.title`,
                                      { implementation: appConfigs.implementation?.name },
                                      'home.header.title',
                                  )}
                        </h1>
                        <div className="banner-description" id="desc">
                            {appConfigs.settings.description ? (
                                <Markdown
                                    content={appConfigs.settings.description_html}
                                    align={appConfigs.settings.description_alignment}
                                />
                            ) : (
                                <Fragment>
                                    {!appConfigs.settings.description && !appConfigs.digid && (
                                        <Fragment>
                                            {funds.length <= 1 && (
                                                <p>
                                                    {translate(
                                                        `home.header.${envData.client_key}.subtitle`,
                                                        {
                                                            fund: funds?.[0]?.name,
                                                            start_date: funds?.[0]?.start_date_locale,
                                                        },
                                                        'home.header.subtitle',
                                                    )}
                                                </p>
                                            )}
                                            {funds.length > 1 && (
                                                <p>
                                                    {translate(
                                                        `home.header.${envData.client_key}.subtitle_multi`,
                                                        { org_name: funds?.[0].organization.name },
                                                        'home.header.subtitle_multi',
                                                    )}
                                                </p>
                                            )}
                                            {!authIdentity && funds.length <= 1 && (
                                                <p>
                                                    {translate(
                                                        `home.header.${envData.client_key}.cta`,
                                                        {
                                                            fund: funds?.[0]?.name,
                                                            start_date: funds?.[0]?.start_date_locale,
                                                        },
                                                        'home.header.cta',
                                                    )}
                                                </p>
                                            )}

                                            {!authIdentity && funds.length > 1 && (
                                                <p>
                                                    {translate(
                                                        `home.header.${envData.client_key}.cta`,
                                                        {
                                                            fund: funds?.[0].name,
                                                            start_date: funds?.[0].start_date_locale,
                                                        },
                                                        'home.header.cta_multi',
                                                    )}
                                                </p>
                                            )}

                                            {authIdentity && vouchers?.length > 0 && (
                                                <p>
                                                    {translate(`home.header.auth_cta`, {
                                                        fund: funds?.[0].name,
                                                        start_date: funds?.[0].start_date_locale,
                                                    })}
                                                </p>
                                            )}
                                        </Fragment>
                                    )}

                                    {!appConfigs.settings.description && appConfigs.digid && (
                                        <Fragment>
                                            <p>
                                                {translate(
                                                    `home.header.${envData.client_key}.subtitle_av`,
                                                    {
                                                        fund: funds?.[0]?.name,
                                                        start_date: funds?.[0]?.start_date_locale,
                                                    },
                                                    'home.header.subtitle_av',
                                                )}
                                            </p>

                                            {!authIdentity && (
                                                <p>
                                                    {translate(
                                                        `home.header.${envData.client_key}.cta_av`,
                                                        {
                                                            fund: funds?.[0]?.name,
                                                            start_date: funds?.[0]?.start_date_locale,
                                                        },
                                                        'home.header.cta_av',
                                                    )}
                                                </p>
                                            )}

                                            {authIdentity && vouchers?.length > 0 && (
                                                <p>
                                                    {translate(`home.header.auth_cta`, {
                                                        fund: funds?.[0]?.name,
                                                        start_date: funds?.[0]?.start_date_locale,
                                                    })}
                                                </p>
                                            )}
                                        </Fragment>
                                    )}
                                </Fragment>
                            )}
                        </div>
                        {appConfigs.settings.banner_button && (
                            <div className="banner-actions">
                                <a
                                    className={classNames(
                                        'button',
                                        appConfigs.settings.banner_button_type === 'color'
                                            ? 'button-primary'
                                            : 'button-light button-light-strict',
                                        'banner-actions-button',
                                        appConfigs.settings.banner_button_type === 'white' &&
                                            'banner-actions-button-white',
                                    )}
                                    href={appConfigs.settings.banner_button_url}
                                    target={appConfigs.settings.banner_button_target}
                                    rel={appConfigs.settings.banner_button_target === '_blank' ? 'noreferrer' : null}>
                                    {appConfigs.settings.banner_button_text}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
