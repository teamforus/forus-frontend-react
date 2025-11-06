import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import ProgressStorage from '../../../helpers/ProgressStorage';
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
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function SignUpSponsor() {
    const assetUrl = useAssetUrl();
    const navigate = useNavigate();
    const translate = useTranslate();

    const { token: authToken } = useContext(authContext);
    const organizations = useOrganization();

    const [INFO_STEPS] = useState(1);

    const [STEP_INFO_GENERAL] = useState(1);

    const STEP_CREATE_PROFILE = useMemo(() => (authToken ? null : 2), [authToken]);
    const STEP_SELECT_ORGANIZATION = useMemo(() => (authToken ? 2 : 3), [authToken]);
    const STEP_ORGANIZATION_ADD = useMemo(() => (authToken ? 3 : 4), [authToken]);
    const STEP_SIGNUP_FINISHED = useMemo(() => (authToken ? 4 : 5), [authToken]);

    const shownSteps = useMemo(() => (authToken ? [1, 2, 3] : [1, 2, 3, 4]), [authToken]);

    const [step, setStep] = useState(STEP_INFO_GENERAL);
    const [organization, setOrganization] = useState(null);
    const [progressStorage] = useState(new ProgressStorage('sponsor-sign_up'));

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
        },
        [STEP_SIGNUP_FINISHED, goToStep, setOrganizationValue],
    );

    const addOrganization = useCallback(() => {
        goToStep(STEP_ORGANIZATION_ADD);
    }, [STEP_ORGANIZATION_ADD, goToStep]);

    const cancelAddOrganization = useCallback(() => {
        goToStep(organizations?.length ? STEP_SELECT_ORGANIZATION : STEP_INFO_GENERAL);
    }, [STEP_INFO_GENERAL, STEP_SELECT_ORGANIZATION, goToStep, organizations?.length]);

    const next = useCallback(
        function () {
            goToStep(step + 1);
        },
        [goToStep, step],
    );

    const back = useCallback(() => {
        goToStep(step - 1);
    }, [goToStep, step]);

    const finish = useCallback(() => {
        navigate(getStateRouteUrl(DashboardRoutes.ORGANIZATION, { organizationId: organization.id }));
    }, [navigate, organization?.id]);

    const openAuthPopup = useCallback(() => {
        navigate(getStateRouteUrl(DashboardRoutes.HOME));
    }, [navigate]);

    useEffect(() => {
        const step = parseInt(progressStorage.get('step'));
        const stepsAvailable = authToken
            ? [STEP_INFO_GENERAL, STEP_SELECT_ORGANIZATION, STEP_ORGANIZATION_ADD, STEP_SIGNUP_FINISHED].filter(
                  (step) => step,
              )
            : [STEP_INFO_GENERAL, STEP_CREATE_PROFILE, STEP_ORGANIZATION_ADD, STEP_SIGNUP_FINISHED];

        if (stepsAvailable.indexOf(step) === -1) {
            return goToStep(STEP_INFO_GENERAL);
        }

        goToStep(step);
    }, [
        STEP_CREATE_PROFILE,
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
                        <NavLink to={getStateRouteUrl(DashboardRoutes.HOME)} className="sign_up-header-item-button">
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

                <h2 className="block-title">{translate('sign_up_sponsor.header.main_header')}</h2>

                {step == STEP_INFO_GENERAL && (
                    <Fragment>
                        <SignUpProgress infoSteps={INFO_STEPS} step={step} shownSteps={shownSteps} />
                        <SignUpStepGeneralInfo panelType={'sponsor'} onStepNext={next} />
                    </Fragment>
                )}

                {step == STEP_CREATE_PROFILE && (
                    <Fragment>
                        <SignUpProgress infoSteps={INFO_STEPS} step={step} shownSteps={shownSteps} />
                        <SignUpStepProfileCreate panelType={'sponsor'} />
                    </Fragment>
                )}

                {step == STEP_SELECT_ORGANIZATION && (
                    <Fragment>
                        <SignUpProgress infoSteps={INFO_STEPS} step={step} shownSteps={shownSteps} />

                        <SignUpStepOrganizationSelect
                            panelType={'sponsor'}
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
                            panelType={'sponsor'}
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
                                {translate(`sign_up_sponsor.header.title_step_5`)}
                            </div>
                            <div className="sign_up-pane-body">
                                <div className="text-center">
                                    <img src={assetUrl('/assets/img/sign_up_finished.svg')} alt={''} />
                                </div>
                                <div className="sign_up-pane-subtitle">
                                    {translate('sign_up_sponsor.header.subtitle_step_5')}
                                </div>
                                <br />
                                <br />
                                <div className="text-center">
                                    <div className="button button-primary-variant" onClick={finish}>
                                        {translate('sign_up_sponsor.buttons.go_to_dashboard')}
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
