import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import ProgressStorage from '../../../helpers/ProgressStorage';
import { useOrganizationService } from '../../../services/OrganizationService';
import Organization from '../../../props/models/Organization';
import useAssetUrl from '../../../hooks/useAssetUrl';
import useOrganization from '../../../hooks/useOrganizations';
import { authContext } from '../../../contexts/AuthContext';
import SignUpProgress from './elements/SignUpProgress';
import SignUpStepGeneralInfo from './elements/sign-up-steps/SignUpStepGeneralInfo';
import SignUpStepProfileCreate from './elements/sign-up-steps/SignUpStepProfileCreate';
import SignUpStepOrganizationSelect from './elements/sign-up-steps/SignUpStepOrganizationSelect';
import SignUpStepOrganizationAdd from './elements/sign-up-steps/SignUpStepOrganizationAdd';
import useTranslate from '../../../hooks/useTranslate';
import SignUpFooter from '../../../../webshop/components/elements/sign-up/SignUpFooter';

export default function SignUpValidator() {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    const { token: authToken } = useContext(authContext);

    const navigate = useNavigate();
    const organizations = useOrganization();
    const organizationService = useOrganizationService();

    const [INFO_STEPS] = useState(2);

    const [STEP_INFO_GENERAL] = useState(1);
    const [STEP_INFO_DETAILS] = useState(2);

    const STEP_CREATE_PROFILE = useMemo(() => (authToken ? null : 3), [authToken]);
    const STEP_SELECT_ORGANIZATION = useMemo(() => (authToken ? 3 : 4), [authToken]);
    const STEP_ORGANIZATION_ADD = useMemo(() => (authToken ? 4 : 5), [authToken]);
    const STEP_SIGNUP_FINISHED = useMemo(() => (authToken ? 5 : 6), [authToken]);

    const shownSteps = useMemo(() => (authToken ? [1, 2, 3] : [1, 2, 3, 4]), [authToken]);

    const [progressStorage] = useState(new ProgressStorage('validator-sign_up'));

    const [step, setStep] = useState(STEP_INFO_GENERAL);
    const [organization, setOrganization] = useState(null);

    const goToStep = useCallback(
        (step: number) => {
            const stepsTotal = shownSteps?.length + INFO_STEPS;

            if (step <= stepsTotal) {
                setStep(step);
                progressStorage.set('step', step.toString());

                if (step == STEP_SELECT_ORGANIZATION && organizations && organizations?.length == 0) {
                    goToStep(STEP_ORGANIZATION_ADD);
                }
            }

            // last step, time for progress cleanup
            if (step >= stepsTotal) {
                progressStorage.clear();
            }
        },
        [
            INFO_STEPS,
            STEP_ORGANIZATION_ADD,
            STEP_SELECT_ORGANIZATION,
            organizations,
            progressStorage,
            shownSteps?.length,
        ],
    );

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
        goToStep(organizations?.length ? STEP_SELECT_ORGANIZATION : STEP_INFO_DETAILS);
    }, [STEP_INFO_DETAILS, STEP_SELECT_ORGANIZATION, goToStep, organizations?.length]);

    const next = useCallback(
        function () {
            if (step == STEP_INFO_GENERAL) {
                goToStep(STEP_INFO_DETAILS);
            } else if (step == STEP_INFO_DETAILS) {
                if (!authToken) {
                    goToStep(STEP_CREATE_PROFILE);
                } else {
                    goToStep(STEP_SELECT_ORGANIZATION);
                }
            } else {
                goToStep(step + 1);
            }
        },
        [
            STEP_CREATE_PROFILE,
            STEP_INFO_DETAILS,
            STEP_INFO_GENERAL,
            STEP_SELECT_ORGANIZATION,
            authToken,
            goToStep,
            step,
        ],
    );

    const back = useCallback(() => {
        goToStep(step - 1);
    }, [goToStep, step]);

    const finish = useCallback(() => {
        navigate(getStateRouteUrl('organizations-view', { organizationId: organization.id }));
    }, [navigate, organization?.id]);

    const openAuthPopup = useCallback(() => {
        navigate(getStateRouteUrl('home'));
    }, [navigate]);

    useEffect(() => {
        const step = parseInt(progressStorage.get('step'));
        const stepsAvailable = authToken
            ? [
                  STEP_INFO_GENERAL,
                  STEP_INFO_DETAILS,
                  STEP_SELECT_ORGANIZATION,
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
        authToken,
        goToStep,
        organizations,
        progressStorage,
    ]);

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
                    {!authToken && (
                        <div className="sign_up-header-item">
                            <a className="sign_up-header-item-button" onClick={openAuthPopup}>
                                Inloggen
                                <em className="mdi mdi-login icon-end" />
                            </a>
                        </div>
                    )}
                </div>

                <h2 className="block-title">{translate('sign_up_validator.header.main_header')}</h2>

                {step == STEP_INFO_GENERAL && (
                    <Fragment>
                        <SignUpProgress infoSteps={INFO_STEPS} step={step} shownSteps={shownSteps} />

                        <SignUpStepGeneralInfo panelType={'validator'} onStepNext={next} />
                    </Fragment>
                )}

                {step == STEP_INFO_DETAILS && (
                    <Fragment>
                        <SignUpProgress infoSteps={INFO_STEPS} step={step} shownSteps={shownSteps} />

                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">
                                {translate('sign_up_validator.header.title_step_2')}
                            </div>
                            <div className="sign_up-pane-body">
                                <div className="sign_up-pane-media">
                                    <img src={assetUrl('/assets/img/icon-smartphone-sign_up.svg')} alt={''} />
                                </div>
                                <div className="sign_up-pane-text">
                                    {translate('sign_up_validator.header.subtitle_step_2')}
                                </div>
                            </div>
                            <SignUpFooter
                                startActions={
                                    <button
                                        className="button button-text button-text-padless"
                                        type={'button'}
                                        onClick={back}
                                        tabIndex={0}>
                                        <em className="mdi mdi-chevron-left icon-left" />
                                        {translate('sign_up_validator.buttons.back')}
                                    </button>
                                }
                                endActions={
                                    <button
                                        className="button button-text button-text-padless"
                                        type={'button'}
                                        onClick={next}
                                        tabIndex={0}>
                                        {translate('sign_up_validator.buttons.next')}
                                        <em className="mdi mdi-chevron-right icon-right" />
                                    </button>
                                }
                            />
                        </div>
                    </Fragment>
                )}

                {step == STEP_CREATE_PROFILE && (
                    <Fragment>
                        <SignUpProgress infoSteps={INFO_STEPS} step={step} shownSteps={shownSteps} />

                        <SignUpStepProfileCreate panelType={'validator'} />
                    </Fragment>
                )}

                {step == STEP_SELECT_ORGANIZATION && (
                    <Fragment>
                        <SignUpProgress infoSteps={INFO_STEPS} step={step} shownSteps={shownSteps} />

                        <SignUpStepOrganizationSelect
                            panelType={'validator'}
                            onOrganizationAdd={addOrganization}
                            onOrganizationSelect={selectOrganization}
                            onStepBack={back}
                        />
                    </Fragment>
                )}

                {step == STEP_ORGANIZATION_ADD && (
                    <Fragment>
                        <SignUpProgress infoSteps={INFO_STEPS} step={step} shownSteps={shownSteps} />

                        <SignUpStepOrganizationAdd
                            panelType={'validator'}
                            onOrganizationSelect={selectOrganization}
                            onCancelAddOrganization={cancelAddOrganization}
                        />
                    </Fragment>
                )}

                {step == STEP_SIGNUP_FINISHED && (
                    <div className="finish-screen">
                        <SignUpProgress step={step} infoSteps={INFO_STEPS} shownSteps={shownSteps} />

                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">
                                {translate('sign_up_validator.header.title_step_6')}
                            </div>
                            <div className="sign_up-pane-body">
                                <div className="text-center">
                                    <img src={assetUrl('/assets/img/sign_up_finished.svg')} alt={''} />
                                </div>
                                <div className="sign_up-pane-subtitle">
                                    {translate('sign_up_validator.header.subtitle_step_6')}
                                </div>
                                <br />
                                <br />
                                <div className="text-center">
                                    <div className="button button-primary-variant" onClick={finish}>
                                        {translate('sign_up_validator.buttons.go_to_dashboard')}
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
