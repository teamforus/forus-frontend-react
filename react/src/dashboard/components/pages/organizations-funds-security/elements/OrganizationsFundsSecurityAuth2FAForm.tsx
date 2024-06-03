import React, { Fragment, useState } from 'react';
import CheckboxControl from '../../../elements/forms/controls/CheckboxControl';
import FormError from '../../../elements/forms/errors/FormError';
import SelectControl from '../../../elements/select-control/SelectControl';
import SelectControlOptions from '../../../elements/select-control/templates/SelectControlOptions';

type Auth2FAValues = {
    auth_2fa_policy?: 'optional' | 'required' | 'restrict_features' | 'global';
    auth_2fa_remember_ip?: boolean;
    auth_2fa_restrict_emails?: boolean;
    auth_2fa_restrict_auth_sessions?: boolean;
    auth_2fa_restrict_bi_connections?: boolean;
    auth_2fa_restrict_reimbursements?: boolean;
};

export default function OrganizationsFundsSecurityAuth2FAForm({
    formValues,
    setFormValues,
    formErrors,
    disabled = false,
}: {
    formValues: Auth2FAValues;
    setFormValues: (values: Auth2FAValues) => void;
    formErrors?: {
        auth_2fa_remember_ip?: string;
        auth_2fa_restrict_emails?: string;
        auth_2fa_restrict_auth_sessions?: string;
        auth_2fa_restrict_bi_connections?: string;
        auth_2fa_restrict_reimbursements?: string;
    };
    disabled: boolean;
}) {
    const [auth2FARememberIpOptions] = useState([
        { value: false, name: 'Altijd bevestiging vereisen met 2FA' },
        { value: true, name: 'Als IP-adres in de afgelopen 48 uur gebruikt, geen 2FA vereisen.' },
    ]);

    return (
        <Fragment>
            {formValues?.auth_2fa_policy == 'required' && (
                <div className="form-group form-group-inline">
                    <div className="form-label">Onthoud IP-adres</div>
                    <div className="form-offset">
                        <SelectControl
                            className="form-control"
                            propKey={'value'}
                            allowSearch={false}
                            value={formValues.auth_2fa_remember_ip}
                            options={auth2FARememberIpOptions}
                            optionsComponent={SelectControlOptions}
                            disabled={disabled}
                            onChange={(auth_2fa_remember_ip: boolean) =>
                                setFormValues({ ...formValues, auth_2fa_remember_ip: auth_2fa_remember_ip })
                            }
                        />
                    </div>
                    <FormError error={formErrors?.auth_2fa_remember_ip} />
                </div>
            )}

            <div className="form-group form-group-inline">
                <div className="form-label"></div>
                <div className="form-offset">
                    <div>
                        {formValues?.auth_2fa_policy == 'restrict_features' && (
                            <CheckboxControl
                                title={'Aanpassen van e-mailadres'}
                                checked={formValues?.auth_2fa_restrict_emails}
                                disabled={disabled}
                                onChange={(e) =>
                                    setFormValues({ ...formValues, auth_2fa_restrict_emails: e.target.checked })
                                }
                            />
                        )}
                    </div>

                    <div>
                        {formValues?.auth_2fa_policy == 'restrict_features' && (
                            <CheckboxControl
                                title={'Aanpassen van inlog sessies'}
                                checked={formValues?.auth_2fa_restrict_auth_sessions}
                                disabled={disabled}
                                onChange={(e) =>
                                    setFormValues({
                                        ...formValues,
                                        auth_2fa_restrict_auth_sessions: e.target.checked,
                                    })
                                }
                            />
                        )}
                    </div>

                    <div>
                        {formValues?.auth_2fa_policy == 'restrict_features' && (
                            <CheckboxControl
                                title={'Indienen van declaraties'}
                                checked={formValues?.auth_2fa_restrict_reimbursements}
                                disabled={disabled}
                                onChange={(e) =>
                                    setFormValues({
                                        ...formValues,
                                        auth_2fa_restrict_reimbursements: e.target.checked,
                                    })
                                }
                            />
                        )}
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
