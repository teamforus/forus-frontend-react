import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import ProgressStorage from '../../../helpers/ProgressStorage';
import useFormBuilder from '../../../hooks/useFormBuilder';
import { useIdentityService } from '../../../services/IdentityService';
import { ResponseError } from '../../../props/ApiResponses';
import { useOrganizationService } from '../../../services/OrganizationService';
import Organization from '../../../props/models/Organization';
import useAssetUrl from '../../../hooks/useAssetUrl';
import FormError from '../../elements/forms/errors/FormError';
import QrCode from '../../elements/qr-code/QrCode';
import UIControlText from '../../elements/forms/ui-controls/UIControlText';
import UIControlCheckbox from '../../elements/forms/ui-controls/UIControlCheckbox';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import { useBusinessTypeService } from '../../../services/BusinessTypeService';
import BusinessType from '../../../props/models/BusinessType';
import Tooltip from '../../elements/tooltip/Tooltip';
import EmailProviderLink from './elements/EmailProviderLink';
import PhotoSelector from '../../elements/photo-selector/PhotoSelector';
import { useMediaService } from '../../../services/MediaService';
import useOrganization from '../../../hooks/useOrganizations';
import { authContext } from '../../../contexts/AuthContext';
import AppLinks from '../../elements/app-links/AppLinks';

function Progress({ step, infoSteps, shownSteps }: { step: number; infoSteps: number; shownSteps?: Array<number> }) {
    return (
        <div className="sign_up-progress">
            <div
                className={`sign_up-step sign_up-step-info ${
                    step <= infoSteps ? 'sign_up-step-active' : 'sign_up-step-done'
                }`}>
                <div className="sign_up-step-border"></div>
                <div className="mdi mdi-information-outline"></div>
            </div>
            {shownSteps?.map((stepItem, index) => (
                <div
                    key={stepItem}
                    className={`sign_up-step ${step == stepItem + infoSteps ? 'sign_up-step-active' : ''} ${
                        step > stepItem + infoSteps ? 'sign_up-step-done' : ''
                    }`}>
                    <div className="sign_up-step-border"></div>
                    <div className="sign-up-step-block">Stap {index + 1}</div>
                </div>
            ))}
            <div className="sign_up-progress-overview">
                Stap {step} from {shownSteps?.length + 2}
            </div>
        </div>
    );
}

