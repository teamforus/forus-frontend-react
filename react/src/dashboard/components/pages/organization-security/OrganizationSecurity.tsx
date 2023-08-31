import React, { useContext, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import useFormBuilder from '../../../hooks/useFormBuilder';
import FormError from '../../elements/forms/errors/FormError';
import { useOrganizationService } from '../../../services/OrganizationService';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import { mainContext } from '../../../contexts/MainContext';
import useSetProgress from '../../../hooks/useSetProgress';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';

export default function OrganizationSecurity() {
    const activeOrganization = useActiveOrganization();
    const [viewType, setViewType] = useState('employees');
    const organizationService = useOrganizationService();
    const { setActiveOrganization } = useContext(mainContext);

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const [auth2FARequiredOptions] = useState([
        {
            value: 'optional',
            name: 'Optioneel',
        },
        {
            value: 'required',
            name: 'Verplicht',
        },
    ]);

    const [auth2FARememberIpOptions] = useState([
        {
            value: 0,
            name: 'Altijd bevestiging vereisen met 2FA',
        },
        {
            value: 1,
            name: 'Als IP-adres in de afgelopen 48 uur gebruikt, geen 2FA vereisen.',
        },
    ]);

    const [auth2FAFundsRequiredOptions] = useState([
        {
            value: 'optional',
            name: 'Optioneel',
        },
        {
            value: 'restrict_features',
            name: '2FA vereisen voor geselecteerde functies',
        },
        {
            value: 'required',
            name: '2FA vereisen om in te loggen',
        },
    ]);

    const form = useFormBuilder(
        {
            auth_2fa_policy: activeOrganization.auth_2fa_policy,
            auth_2fa_remember_ip: activeOrganization.auth_2fa_remember_ip ? 1 : 0,
            auth_2fa_funds_policy: activeOrganization.auth_2fa_funds_policy,
            auth_2fa_funds_remember_ip: activeOrganization.auth_2fa_funds_remember_ip ? 1 : 0,
            auth_2fa_funds_restrict_emails: activeOrganization.auth_2fa_funds_restrict_emails,
            auth_2fa_funds_restrict_auth_sessions: activeOrganization.auth_2fa_funds_restrict_auth_sessions,
            auth_2fa_funds_restrict_reimbursements: activeOrganization.auth_2fa_funds_restrict_reimbursements,
        },
        () => {
            setProgress(0);

            organizationService
                .update(activeOrganization.id, form.values)
                .then(
                    (e) => {
                        pushSuccess('Opgeslagen!');
                        setActiveOrganization(e.data.data);
                    },
                    (err) => {
                        pushDanger('Error!', err.data?.message || 'Onbekende foutmelding.');
                        form.setErrors(err.data.errors);
                    },
                )
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    return (
        <>
            <div>
                <div className="block block-breadcrumbs">
                    <StateNavLink className="breadcrumb-item" name={'organizations'} params={{}}>
                        {activeOrganization.name}
                    </StateNavLink>
                    <div className="breadcrumb-item active">Beveiliging</div>
                </div>
                <div className="card">
                    <form className="form" onSubmit={form.submit}>
                        <div className="card-header">
                            <div className="flex-row">
                                <div className="flex flex-grow">
                                    {viewType == 'employees' && (
                                        <div className="card-title">Tweefactorauthenticatie voor medewerkers</div>
                                    )}
                                    {viewType == 'funds' && (
                                        <div className="card-title">Tweefactorauthenticatie voor fondsen</div>
                                    )}
                                </div>
                                <div className="flex">
                                    <div className="block block-inline-filters">
                                        <div className="flex">
                                            <div>
                                                <div className="block block-label-tabs pull-right">
                                                    <div className="label-tab-set">
                                                        <div
                                                            className={`label-tab label-tab-sm ${
                                                                viewType == 'employees' ? 'active' : ''
                                                            }`}
                                                            onClick={() => setViewType('employees')}>
                                                            Medewerkers
                                                        </div>
                                                        <div
                                                            className={`label-tab label-tab-sm ${
                                                                viewType == 'funds' ? 'active' : ''
                                                            }`}
                                                            onClick={() => setViewType('funds')}>
                                                            Fondsen
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {viewType == 'employees' && (
                            <div className="card-section card-section-primary">
                                <div className="row">
                                    <div className="col col-lg-9 col-xs-12">
                                        <div className="form-group form-group-inline">
                                            {' '}
                                            <label className="form-label">2FA beperkingen</label>
                                            <div className="form-offset">
                                                <SelectControl
                                                    className="form-control"
                                                    propKey="value"
                                                    allowSearch={false}
                                                    value={form.values.auth_2fa_policy}
                                                    options={auth2FARequiredOptions}
                                                    optionsComponent={SelectControlOptions}
                                                    onChange={(
                                                        auth_2fa_policy: 'optional' | 'required' | 'restrict_features',
                                                    ) => form.update({ auth_2fa_policy })}
                                                />
                                            </div>
                                            <FormError error={form.errors.auth_2fa_policy} />
                                        </div>
                                        {form.values.auth_2fa_policy == 'required' && (
                                            <div className="form-group form-group-inline">
                                                <label className="form-label">Onthoud IP-adres</label>
                                                <div className="form-offset">
                                                    <SelectControl
                                                        className="form-control"
                                                        propKey="value"
                                                        allowSearch={false}
                                                        value={form.values.auth_2fa_remember_ip}
                                                        options={auth2FARememberIpOptions}
                                                        optionsComponent={SelectControlOptions}
                                                        onChange={(auth_2fa_remember_ip: 1 | 0) =>
                                                            form.update({ auth_2fa_remember_ip })
                                                        }
                                                    />
                                                </div>
                                                <FormError error={form.errors.auth_2fa_remember_ip} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {viewType == 'funds' && (
                            <div className="card-section card-section-primary">
                                <div className="row">
                                    <div className="col col-lg-9 col-xs-12">
                                        <div className="form-group form-group-inline">
                                            <label className="form-label">2FA beperkingen</label>
                                            <div className="form-offset">
                                                <SelectControl
                                                    className="form-control"
                                                    propKey="value"
                                                    allowSearch={false}
                                                    value={form.values.auth_2fa_funds_policy}
                                                    options={auth2FAFundsRequiredOptions}
                                                    onChange={(
                                                        auth_2fa_funds_policy:
                                                            | 'optional'
                                                            | 'required'
                                                            | 'restrict_features',
                                                    ) => form.update({ auth_2fa_funds_policy })}
                                                    optionsComponent={SelectControlOptions}
                                                />
                                            </div>
                                            <FormError error={form.errors?.auth_2fa_funds_policy} />
                                        </div>
                                        {form.values.auth_2fa_funds_policy == 'required' && (
                                            <div className="form-group form-group-inline">
                                                <label className="form-label">Onthoud IP-adres</label>
                                                <div className="form-offset">
                                                    <SelectControl
                                                        className="form-control"
                                                        propKey="value"
                                                        allowSearch={false}
                                                        value={form.values.auth_2fa_funds_remember_ip}
                                                        onChange={(auth_2fa_funds_remember_ip: 1 | 0) =>
                                                            form.update({ auth_2fa_funds_remember_ip })
                                                        }
                                                        options={auth2FARememberIpOptions}
                                                        optionsComponent={SelectControlOptions}
                                                    />
                                                </div>
                                                <FormError error={form.errors?.auth_2fa_funds_remember_ip} />
                                            </div>
                                        )}

                                        {form.values.auth_2fa_funds_policy == 'restrict_features' && (
                                            <div className="form-group form-group-inline">
                                                <label className="form-label">&nbsp;</label>
                                                <div className="form-offset">
                                                    <div>
                                                        <CheckboxControl
                                                            title={'Aanpassen van e-mailadres'}
                                                            checked={form.values.auth_2fa_funds_restrict_emails}
                                                            onChange={(_, checked) =>
                                                                form.update({ auth_2fa_funds_restrict_emails: checked })
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <CheckboxControl
                                                            title={'Aanpassen van inlog sessies'}
                                                            checked={form.values.auth_2fa_funds_restrict_auth_sessions}
                                                            onChange={(_, checked) =>
                                                                form.update({
                                                                    auth_2fa_funds_restrict_auth_sessions: checked,
                                                                })
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <CheckboxControl
                                                            title={'Indienen van declaraties'}
                                                            checked={form.values.auth_2fa_funds_restrict_reimbursements}
                                                            onChange={(_, checked) =>
                                                                form.update({
                                                                    auth_2fa_funds_restrict_reimbursements: checked,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card-section card-section-primary">
                            <div className="text-center">
                                <StateNavLink
                                    name={'employees'}
                                    className="button button-default"
                                    params={{ organizationId: activeOrganization.id }}>
                                    Annuleer
                                </StateNavLink>
                                <button className="button button-primary" type="submit">
                                    Bevestig
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
