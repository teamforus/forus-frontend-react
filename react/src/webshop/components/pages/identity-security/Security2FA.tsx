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
import StateNavLink from '../../../modules/state_router/StateNavLink';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import Modal2FADeactivate from '../../modals/Modal2FADeactivate';
import Modal2FASetup from '../../modals/Modal2FASetup';

export default function Security2FA() {
    const openModal = useOpenModal();
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
        { value: 0, name: 'Altijd bevestiging vereisen met 2FA' },
        { value: 1, name: 'Als IP-adres in de afgelopen 48 uur gebruikt, geen 2FA vereisen.' },
    ]);

    const form = useFormBuilder<{
        auth_2fa_remember_ip: 0 | 1;
    }>(null, (values) => {
        setProgress(0);

        identity2FAService
            .update(values)
            .then((res) => {
                setAuth2FAState(res.data.data);
                pushSuccess('Opgeslagen!');
            })
            .catch((err: ResponseError) => {
                form.setErrors(err.data.errors);
                pushDanger('Error', err.data?.message || 'Onbekende foutmelding.');
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
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data?.message || 'Unknown error.'))
            .finally(() => setProgress(100));
    }, [identity2FAService, setProgress, pushDanger, updateIdentity]);

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
            breadcrumbs={
                <div className="block block-breadcrumbs">
                    <StateNavLink name={'home'} className="breadcrumb-item">
                        Home
                    </StateNavLink>
                    <div className="breadcrumb-item active">Beveiliging</div>
                </div>
            }
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
                                    <h1 className="profile-content-header">Tweefactorauthenticatie</h1>
                                </div>
                            </h2>
                        </div>
                        <div className="profile-content-header clearfix">
                            <h2 className="profile-content-title">
                                <div className="profile-content-subtitle">
                                    Voeg een extra beveiligingslaag toe aan uw account door tweefactorauthenticatie in
                                    te schakelen. U kunt kiezen uit de volgende verificatiemethoden: Authenticator app
                                    en SMS-verificatie.
                                </div>
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
                                        {provider_type.title}

                                        {activeProvidersByKey[provider_type.type] ? (
                                            <div className="auth-2fa-item-date">
                                                <em className="mdi mdi-check-circle" />
                                                {'Ingeschakeld: '}
                                                {activeProvidersByKey[provider_type.type].created_at_locale}
                                            </div>
                                        ) : (
                                            <div className="auth-2fa-item-label">
                                                <div className="label label-light">Uitgeschakeld</div>
                                            </div>
                                        )}
                                    </div>

                                    {provider_type.type == 'phone' && activeProvidersByKey[provider_type.type] && (
                                        <div className="auth-phone-details">
                                            <div className="auth-phone-details-icon">
                                                <em className="mdi mdi-message-processing" />
                                            </div>
                                            <div className="auth-phone-details-content">
                                                <div className="auth-phone-details-title">SMS Bericht</div>
                                                <div className="auth-phone-details-subtitle flex">
                                                    <div className="auth-phone-details-phone">
                                                        {activeProvidersByKey[provider_type.type].phone}
                                                    </div>
                                                    <div className="label-group pull-right">
                                                        <div className="label label-success">Nummer bevestigd</div>
                                                    </div>
                                                </div>
                                                <div className="auth-phone-details-description">
                                                    Verificatie codes zijn verzonden via SMS
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
                                                    Uitschakelen
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="button button-primary button-sm"
                                                    onClick={() => setupAuth2FA(provider_type.type)}>
                                                    <em className="mdi mdi-shield-check-outline icon-start" />
                                                    Inschakelen
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="profile-content-header clearfix">
                        <h3 className="profile-content-title">Instellingen</h3>
                    </div>

                    <div className="block block-auth-2fa">
                        <form className="form form-compact" onSubmit={form.submit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="auth_2fa_remember_ip">
                                    Onthoud IP-adres
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
                                    />
                                ) : (
                                    <input
                                        className="form-control"
                                        disabled={true}
                                        value={auth2FARememberIpOptions?.[0]?.name}
                                    />
                                )}
                                {auth2FAState.auth_2fa_forget_force.voucher && (
                                    <div className="form-hint">
                                        Er zijn één of meerdere vouchers van een fonds die deze instelling beperken
                                    </div>
                                )}

                                {auth2FAState.auth_2fa_forget_force.organization && (
                                    <div className="form-hint">
                                        Deze instellingen kunnen niet worden aangepast vanwege de voorwaarden die door
                                        de gemeente zijn gesteld
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <button className="button button-primary button-sm" type="submit">
                                    Bevestigen
                                </button>
                            </div>
                        </form>
                    </div>
                </Fragment>
            )}
        </BlockShowcaseProfile>
    );
}
