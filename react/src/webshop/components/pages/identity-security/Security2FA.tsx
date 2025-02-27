import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useOpenModal from '../../../../dashboard/hooks/useOpenModal';
import usePushDanger from '../../../../dashboard/hooks/usePushDanger';
import usePushSuccess from '../../../../dashboard/hooks/usePushSuccess';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { authContext } from '../../../contexts/AuthContext';
import { useIdentity2FAService } from '../../../../dashboard/services/Identity2FAService';
import Identity2FAState from '../../../../dashboard/props/models/Identity2FAState';
import useFormBuilder from '../../../../dashboard/hooks/useFormBuilder';
import { ResponseError } from '../../../../dashboard/props/ApiResponses';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import Modal2FADeactivate from '../../modals/Modal2FADeactivate';
import Modal2FASetup from '../../modals/Modal2FASetup';
import useTranslate from '../../../../dashboard/hooks/useTranslate';

export default function Security2FA() {
    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const { updateIdentity } = useContext(authContext);
    const identity2FAService = useIdentity2FAService();
    const [auth2FAState, setAuth2FAState] = useState<Identity2FAState>(null);

    const activeProvidersByKey = useMemo(() => {
        return (
            auth2FAState?.active_providers?.reduce((acc, item) => {
                return { ...acc, [item.provider_type.type]: item };
            }, {}) || {}
        );
    }, [auth2FAState]);

    const [auth2FARememberIpOptions] = useState([
        { value: 0, name: translate('security_2fa.require_2fa_always') },
        { value: 1, name: translate('security_2fa.require_2fa_ip') },
    ]);

    const form = useFormBuilder<{
        auth_2fa_remember_ip: 0 | 1;
    }>(null, (values) => {
        setProgress(0);

        identity2FAService
            .update(values)
            .then((res) => {
                setAuth2FAState(res.data.data);
                pushSuccess(translate('push.saved'));
            })
            .catch((err: ResponseError) => {
                form.setErrors(err.data.errors);
                pushDanger(translate('push.error'), err.data?.message || translate('security_2fa.unknown_error'));
            })
            .finally(() => {
                form.setIsLocked(false);
                setProgress(100);
            });
    });

    const { update } = form;

    const fetchState = useCallback(() => {
        setProgress(0);

        identity2FAService
            .status()
            .then((res) => {
                updateIdentity().then();
                setAuth2FAState(res.data.data);
            })
            .catch((err: ResponseError) =>
                pushDanger(translate('push.error'), err.data?.message || translate('security_2fa.unknown_error')),
            )
            .finally(() => setProgress(100));
    }, [identity2FAService, setProgress, pushDanger, updateIdentity, translate]);

    const setupAuth2FA = useCallback(
        (type: string) => {
            openModal((modal) => (
                <Modal2FASetup
                    type={type}
                    modal={modal}
                    auth2FAState={auth2FAState}
                    onReady={fetchState}
                    onCancel={null}
                />
            ));
        },
        [auth2FAState, fetchState, openModal],
    );

    const deactivateAuth2FA = useCallback(
        (type: string) => {
            openModal((modal) => (
                <Modal2FADeactivate
                    modal={modal}
                    auth2FA={auth2FAState.active_providers.find((auth_2fa) => auth_2fa.provider_type.type == type)}
                    onReady={fetchState}
                    onCancel={null}
                />
            ));
        },
        [auth2FAState, fetchState, openModal],
    );

    useEffect(() => {
        if (auth2FAState) {
            update({ auth_2fa_remember_ip: auth2FAState.auth_2fa_remember_ip ? 1 : 0 });
        }
    }, [auth2FAState, update]);

    useEffect(() => {
        fetchState();
    }, [fetchState]);

    return (
        <BlockShowcaseProfile
            breadcrumbItems={[
                { name: translate('security_2fa.breadcrumbs.home'), state: 'home' },
                { name: translate('security_2fa.breadcrumbs.security_2fa') },
            ]}
            profileHeader={
                auth2FAState &&
                form.values && (
                    <Fragment>
                        <div className="profile-content-header clearfix">
                            <h2 className="profile-content-title">
                                <div className="pull-left">
                                    <div className="profile-content-title-count">
                                        {auth2FAState?.provider_types.length}
                                    </div>
                                    <h1 className="profile-content-header">{translate('security_2fa.title')}</h1>
                                </div>
                            </h2>
                        </div>
                        <div className="profile-content-header clearfix">
                            <h2 className="profile-content-title">
                                <div className="profile-content-subtitle">{translate('security_2fa.subtitle')}</div>
                            </h2>
                        </div>
                    </Fragment>
                )
            }>
            {auth2FAState && form.values && (
                <Fragment>
                    {auth2FAState?.provider_types?.map((provider_type) => (
                        <div key={provider_type.type} className="block block-auth-2fa">
                            <div className="auth-2fa-item">
                                <div className="auth-2fa-item-icon">
                                    {provider_type?.type == 'authenticator' && <em className="mdi mdi-cellphone-key" />}
                                    {provider_type?.type == 'phone' && <em className="mdi mdi-cellphone-message" />}
                                </div>
                                <div className="auth-2fa-item-details">
                                    <div className="auth-2fa-item-title">
                                        {provider_type?.type == 'authenticator' &&
                                            translate('security_2fa.providers.authenticator.title')}

                                        {provider_type?.type == 'phone' &&
                                            translate('security_2fa.providers.phone.title')}

                                        {activeProvidersByKey[provider_type.type] ? (
                                            <div className="auth-2fa-item-date">
                                                <em className="mdi mdi-check-circle" />
                                                {translate('security_2fa.enabled_on')}
                                                {activeProvidersByKey[provider_type.type].created_at_locale}
                                            </div>
                                        ) : (
                                            <div className="auth-2fa-item-label">
                                                <div className="label label-light">
                                                    {translate('security_2fa.disabled')}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {provider_type.type == 'phone' && activeProvidersByKey[provider_type.type] && (
                                        <div className="auth-phone-details">
                                            <div className="auth-phone-details-icon">
                                                <em className="mdi mdi-message-processing" />
                                            </div>
                                            <div className="auth-phone-details-content">
                                                <div className="auth-phone-details-title">
                                                    {translate('security_2fa.sms_message')}
                                                </div>
                                                <div className="auth-phone-details-subtitle flex">
                                                    <div className="auth-phone-details-phone">
                                                        {activeProvidersByKey[provider_type.type].phone}
                                                    </div>
                                                    <div className="label-group pull-right">
                                                        <div className="label label-success">
                                                            {translate('security_2fa.number_confirmed')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="auth-phone-details-description">
                                                    {translate('security_2fa.verification_codes_sent')}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="auth-2fa-item-actions">
                                        <div className="button-group">
                                            {activeProvidersByKey[provider_type.type] ? (
                                                <button
                                                    type="button"
                                                    className="button button-light button-sm"
                                                    onClick={() => deactivateAuth2FA(provider_type.type)}>
                                                    <em className="mdi mdi-lock-open-outline icon-start" />
                                                    {translate('security_2fa.disable')}
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="button button-primary button-sm"
                                                    onClick={() => setupAuth2FA(provider_type.type)}>
                                                    <em className="mdi mdi-shield-check-outline icon-start" />
                                                    {translate('security_2fa.enable')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="profile-content-header clearfix">
                        <h3 className="profile-content-title">{translate('security_2fa.settings')}</h3>
                    </div>

                    <div className="block block-auth-2fa">
                        <form className="form form-compact" onSubmit={form.submit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="auth_2fa_remember_ip">
                                    {translate('security_2fa.remember_ip')}
                                </label>
                                {!auth2FAState.auth_2fa_forget_force.voucher &&
                                !auth2FAState.auth_2fa_forget_force.organization ? (
                                    <SelectControl
                                        id={'auth_2fa_remember_ip'}
                                        propKey={'value'}
                                        allowSearch={false}
                                        value={form.values.auth_2fa_remember_ip}
                                        onChange={(auth_2fa_remember_ip: 0 | 1) => {
                                            form.update({ auth_2fa_remember_ip });
                                        }}
                                        options={auth2FARememberIpOptions}
                                        multiline={true}
                                    />
                                ) : (
                                    <input
                                        className="form-control"
                                        disabled={true}
                                        value={auth2FARememberIpOptions?.[0]?.name}
                                    />
                                )}
                                {auth2FAState.auth_2fa_forget_force.voucher && (
                                    <div className="form-hint">{translate('security_2fa.vouchers_restrict')}</div>
                                )}

                                {auth2FAState.auth_2fa_forget_force.organization && (
                                    <div className="form-hint">{translate('security_2fa.municipality_restrict')}</div>
                                )}
                            </div>
                            <div className="text-center">
                                <button className="button button-primary button-sm" type="submit">
                                    {translate('security_2fa.confirm')}
                                </button>
                            </div>
                        </form>
                    </div>
                </Fragment>
            )}
        </BlockShowcaseProfile>
    );
}
