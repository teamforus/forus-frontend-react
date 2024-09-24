import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
import SignUpProgress from './elements/SignUpProgress';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import TranslateHtml from '../../elements/translate-html/TranslateHtml';
import useEnvData from '../../../hooks/useEnvData';
import PhoneControl from '../../elements/forms/controls/PhoneControl';
import useShareService from '../../../services/ShareService';
import useSetProgress from '../../../hooks/useSetProgress';
import { phoneNumberFormat, strLimit } from '../../../helpers/string';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';
import useOfficeService from '../../../services/OfficeService';
import Office from '../../../props/models/Office';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useOpenModal from '../../../hooks/useOpenModal';
import Employee from '../../../props/models/Employee';
import { useEmployeeService } from '../../../services/EmployeeService';
import ModalNotification from '../../modals/ModalNotification';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import { GoogleMap } from '../../elements/google-map/GoogleMap';
import SignUpOfficeEdit from './elements/SignUpOfficeEdit';
import SignUpAvailableFunds from './elements/SignUpAvailableFunds';
import useFilter from '../../../hooks/useFilter';
import useDemoTransactionService from '../../../services/DemoTransactionService';
import { uniq } from 'lodash';
import useAppConfigs from '../../../hooks/useAppConfigs';
import usePushDanger from '../../../hooks/usePushDanger';
import useTranslate from '../../../hooks/useTranslate';
import SignUpFooter from '../../../../webshop/components/elements/sign-up/SignUpFooter';

type OfficeLocal = Office & { edit?: boolean };

