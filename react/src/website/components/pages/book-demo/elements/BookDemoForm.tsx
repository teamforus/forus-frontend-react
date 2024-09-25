import React, { Fragment, useState } from 'react';
import CheckboxControl from '../../../../../dashboard/components/elements/forms/controls/CheckboxControl';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import FormError from '../../../../../dashboard/components/elements/forms/errors/FormError';
import SelectControl from '../../../../../dashboard/components/elements/select-control/SelectControl';
import SelectControlOptions from '../../../../../dashboard/components/elements/select-control/templates/SelectControlOptions';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import { CountryCallingCode, getCountries, getPhoneCode } from 'libphonenumber-js';
import countries from 'i18n-iso-countries';
import countriesEn from 'i18n-iso-countries/langs/en.json';
import useFormBuilder from '../../../../../dashboard/hooks/useFormBuilder';
import { ResponseError } from '../../../../../dashboard/props/ApiResponses';
import { useContactService } from '../../../../services/ContactService';

countries.registerLocale(countriesEn);

const getCountryOptions = () => {
    return getCountries()
        .map((code) => ({ code: code, name: countries.getName(code, 'en'), dialCode: getPhoneCode(code) }))
        .map((option) => (option.name ? { ...option, name: `+${option.dialCode}` } : null))
        .filter((option) => option);
};