export default function SignUp() {
    const { t } = useTranslation();
    const assetUrl = useAssetUrl();
    const { setToken, token } = useContext(authContext);

    const navigate = useNavigate();
    const organizations = useOrganization();
    const mediaService = useMediaService();
    const identityService = useIdentityService();
    const organizationService = useOrganizationService();
    const businessTypeService = useBusinessTypeService();

    const [INFO_STEPS] = useState(2);

    const [STEP_INFO_GENERAL] = useState(1);
    const [STEP_INFO_DETAILS] = useState(2);

    const STEP_CREATE_PROFILE = useMemo(() => (token ? null : 3), [token]);
    const STEP_SELECT_ORGANIZATION = useMemo(() => (token ? 3 : 4), [token]);
    const STEP_ORGANIZATION_ADD = useMemo(() => (token ? 4 : 5), [token]);
    const STEP_SIGNUP_FINISHED = useMemo(() => (token ? 5 : 6), [token]);

    const shownSteps = useMemo(() => (token ? [1, 2, 3] : [1, 2, 3, 4]), [token]);

    const [businessTypes, setBusinessTypes] = useState<Array<BusinessType>>(null);
    const [orgMediaFile, setOrgMediaFile] = useState(null);
    const [progressStorage] = useState(new ProgressStorage('validator-sign_up'));

    const [step, setStep] = useState(STEP_INFO_GENERAL);
    const [organization, setOrganization] = useState(null);
    const [hasApp, setHasApp] = useState(null);
    const [authEmailSent, setAuthEmailSent] = useState(null);
    const [authEmailRestoreSent, setAuthEmailRestoreSent] = useState(null);
    const [authToken, setAuthToken] = useState(null);

    const [selectedOrganization, setSelectedOrganization] = useState<Organization>(null);
    const [organizationsList, setOrganizationsList] = useState<Array<Organization>>(null);

    const formSignUp = useFormBuilder(
        {
            email: '',
            target: 'newSignup',
            confirm: true,
        },
        (values) => {
            const resolveErrors = (res: ResponseError) => {
                formSignUp.setIsLocked(false);
                formSignUp.setErrors(res.data.errors);
            };

            return identityService.validateEmail(values).then((res) => {
                if (!res.data.email.used) {
                    identityService.make(values).then(
                        () => setAuthEmailSent(true),
                        (res) => resolveErrors(res),
                    );
                } else {
                    identityService.makeAuthEmailToken(values.email, 'newSignup').then(
                        () => setAuthEmailRestoreSent(true),
                        (res) => resolveErrors(res),
                    );
                }
            }, resolveErrors);
        },
    );

    const formOrganization = useFormBuilder(
        {
            name: '',
            kvk: '',
            btw: '',
            email: '',
            email_public: false,
            phone: '',
            phone_public: false,
            website: 'https://',
            website_public: false,
            iban: '',
            iban_confirmation: '',
            business_type_id: null,
            media_uid: null,
        },
        async (values) => {
            if (values && values.iban != values.iban_confirmation) {
                formOrganization.setIsLocked(false);
                formOrganization.setErrors({ iban_confirmation: [t('validation.iban_confirmation')] });
                return;
            }

            const data = JSON.parse(JSON.stringify(values));

            if (typeof data.iban === 'string') {
                data.iban = data.iban.replace(/\s/g, '');
            }

            const submit = () => {
                return organizationService.store(data).then(
                    (res) => {
                        setOrganizationValue(res.data.data);
                        makeOrganizationValidator(res.data.data);
                        goToStep(STEP_SIGNUP_FINISHED);
                    },
                    (res) => {
                        formOrganization.setErrors(res.data.errors);
                        formOrganization.setIsLocked(false);
                    },
                );
            };

            if (orgMediaFile) {
                await mediaService.store('organization_logo', orgMediaFile).then((res) => {
                    formOrganization.update({ media_uid: res.data.data.uid });
                    Object.assign(data, { media_uid: res.data.data.uid });
                    setOrgMediaFile(null);
                });
            }

            return submit();
        },
    );

    const formOrganizationUpdate = formOrganization.update;

    const loadOrganizations = useCallback(() => {
        return new Promise<Array<Organization>>((resolve, reject) =>
            organizationService.list().then((res) => {
                setOrganizationsList(res.data.data);
                resolve(res.data.data);
            }, reject),
        );
    }, [organizationService]);

    const goToStep = useCallback(
        (step: number) => {
            const stepsTotal = shownSteps?.length + INFO_STEPS;

            if (step <= stepsTotal) {
                setStep(step);
                progressStorage.set('step', step.toString());

                if (step == STEP_SELECT_ORGANIZATION) {
                    loadOrganizations().then((organizations) => {
                        if (organizations.length == 0) {
                            goToStep(STEP_ORGANIZATION_ADD);
                        }
                    });
                }

                if (step == STEP_ORGANIZATION_ADD && progressStorage.has('organizationForm')) {
                    formOrganizationUpdate(JSON.parse(progressStorage.get('organizationForm')));
                }

                if (step == STEP_CREATE_PROFILE) {
                    setHasApp(JSON.parse(progressStorage.get('hasApp', 'false')));
                }
            }

            // last step, time for progress cleanup
            if (step >= stepsTotal) {
                progressStorage.clear();
            }
        },
        [
            INFO_STEPS,
            STEP_CREATE_PROFILE,
            STEP_ORGANIZATION_ADD,
            STEP_SELECT_ORGANIZATION,
            formOrganizationUpdate,
            loadOrganizations,
            progressStorage,
            shownSteps?.length,
        ],
    );

    const fetchBusinessTypes = useCallback(() => {
        businessTypeService.list({ per_page: 9999 }).then((res) => {
            setBusinessTypes(res.data.data);
        });
    }, [businessTypeService]);

    const makeOrganizationValidator = useCallback(
        (organization) => {
            organizationService.updateRole(organization.id, { is_validator: true }).then();
        },
        [organizationService],
    );

    const setOrganizationValue = useCallback(
        (organization: Organization) => {
            setOrganization(organization);
            progressStorage.set('organizationForm', JSON.stringify(organization));
        },
        [progressStorage],
    );

    const selectOrganization = useCallback(
        (organization: Organization) => {
            setSelectedOrganization(organization);
            setOrganizationValue(organization);
            goToStep(STEP_SIGNUP_FINISHED);
            makeOrganizationValidator(organization);
        },
        [STEP_SIGNUP_FINISHED, goToStep, makeOrganizationValidator, setOrganizationValue],
    );

    const addOrganization = useCallback(() => {
        goToStep(STEP_ORGANIZATION_ADD);
    }, [STEP_ORGANIZATION_ADD, goToStep]);

    const cancelAddOrganization = useCallback(() => {
        goToStep(STEP_SELECT_ORGANIZATION);
    }, [STEP_SELECT_ORGANIZATION, goToStep]);

    const next = useCallback(
        function () {
            if (step == STEP_INFO_GENERAL) {
                goToStep(STEP_INFO_DETAILS);
            } else if (step == STEP_INFO_DETAILS) {
                if (!token) {
                    goToStep(STEP_CREATE_PROFILE);
                } else {
                    goToStep(STEP_SELECT_ORGANIZATION);
                }
            } else if (step == STEP_ORGANIZATION_ADD) {
                formOrganization.submit();
            } else {
                goToStep(step + 1);
            }
        },
        [
            formOrganization,
            STEP_CREATE_PROFILE,
            STEP_INFO_DETAILS,
            STEP_INFO_GENERAL,
            STEP_ORGANIZATION_ADD,
            STEP_SELECT_ORGANIZATION,
            token,
            goToStep,
            step,
        ],
    );

    const back = useCallback(() => {
        goToStep(step - 1);
    }, [goToStep, step]);

    const finish = useCallback(() => {
        navigate(getStateRouteUrl('organizations-view', { id: organization.id }));
    }, [navigate, organization?.id]);

    const selectPhoto = useCallback((file: File | Blob) => {
        setOrgMediaFile(file);
    }, []);

    const openAuthPopup = useCallback(() => {
        navigate(getStateRouteUrl('home'));
    }, [navigate]);

    useEffect(() => {
        fetchBusinessTypes();
    }, [fetchBusinessTypes]);

    useEffect(() => {
        let timer = null;
        progressStorage.set('hasApp', `${hasApp}`);

        if (!hasApp) {
            return;
        }

        const checkCallback = (access_token: string) => {
            identityService.checkAccessToken(access_token).then((res) => {
                if (res.data.message == 'active') {
                    setToken(access_token);
                    setHasApp(false);
                    progressStorage.set('step', '4');
                } else if (res.data.message == 'pending') {
                    timer = setTimeout(() => checkCallback(access_token), 2500);
                } else {
                    document.location.reload();
                }
            });
        };

        identityService.makeAuthToken().then((res) => {
            setAuthToken(res.data.auth_token);
            timer = window.setTimeout(() => checkCallback(res.data.access_token), 2500);
        }, console.error);

        return () => window.clearTimeout(timer);
    }, [STEP_SELECT_ORGANIZATION, hasApp, identityService, progressStorage, setToken]);

    useEffect(() => {
        const step = parseInt(progressStorage.get('step'));
        const stepsAvailable = token
            ? [
                  STEP_INFO_GENERAL,
                  STEP_INFO_DETAILS,
                  organizations ? STEP_SELECT_ORGANIZATION : null,
                  STEP_ORGANIZATION_ADD,
                  STEP_SIGNUP_FINISHED,
              ].filter((step) => step)
            : [STEP_INFO_GENERAL, STEP_INFO_DETAILS, STEP_CREATE_PROFILE, STEP_ORGANIZATION_ADD, STEP_SIGNUP_FINISHED];

        if (stepsAvailable.indexOf(step) === -1) {
            return goToStep(STEP_INFO_GENERAL);
        }

        goToStep(step);
    }, [
        STEP_CREATE_PROFILE,
        STEP_INFO_DETAILS,
        STEP_INFO_GENERAL,
        STEP_ORGANIZATION_ADD,
        STEP_SELECT_ORGANIZATION,
        STEP_SIGNUP_FINISHED,
        token,
        goToStep,
        organizations,
        progressStorage,
    ]);

    return (
        <div className="block block-sign_up">
            <div className="block-wrapper">
                <div className="sign_up-header">
                    <div className="sign_up-header-item flex-grow">
                        <NavLink to={getStateRouteUrl('home')} className="sign_up-header-item-button">
                            <em className="mdi mdi-chevron-left" />
                            Verlaat het formulier
                        </NavLink>
                    </div>
                    {!token && (
                        <div className="sign_up-header-item">
                            <a className="sign_up-header-item-button" onClick={openAuthPopup}>
                                Inloggen
                                <em className="mdi mdi-login icon-end" />
                            </a>
                        </div>
                    )}
                </div>

                <h2 className="block-title">{t('sign_up_validator.header.main_header')}</h2>

                {step == STEP_INFO_GENERAL && (
                    <Fragment>
                        <Progress infoSteps={INFO_STEPS} step={step} shownSteps={shownSteps} />

                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">{t('sign_up_validator.header.title_step_1')}</div>
                            <div className="sign_up-pane-body sign_up-pane-body-padless-bottom">
                                <div className="sign_up-pane-text">{t('sign_up_validator.header.subtitle_step_1')}</div>
                                <div className="sign_up-pane-media">
                                    <img src={assetUrl('/assets/img/sign_up_first_step.png')} alt={''} />
                                </div>
                            </div>
                            <div className="sign_up-pane-footer">
                                <div className="row">
                                    <div className="col col-lg-6 text-left">
                                        <div className="button button-text button-text-padless" />
                                    </div>
                                    <div className="col col-lg-6 text-right">
                                        <button
                                            type="button"
                                            className="button button-text button-text-padless"
                                            onClick={next}>
                                            {t('sign_up_validator.buttons.next')}
                                            <em className="mdi mdi-chevron-right icon-right" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Fragment>
                )}

                {step == STEP_INFO_DETAILS && (
                    <Fragment>
                        <Progress infoSteps={INFO_STEPS} step={step} shownSteps={shownSteps} />

                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">{t('sign_up_validator.header.title_step_2')}</div>
                            <div className="sign_up-pane-body">
                                <div className="sign_up-pane-media">
                                    <img src={assetUrl('/assets/img/icon-smartphone-sign_up.svg')} alt={''} />
                                </div>
                                <div className="sign_up-pane-text">{t('sign_up_validator.header.subtitle_step_2')}</div>
                            </div>
                            <div className="sign_up-pane-footer">
                                <div className="row">
                                    <div className="col col-lg-6 text-left">
                                        <div className="button button-text button-text-padless" onClick={back}>
                                            <em className="mdi mdi-chevron-left icon-left" />
                                            {t('sign_up_validator.buttons.back')}
                                        </div>
                                    </div>
                                    <div className="col col-lg-6 text-right">
                                        <div className="button button-text button-text-padless" onClick={next}>
                                            {t('sign_up_validator.buttons.next')}
                                            <em className="mdi mdi-chevron-right icon-right"> </em>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Fragment>
                )}

                {step == STEP_CREATE_PROFILE && (
                    <Fragment>
                        <Progress infoSteps={INFO_STEPS} step={step} shownSteps={shownSteps} />

                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">{t('sign_up_validator.header.title_step_3')}</div>
                            {!authEmailSent && !authEmailRestoreSent && !hasApp && (
                                <div className="sign_up-pane-body">
                                    <div className="sign_up-pane-heading">
                                        {t('sign_up_validator.header.subtitle_step_3')}
                                    </div>
                                    <div className="sign_up-pane-text">{t('sign_up_validator.labels.terms')}</div>
                                    <form className="form" onSubmit={formSignUp.submit}>
                                        <div className="row">
                                            <div className="col col-md-7 col-xs-12">
                                                <div className="form-group">
                                                    <label className="form-label">E-mailadres</label>
                                                    <UIControlText
                                                        value={formSignUp.values.email}
                                                        onChange={(e) => formSignUp.update({ email: e.target.value })}
                                                        className={'large'}
                                                        placeholder={'e-mail@e-mail.nl'}
                                                    />
                                                    <FormError
                                                        error={
                                                            formSignUp.errors.email ||
                                                            formSignUp.errors['records.primary_email']
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="col col-md-5 col-xs-12">
                                                <div className="form-group">
                                                    <label className="form-label">&nbsp;</label>
                                                    <button
                                                        type="submit"
                                                        className={`button button-primary button-fill ${
                                                            formSignUp.values.email ? '' : 'button-disabled'
                                                        }`}>
                                                        {t('sign_up_validator.app_instruction.create_profile')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    <div
                                        className="sign_up-pane-link visible-md visible-lg"
                                        onClick={() => setHasApp(true)}>
                                        {t('sign_up_sponsor.no_app.to_app')}
                                    </div>
                                </div>
                            )}
                            {!authEmailSent && !authEmailRestoreSent && hasApp && (
                                <div className="sign_up-pane-body">
                                    <div className="sign_up-pane-heading">{t('sign_up_validator.app.title')}</div>
                                    <div className="sign_up-pane-auth">
                                        <div className="sign_up-pane-auth-content">
                                            {t('sign_up_validator.app.description_top')
                                                ?.split('\n')
                                                ?.map((line, index) => (
                                                    <div key={index} className="sign_up-pane-text">
                                                        {line}
                                                    </div>
                                                ))}
                                            <div className="sign_up-pane-auth-qr_code visible-sm visible-xs">
                                                {authToken && (
                                                    <QrCode
                                                        logo={assetUrl('/assets/img/me-logo-react.png')}
                                                        value={JSON.stringify({ type: 'auth_token', value: authToken })}
                                                    />
                                                )}
                                            </div>
                                            {t('sign_up_validator.app.description_bottom')
                                                ?.split('\n')
                                                ?.map((line, index) => (
                                                    <div key={index} className="sign_up-pane-text">
                                                        {line}
                                                    </div>
                                                ))}
                                            <AppLinks />
                                        </div>
                                        <div className="sign_up-pane-auth-qr_code visible-md visible-lg">
                                            {authToken && (
                                                <QrCode
                                                    logo={assetUrl('/assets/img/me-logo-react.png')}
                                                    value={JSON.stringify({ type: 'auth_token', value: authToken })}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        className="sign_up-pane-link visible-md visible-lg"
                                        onClick={() => setHasApp(false)}>
                                        {t('sign_up_validator.app.no_app')}
                                    </div>
                                </div>
                            )}

                            {(authEmailSent || authEmailRestoreSent) && (
                                <div className="sign_up-pane-body text-center">
                                    <div className="sign_up-pane-media">
                                        <img src={assetUrl('/assets/img/email_confirmed.svg')} alt={''} />
                                    </div>
                                    <div className="sign_up-pane-heading sign_up-pane-heading-lg text-primary-mid">
                                        {t('sign_up_sponsor.labels.confirm_email')}
                                    </div>
                                    <div className="sign_up-pane-text">
                                        {t('sign_up_sponsor.labels.confirm_email_description')}
                                        <span className="sign_up-pane-link text-underline">
                                            &nbsp;{formSignUp.values.email}
                                        </span>
                                        <br />
                                        <br />
                                        <EmailProviderLink email={formSignUp.values?.email} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Fragment>
                )}

                {step == STEP_SELECT_ORGANIZATION && (
                    <Fragment>
                        <Progress infoSteps={INFO_STEPS} step={step} shownSteps={shownSteps} />

                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">{t('sign_up_validator.header.title_step_4')}</div>
                            <div className="sign_up-pane-body">
                                <div className="sign_up-pane-text">{t('sign_up_validator.header.subtitle_step_4')}</div>
                                <br />
                                <div className="sign_up-organizations">
                                    {organizationsList?.map((organization) => (
                                        <div
                                            key={organization.id}
                                            className={`sign_up-organization ${
                                                organization.id == selectedOrganization?.id ? 'active' : ''
                                            }`}
                                            onClick={() => selectOrganization(organization)}>
                                            <div className="sign_up-organization-logo">
                                                <img
                                                    src={
                                                        organization.logo?.sizes?.thumbnail ||
                                                        assetUrl('./assets/img/organization-no-logo.svg')
                                                    }
                                                    alt={''}
                                                />
                                            </div>
                                            <div className="sign_up-organization-title">{organization.name}</div>
                                        </div>
                                    ))}
                                </div>
                                <div
                                    className="button button-primary-outline button-fill visible-sm visible-xs"
                                    onClick={addOrganization}>
                                    <div className="mdi mdi-plus-circle-outline icon-start" />
                                    {t('sign_up_sponsor.buttons.organization_add')}
                                </div>
                            </div>
                            <div className="sign_up-pane-body visible-md visible-lg">
                                <div className="button button-primary-outline" onClick={addOrganization}>
                                    <div className="mdi mdi-plus-circle-outline icon-start" />
                                    {t('sign_up_sponsor.buttons.organization_add')}
                                </div>
                            </div>
                            <div className="sign_up-pane-footer">
                                <div className="row">
                                    <div className="col col-lg-6 text-left">
                                        <div className="button button-text button-text-padless" onClick={back}>
                                            <em className="mdi mdi-chevron-left icon-lefts" />
                                            {t('sign_up_validator.buttons.back')}
                                        </div>
                                    </div>
                                    <div className="col col-lg-6 text-right" />
                                </div>
                            </div>
                        </div>
                    </Fragment>
                )}

                {step == STEP_ORGANIZATION_ADD && (
                    <Fragment>
                        <Progress infoSteps={INFO_STEPS} step={step} shownSteps={shownSteps} />

                        <div className="sign_up-pane">
                            <form
                                className="form"
                                onSubmit={(e) => {
                                    e?.preventDefault();
                                    next();
                                }}>
                                <div className="sign_up-pane-header">{t('sign_up_validator.header.title_step_5')}</div>
                                <div className="sign_up-pane-body">
                                    <div className="sign_up-pane-text">
                                        {t('sign_up_validator.header.subtitle_step_5')}
                                    </div>
                                </div>
                                <div className="sign_up-pane-body sign_up-pane-body-padless">
                                    <div className="sign_up-pane-section">
                                        <div className="sign_up-pane-col sign_up-pane-col-2">
                                            <div className="form-group">
                                                <label className="form-label">
                                                    {t('organization_edit.labels.name')}
                                                </label>
                                                <UIControlText
                                                    value={formOrganization.values.name}
                                                    onChange={(e) => formOrganization.update({ name: e.target.value })}
                                                    placeholder={'Bedrijfsnaam'}
                                                />
                                                <FormError error={formOrganization.errors.name} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">
                                                    {t('organization_edit.labels.bank')}
                                                    <Tooltip
                                                        text={
                                                            'Vul hier het rekeningnummer in waar u de betalingen op wilt ontvangen'
                                                        }
                                                    />
                                                </label>
                                                <UIControlText
                                                    value={formOrganization.values.iban}
                                                    onChange={(e) => formOrganization.update({ iban: e.target.value })}
                                                    placeholder={'Voorbeeld: NL123456789B01'}
                                                />
                                                <FormError error={formOrganization.errors.iban} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">
                                                    HERHAAL IBAN–NUMMER
                                                    <Tooltip
                                                        text={
                                                            'Vul hier het rekeningnummer in waar u de betalingen op wilt ontvangen'
                                                        }
                                                    />
                                                </label>
                                                <UIControlText
                                                    value={formOrganization.values.iban_confirmation}
                                                    onChange={(e) =>
                                                        formOrganization.update({ iban_confirmation: e.target.value })
                                                    }
                                                    placeholder={'Voorbeeld: NL123456789B01'}
                                                />
                                                <FormError error={formOrganization.errors.iban_confirmation} />
                                            </div>
                                        </div>
                                        <div className="sign_up-pane-col sign_up-pane-col-1">
                                            <PhotoSelector
                                                type={'organization_logo'}
                                                template="photo-selector-sign_up"
                                                selectPhoto={selectPhoto}
                                                description={t('organization_edit.labels.photo_description')}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="sign_up-pane-body sign_up-pane-body-padless">
                                    <div className="sign_up-pane-section" style={{ paddingRight: '30px' }}>
                                        <div className="sign_up-pane-col">
                                            <div className="form-group">
                                                <label className="form-label">
                                                    {t('organization_edit.labels.mail')}
                                                </label>
                                                <div className="row">
                                                    <div className="col col-md-8 col-xs-12">
                                                        <UIControlText
                                                            value={formOrganization.values.email}
                                                            onChange={(e) =>
                                                                formOrganization.update({ email: e.target.value })
                                                            }
                                                            placeholder={'E-mailadres'}
                                                        />
                                                    </div>
                                                    <div className="col col-md-4 col-xs-12">
                                                        <UIControlCheckbox
                                                            id={'email_public_input'}
                                                            name="email_public"
                                                            className="make-public"
                                                            label={t('organization_edit.labels.make_public')}
                                                            checked={formOrganization.values.email_public}
                                                            onChange={(e) =>
                                                                formOrganization.update({
                                                                    email_public: e.target.checked,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <FormError error={formOrganization.errors.email} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">
                                                    {t('organization_edit.labels.phone')}
                                                </label>
                                                <div className="row">
                                                    <div className="col col-md-8 col-xs-12">
                                                        <UIControlText
                                                            value={formOrganization.values.phone}
                                                            onChange={(e) =>
                                                                formOrganization.update({ phone: e.target.value })
                                                            }
                                                            placeholder={'Telefoonnummer'}
                                                        />
                                                    </div>
                                                    <div className="col col-md-4 col-xs-12">
                                                        <UIControlCheckbox
                                                            id={'phone_public_input'}
                                                            name="phone_public"
                                                            className="make-public"
                                                            label={t('organization_edit.labels.make_public')}
                                                            checked={formOrganization.values.phone_public}
                                                            onChange={(e) =>
                                                                formOrganization.update({
                                                                    phone_public: e.target.checked,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <FormError error={formOrganization.errors.phone} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">
                                                    {t('organization_edit.labels.website')}
                                                </label>
                                                <div className="row">
                                                    <div className="col col-md-8 col-xs-12">
                                                        <UIControlText
                                                            value={formOrganization.values.website}
                                                            onChange={(e) =>
                                                                formOrganization.update({ website: e.target.value })
                                                            }
                                                            placeholder={'Website'}
                                                        />
                                                    </div>
                                                    <div className="col col-md-4 col-xs-12">
                                                        <UIControlCheckbox
                                                            id={'website_public_input'}
                                                            name="website_public"
                                                            className="make-public"
                                                            label={t('organization_edit.labels.make_public')}
                                                            checked={formOrganization.values.website_public}
                                                            onChange={(e) =>
                                                                formOrganization.update({
                                                                    website_public: e.target.checked,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <FormError error={formOrganization.errors.website} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="sign_up-pane-body sign_up-pane-body-padless">
                                    <div className="sign_up-pane-section" style={{ paddingRight: '30px' }}>
                                        <div className="sign_up-pane-col">
                                            <div className="form-group row">
                                                <div className="col col-md-8 col-xs-12">
                                                    <label className="form-label">
                                                        {t('organization_edit.labels.business_type')}
                                                    </label>
                                                    <div className="form-offset">
                                                        {businessTypes && (
                                                            <SelectControl
                                                                value={formOrganization.values.business_type_id}
                                                                propKey={'id'}
                                                                onChange={(business_type_id?: number) =>
                                                                    formOrganization.update({ business_type_id })
                                                                }
                                                                options={businessTypes}
                                                                placeholder={'Selecteer organisatie type...'}
                                                                optionsComponent={SelectControlOptions}
                                                            />
                                                        )}
                                                    </div>
                                                    <FormError error={formOrganization.errors.business_type_id} />
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <div className="col col-md-8 col-xs-12">
                                                    <label className="form-label">
                                                        {t('organization_edit.labels.kvk')}
                                                    </label>
                                                    <UIControlText
                                                        value={formOrganization.values.kvk}
                                                        onChange={(e) =>
                                                            formOrganization.update({ kvk: e.target.value })
                                                        }
                                                        placeholder={'KvK-nummer'}
                                                    />
                                                    <FormError error={formOrganization.errors.kvk} />
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <div className="col col-md-8 col-xs-12">
                                                    <label className="form-label">
                                                        {t('organization_edit.labels.tax')}
                                                    </label>
                                                    <UIControlText
                                                        value={formOrganization.values.btw}
                                                        onChange={(e) =>
                                                            formOrganization.update({ btw: e.target.value })
                                                        }
                                                        placeholder={'BTW-nummer'}
                                                    />
                                                    <div className="form-hint text-right">
                                                        {t('organization_edit.labels.optional')}
                                                    </div>
                                                    <FormError error={formOrganization.errors.btw} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="sign_up-pane-footer">
                                    <div className="row">
                                        <div className="col col-lg-6 text-left">
                                            <button
                                                type={'button'}
                                                className="button button-text button-text-padless"
                                                onClick={cancelAddOrganization}>
                                                <em className="mdi mdi-chevron-left icon-left" />
                                                {t('sign_up_validator.buttons.back')}
                                            </button>
                                        </div>
                                        <div className="col col-lg-6 text-right">
                                            <button type={'submit'} className="button button-text button-text-padless">
                                                {t('sign_up_validator.buttons.next')}
                                                <em className="mdi mdi-chevron-right icon-right" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </Fragment>
                )}

                {step == STEP_SIGNUP_FINISHED && (
                    <div className="finish-screen">
                        <Progress step={step} infoSteps={INFO_STEPS} shownSteps={shownSteps} />

                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">{t('sign_up_validator.header.title_step_6')}</div>
                            <div className="sign_up-pane-body">
                                <div className="text-center">
                                    <img src={assetUrl('/assets/img/sign_up_finished.svg')} alt={''} />
                                </div>
                                <div className="sign_up-pane-subtitle">
                                    {t('sign_up_validator.header.subtitle_step_6')}
                                </div>
                                <br />
                                <br />
                                <div className="text-center">
                                    <div className="button button-primary-variant" onClick={finish}>
                                        {t('sign_up_validator.buttons.go_to_dashboard')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