export default function SignUpProvider() {
    const envData = useEnvData();
    const isMobile = window.innerWidth < 1000;
    const appConfigs = useAppConfigs();

    const translate = useTranslate();
    const pushDanger = usePushDanger();

    const [printDebug] = useState(false);

    const [{ organization_id, fund_id, tag }] = useQueryParams({
        organization_id: NumberParam,
        fund_id: NumberParam,
        tag: StringParam,
    });

    const assetUrl = useAssetUrl();
    const openModal = useOpenModal();
    const setProgress = useSetProgress();
    const authIdentity = useAuthIdentity();

    const { setToken, token: authToken } = useContext(authContext);

    const [showAddOfficeBtn, setShowAddOfficeBtn] = useState(true);
    const [isAddingNewOffice, setIsAddingNewOffice] = useState(false);
    const [skipFundApplications, setSkipFundApplications] = useState(false);
    const [hasFundApplications, setHasFundApplications] = useState(false);

    const [demoToken, setDemoToken] = useState(null);

    const navigate = useNavigate();
    const organizations = useOrganization();
    const mediaService = useMediaService();
    const officeService = useOfficeService();
    const employeesService = useEmployeeService();
    const identityService = useIdentityService();
    const organizationService = useOrganizationService();
    const businessTypeService = useBusinessTypeService();
    const demoTransactionService = useDemoTransactionService();

    const [businessTypes, setBusinessTypes] = useState<Array<BusinessType>>(null);
    const [orgMediaFile, setOrgMediaFile] = useState(null);
    const [progressStorage] = useState(new ProgressStorage('validator-sign_up'));

    const [offices, setOffices] = useState<Array<OfficeLocal>>(null);
    const [employees, setEmployees] = useState<Array<Employee>>(null);
    const [organization, setOrganization] = useState(null);
    const [hasApp, setHasApp] = useState(true);
    const [authEmailSent, setAuthEmailSent] = useState(null);
    const [authEmailRestoreSent, setAuthEmailRestoreSent] = useState(null);
    const [tmpAuthToken, setTmpAuthToken] = useState(null);
    const [tmpAccessToken, setTmpAccessToken] = useState(null);

    const [shareSmsSent, setShareSmsSent] = useState(false);
    const [shareEmailSent, setShareEmailSent] = useState(false);
    const [appDownloadSkip, setAppDownloadSkip] = useState(false);

    const [selectedOption, setSelectedOption] = useState(undefined);

    const [organizationsList, setOrganizationsList] = useState<Array<Organization>>(null);
    const [loggedWithApp, setLoggedWithApp] = useState(false);

    const [INFO_STEPS] = useState(2);

    const STEPS = useMemo(() => {
        return [
            'STEP_INFO_GENERAL',
            'STEP_INFO_ME_APP',
            authToken ? null : 'STEP_CREATE_PROFILE',
            organizations?.length > 0 ? 'STEP_SELECT_ORGANIZATION' : 'STEP_ORGANIZATION_ADD',
            'STEP_OFFICES',
            'STEP_EMPLOYEES',
            'STEP_FUND_APPLY',
            'STEP_PROCESS_NOTICE',
            loggedWithApp && !isMobile ? 'STEP_DEMO_TRANSACTION' : null,
            loggedWithApp && !isMobile ? 'STEP_SIGNUP_FINISHED' : null,
        ].filter((step) => step);
    }, [authToken, isMobile, loggedWithApp, organizations?.length]);

    const STEPS_AVAILABLE = useMemo(() => {
        return uniq([...STEPS, 'STEP_SELECT_ORGANIZATION', 'STEP_ORGANIZATION_ADD']);
    }, [STEPS]);

    const [step, setStep] = useState(STEPS[0]);

    const [fundUrlFilters] = useQueryParams({
        tag: StringParam,
        fund_id: NumberParam,
        organization_id: NumberParam,
    });

    const fundFilter = useFilter({
        q: '',
        per_page: 10,
        ...fundUrlFilters,
    });

    const signUpForm = useFormBuilder(
        {
            email: '',
            target: ['newSignup', organization_id, fund_id, tag].join('-'),
            confirm: true,
        },
        (values) => {
            const resolveErrors = (err: ResponseError) => {
                signUpForm.setIsLocked(false);
                signUpForm.setErrors(err.data?.errors || { email: err?.data?.message });
            };

            return identityService.validateEmail(values).then((res) => {
                const source = `${envData.client_key}_${envData.client_type}`;

                if (!res.data.email.used) {
                    identityService
                        .make(values)
                        .then(() => setAuthEmailSent(true))
                        .catch((err) => resolveErrors(err));
                } else {
                    identityService
                        .makeAuthEmailToken(values.email, source, values.target)
                        .then(() => setAuthEmailRestoreSent(true))
                        .catch((err) => resolveErrors(err));
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
                formOrganization.setErrors({ iban_confirmation: [translate('validation.iban_confirmation')] });
                return;
            }

            const data = JSON.parse(JSON.stringify(values));

            if (typeof data.iban === 'string') {
                data.iban = data.iban.replace(/\s/g, '');
            }

            const submit = async () => {
                return organizationService
                    .store(data)
                    .then((res) => {
                        setOrganizationValue(res.data.data);
                        goToStep(STEPS[STEPS.indexOf(step) + 1]);
                    })
                    .catch((err: ResponseError) => {
                        formOrganization.setErrors(err.data.errors);
                        formOrganization.setIsLocked(false);
                    });
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

    const employeeForm = useFormBuilder({ id: null, email: undefined }, (values) => {
        // Role operation_officer
        const operation_officer = 5;
        const data = { ...values, roles: [operation_officer] };

        const promise = data.id
            ? employeesService.update(organization.id, data.id, data)
            : employeesService.store(organization.id, data);

        promise
            .then((res) => {
                if (!values.id) {
                    setEmployees((employees) => {
                        return [...(employees || []), res.data.data];
                    });
                } else {
                    setEmployees((employees) => {
                        return employees.map((employee) => {
                            if (employee.id == values.id) {
                                return res.data.data;
                            }

                            return employee;
                        });
                    });
                }
            })
            .catch((err: ResponseError) => {
                if (err.status == 429) {
                    employeeForm.setErrors({ email: new Array(err.data.message) });
                } else {
                    employeeForm.setErrors(err.data.errors);
                }
            })
            .finally(() => employeeForm.setIsLocked(false));
    });

    const saveEmployee = useCallback(
        (e: React.FormEvent) => {
            e?.preventDefault();

            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    title={'Bevestig uitnodiging'}
                    className={'modal-md'}
                    description={
                        <Fragment>
                            Wilt u medewerker met het e-mailadres{' '}
                            <strong className="text-primary">{employeeForm.values.email}</strong> uitnodigen?
                            <br />
                            Deze medewerker zal hier over een e-mail ontvangen.
                        </Fragment>
                    }
                    buttonCancel={{
                        text: 'Annuleer',
                        onClick: () => modal.close(),
                    }}
                    buttonSubmit={{
                        text: 'Bevestigen',
                        onClick: () => {
                            modal.close();
                            employeeForm.submit();
                        },
                    }}
                />
            ));
        },
        [employeeForm, openModal],
    );

    const applyFund = useCallback(() => {
        setHasFundApplications(true);
    }, []);

    const deleteEmployee = useCallback(
        function (employee) {
            employeesService.delete(organization.id, employee.id).then(() => {
                setEmployees((employees) => {
                    return employees.filter((_employee) => {
                        return !_employee.id || _employee.id != employee.id;
                    });
                });
            });
        },
        [employeesService, organization?.id],
    );

    const deleteOffice = useCallback(
        (office) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={'Kantoor verwijderen'}
                    description={'Weet u zeker dat u dit kantoor wilt verwijderen?'}
                    buttonCancel={{
                        text: 'Annuleren',
                        onClick: () => modal.close(),
                    }}
                    buttonSubmit={{
                        text: 'Verwijderen',
                        onClick: () => {
                            modal.close();
                            officeService
                                .destroy(office.organization_id, office.id)
                                .then(() => {
                                    setOffices((offices) => {
                                        return offices.filter((_office) => {
                                            return typeof _office.id == 'undefined' || _office.id != office.id;
                                        });
                                    });
                                })
                                .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message));
                        },
                    }}
                />
            ));
        },
        [officeService, openModal, pushDanger],
    );

    const addOffice = useCallback(() => {
        setIsAddingNewOffice(true);
        setShowAddOfficeBtn(false);
    }, []);

    const loadOrganizations = useCallback(() => {
        return new Promise<Array<Organization>>((resolve, reject) =>
            organizationService.list({ per_page: 500 }).then((res) => {
                setOrganizationsList(res.data.data);
                resolve(res.data.data);
            }, reject),
        );
    }, [organizationService]);

    const loadOrganizationOffices = useCallback(
        (organization) => {
            officeService.list(organization.id, { per_page: 100 }).then((res) => {
                if (!res.data.data.length) {
                    return addOffice();
                }

                setOffices(res.data.data);
            });
        },
        [addOffice, officeService],
    );
    const loadOrganizationEmployees = useCallback(
        (organization) => {
            employeesService.list(organization.id, { per_page: 100 }).then((res) => {
                setEmployees(res.data.data.filter((item) => item.identity_address !== authIdentity?.address));
            });
        },
        [authIdentity?.address, employeesService],
    );

    const editOffice = useCallback((office) => {
        setIsAddingNewOffice(false);
        setShowAddOfficeBtn(false);

        setOffices((offices) => {
            return offices.map((_office) => {
                if (_office.id == office.id) {
                    _office.edit = true;
                }

                return _office;
            });
        });
    }, []);

    const officeUpdated = useCallback(
        (office) => {
            setOffices((offices) => {
                return offices.map((_office) => {
                    if (_office.id == office.id) {
                        _office.edit = false;
                    }

                    return _office;
                });
            });

            loadOrganizationOffices(organization);
        },
        [loadOrganizationOffices, organization],
    );

    const cancelOfficeAdd = useCallback(() => {
        setIsAddingNewOffice(false);
        setShowAddOfficeBtn(true);
    }, []);

    const officeCreated = useCallback(() => {
        loadOrganizationOffices(organization);
        cancelOfficeAdd();
    }, [cancelOfficeAdd, loadOrganizationOffices, organization]);

    const cancelOfficeEdit = useCallback((office) => {
        setOffices((offices) => {
            return offices.map((_office) => {
                if (_office.id == office.id) {
                    _office.edit = false;
                }

                return _office;
            });
        });
    }, []);

    const goToStep = useCallback(
        (targetStep: string) => {
            const movingForward = STEPS.indexOf(targetStep) >= STEPS.indexOf(step);
            const targetStepIndex = STEPS.indexOf(targetStep);

            if (isMobile && targetStep == 'STEP_INFO_ME_APP') {
                return movingForward ? goToStep(STEPS[targetStepIndex + 1]) : goToStep(STEPS[targetStepIndex - 1]);
            }

            if (STEPS_AVAILABLE.includes(targetStep)) {
                setStep(targetStep);
                progressStorage.set('step', targetStep);
            }
        },
        [isMobile, progressStorage, STEPS, STEPS_AVAILABLE, step],
    );

    const fetchBusinessTypes = useCallback(() => {
        businessTypeService.list({ per_page: 9999 }).then((res) => {
            setBusinessTypes(res.data.data);
        });
    }, [businessTypeService]);

    const setOrganizationValue = useCallback(
        (organization: Organization) => {
            setOrganization(organization);
            progressStorage.set('organizationForm', JSON.stringify(organization));
        },
        [progressStorage],
    );

    const selectOrganization = useCallback(
        (organization: Organization) => {
            setOrganizationValue(organization);
            goToStep('STEP_OFFICES');
        },
        [goToStep, setOrganizationValue],
    );

    const addOrganization = useCallback(() => {
        goToStep('STEP_ORGANIZATION_ADD');
    }, [goToStep]);

    const next = useCallback(
        function () {
            if (step == 'STEP_ORGANIZATION_ADD') {
                formOrganization.submit();
            } else {
                goToStep(STEPS[STEPS.indexOf(step) + 1]);
            }
        },
        [STEPS, formOrganization, goToStep, step],
    );

    const back = useCallback(() => {
        if (step == 'STEP_OFFICES') {
            return goToStep('STEP_SELECT_ORGANIZATION');
        }

        goToStep(STEPS[STEPS.indexOf(step) - 1]);
    }, [STEPS, goToStep, step]);

    const finish = useCallback(() => {
        navigate(getStateRouteUrl('organizations-view', { organizationId: organization.id }));
    }, [navigate, organization?.id]);

    const cancelAddOrganization = useCallback(() => {
        if (STEPS.includes('STEP_ORGANIZATION_ADD')) {
            return back();
        }

        return goToStep('STEP_SELECT_ORGANIZATION');
    }, [back, STEPS, goToStep]);

    const selectPhoto = useCallback((file: File | Blob) => {
        setOrgMediaFile(file);
    }, []);

    const shareService = useShareService();

    const phoneForm = useFormBuilder({ phone: '+31' }, (values) => {
        setProgress(0);

        shareService
            .sendSms({
                phone: parseInt(values.phone.toString().replace(/\D/g, '') || '0'),
                type: 'me_app_download_link',
            })
            .then(() => setShareSmsSent(true))
            .catch((err: ResponseError) => {
                phoneForm.setErrors(err.data.errors);

                if (err.status == 429) {
                    phoneForm.errors = { phone: [err.data.message] };
                }
            })
            .finally(() => {
                phoneForm.setIsLocked(false);
                setProgress(100);
            });
    });

    const { update: phoneFormUpdate } = phoneForm;

    const emailForm = useFormBuilder({ email: '' }, (values) => {
        setProgress(0);

        shareService
            .sendEmail({ email: values.email })
            .then(() => setShareEmailSent(true))
            .catch((err: ResponseError) => {
                emailForm.setErrors(err.data.errors);

                if (err.status == 429) {
                    emailForm.errors = { email: [err.data.message] };
                }
            })
            .finally(() => {
                emailForm.setIsLocked(false);
                setProgress(100);
            });
    });

    const resetShareForms = useCallback(() => {
        phoneForm.reset();
        emailForm.reset();
        setShareSmsSent(false);
        setShareEmailSent(false);
        setAppDownloadSkip(false);
    }, [emailForm, phoneForm]);

    const onPhoneChange = useCallback(
        (phone?: string) => {
            phoneFormUpdate({ phone });
        },
        [phoneFormUpdate],
    );

    const makeDemoToken = useCallback(() => {
        demoTransactionService.store().then((res) => {
            setDemoToken(res.data.data.token);
        });
    }, [demoTransactionService]);

    const requestAuthQrToken = useCallback(() => {
        identityService.makeAuthToken().then((res) => {
            setTmpAuthToken(res.data.auth_token);
            setTmpAccessToken(res.data.access_token);
        }, console.error);
    }, [identityService]);

    useEffect(() => {
        if (printDebug) {
            console.info(STEPS, step, `step ${STEPS.indexOf(step) + 1} of ${STEPS.length}`);
        }
    }, [STEPS, step, printDebug]);

    useEffect(() => {
        if (step !== 'STEP_CREATE_PROFILE' && tmpAuthToken) {
            setTmpAuthToken(null);
        }
    }, [step, tmpAuthToken]);

    useEffect(() => {
        if (step === 'STEP_CREATE_PROFILE') {
            if ((!tmpAuthToken || !tmpAccessToken) && hasApp && (appDownloadSkip || shareEmailSent || shareSmsSent)) {
                requestAuthQrToken();
            }
        } else {
            if (tmpAuthToken || tmpAccessToken) {
                setTmpAuthToken(null);
                setTmpAccessToken(null);
            }
        }
    }, [hasApp, appDownloadSkip, requestAuthQrToken, tmpAccessToken, tmpAuthToken, step, shareEmailSent, shareSmsSent]);

    useEffect(() => {
        if (!demoToken) {
            return;
        }

        const callback = () => {
            demoTransactionService.read(demoToken).then((res) => {
                if (res.data.data.state != 'pending') {
                    setDemoToken(null);
                    setStep('STEP_SIGNUP_FINISHED');
                }
            });
        };

        const id = setInterval(callback, 2000);

        return () => clearInterval(id);
    }, [demoToken, demoTransactionService]);

    useEffect(() => {
        if (!tmpAccessToken) {
            return;
        }

        const callback = () => {
            identityService.checkAccessToken(tmpAccessToken).then((res) => {
                if (res.data.message == 'active') {
                    setToken(tmpAccessToken);
                    setHasApp(false);
                    setLoggedWithApp(true);
                } else if (res.data.message == 'pending') {
                    // pending
                } else {
                    document.location.reload();
                }
            });
        };

        const id = window.setInterval(callback, 2500);

        return () => clearTimeout(id);
    }, [identityService, progressStorage, setToken, tmpAccessToken]);

    useEffect(() => {
        if (organization) {
            loadOrganizationOffices(organization);
            loadOrganizationEmployees(organization);
        }
    }, [organization, loadOrganizationOffices, loadOrganizationEmployees]);

    useEffect(() => {
        const stepsTotal = STEPS?.length + INFO_STEPS;

        if (step == 'STEP_CREATE_PROFILE') {
            setHasApp(JSON.parse(progressStorage.get('hasApp', 'true')));
        }

        if (STEPS.indexOf(step) >= STEPS.indexOf('STEP_ORGANIZATION_ADD') && progressStorage.has('organizationForm')) {
            const storedOrganization = JSON.parse(progressStorage.get('organizationForm'));

            formOrganizationUpdate(storedOrganization);
            setOrganizationValue(storedOrganization);
        }

        if (step == 'STEP_SELECT_ORGANIZATION') {
            loadOrganizations().then((organizations) => {
                if (organizations.length == 0) {
                    goToStep('STEP_ORGANIZATION_ADD');
                }
            });
        }

        if (step == 'STEP_DEMO_TRANSACTION') {
            makeDemoToken();
        }

        // last step, time for progress cleanup
        if (STEPS.indexOf(step) >= stepsTotal) {
            progressStorage.clear();
        }
    }, [
        INFO_STEPS,
        STEPS,
        formOrganizationUpdate,
        goToStep,
        loadOrganizations,
        makeDemoToken,
        progressStorage,
        setOrganizationValue,
        step,
    ]);

    useEffect(() => {
        fetchBusinessTypes();
    }, [fetchBusinessTypes]);

    useEffect(() => {
        if (authToken && organizations === null) {
            return;
        }

        const step = progressStorage.get('step');

        if (authToken && step == 'STEP_CREATE_PROFILE') {
            return goToStep(organizations?.length > 0 ? 'STEP_SELECT_ORGANIZATION' : 'STEP_ORGANIZATION_ADD');
        }

        if (!STEPS_AVAILABLE.includes(step)) {
            return goToStep('STEP_INFO_GENERAL');
        }

        goToStep(step);
    }, [STEPS_AVAILABLE, authToken, goToStep, organizations, progressStorage]);

    useEffect(() => {
        return () => progressStorage.clear();
    }, [progressStorage]);

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

                    <div className="sign_up-header-item">
                        {!authToken ? (
                            <StateNavLink name={'sign-in'} className="sign_up-header-item-button">
                                Inloggen
                                <em className="mdi mdi-login icon-end" />
                            </StateNavLink>
                        ) : (
                            <StateNavLink name={'organizations'} className="sign_up-header-item-button">
                                Open beheeromgeving
                            </StateNavLink>
                        )}
                    </div>
                </div>

                <h2 className="block-title">{translate('sign_up_provider.header.main_header')}</h2>

                {step == 'STEP_INFO_GENERAL' && (
                    <Fragment>
                        <SignUpProgress
                            infoSteps={INFO_STEPS}
                            step={STEPS.indexOf(step) + 1}
                            shownSteps={STEPS.slice(INFO_STEPS).map((_, index) => index + 1)}
                        />

                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">
                                {translate('sign_up_provider.header.title_step_1')}
                            </div>
                            <div className="sign_up-pane-body">
                                <div className="sign_up-pane-text">
                                    {translate('sign_up_provider.header.subtitle_step_1')}
                                </div>
                                <div className="sign_up-pane-text">
                                    <h5 className="sign_up-pane-heading">
                                        {translate('sign_up_provider.header.title_step_1_paragrah_1')}
                                    </h5>
                                    <ul className="list-normal">
                                        <li className="sign_up-pane-text list-item-normal">
                                            {translate('sign_up_provider.header.subtitle_step_1_point_1')}
                                        </li>
                                        <li className="sign_up-pane-text list-item-normal">
                                            {translate('sign_up_provider.header.subtitle_step_1_point_2')}
                                        </li>
                                        <li className="sign_up-pane-text list-item-normal">
                                            {translate('sign_up_provider.header.subtitle_step_1_point_3')}
                                        </li>
                                    </ul>
                                </div>
                                {!authToken && (
                                    <div className="sign_up-pane-text">
                                        <h5 className="sign_up-pane-heading">
                                            {translate('sign_up_provider.header.title_step_1_paragrah_2')}
                                        </h5>
                                        <StateNavLink name={'sign-in'} className="sign_up-pane-link">
                                            Klik hier&nbsp;
                                        </StateNavLink>
                                        {translate('sign_up_provider.header.subtitle_step_1_paragrah_2')}
                                    </div>
                                )}
                                <div className="sign_up-pane-text">
                                    <h5 className="sign_up-pane-heading">
                                        {translate('sign_up_provider.header.title_step_1_paragrah_3')}
                                    </h5>
                                    {translate('sign_up_provider.header.subtitle_step_1_paragrah_3')}
                                </div>
                                <div className="sign_up-pane-media">
                                    <img src={assetUrl('/assets/img/sign_up_first_step.png')} alt={''} />
                                </div>
                            </div>

                            <SignUpFooter
                                endActions={
                                    <button
                                        className="button button-text button-text-padless"
                                        type={'button'}
                                        onClick={next}
                                        tabIndex={0}>
                                        {translate('sign_up_provider.buttons.next')}
                                        <em className="mdi mdi-chevron-right icon-right" />
                                    </button>
                                }
                            />
                        </div>
                    </Fragment>
                )}

                {step == 'STEP_INFO_ME_APP' && (
                    <Fragment>
                        <SignUpProgress
                            infoSteps={INFO_STEPS}
                            step={STEPS.indexOf(step) + 1}
                            shownSteps={STEPS.slice(INFO_STEPS).map((_, index) => index + 1)}
                        />

                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">
                                {translate('sign_up_provider.header.title_step_2')}
                            </div>
                            <div className="sign_up-pane-body">
                                <div className="sign_up-pane-media">
                                    <img
                                        className={'pull-right'}
                                        src={assetUrl('/assets/img/sign_up_second_step.png')}
                                        alt={''}
                                    />
                                </div>
                                <TranslateHtml
                                    component={<div className={'sign_up-pane-text'} />}
                                    i18n={'sign_up_provider.header.subtitle_step_2'}
                                />
                            </div>
                            <SignUpFooter
                                startActions={
                                    <div className="button button-text button-text-padless" onClick={back} tabIndex={0}>
                                        <em className="mdi mdi-chevron-left icon-left" />
                                        {translate('sign_up_provider.buttons.back')}
                                    </div>
                                }
                                endActions={
                                    <div className="button button-text button-text-padless" onClick={next} tabIndex={0}>
                                        {translate('sign_up_provider.buttons.next')}
                                        <em className="mdi mdi-chevron-right icon-right" />
                                    </div>
                                }
                            />
                        </div>
                    </Fragment>
                )}

                {step == 'STEP_CREATE_PROFILE' && (
                    <Fragment>
                        <SignUpProgress
                            infoSteps={INFO_STEPS}
                            step={STEPS.indexOf(step) + 1}
                            shownSteps={STEPS.slice(INFO_STEPS).map((_, index) => index + 1)}
                        />

                        <div className="sign_up-pane">
                            {hasApp && (
                                <div className="sign_up-pane-header">
                                    {translate('sign_up_provider.header.title_step_3')}
                                </div>
                            )}

                            {!hasApp && (
                                <div className="sign_up-pane-header visible-md visible-lg">
                                    {translate('sign_up_provider.header.title_step_3_mail')}
                                </div>
                            )}

                            {!hasApp && (
                                <div className="sign_up-pane-header visible-sm visible-xs">
                                    {translate('sign_up_provider.header.title_step_3_mail_mobile')}
                                </div>
                            )}

                            {!authEmailSent &&
                                !authEmailRestoreSent &&
                                hasApp &&
                                !shareSmsSent &&
                                !shareEmailSent &&
                                !appDownloadSkip && (
                                    <div className="sign_up-pane-body">
                                        <div className="block block-app_download form">
                                            <div className="app_download-row">
                                                <div className="app_download-media">
                                                    <img src={assetUrl('/assets/img/sign_up_me.svg')} alt={''} />
                                                </div>
                                                <div className="app_download-content form">
                                                    <h4 className="app_download-heading">Selecteer uw apparaat</h4>
                                                    <select
                                                        className="form-control"
                                                        value={selectedOption}
                                                        onChange={(e) => setSelectedOption(e.target.value)}>
                                                        <option value="null">Selecteer uw apparaat</option>
                                                        <option value="iphone">iPhone</option>
                                                        <option value="android-phone">Android smartphone</option>
                                                        <option value="android-tablet">Android tablet</option>
                                                        <option value="ipad">iPad</option>
                                                    </select>
                                                </div>
                                            </div>
                                            {!selectedOption && (
                                                <Fragment>
                                                    <div className="app_download-row">
                                                        <h4 className="app_download-heading">Of:</h4>
                                                    </div>
                                                    <div className="app_download-row">
                                                        <div className="app_download-media">
                                                            <img
                                                                src={assetUrl('/assets/img/forus-dl-link.jpg')}
                                                                alt={''}
                                                            />
                                                        </div>
                                                        <div className="app_download-content">
                                                            <p className="app_download-text">
                                                                Typ <b>forus.io/dl</b> in uw mobiele browser (safari,
                                                                chrome, etc) en{' '}
                                                                <a
                                                                    className="app_download-link"
                                                                    onClick={(e) => {
                                                                        e?.preventDefault();
                                                                        setAppDownloadSkip(true);
                                                                    }}>
                                                                    ga verder &gt;
                                                                </a>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Fragment>
                                            )}

                                            {(selectedOption == 'iphone' || selectedOption == 'android-phone') && (
                                                <div className="app_download-row">
                                                    <div className="app_download-col">
                                                        {selectedOption == 'iphone' && (
                                                            <div className="app_download-row">
                                                                <h4 className="app_download-heading">
                                                                    Download uit app store
                                                                </h4>
                                                            </div>
                                                        )}
                                                        {selectedOption == 'android-phone' && (
                                                            <div className="app_download-row">
                                                                <h4 className="app_download-heading">
                                                                    Download uit play store
                                                                </h4>
                                                            </div>
                                                        )}
                                                        <div className="app_download-row">
                                                            {selectedOption == 'android-phone' && (
                                                                <a
                                                                    className="app_download-store_icon"
                                                                    href={envData.config.android_link}
                                                                    target="_blank"
                                                                    rel="noreferrer">
                                                                    <img
                                                                        alt={'Download uit play store'}
                                                                        src={assetUrl(
                                                                            '/assets/img/icon-app/app-store-android.svg',
                                                                        )}
                                                                    />
                                                                </a>
                                                            )}
                                                            {selectedOption == 'iphone' && (
                                                                <a
                                                                    className="app_download-store_icon"
                                                                    href={envData.config.ios_iphone_link}
                                                                    target="_blank"
                                                                    rel="noreferrer">
                                                                    <img
                                                                        alt={'Download uit app store'}
                                                                        src={assetUrl(
                                                                            '/assets/img/icon-app/app-store-ios.svg',
                                                                        )}
                                                                    />
                                                                </a>
                                                            )}

                                                            <div className="app_download-col flex-center">
                                                                <a
                                                                    className="app_download-link text-muted"
                                                                    onClick={(e) => {
                                                                        e?.preventDefault();
                                                                        setAppDownloadSkip(true);
                                                                    }}>
                                                                    Ga verder &gt;
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <div className="app_download-row">
                                                            <h4 className="app_download-heading">
                                                                Of stuur een downloadlink direct naar uw telefoon
                                                            </h4>
                                                        </div>
                                                        <div className="app_download-row">
                                                            <div className="app_download-col">
                                                                <label className="form-label">
                                                                    Mobiele telefoonnummer
                                                                </label>
                                                                <PhoneControl
                                                                    className="visible-md visible-lg"
                                                                    onChange={onPhoneChange}
                                                                />
                                                                <div className="pincode-errors">
                                                                    <FormError error={phoneForm.errors.phone} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="app_download-row">
                                                            <button
                                                                className="button button-primary-outline"
                                                                type="button"
                                                                onClick={() => phoneForm.submit()}>
                                                                {translate('sign_up_provider.download.download_link')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {(selectedOption == 'ipad' || selectedOption == 'android-tablet') && (
                                                <div className="app_download-row">
                                                    <div className="app_download-col">
                                                        {selectedOption == 'ipad' && (
                                                            <div className="app_download-row">
                                                                <h4 className="app_download-heading">
                                                                    Download uit app store
                                                                </h4>
                                                            </div>
                                                        )}
                                                        {selectedOption == 'android-tablet' && (
                                                            <div className="app_download-row">
                                                                <h4 className="app_download-heading">
                                                                    Download uit play store
                                                                </h4>
                                                            </div>
                                                        )}
                                                        <div className="app_download-row">
                                                            {selectedOption == 'android-tablet' && (
                                                                <a
                                                                    className="app_download-store_icon"
                                                                    href={envData.config.android_link}
                                                                    target="_blank"
                                                                    rel="noreferrer">
                                                                    <img
                                                                        alt={''}
                                                                        src={assetUrl(
                                                                            '/assets/img/icon-app/app-store-android.svg',
                                                                        )}
                                                                    />
                                                                </a>
                                                            )}
                                                            {selectedOption == 'ipad' && (
                                                                <a
                                                                    className="app_download-store_icon"
                                                                    href={envData.config.ios_ipad_link}
                                                                    target="_blank"
                                                                    rel="noreferrer">
                                                                    <img
                                                                        alt={''}
                                                                        src={assetUrl(
                                                                            '/assets/img/icon-app/app-store-ios.svg',
                                                                        )}
                                                                    />
                                                                </a>
                                                            )}
                                                            <div className="app_download-col flex-center">
                                                                <a
                                                                    className="app_download-link text-muted"
                                                                    onClick={(e) => {
                                                                        e?.preventDefault();
                                                                        setAppDownloadSkip(true);
                                                                    }}>
                                                                    Ga verder &gt;
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <div className="app_download-row">
                                                            <h4 className="app_download-heading">
                                                                Of stuur een link naar een e-mailadres
                                                            </h4>
                                                        </div>
                                                        <div className="app_download-row">
                                                            <div className="app_download-col">
                                                                <form
                                                                    className="app_download-form_group"
                                                                    onSubmit={emailForm.submit}>
                                                                    <div className="app_download-form_group-input">
                                                                        <label
                                                                            className="form-label hide-xs"
                                                                            htmlFor="email_input">
                                                                            E-mailadres
                                                                        </label>
                                                                        <input
                                                                            className="large form-control"
                                                                            type="text"
                                                                            id="email_input"
                                                                            name="email"
                                                                            value={emailForm.values.email}
                                                                            onChange={(e) =>
                                                                                emailForm.update({
                                                                                    email: e.target.value,
                                                                                })
                                                                            }
                                                                            placeholder="EMAILADRES"
                                                                        />
                                                                    </div>
                                                                    <div className="app_download-form_group-button">
                                                                        <label className="form-label">&nbsp;</label>
                                                                        <button
                                                                            className="button button-primary-outline"
                                                                            disabled={!emailForm.values.email}
                                                                            type="submit">
                                                                            verstuur e-mail
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                                <div className="app_download-form_group">
                                                                    <FormError error={emailForm.errors.email} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="app_download-row" />
                                            <div className="app_download-row">
                                                <div className="app_download-text app_download-text-xs">
                                                    {translate('sign_up_provider.download.cannot_install_app')}
                                                    <span>&nbsp;</span>
                                                    <a
                                                        className="app_download-link text-muted"
                                                        onClick={(e) => {
                                                            e?.preventDefault();
                                                            setHasApp(false);
                                                        }}>
                                                        Ga verder met uw e-mailadres &gt;
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            {/* Sms sent message */}
                            {!authEmailSent && !authEmailRestoreSent && shareSmsSent && (
                                <div className="sign_up-pane-body">
                                    <div className="sign_up-pane-heading">
                                        {`U heeft een SMS ontvangen op ${phoneNumberFormat(phoneForm.values.phone)}`}
                                    </div>
                                    <div className="sign_up-pane-auth">
                                        <div className="sign_up-pane-auth-content">
                                            <div className="sign_up-pane-text">
                                                <TranslateHtml i18n={'sign_up_provider.qr_code.description'} />
                                            </div>
                                            <br />
                                            <div className="sign_up-pane-text">
                                                <small>
                                                    {translate('sign_up_provider.download.no_link_received_sms')}{' '}
                                                    <a href="https://www.forus.io/DL" target="_blank" rel="noreferrer">
                                                        www.forus.io/DL
                                                    </a>
                                                </small>
                                            </div>
                                        </div>
                                        <div className="sign_up-pane-auth-qr_code visible-md visible-lg">
                                            {tmpAuthToken && (
                                                <QrCode
                                                    logo={assetUrl('/assets/img/me-logo-react.png')}
                                                    value={JSON.stringify({
                                                        type: 'auth_token',
                                                        value: tmpAuthToken,
                                                    })}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Email sent message */}
                            {!authEmailSent && !authEmailRestoreSent && shareEmailSent && (
                                <div className="sign_up-pane-body">
                                    <div className="sign_up-pane-heading">
                                        Er is een e-mail verstuurd naar {emailForm.values.email}
                                    </div>
                                    <div className="sign_up-pane-auth">
                                        <div className="sign_up-pane-auth-content">
                                            <div className="sign_up-pane-text">
                                                <TranslateHtml i18n={'sign_up_provider.qr_code.description'} />
                                            </div>
                                            <br />
                                            <div className="sign_up-pane-text">
                                                <small>
                                                    {translate('sign_up_provider.download.no_link_received_email')}{' '}
                                                    <a href="https://www.forus.io/DL" target="_blank" rel="noreferrer">
                                                        www.forus.io/DL
                                                    </a>
                                                </small>
                                            </div>
                                        </div>
                                        <div className="sign_up-pane-auth-qr_code visible-md visible-lg">
                                            {tmpAuthToken && (
                                                <QrCode
                                                    logo={assetUrl('/assets/img/me-logo-react.png')}
                                                    value={JSON.stringify({
                                                        type: 'auth_token',
                                                        value: tmpAuthToken,
                                                    })}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Skipped */}
                            {!authEmailSent && !authEmailRestoreSent && appDownloadSkip && (
                                <div className="sign_up-pane-body">
                                    <div className="sign_up-pane-heading">
                                        Maak een profiel en scan QR-code om verder te gaan
                                    </div>
                                    <div className="sign_up-pane-auth">
                                        <div className="sign_up-pane-auth-content">
                                            <div className="sign_up-pane-text">
                                                1. Installeer de Me-app <br />
                                                2. Open de Me app en meld u aan <br />
                                                3. Scan de QR-code aan de rechterkant met de QR scanner in de Me app{' '}
                                                <br />
                                            </div>
                                            <br />
                                            <div className="sign_up-pane-text">
                                                <small>
                                                    App nog niet gedownload?{' '}
                                                    <div
                                                        className="sign_up-pane-link text-muted"
                                                        onClick={() => setAppDownloadSkip(false)}>
                                                        Ga naar de vorige stap
                                                    </div>
                                                </small>
                                            </div>
                                        </div>
                                        <div className="sign_up-pane-auth-qr_code visible-md visible-lg">
                                            {tmpAuthToken && (
                                                <QrCode
                                                    logo={assetUrl('/assets/img/me-logo-react.png')}
                                                    value={JSON.stringify({
                                                        type: 'auth_token',
                                                        value: tmpAuthToken,
                                                    })}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!authEmailSent && !authEmailRestoreSent && !hasApp && (
                                <div className="sign_up-pane-body">
                                    <div className="sign_up-pane-heading visible-md visible-lg">
                                        {translate('sign_up_provider.no_app.enter_email')}
                                    </div>
                                    <div className="sign_up-pane-text visible-md visible-lg">
                                        {translate('sign_up_provider.no_app.instructions')}
                                    </div>
                                    <form className="sign-up-form form" onSubmit={signUpForm.submit}>
                                        <div className="row">
                                            <div className="col col-md-7 col-xs-12">
                                                <div className="form-group">
                                                    <label className="form-label">E-mailadres</label>
                                                    <UIControlText
                                                        value={signUpForm.values.email}
                                                        onChange={(e) => signUpForm.update({ email: e.target.value })}
                                                        className={'large'}
                                                        placeholder={'e-mail@e-mail.nl'}
                                                    />
                                                    <FormError error={signUpForm.errors?.email} />
                                                </div>
                                            </div>
                                            <div className="col col-md-5 col-xs-12">
                                                <div className="form-group">
                                                    <label className="form-label">&nbsp;</label>
                                                    <button
                                                        className="button button-primary button-fill"
                                                        type="submit"
                                                        disabled={!signUpForm.values.email || signUpForm.isLocked}>
                                                        {translate('sign_up_provider.app_instruction.create_profile')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    <div
                                        className="sign_up-pane-link visible-md visible-lg"
                                        onClick={() => setHasApp(true)}>
                                        {translate('sign_up_provider.no_app.continue_app')}
                                    </div>
                                </div>
                            )}

                            {(authEmailSent || authEmailRestoreSent) && (
                                <div className="sign_up-pane-body text-center">
                                    <div className="sign_up-pane-media">
                                        <img src={assetUrl('/assets/img/email_confirmed.svg')} alt={''} />
                                    </div>
                                    <div className="sign_up-pane-heading sign_up-pane-heading-lg text-primary-mid">
                                        {translate('sign_up_sponsor.labels.confirm_email')}
                                    </div>
                                    <div className="sign_up-pane-text">
                                        {translate('sign_up_sponsor.labels.confirm_email_description')}
                                        &nbsp;
                                        <span className="sign_up-pane-link">{signUpForm.values.email}</span>
                                        <br />
                                        <br />
                                        <EmailProviderLink email={signUpForm.values.email} />
                                    </div>
                                </div>
                            )}

                            {(shareSmsSent || shareEmailSent || appDownloadSkip) && (
                                <SignUpFooter
                                    startActions={
                                        <div
                                            className="button button-text button-text-padless"
                                            onClick={resetShareForms}
                                            tabIndex={0}>
                                            <em className="mdi mdi-chevron-left icon-lefts" />
                                            {translate('sign_up_provider.buttons.back')}
                                        </div>
                                    }
                                />
                            )}

                            {!shareSmsSent && !shareEmailSent && !appDownloadSkip && (
                                <SignUpFooter
                                    startActions={
                                        <div
                                            className="button button-text button-text-padless"
                                            onClick={back}
                                            tabIndex={0}>
                                            <em className="mdi mdi-chevron-left icon-lefts" />
                                            {translate('sign_up_provider.buttons.back')}
                                        </div>
                                    }
                                />
                            )}
                        </div>
                    </Fragment>
                )}

                {step == 'STEP_SELECT_ORGANIZATION' && (
                    <Fragment>
                        <SignUpProgress
                            infoSteps={INFO_STEPS}
                            step={STEPS.indexOf(step) + 1}
                            shownSteps={STEPS.slice(INFO_STEPS).map((_, index) => index + 1)}
                        />

                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">
                                {translate('sign_up_provider.header.title_step_4')}
                            </div>
                            <div className="sign_up-pane-body">
                                <div className="sign_up-pane-text">
                                    {translate('sign_up_provider.header.subtitle_step_4')}
                                </div>
                                <br />
                                <div className="sign_up-organizations">
                                    {organizationsList?.map((item) => (
                                        <a
                                            key={item.id}
                                            className={`sign_up-organization ${
                                                item.id == organization?.id ? 'active' : ''
                                            }`}
                                            onClick={(e) => {
                                                e?.preventDefault();
                                                selectOrganization(item);
                                            }}>
                                            <div className="sign_up-organization-logo">
                                                <img
                                                    src={
                                                        item.logo?.sizes?.thumbnail ||
                                                        assetUrl('./assets/img/organization-no-logo.svg')
                                                    }
                                                    alt={''}
                                                />
                                            </div>
                                            <div className="sign_up-organization-title">{item.name}</div>
                                        </a>
                                    ))}
                                </div>
                                <div
                                    className="button button-primary-outline button-fill visible-sm visible-xs"
                                    onClick={addOrganization}>
                                    <div className="mdi mdi-plus-circle-outline icon-start" />
                                    {translate('sign_up_sponsor.buttons.organization_add')}
                                </div>
                            </div>
                            <div className="sign_up-pane-body visible-md visible-lg">
                                <div className="button button-primary-outline" onClick={addOrganization}>
                                    <div className="mdi mdi-plus-circle-outline icon-start" />
                                    {translate('sign_up_sponsor.buttons.organization_add')}
                                </div>
                            </div>
                            <SignUpFooter
                                startActions={
                                    <div className="button button-text button-text-padless" onClick={back} tabIndex={0}>
                                        <em className="mdi mdi-chevron-left icon-lefts" />
                                        {translate('sign_up_provider.buttons.back')}
                                    </div>
                                }
                            />
                        </div>
                    </Fragment>
                )}

                {step == 'STEP_ORGANIZATION_ADD' && (
                    <Fragment>
                        <SignUpProgress
                            infoSteps={INFO_STEPS}
                            step={STEPS.indexOf(step) + 1}
                            shownSteps={STEPS.slice(INFO_STEPS).map((_, index) => index + 1)}
                        />

                        <div className="sign_up-pane">
                            <form
                                className="form"
                                onSubmit={(e) => {
                                    e?.preventDefault();
                                    next();
                                }}>
                                <div className="sign_up-pane-header">
                                    {translate('sign_up_provider.header.title_step_5')}
                                </div>
                                <div className="sign_up-pane-body">
                                    <div className="sign_up-pane-text">
                                        {translate('sign_up_provider.header.subtitle_step_5')}
                                    </div>
                                </div>
                                <div className="sign_up-pane-body sign_up-pane-body-padless">
                                    <div className="sign_up-pane-section">
                                        <div className="sign_up-pane-col sign_up-pane-col-2">
                                            <div className="form-group">
                                                <label className="form-label">
                                                    {translate('organization_edit.labels.name')}
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
                                                    {translate('organization_edit.labels.bank')}
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
                                                description={translate('organization_edit.labels.photo_description')}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="sign_up-pane-body sign_up-pane-body-padless">
                                    <div className="sign_up-pane-section" style={{ paddingRight: '30px' }}>
                                        <div className="sign_up-pane-col">
                                            <div className="form-group">
                                                <label className="form-label">
                                                    {translate('organization_edit.labels.mail')}
                                                </label>
                                                <div className="row">
                                                    <div className="col col-md-8 col-xs-12">
                                                        <UIControlText
                                                            value={formOrganization.values.email}
                                                            onChange={(e) =>
                                                                formOrganization.update({ email: e.target.value })
                                                            }
                                                            placeholder={'Voorbeeld: info@bedrijfsnaam.nl'}
                                                        />
                                                    </div>
                                                    <div className="col col-md-4 col-xs-12">
                                                        <UIControlCheckbox
                                                            id={'email_public_input'}
                                                            name="email_public"
                                                            className="make-public"
                                                            label={translate('organization_edit.labels.make_public')}
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
                                                    {translate('organization_edit.labels.phone')}
                                                </label>
                                                <div className="row">
                                                    <div className="col col-md-8 col-xs-12">
                                                        <UIControlText
                                                            value={formOrganization.values.phone}
                                                            onChange={(e) =>
                                                                formOrganization.update({ phone: e.target.value })
                                                            }
                                                            placeholder={'Voorbeeld: 06 123 45 678'}
                                                        />
                                                    </div>
                                                    <div className="col col-md-4 col-xs-12">
                                                        <UIControlCheckbox
                                                            id={'phone_public_input'}
                                                            name="phone_public"
                                                            className="make-public"
                                                            label={translate('organization_edit.labels.make_public')}
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
                                                    {translate('organization_edit.labels.website')}
                                                </label>
                                                <div className="row">
                                                    <div className="col col-md-8 col-xs-12">
                                                        <UIControlText
                                                            value={formOrganization.values.website || ''}
                                                            onChange={(e) =>
                                                                formOrganization.update({ website: e.target.value })
                                                            }
                                                            placeholder={'Voorbeeld: https://bedrijfsnaam.nl'}
                                                        />
                                                    </div>
                                                    <div className="col col-md-4 col-xs-12">
                                                        <UIControlCheckbox
                                                            id={'website_public_input'}
                                                            name="website_public"
                                                            className="make-public"
                                                            label={translate('organization_edit.labels.make_public')}
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
                                                        {translate('organization_edit.labels.business_type')}
                                                    </label>
                                                    <div className="form-offset">
                                                        {businessTypes && (
                                                            <SelectControl
                                                                value={formOrganization.values.business_type_id}
                                                                propKey={'id'}
                                                                onChange={(business_type_id?: number) => {
                                                                    formOrganization.update({ business_type_id });
                                                                }}
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
                                                        {translate('organization_edit.labels.kvk')}
                                                    </label>
                                                    <UIControlText
                                                        value={formOrganization.values.kvk}
                                                        onChange={(e) =>
                                                            formOrganization.update({ kvk: e.target.value })
                                                        }
                                                        placeholder={'Voorbeeld: 12345678'}
                                                    />
                                                    <FormError error={formOrganization.errors.kvk} />
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <div className="col col-md-8 col-xs-12">
                                                    <label className="form-label">
                                                        {translate('organization_edit.labels.tax')}
                                                    </label>
                                                    <UIControlText
                                                        value={formOrganization.values.btw}
                                                        onChange={(e) =>
                                                            formOrganization.update({ btw: e.target.value })
                                                        }
                                                        placeholder={'Voorbeeld: NL123456789B01'}
                                                    />
                                                    <div className="form-hint text-right">
                                                        {translate('organization_edit.labels.optional')}
                                                    </div>
                                                    <FormError error={formOrganization.errors.btw} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <SignUpFooter
                                    startActions={
                                        <button
                                            type={'button'}
                                            className="button button-text button-text-padless"
                                            onClick={cancelAddOrganization}
                                            tabIndex={0}>
                                            <em className="mdi mdi-chevron-left icon-left" />
                                            {translate('sign_up_provider.buttons.back')}
                                        </button>
                                    }
                                    endActions={
                                        <button
                                            type={'submit'}
                                            className="button button-text button-text-padless"
                                            tabIndex={0}>
                                            {translate('sign_up_provider.buttons.next')}
                                            <em className="mdi mdi-chevron-right icon-right" />
                                        </button>
                                    }
                                />
                            </form>
                        </div>
                    </Fragment>
                )}

                {step == 'STEP_OFFICES' && (
                    <Fragment>
                        <SignUpProgress
                            infoSteps={INFO_STEPS}
                            step={STEPS.indexOf(step) + 1}
                            shownSteps={STEPS.slice(INFO_STEPS).map((_, index) => index + 1)}
                        />

                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">
                                {translate('sign_up_provider.header.title_step_6')}
                            </div>
                            <div className="sign_up-pane-body">
                                <div className="sign_up-pane-text">
                                    {translate('sign_up_provider.header.subtitle_step_6')}
                                </div>
                            </div>
                            <div className="sign_up-pane-body sign_up-pane-body-padless">
                                {offices?.map((office, index) => (
                                    <div className="sign_up-offices" key={index}>
                                        {!office.edit ? (
                                            <div className="sign_up-office">
                                                <div
                                                    className={`office-media ${
                                                        !office.photo?.sizes?.thumbnail
                                                            ? 'office-media-placeholder'
                                                            : ''
                                                    }`}>
                                                    <img
                                                        alt={''}
                                                        src={
                                                            office.photo?.sizes?.thumbnail ||
                                                            assetUrl('/assets/img/organization-no-logo.svg')
                                                        }
                                                    />
                                                </div>
                                                <div className="office-contacts">
                                                    <div className="office-contact">
                                                        <em className="mdi mdi-map-marker" />
                                                        {office.address}
                                                    </div>
                                                    <div className="office-contact">
                                                        <em className="mdi mdi-phone" />
                                                        {office.phone ||
                                                            translate('organization_edit.labels.not_specified')}
                                                    </div>
                                                </div>
                                                <div className="office-map">
                                                    <div className="office-map-content">
                                                        <GoogleMap
                                                            mapPointers={[office]}
                                                            appConfigs={appConfigs}
                                                            mapTypeControlOptions={{ mapTypeIds: ['map_style'] }}
                                                        />
                                                    </div>
                                                    <div className="office-actions">
                                                        <a
                                                            className="office-action"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                editOffice(office);
                                                            }}>
                                                            <em className="edit mdi mdi-pencil-outline" />
                                                            {translate('organization_edit.buttons.edit_location')}
                                                        </a>
                                                        <a
                                                            className="office-action"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                deleteOffice(office);
                                                            }}>
                                                            <em className="delete mdi mdi-trash-can-outline" />
                                                            {translate('organization_edit.buttons.delete_location')}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <SignUpOfficeEdit
                                                office={office}
                                                organization={organization}
                                                cancel={() => cancelOfficeEdit(office)}
                                                updated={(office) => officeUpdated(office)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {isAddingNewOffice && (
                                <div className="sign_up-pane-body sign_up-pane-body-padless">
                                    <div className="sign_up-offices">
                                        <SignUpOfficeEdit
                                            organization={organization}
                                            cancel={cancelOfficeAdd}
                                            created={officeCreated}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="sign_up-pane-body">
                                <div className="flex-row">
                                    {showAddOfficeBtn && (
                                        <div className="flex-col">
                                            <button
                                                className="button button-primary-outline button-fill button-sm"
                                                onClick={addOffice}>
                                                <em className="mdi mdi-plus-circle-outline icon-start" />
                                                {translate('organization_edit.buttons.add_location')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <SignUpFooter
                                startActions={
                                    <div
                                        className="button button-text button-text-padless"
                                        onClick={() => back()}
                                        tabIndex={0}>
                                        <em className="mdi mdi-chevron-left icon-lefts" />
                                        {translate('sign_up_provider.buttons.back')}
                                    </div>
                                }
                                endActions={
                                    <button
                                        type={'button'}
                                        className="button button-text button-text-padless"
                                        disabled={!offices || offices?.length == 0}
                                        onClick={() => next()}
                                        tabIndex={0}>
                                        {translate('sign_up_provider.buttons.next')}
                                        <em className="mdi mdi-chevron-right icon-right" />
                                    </button>
                                }
                            />
                        </div>
                    </Fragment>
                )}

                {step == 'STEP_EMPLOYEES' && (
                    <Fragment>
                        <SignUpProgress
                            infoSteps={INFO_STEPS}
                            step={STEPS.indexOf(step) + 1}
                            shownSteps={STEPS.slice(INFO_STEPS).map((_, index) => index + 1)}
                        />

                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">
                                {translate('sign_up_provider.header.title_step_7')}
                            </div>
                            <div className="sign_up-pane-body">
                                <TranslateHtml
                                    component={<div className="sign_up-pane-text" />}
                                    i18n={'sign_up_provider.header.subtitle_step_7'}
                                />
                            </div>
                            <div className="sign_up-pane-body">
                                <div className="sign_up-employees">
                                    {employees?.map((employee, index) => (
                                        <div className="sign_up-employee" key={index}>
                                            <span>
                                                {employee.email
                                                    ? employee.email
                                                    : strLimit(employee.identity_address, 32)}
                                            </span>
                                            <div className="sign_up-employee-actions">
                                                <a
                                                    onClick={() => deleteEmployee(employee)}
                                                    className="mdi mdi-trash-can-outline"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <form className="form" onSubmit={saveEmployee}>
                                    <div className="row">
                                        <div className="col col-md-8 col-xs-12">
                                            <div className="form-group">
                                                <label className="form-label">E-mailadres</label>
                                                <UIControlText
                                                    className={'large'}
                                                    value={employeeForm.values.email}
                                                    onChange={(e) => employeeForm.update({ email: e.target.value })}
                                                    placeholder={'Voorbeeld: e-mail@e-mail.nl'}
                                                />
                                                <FormError error={employeeForm.errors.email} />
                                            </div>
                                        </div>
                                        <div className="col col-md-4 col-xs-12">
                                            <div className="form-group">
                                                <label className="form-label">&nbsp;</label>
                                                <button
                                                    className="button button-primary button-fill"
                                                    type="submit"
                                                    disabled={!employeeForm.values.email || employeeForm.isLocked}>
                                                    {translate('organization_edit.buttons.add_employee')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <SignUpFooter
                                startActions={
                                    <div className="button button-text button-text-padless" onClick={back} tabIndex={0}>
                                        <em className="mdi mdi-chevron-left icon-lefts" />
                                        {translate('sign_up_provider.buttons.back')}
                                    </div>
                                }
                                endActions={
                                    <div className="button button-text button-text-padless" onClick={next} tabIndex={0}>
                                        {translate('sign_up_provider.buttons.next')}
                                        <em className="mdi mdi-chevron-right icon-right" />
                                    </div>
                                }
                            />
                        </div>
                    </Fragment>
                )}

                {step == 'STEP_FUND_APPLY' && (
                    <div className={'step-item fund-apply'}>
                        <SignUpProgress
                            infoSteps={INFO_STEPS}
                            step={STEPS.indexOf(step) + 1}
                            shownSteps={STEPS.slice(INFO_STEPS).map((_, index) => index + 1)}
                        />

                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">
                                {translate('sign_up_provider.header.title_step_8')}
                            </div>
                            <div className="sign_up-pane-body">
                                <div className="sign_up-pane-text">
                                    {translate('sign_up_provider.header.subtitle_step_8')}
                                </div>
                            </div>
                            <div className="sign_up-pane-body">
                                <SignUpAvailableFunds
                                    organization={organization}
                                    onApply={applyFund}
                                    externalFilters={fundFilter.values}
                                />
                                {!hasFundApplications && (
                                    <UIControlCheckbox
                                        label={translate(
                                            'Ik wil me nu niet aanmelden voor een regeling en doe dit later.',
                                        )}
                                        checked={skipFundApplications}
                                        onChange={(e) => setSkipFundApplications(e.target.checked)}
                                    />
                                )}
                            </div>
                            <SignUpFooter
                                startActions={
                                    <div className="button button-text button-text-padless" onClick={back} tabIndex={0}>
                                        <em className="mdi mdi-chevron-left icon-lefts" />
                                        {translate('sign_up_provider.buttons.back')}
                                    </div>
                                }
                                endActions={
                                    (skipFundApplications || hasFundApplications) && (
                                        <div
                                            className="button button-text button-text-padless"
                                            onClick={next}
                                            tabIndex={0}>
                                            {translate('sign_up_provider.buttons.next')}
                                            <em className="mdi mdi-chevron-right icon-right" />
                                        </div>
                                    )
                                }
                            />
                        </div>
                    </div>
                )}

                {step == 'STEP_PROCESS_NOTICE' && (
                    <div className={'finish-screen visible-md visible-lg'}>
                        <SignUpProgress
                            infoSteps={INFO_STEPS}
                            step={STEPS.indexOf(step) + 1}
                            shownSteps={STEPS.slice(INFO_STEPS).map((_, index) => index + 1)}
                        />

                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">
                                {translate('sign_up_provider.header.title_step_9')}
                            </div>
                            <div className="sign_up-pane-body">
                                <div className="form row">
                                    <div className="form-group col col-lg-12">
                                        <div className="block-icon">
                                            <img alt={''} src={assetUrl('/assets/img/icon-sign_up-success.svg')} />
                                        </div>
                                        <div className="sign_up-pane-heading text-center">
                                            {translate('sign_up_provider.header.top_title_step_9')}
                                        </div>
                                        <p className="sign_up-pane-text text-center">
                                            {translate('sign_up_provider.header.subtitle_step_9')}
                                        </p>
                                        <div className="text-center">
                                            {loggedWithApp && (
                                                <div className="button button-primary-variant" onClick={() => next()}>
                                                    {translate('sign_up_provider.buttons.go_test_screen')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <SignUpFooter
                                startActions={
                                    <div className="button button-text button-text-padless" onClick={back} tabIndex={0}>
                                        <em className="mdi mdi-chevron-left icon-lefts" />
                                        {translate('sign_up_provider.buttons.back')}
                                    </div>
                                }
                                endActions={
                                    !loggedWithApp && (
                                        <div
                                            className="button button-text button-text-padless"
                                            onClick={finish}
                                            tabIndex={0}>
                                            {translate('sign_up_provider.buttons.go_to_dashboard')}
                                            <em className="mdi mdi-chevron-right icon-right" />
                                        </div>
                                    )
                                }
                            />
                        </div>
                    </div>
                )}

                {step == 'STEP_PROCESS_NOTICE' && (
                    <div className={'finish-screen visible-sm visible-xs'}>
                        <SignUpProgress
                            infoSteps={INFO_STEPS}
                            step={STEPS.indexOf(step) + 1}
                            shownSteps={STEPS.slice(INFO_STEPS).map((_, index) => index + 1)}
                        />

                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">
                                {translate('sign_up_provider.header.title_step_9_mobile')}
                            </div>
                            <div className="sign_up-pane-body">
                                <div className="form row">
                                    <div className="form-group col col-lg-12">
                                        <div className="block-icon">
                                            <img alt={''} src={assetUrl('/assets/img/icon-sign_up-success.svg')} />
                                        </div>
                                        <div className="sign_up-pane-heading text-center">
                                            {translate('sign_up_provider.header.top_title_step_9_mobile')}
                                        </div>
                                        <p className="sign_up-pane-text text-left">
                                            {translate('sign_up_provider.header.subtitle_step_9_mobile')}
                                        </p>
                                        <div className="text-center">
                                            {loggedWithApp && (
                                                <div className="button button-primary-variant" onClick={() => next()}>
                                                    {translate('sign_up_provider.buttons.go_test_screen')}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-lg-12 col-md-12 col-sm-12">
                                            <a
                                                href="https://www.forus.io/DL"
                                                className="button button-primary-outline col-xs-12">
                                                {translate('sign_up_provider.header.download_step_9_mobile')}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step == 'STEP_DEMO_TRANSACTION' && (
                    <Fragment>
                        <SignUpProgress
                            infoSteps={INFO_STEPS}
                            step={STEPS.indexOf(step) + 1}
                            shownSteps={STEPS.slice(INFO_STEPS).map((_, index) => index + 1)}
                        />

                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">
                                {translate('sign_up_provider.header.title_step_10')}
                            </div>
                            <div className="sign_up-pane-body">
                                <div className="sign_up-pane-text header">
                                    {translate('sign_up_provider.header.subtitle_step_10')}
                                </div>
                                <div className="sign_up-pane-auth test-qr">
                                    <div className="sign_up-pane-auth-qr_code">
                                        {demoToken && (
                                            <QrCode
                                                logo={assetUrl('/assets/img/me-logo-react.png')}
                                                value={JSON.stringify({ type: 'demo_voucher', value: demoToken })}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {demoToken && (
                                <SignUpFooter
                                    startActions={
                                        <div
                                            className="button button-text button-text-padless"
                                            onClick={() => {
                                                setDemoToken(null);
                                                back();
                                            }}
                                            tabIndex={0}>
                                            <em className="mdi mdi-chevron-left icon-lefts" />
                                            {translate('sign_up_provider.buttons.back')}
                                        </div>
                                    }
                                    endActions={
                                        <div
                                            className="button button-text button-text-padless"
                                            onClick={finish}
                                            tabIndex={0}>
                                            Skip and finish
                                            <em className="mdi mdi-chevron-right icon-right" />
                                        </div>
                                    }
                                />
                            )}

                            {!loggedWithApp && (
                                <SignUpFooter
                                    endActions={
                                        <div
                                            className="button button-text button-text-padless"
                                            onClick={next}
                                            tabIndex={0}>
                                            {translate('sign_up_provider.buttons.go_to_dashboard')}
                                            <em className="mdi mdi-chevron-right icon-right" />
                                        </div>
                                    }
                                />
                            )}
                        </div>
                    </Fragment>
                )}

                {step == 'STEP_SIGNUP_FINISHED' && (
                    <div className="finish-screen">
                        <SignUpProgress
                            infoSteps={INFO_STEPS}
                            step={STEPS.indexOf(step) + 1}
                            shownSteps={STEPS.slice(INFO_STEPS).map((_, index) => index + 1)}
                        />

                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">
                                {translate('sign_up_provider.header.title_step_11')}
                            </div>
                            <div className="sign_up-pane-body">
                                <div className="form row">
                                    <div className="form-group col col-lg-12">
                                        <div className="block-icon">
                                            <img alt={''} src={assetUrl('/assets/img/icon-smartphone-sign_up.svg')} />
                                        </div>
                                        <div className="sign_up-pane-heading text-center">
                                            {translate('sign_up_provider.header.top_title_step_11')}
                                        </div>
                                        <p className="sign_up-pane-text text-center">
                                            {translate('sign_up_provider.header.subtitle_step_11')}
                                        </p>
                                        <div className="text-center">
                                            <div className="button button-primary-variant" onClick={() => finish()}>
                                                {translate('sign_up_provider.buttons.go_to_dashboard')}
                                            </div>
                                        </div>
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