export default function BookDemoForm() {
    const assetUrl = useAssetUrl();

    const contactService = useContactService();

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formSubmitFailed, setFormSubmitFailed] = useState(false);

    const [countryOptions] = useState(getCountryOptions);
    const [dialCode, setDialCode] = useState<CountryCallingCode>(
        countryOptions.find((country) => country.code == 'NL').dialCode,
    );

    const form = useFormBuilder(
        {
            name: '',
            email: '',
            organization_name: '',
            phone: '',
            message: '',
            accept_product_update_terms: false,
            accept_privacy_terms: false,
        },
        (values) => {
            contactService
                .send({ ...values, phone: `+${dialCode}${values.phone}` })
                .then(() => {
                    setFormSubmitFailed(false);
                    form.setErrors(null);
                })
                .catch((res: ResponseError) => {
                    form.setErrors(res.data.errors);

                    if (res.status != 422) {
                        setFormSubmitFailed(true);
                    }
                })
                .finally(() => {
                    setFormSubmitted(true);
                    form.setIsLocked(false);
                });
        },
    );

    return (
        <Fragment>
            <div className="block-contact-form-info block-contact-form-book-demo">
                <div className="block-contact-form-label">Bekijk ons platform in actie</div>
                <div className="block-contact-form-title">Klaar om uw impact te vergroten?</div>
                <div className="block-contact-form-description">
                    Vul het formulier in en wij nemen contact met u op om een afspraak te maken voor een kennismaking
                    met onze adviseurs en het platform.
                </div>
            </div>

            {(!formSubmitted || form.errors) && (
                <div className="block-contact-form-main">
                    <div className="block-contact-form-title">Wij plannen graag een afspraak om kennis te maken</div>

                    <form className="form" onSubmit={form.submit}>
                        <div className="form-group">
                            <label className="form-label form-label-required">Naam</label>
                            <input
                                className="form-control"
                                type="text"
                                value={form.values.name || ''}
                                onChange={(e) => form.update({ name: e.target.value })}
                                placeholder="Voor- en achternaam"
                            />
                            <FormError error={form.errors?.name} />
                        </div>
                        <div className="form-group">
                            <label className="form-label form-label-required">E-mail</label>
                            <input
                                className="form-control"
                                type="text"
                                value={form.values.email || ''}
                                onChange={(e) => form.update({ email: e.target.value })}
                                placeholder="E-mailadres"
                            />
                            <FormError error={form.errors?.email} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Telefoon</label>
                            <div className="flex">
                                <SelectControl
                                    className="select-control-country-codes"
                                    value={dialCode}
                                    propKey={'dialCode'}
                                    options={countryOptions}
                                    allowSearch={true}
                                    onChange={(dialCode: CountryCallingCode) => setDialCode(dialCode)}
                                    optionsComponent={SelectControlOptions}
                                />
                                <input
                                    className="form-control"
                                    type="text"
                                    value={form.values.phone || ''}
                                    onChange={(e) => form.update({ phone: e.target.value })}
                                    placeholder="Telefoonnummer"
                                />
                            </div>
                            <FormError error={form.errors?.phone} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Organisatie</label>
                            <input
                                className="form-control"
                                type="text"
                                value={form.values.organization_name || ''}
                                onChange={(e) => form.update({ organization_name: e.target.value })}
                                placeholder="Naam van organisatie"
                            />
                            <FormError error={form.errors?.organization_name} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                Heeft u specifieke vragen die we mee kunnen nemen tijdens de demonstratie?
                            </label>
                            <textarea
                                className="form-control"
                                value={form.values.message || ''}
                                onChange={(e) => form.update({ message: e.target.value })}
                                placeholder="Bericht"
                            />
                            <FormError error={form.errors?.message} />
                        </div>
                        <div className="form-group">
                            <CheckboxControl
                                className={'checkbox-narrow'}
                                checked={form.values.accept_product_update_terms}
                                title={`Ik ga akkoord met het ontvangen van product updates, nieuwsbrieven en andere marketingcommunicatie van Forus.`}
                                onChange={(e) => {
                                    form.update({
                                        accept_product_update_terms: e.target.checked,
                                    });
                                }}
                            />
                            <FormError error={form.errors?.accept_product_update_terms} />
                        </div>
                        <div className="form-group last-child">
                            <CheckboxControl
                                className={'checkbox-narrow'}
                                checked={form.values.accept_privacy_terms}
                                onChange={(e) => {
                                    form.update({
                                        accept_privacy_terms: e.target.checked,
                                    });
                                }}>
                                <div className="form-label form-label-required">
                                    Ik geef toestemming aan Forus om mijn persoonsgegevens op te slaan en te verwerken.
                                    <StateNavLink name="privacy" className="checkbox-label">
                                        *Privacyverklaring
                                    </StateNavLink>
                                </div>
                            </CheckboxControl>
                            <FormError error={form.errors?.accept_privacy_terms} />
                        </div>
                        <button
                            type={'submit'}
                            className="button button-primary"
                            disabled={!form.values.name || !form.values.email}>
                            Verzenden
                        </button>
                    </form>
                </div>
            )}

            {formSubmitted && !form.errors && (
                <Fragment>
                    {!formSubmitFailed ? (
                        <div className="block-contact-form-success">
                            <div className="block-contact-form-success-icon">
                                <img src={assetUrl('/assets/img/form-submit-succes.svg')} alt="" />
                            </div>
                            <div className="block-contact-form-success-title">
                                Bedankt voor het invullen van het formulier
                            </div>
                            <div className="block-contact-form-success-description">
                                We nemen zo snel mogelijk contact met u op.
                            </div>
                            <StateNavLink name={'home'} className="button button-primary">
                                Naar home
                            </StateNavLink>
                        </div>
                    ) : (
                        <div className="block-contact-form-error">
                            <div className="block-contact-form-success-icon">
                                <img src={assetUrl('/assets/img/form-submit-fail.svg')} alt="" />
                            </div>
                            <div className="block-contact-form-error-title">Er is iets misgegaan</div>
                            <div className="block-contact-form-error-description">Probeer het alstublieft opnieuw.</div>
                            <div className="button-group">
                                <button className="button button-dark" onClick={() => setFormSubmitted(false)}>
                                    Opnieuw proberen
                                </button>
                                <StateNavLink name={'home'} className="button button-primary">
                                    Naar home
                                </StateNavLink>
                            </div>
                        </div>
                    )}
                </Fragment>
            )}
        </Fragment>
    );
}
