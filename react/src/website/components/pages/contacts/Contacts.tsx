import React, { Fragment, useEffect, useState } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useAssetUrl from '../../../hooks/useAssetUrl';
import BlockDashedSeparator from '../home/elements/BlockDashedSeparator';
import useSetMetaDescription from '../../../hooks/useSetMetaDescription';
import { GoogleMap } from '../../../../dashboard/components/elements/google-map/GoogleMap';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useFormBuilder from '../../../../dashboard/hooks/useFormBuilder';
import CheckboxControl from '../../../../dashboard/components/elements/forms/controls/CheckboxControl';
import { useContactService } from '../../../services/ContactService';
import { ResponseError } from '../../../../dashboard/props/ApiResponses';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import FormError from '../../../../dashboard/components/elements/forms/errors/FormError';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import SelectControlOptions from '../../../../dashboard/components/elements/select-control/templates/SelectControlOptions';
import { CountryCallingCode, getCountries, getPhoneCode } from 'libphonenumber-js';
import countries from 'i18n-iso-countries';
import countriesEn from 'i18n-iso-countries/langs/en.json';
import BackgroundCircles from '../../elements/BackgroundCircles';

countries.registerLocale(countriesEn);

const getCountryOptions = () => {
    return getCountries()
        .map((code) => ({ code: code, name: countries.getName(code, 'en'), dialCode: getPhoneCode(code) }))
        .map((option) => (option.name ? { ...option, name: `+${option.dialCode}` } : null))
        .filter((option) => option);
};

