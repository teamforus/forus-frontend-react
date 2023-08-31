import React, { useCallback, useEffect, useState } from 'react';
import { useIdentity2FAService } from '../../../services/Identity2FAService';
import Identity2FAState from '../../../props/models/Identity2FAState';
import useOpenModal from '../../../hooks/useOpenModal';
import SelectControl from '../../elements/select-control/SelectControl';
import useFormBuilder from '../../../hooks/useFormBuilder';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import useSetProgress from '../../../hooks/useSetProgress';
import Modal2FASetup from '../../modals/Modal2FASetup';
import Modal2FADeactivate from '../../modals/Modal2FADeactivate';

export default function Security2FA() {
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const identity2FAService = useIdentity2FAService();
    const [auth2FAState, setAuth2FAState] = useState<Identity2FAState>(null);

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
            .then(
                (res) => {
                    setAuth2FAState(res.data.data);
                    pushSuccess('Opgeslagen!');
                },
                (res) => {
                    form.setErrors(res.data.errors);
                    pushDanger('Error', res.data?.message || 'Onbekende foutmelding.');
                },
            )
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
            .then(
                (res) => setAuth2FAState(res.data.data),
                (err) => pushDanger('Error!', err.data?.message || 'Unknown error.'),
            )
            .finally(() => setProgress(100));
    }, [identity2FAService, setProgress, pushDanger]);

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

    if (!auth2FAState || !form.values) {
        return <LoadingCard />;
    }

    return (
        <div className="block block-auth-2fa">
            {auth2FAState?.provider_types.map((provider_type) => (
                <div key={provider_type.type} className="auth-2fa-item">
                    <div className="auth-2fa-item-icon">
                        {provider_type.type == 'authenticator' && <div className="mdi mdi-cellphone-key" />}
                        {provider_type.type == 'phone' && <div className="mdi mdi-cellphone-message" />}
                    </div>

                    <div className="auth-2fa-item-title">{provider_type.title}</div>

                    <div className="auth-2fa-item-label">
                        <div className="label-group">
                            {!auth2FAState.active_providers
                                .map((auth_2fa) => auth_2fa.provider_type.type)
                                .includes(provider_type.type) && (
                                <div className="label label-default">Uitgeschakeld</div>
                            )}

                            {auth2FAState.active_providers
                                .map((auth_2fa) => auth_2fa.provider_type.type)
                                .includes(provider_type.type) && (
                                <div className="label label-success">Ingeschakeld</div>
                            )}
                        </div>
                    </div>

                    <div className="auth-2fa-item-space" />

                    <div className="auth-2fa-item-actions">
                        <div className="button-group">
                            {!auth2FAState.active_providers
                                .map((auth_2fa) => auth_2fa.provider_type.type)
                                .includes(provider_type.type) && (
                                <div className="button button-primary" onClick={() => setupAuth2FA(provider_type.type)}>
                                    <em className="mdi mdi-shield-check-outline icon-start" />
                                    Inschakelen
                                </div>
                            )}

                            {auth2FAState.active_providers
                                .map((auth_2fa) => auth_2fa.provider_type.type)
                                .includes(provider_type.type) && (
                                <div
                                    className="button button-default"
                                    onClick={() => deactivateAuth2FA(provider_type.type)}>
                                    <em className="mdi mdi-lock-open-outline icon-start" />
                                    Uitschakelen
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            <div className="card">
                <form className="form form-compact" onSubmit={form.submit}>
                    <div className="card-header">
                        <div className="card-title">Instellingen</div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="form-group">
                            <label className="form-label" htmlFor="select_organization">
                                Onthoud IP-adres
                            </label>
                            {!auth2FAState.auth_2fa_forget_force.voucher &&
                            !auth2FAState.auth_2fa_forget_force.organization ? (
                                <SelectControl
                                    propKey={'value'}
                                    options={auth2FARememberIpOptions}
                                    value={form.values.auth_2fa_remember_ip}
                                    allowSearch={false}
                                    onChange={(auth_2fa_remember_ip: 0 | 1) =>
                                        form.update({ auth_2fa_remember_ip: auth_2fa_remember_ip })
                                    }
                                    optionsComponent={SelectControlOptions}
                                />
                            ) : (
                                <input
                                    className="form-control"
                                    disabled={true}
                                    value={auth2FARememberIpOptions[0]?.name}
                                />
                            )}

                            {auth2FAState.auth_2fa_forget_force.voucher && (
                                <div className="form-hint">
                                    Je hebt een voucher die tweefactorauthenticatie verplicht stelt
                                </div>
                            )}

                            {auth2FAState.auth_2fa_forget_force.organization && (
                                <div className="form-hint">
                                    Deze instellingen kunnen niet worden aangepast vanwege de voorwaarden die door de
                                    organisatie zijn gesteld
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card-section card-section-primary text-center">
                        <button className="button button-primary" type="submit">
                            Bevestig
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