export default function Contacts() {
    const assetUrl = useAssetUrl();
    const setTitle = useSetTitle();
    const appConfigs = useAppConfigs();
    const setMetaDescription = useSetMetaDescription();

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
                .send(values)
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

    useEffect(() => {
        setTitle('Ons verhaal | Verbinden en bijdragen aan sociale initiatieven');
        setMetaDescription(
            [
                'Forus is het platform voor sociale initiatieven. ',
                'Samen met overheidsorganisaties en goede doelen vergroten we sociale impact - for us all, by us all.',
            ].join(''),
        );
    }, [setMetaDescription, setTitle]);

    useEffect(() => {
        if (!appConfigs) {
            return;
        }
    }, [appConfigs]);

    return (
        <Fragment>
            <BackgroundCircles mainStyles={{ height: '700px' }} />
            <div className="wrapper">
                <div className="block block-info block-info-contact">
                    <div className="block-info-banner">
                        <img src={assetUrl('/assets/img/contact-banner.jpg')} alt="Locatie van Forus in Groningen" />
                    </div>

                    <h2 className="block-info-title">Contact</h2>

                    <div className="block-info-description">
                        Heeft u vragen of opmerkingen? Neem gerust contact met ons op. We zijn hier om te helpen en
                        staan klaar om uw vragen te beantwoorden.
                    </div>
                </div>
            </div>

            <BlockDashedSeparator />

            <div className="wrapper">
                <div className="block block-contact-details">
                    <div className="block-contact-details-main-info">
                        <div className="block-contact-details-main-title">Contactgegevens</div>
                        <div className="block-contact-details-main-list">
                            <div className="block-contact-details-main-list-item">
                                <div className="block-contact-details-main-list-item-label">
                                    <em className="mdi mdi-phone-outline" />
                                    Telefoon
                                </div>
                                <div className="block-contact-details-main-list-item-value">+31 (0) 85 004 33 87</div>
                            </div>
                            <div className="block-contact-details-main-list-item">
                                <div className="block-contact-details-main-list-item-label">
                                    <em className="mdi mdi-email-outline" />
                                    E-mail
                                </div>
                                <div className="block-contact-details-main-list-item-value">info@forus.io</div>
                            </div>
                            <div className="block-contact-details-main-list-item">
                                <div className="block-contact-details-main-list-item-label">
                                    <em className="mdi mdi-map-marker-outline" />
                                    Adres
                                </div>
                                <div className="block-contact-details-main-list-item-value">
                                    Verlengde Hereweg 161, 9721 AN Groningen, Nederland
                                </div>
                            </div>
                            <div className="block-contact-details-main-list-item">
                                <div className="block-contact-details-main-list-item-label">
                                    <em className="mdi mdi-share-variant" />
                                    Social
                                </div>
                                <div className="block-contact-details-main-info-social">
                                    <a
                                        href="https://nl.linkedin.com/company/stichtingforus"
                                        className="icon-social icon-linkedin"
                                        target="_blank"
                                        rel="noreferrer"
                                    />
                                    <a
                                        href="https://discord.forus.io"
                                        className="icon-social icon-discord"
                                        target="_blank"
                                        rel="noreferrer"
                                    />
                                    <a
                                        href="https://github.com/teamforus"
                                        className="icon-social icon-github"
                                        target="_blank"
                                        rel="noreferrer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="block block-contact-map">
                        <GoogleMap
                            appConfigs={appConfigs}
                            mapPointers={[{ lat: '53.194366825847645', lon: '6.581381855274472' }]}
                            mapGestureHandling={'greedy'}
                            mapGestureHandlingMobile={'none'}
                            fullscreenPosition={window.google.maps.ControlPosition.TOP_RIGHT}
                        />
                        <div className="block-contact-map-circles block-contact-map-circles-top-right" />
                        <div className="block-contact-map-circles block-contact-map-circles-bottom-right" />
                        <div className="block-contact-map-circles block-contact-map-circles-bottom-left" />
                    </div>
                </div>

                <div className="block block-support">
                    <div className="block-support-title">Support</div>
                    <div className="block-support-description">
                        Heeft u vragen over het systeem? U kunt hulp aanvragen via chat, telefoon, e-mail, of ons
                        Helpcentrum raadplegen. We zijn bereikbaar op maandag t/m vrijdag van 09.00 uur tot 17.00 uur.
                    </div>
                    <div className="block-support-contact">
                        <div className="block-support-contact-item">
                            <div className="block-support-contact-item-icon icon-chat" />
                            <div className="block-support-contact-item-main">
                                <div className="block-support-contact-item-label">Chat</div>
                                <div className="block-support-contact-item-value link">
                                    <a href={appConfigs.fronts.url_sponsor} target="_blank" rel="noreferrer">
                                        Ga naar de beheeromgeving
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="block-support-contact-item">
                            <div className="block-support-contact-item-icon icon-phone" />
                            <div className="block-support-contact-item-main">
                                <div className="block-support-contact-item-label">Telefoon</div>
                                <div className="block-support-contact-item-value">+31 (0) 85 004 33 87</div>
                            </div>
                        </div>

                        <div className="block-support-contact-item">
                            <div className="block-support-contact-item-icon icon-email" />
                            <div className="block-support-contact-item-main">
                                <div className="block-support-contact-item-label">E-mail</div>
                                <div className="block-support-contact-item-value link">support@forus.io</div>
                            </div>
                        </div>

                        <div className="block-support-contact-item">
                            <div className="block-support-contact-item-icon icon-help-center" />
                            <div className="block-support-contact-item-main">
                                <div className="block-support-contact-item-label">Helpcentrum</div>
                                <div className="block-support-contact-item-value link">
                                    <a href="https://helpcentrum.forus.io/kb/nl/" target="_blank" rel="noreferrer">
                                        helpcentrum.forus.io
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="block block-contact-form">
                    <div className="block-contact-form-info">
                        <div className="block-contact-form-title">Contactformulier</div>
                        <div className="block-contact-form-description">
                            Ontdek wat Forus voor uw organisatie kan betekenen. Heeft u suggesties om het platform of de
                            app te optimaliseren? Wij horen het graag. Vul het contactformulier hieronder in en wij
                            nemen zo spoedig mogelijk contact met u op.
                        </div>
                    </div>

                    {(!formSubmitted || form.errors) && (
                        <div className="block-contact-form-main">
                            <div className="block-contact-form-circles block-contact-form-circles-top-right" />
                            <div className="block-contact-form-circles block-contact-form-circles-top-left" />
                            <div className="block-contact-form-circles block-contact-form-circles-bottom-left" />

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
                                    <label className="form-label">Bericht</label>
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
                                            Ik geef toestemming aan Forus om mijn persoonsgegevens op te slaan en te
                                            verwerken.
                                            <StateNavLink name="privacy" className="checkbox-label">
                                                *Privacyverklaring
                                            </StateNavLink>
                                        </div>
                                    </CheckboxControl>
                                    <FormError error={form.errors?.accept_privacy_terms} />
                                </div>
                                <button type={'submit'} className="button button-primary">
                                    Verzenden
                                </button>
                            </form>
                        </div>
                    )}

                    {formSubmitted && !form.errors && (
                        <Fragment>
                            {!formSubmitFailed ? (
                                <div className="block-contact-form-success">
                                    <div className="block-contact-form-circles block-contact-form-circles-top-right" />
                                    <div className="block-contact-form-circles block-contact-form-circles-top-left" />
                                    <div className="block-contact-form-circles block-contact-form-circles-bottom-left" />

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
                                    <div className="block-contact-form-circles block-contact-form-circles-top-right" />
                                    <div className="block-contact-form-circles block-contact-form-circles-top-left" />
                                    <div className="block-contact-form-circles block-contact-form-circles-bottom-left" />

                                    <div className="block-contact-form-success-icon">
                                        <img src={assetUrl('/assets/img/form-submit-fail.svg')} alt="" />
                                    </div>
                                    <div className="block-contact-form-error-title">Er is iets misgegaan</div>
                                    <div className="block-contact-form-error-description">
                                        Probeer het alstublieft opnieuw.
                                    </div>
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
                </div>
            </div>
        </Fragment>
    );
}
