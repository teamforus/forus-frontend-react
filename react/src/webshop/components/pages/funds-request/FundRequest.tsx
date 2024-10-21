import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Fund from '../../../props/models/Fund';
import { useFundRequestService } from '../../../services/FundRequestService';
import { ResponseError } from '../../../../dashboard/props/ApiResponses';
import usePushSuccess from '../../../../dashboard/hooks/usePushSuccess';
import usePushDanger from '../../../../dashboard/hooks/usePushDanger';
import { useNavigateState, useStateParams } from '../../../modules/state_router/Router';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import { currencyFormat } from '../../../../dashboard/helpers/string';
import { useDigiDService } from '../../../services/DigiDService';
import Voucher from '../../../../dashboard/props/models/Voucher';
import { useHelperService } from '../../../../dashboard/services/HelperService';
import FundsListItemModel from '../../../services/types/FundsListItemModel';
import { useVoucherService } from '../../../services/VoucherService';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import { useParams } from 'react-router-dom';
import useAppConfigs from '../../../hooks/useAppConfigs';
import type FundRequest from '../../../../dashboard/props/models/FundRequest';
import RecordType from '../../../../dashboard/props/models/RecordType';
import { useRecordTypeService } from '../../../../dashboard/services/RecordTypeService';
import useAssetUrl from '../../../hooks/useAssetUrl';
import IconTimeout from '../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-timeout.svg';
import RecordTypeOption from '../../../../dashboard/props/models/RecordTypeOption';
import { useFundService } from '../../../services/FundService';
import File from '../../../../dashboard/props/models/File';
import FundRequestStepEmailSetup from './elements/steps/FundRequestStepEmailSetup';
import FundRequestStepCriteriaOverview from './elements/steps/FundRequestStepCriteriaOverview';
import FundRequestProgress from './elements/FundRequestProgress';
import FundRequestStepDone from './elements/steps/FundRequestStepDone';
import FundRequestValuesOverview from './elements/steps/FundRequestValuesOverview';
import FundRequestStepContactInformation from './elements/steps/FundRequestStepContactInformation';
import FundRequestStepConfirmCriteria from './elements/steps/FundRequestStepConfirmCriteria';
import FundRequestBsnWarning from './elements/FundRequestBsnWarning';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import useFetchAuthIdentity from '../../../hooks/useFetchAuthIdentity';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import BlockLoader from '../../elements/block-loader/BlockLoader';
import FundCriteriaStep from '../../../../dashboard/props/models/FundCriteriaStep';
import FundRequestStepCriteria from './elements/steps/FundRequestStepCriteria';
import useShouldRequestRecord from './hooks/useShouldRequestRecord';
import FundCriterion from '../../../../dashboard/props/models/FundCriterion';
import { orderBy, sortBy } from 'lodash';
import FundRequestHelpBlock from './elements/FundRequestHelpBlock';

export type LocalCriterion = FundCriterion & {
    input_value?: string;
    files_uid?: Array<string>;
    errors?: { [key: string]: string | string[] };
    files?: File[];
    is_checked?: boolean;
    title_default?: string;
    label?: string;
    control_type?: string;
    record_type_options?: { [key: string]: RecordTypeOption };
    requested?: boolean;
};

type FundCriteriaStepLocal = FundCriteriaStep & {
    uid?: string;
    uploaderTemplate: 'inline' | 'default';
    criteria: Array<LocalCriterion>;
};

export default function FundRequest() {
    const { id } = useParams();
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();

    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const navigateState = useNavigateState();
    const setProgress = useSetProgress();
    const fetchAuthIdentity = useFetchAuthIdentity();

    const fundService = useFundService();
    const digIdService = useDigiDService();
    const helperService = useHelperService();
    const voucherService = useVoucherService();
    const recordTypeService = useRecordTypeService();
    const fundRequestService = useFundRequestService();

    const { from } = useStateParams<{ from?: string }>();
    const [step, setStep] = useState<number>(null);
    const [submitInProgress, setSubmitInProgress] = useState(false);
    const [errorReason, setErrorReason] = useState<string>(null);
    const [finishError, setFinishError] = useState(false);
    const [autoSubmit, setAutoSubmit] = useState(false);
    const [autoSubmitted, setAutoSubmitted] = useState(false);

    const [digiExpired, setDigidExpired] = useState<boolean>(null);

    const [contactInformation, setContactInformation] = useState('');
    const [contactInformationError, setContactInformationError] = useState(null);
    const [steps, setSteps] = useState([]);

    const [criteriaStepKeys, setCriteriaStepKeys] = useState([]);
    const [pendingCriteria, setPendingCriteria] = useState<Array<LocalCriterion>>([]);

    const [fund, setFund] = useState<FundsListItemModel>(null);
    const [vouchers, setVouchers] = useState<Array<Voucher>>(null);
    const [recordTypes, setRecordTypes] = useState<Array<RecordType>>(null);
    const [fundRequests, setFundRequests] = useState<Array<FundRequest>>(null);

    const bsnIsKnown = useMemo(() => !!authIdentity?.bsn, [authIdentity]);
    const emailSetupShow = useMemo(() => !authIdentity?.email, [authIdentity]);

    const digidAvailable = useMemo(() => appConfigs?.digid, [appConfigs]);
    const digidMandatory = useMemo(() => appConfigs?.digid_mandatory, [appConfigs]);

    const shouldAddContactInfo = useMemo(
        () => !authIdentity?.email && fund?.contact_info_enabled,
        [authIdentity, fund],
    );

    const shouldAddContactInfoRequired = useMemo(
        () => shouldAddContactInfo && fund?.contact_info_required,
        [fund?.contact_info_required, shouldAddContactInfo],
    );

    const recordTypesByKey = useMemo<{ [key: string]: RecordType }>(() => {
        return recordTypes?.reduce((acc, type) => ({ ...acc, [type.key]: type }), {});
    }, [recordTypes]);

    const recordValuesByType = useMemo<{ [key: string]: string }>(() => {
        return pendingCriteria.reduce((list, item) => {
            return { ...list, [item.record_type_key]: item.input_value };
        }, {});
    }, [pendingCriteria]);

    const shouldRequestRecord = useShouldRequestRecord(recordTypesByKey, recordValuesByType);

    const criteriaSteps = useMemo<Array<FundCriteriaStepLocal>>(() => {
        if (!fund || !pendingCriteria || !recordTypesByKey) {
            return null;
        }

        const fundSteps = fund.criteria_steps.map((step) => step.id);
        const hasOrders = pendingCriteria.filter((item) => item.order !== null).length > 0;

        const customSteps = fund.criteria_steps.map(
            (step): FundCriteriaStepLocal => ({
                ...step,
                uid: `criteria_step_${step.id}`,
                uploaderTemplate: 'inline',
                criteria: orderBy(
                    pendingCriteria
                        .filter((criterion) => criterion.fund_criteria_step_id == step.id)
                        .map((criterion) => ({ ...criterion, requested: shouldRequestRecord(criterion) })),
                    'order',
                ),
            }),
        );

        const stepLessCriteria = (hasOrders ? orderBy(pendingCriteria, 'order') : pendingCriteria)
            .filter((criterion) => {
                return !criterion.fund_criteria_step_id || !fundSteps.includes(criterion.fund_criteria_step_id);
            })
            .map(
                (criterion): FundCriteriaStepLocal => ({
                    uid: `criteria_step_default_${criterion.id}`,
                    title: criterion.title || `Bevestig uw ${recordTypesByKey?.[criterion?.record_type?.key]?.name}`,
                    order: 1000,
                    criteria: [{ ...criterion, requested: shouldRequestRecord(criterion) }],
                    uploaderTemplate: 'default',
                }),
            );

        const combinedSteps = [...customSteps, ...stepLessCriteria].filter(
            (step) => step.criteria.filter((criterion) => criterion.requested).length > 0,
        );

        return sortBy(combinedSteps, 'order');
    }, [fund, pendingCriteria, recordTypesByKey, shouldRequestRecord]);

    const setStepByName = useCallback(
        (stepName: string) => {
            setStep(steps.indexOf(stepName));
        },
        [steps],
    );

    const nextStep = useCallback(() => {
        setStep((step) => Math.min(step + 1, steps.length - 1));
    }, [steps?.length]);

    const prevStep = useCallback(() => {
        setStep((step) => Math.max(step - 1, 0));
    }, []);

    const formDataBuild = useCallback(
        (criteria: Array<LocalCriterion>): object => {
            return {
                contact_information: contactInformation,
                records: criteria.map((criterion) => {
                    const { id, value, operator, input_value = '', files_uid = [] } = criterion;

                    const makeValue =
                        {
                            '*': () => value,
                            '=': () => value,
                            '>': () => parseInt(value) + 1,
                            '<': () => parseInt(value) - 1,
                            '>=': () => value,
                            '<=': () => value,
                        }[operator] || null;

                    return fund?.auto_validation
                        ? { files: [], value: makeValue ? makeValue() : null, fund_criterion_id: id }
                        : { files: files_uid, value: input_value, fund_criterion_id: id };
                }),
            };
        },
        [contactInformation, fund?.auto_validation],
    );

    const applyFund = useCallback(
        (fund: Fund) => {
            fundService
                .apply(fund.id)
                .then((res) => {
                    fetchAuthIdentity().then(() => {
                        navigateState('voucher', { address: res.data.data.address });
                        pushSuccess(`Succes! ${fund.name} tegoed geactiveerd!`);
                    });
                })
                .catch((err: ResponseError) => pushDanger(err.data.message));
        },
        [fetchAuthIdentity, fundService, navigateState, pushDanger, pushSuccess],
    );

    const submitRequest = useCallback(() => {
        if (submitInProgress) {
            return;
        }

        setSubmitInProgress(true);

        fundRequestService
            .store(fund.id, formDataBuild(pendingCriteria.filter((criterion) => shouldRequestRecord(criterion))))
            .then(() => {
                if (fund.auto_validation) {
                    return applyFund(fund);
                }

                setStepByName('done');
                setErrorReason('');
                setFinishError(false);
            })
            .catch((err: ResponseError) => {
                setFinishError(true);
                setErrorReason(err.data.message);
                setSubmitInProgress(false);
                setContactInformationError(err.data?.errors?.contact_information);

                if (err.status === 422 && err.data.errors.contact_information) {
                    return setStepByName('contact_information');
                }

                setStepByName('done');
            });
    }, [
        applyFund,
        formDataBuild,
        fund,
        fundRequestService,
        pendingCriteria,
        setStepByName,
        submitInProgress,
        shouldRequestRecord,
    ]);

    const criterionTitle = useCallback(
        (criterion: FundCriterion) => {
            const record_type = criterion.record_type;

            if (['>', '<', '>=', '<=', '=', '*'].includes(criterion?.operator)) {
                const key =
                    {
                        '>': 'more',
                        '>=': 'more_or_equal',
                        '<': 'less',
                        '<=': 'less_or_equal',
                        '=': 'same',
                        '*': 'any',
                    }[criterion.operator] || '';

                const isCurrency = fundService.getCurrencyKeys().includes(record_type?.key);

                const value =
                    record_type.type == 'select'
                        ? record_type.options.find((option) => option.value == criterion.value)?.name || ''
                        : criterion.value;

                return translate(`fund_request.sign_up.pane.criterion_${key}`, {
                    name: criterion?.record_type?.name,
                    value: isCurrency ? currencyFormat(parseFloat(value)) : value,
                });
            }
        },
        [fundService, translate],
    );

    // Start digid sign-in
    const startDigId = useCallback(() => {
        digIdService
            .startFundRequest(fund.id)
            .then((res) => (document.location = res.data.redirect_url))
            .catch((err) => {
                if (err.status === 403 && err.data.message) {
                    return pushDanger(err.data.message);
                }

                navigateState('error', { errorCode: err.headers('error-code') });
            });
    }, [digIdService, fund?.id, navigateState, pushDanger]);

    const transformInvalidCriteria = useCallback(
        function (item: FundCriterion): LocalCriterion {
            const control_type = fundService.getCriterionControlType(item.record_type, item.operator);

            return {
                ...item,
                title_default: criterionTitle(item),
                record_type_options: item.record_type?.options.reduce(
                    (list, option) => ({ ...list, [option.value]: option }),
                    {},
                ),
                files: [],
                label:
                    control_type === 'ui_control_checkbox'
                        ? item.label || 'Ik verklaar aan de bovenstaande voorwaarden te voldoen'
                        : '',
                input_value: fundService.getCriterionControlDefaultValue(item.record_type, item.operator),
                control_type,
            };
        },
        [criterionTitle, fundService],
    );

    const buildSteps = useCallback(() => {
        if (!fund || !criteriaSteps) {
            return null;
        }

        const hideOverview = fund.auto_validation && !shouldAddContactInfo;
        const criteriaStepsList = criteriaSteps.map((step) => step.uid);

        const criteriaStepsKeys = [
            fund.auto_validation ? 'confirm_criteria' : null,
            ...(fund.auto_validation ? [] : criteriaStepsList),
            shouldAddContactInfo ? 'contact_information' : null,
            hideOverview ? null : 'application_overview',
        ].filter((step) => step);

        const steps = [
            emailSetupShow ? 'email_setup' : null,
            !fund.auto_validation ? 'criteria' : null,
            ...criteriaStepsKeys.filter((step) => step),
            'done',
        ].filter((step) => step);

        setSteps(steps);
        setCriteriaStepKeys(criteriaStepsKeys);
    }, [emailSetupShow, fund, criteriaSteps, shouldAddContactInfo]);

    const getFirstActiveFundVoucher = useCallback((fund: Fund, vouchers: Array<Voucher>) => {
        return vouchers.find((voucher) => !voucher.expired && voucher.fund_id === fund.id);
    }, []);

    const goToActivationComponent = useCallback(() => {
        navigateState('fund-activate', { id: fund.id });
    }, [fund?.id, navigateState]);

    const submitConfirmCriteria = useCallback(() => {
        if (steps.includes('contact_information')) {
            return setStepByName('contact_information');
        }

        submitRequest();
    }, [setStepByName, steps, submitRequest]);

    const submitContactInformation = useCallback(
        (e: React.FormEvent) => {
            e?.preventDefault();
            e?.stopPropagation();

            if (steps.includes('application_overview')) {
                return setStepByName('application_overview');
            }

            submitRequest();
        },
        [steps, submitRequest, setStepByName],
    );

    const fundRequestIsAvailable = useCallback(
        (fund: Fund) => {
            return fund.allow_fund_requests && (!digidMandatory || (digidMandatory && bsnIsKnown));
        },
        [bsnIsKnown, digidMandatory],
    );

    const fetchFund = useCallback(() => {
        setProgress(0);

        fundService
            .read(parseInt(id), { check_criteria: 1 })
            .then((res) => setFund(res.data.data))
            .finally(() => setProgress(100));
    }, [fundService, setProgress, id]);

    const fetchRecordTypes = useCallback(() => {
        setProgress(0);

        recordTypeService
            .list()
            .then((res) => setRecordTypes(res.data))
            .finally(() => setProgress(100));
    }, [recordTypeService, setProgress]);

    const fetchVouchers = useCallback(() => {
        if (!authIdentity || !fund) {
            setVouchers(null);
            return;
        }

        setProgress(0);

        voucherService
            .list()
            .then((res) => setVouchers(res.data.data))
            .finally(() => setProgress(100));
    }, [authIdentity, fund, voucherService, setProgress]);

    const fetchFundRequests = useCallback(() => {
        if (!authIdentity || !fund) {
            return setFundRequests(null);
        }

        setProgress(0);

        fundRequestService
            .index(fund.id)
            .then((res) => setFundRequests(res.data.data))
            .finally(() => setProgress(100));
    }, [authIdentity, fund, fundRequestService, setProgress]);

    useEffect(() => {
        fetchFund();
    }, [fetchFund]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    useEffect(() => {
        fetchAuthIdentity().then();
    }, [fetchAuthIdentity]);

    useEffect(() => {
        fetchFundRequests();
    }, [fetchFundRequests]);

    useEffect(() => {
        buildSteps();
    }, [buildSteps]);

    useEffect(() => {
        if (steps?.length > 0 && step == null) {
            setStepByName(steps[0]);
        }
    }, [setStepByName, step, steps]);

    useEffect(() => {
        if (step !== null) {
            helperService.focusElement(document.querySelector('.block-sign_up'));
        }
    }, [helperService, step]);

    useEffect(() => {
        if (!fund || !vouchers || !fundRequests) {
            return;
        }

        // The user has to sign-in first
        const voucher = getFirstActiveFundVoucher(fund, vouchers);
        const pendingRequests = fundRequests.filter((request) => request.state === 'pending');
        const pendingCriteria = fund.criteria.filter((criterion) => !criterion.is_valid || !criterion.has_record);
        const invalidCriteria = fund.criteria.filter((criterion) => !criterion.is_valid);

        // Voucher already received, go to the voucher
        if (voucher) {
            return navigateState('voucher', { address: voucher.address });
        }

        // Hot linking is not allowed
        if (from !== 'fund-activate') {
            return navigateState('fund-activate', { id: fund.id });
        }

        // The user is not authenticated and have to go back to sign-up page
        if (fund.auto_validation && !bsnIsKnown) {
            return navigateState('start');
        }

        // Fund requests enabled and user has all meet the requirements
        if (!fundRequestIsAvailable(fund)) {
            return goToActivationComponent();
        }

        // The fund is already taken by identity partner
        if (fund.taken_by_partner || pendingRequests?.length > 0) {
            return goToActivationComponent();
        }

        // All the criteria are meet, request the voucher
        if (invalidCriteria.length == 0) {
            return goToActivationComponent();
        }

        setPendingCriteria(pendingCriteria.map((criterion) => transformInvalidCriteria(criterion)));

        setAutoSubmit(
            digidAvailable &&
                fund.auto_validation &&
                invalidCriteria?.length > 0 &&
                ['IIT', 'bus_2020', 'meedoen'].includes(fund.key),
        );
    }, [
        bsnIsKnown,
        transformInvalidCriteria,
        digidAvailable,
        from,
        fund,
        fundRequestIsAvailable,
        fundRequests,
        getFirstActiveFundVoucher,
        goToActivationComponent,
        navigateState,
        vouchers,
    ]);

    useEffect(() => {
        const removedData = {};

        const criteria = pendingCriteria
            .map((item) => {
                const defaultValue = fundService.getCriterionControlDefaultValue(item.record_type, item.operator);

                if (!shouldRequestRecord(item) && item.input_value != defaultValue) {
                    removedData[item.record_type_key] = {
                        input_value: item.input_value,
                        files: item.files,
                        files_uid: item.files_uid,
                        errors: item.errors,
                        is_checked: item.is_checked,
                    };

                    item.input_value = defaultValue;
                    item.files = [];
                    item.files_uid = [];
                    delete item.errors;
                    delete item.is_checked;
                }

                return { ...item };
            })
            .map((item) => {
                if (shouldRequestRecord(item) && Object.keys(removedData).includes(item.record_type_key)) {
                    return { ...item, ...removedData[item.record_type_key] };
                }

                return { ...item };
            });

        if (Object.keys(removedData).length > 0) {
            setPendingCriteria([...criteria]);
        }
    }, [fundService, pendingCriteria, shouldRequestRecord]);

    useEffect(() => {
        if (autoSubmit && steps?.[step] == 'confirm_criteria' && !autoSubmitted) {
            setAutoSubmitted(true);
            submitConfirmCriteria();
        }
    }, [autoSubmit, autoSubmitted, step, steps, submitConfirmCriteria]);

    if (!fund || !vouchers || !fundRequests || (steps[step] == 'confirm_criteria' && autoSubmit)) {
        return <BlockShowcase wrapper={true} />;
    }

    return (
        <BlockShowcase wrapper={true} breadcrumbs={<></>} loaderElement={<BlockLoader type={'full'} />}>
            {!digiExpired && (
                <div className="block block-sign_up">
                    <div className="block-wrapper form">
                        {steps[step] == 'email_setup' && (
                            <FundRequestStepEmailSetup
                                fund={fund}
                                step={step}
                                prevStep={prevStep}
                                nextStep={nextStep}
                                progress={
                                    <FundRequestProgress step={step} steps={steps} criteriaSteps={criteriaStepKeys} />
                                }
                                bsnWarning={<FundRequestBsnWarning fund={fund} setDigidExpired={setDigidExpired} />}
                            />
                        )}

                        {steps[step] == 'criteria' && (
                            <FundRequestStepCriteriaOverview
                                fund={fund}
                                step={step}
                                onPrevStep={prevStep}
                                onNextStep={nextStep}
                                criteriaSteps={criteriaSteps}
                                progress={
                                    <FundRequestProgress step={step} steps={steps} criteriaSteps={criteriaStepKeys} />
                                }
                                bsnWarning={<FundRequestBsnWarning fund={fund} setDigidExpired={setDigidExpired} />}
                            />
                        )}

                        {criteriaSteps?.map(
                            (criterionStep) =>
                                steps[step] == criterionStep.uid && (
                                    <FundRequestStepCriteria
                                        key={criterionStep.uid}
                                        step={step}
                                        steps={steps}
                                        fund={fund}
                                        title={criterionStep.title}
                                        onPrevStep={prevStep}
                                        onNextStep={nextStep}
                                        submitInProgress={submitInProgress}
                                        setSubmitInProgress={setSubmitInProgress}
                                        criteria={criterionStep.criteria.filter((item) => item.requested)}
                                        uploaderTemplate={criterionStep.uploaderTemplate}
                                        formDataBuild={formDataBuild}
                                        setCriterion={(id, update) => {
                                            setPendingCriteria((criteria) => {
                                                const criterion = criteria.find((item) => item.id == id);

                                                if (criterion) {
                                                    Object.assign(criterion, update);
                                                }

                                                return [...criteria];
                                            });
                                        }}
                                        recordTypes={recordTypes}
                                        progress={
                                            <FundRequestProgress
                                                step={step}
                                                steps={steps}
                                                criteriaSteps={criteriaStepKeys}
                                            />
                                        }
                                        bsnWarning={
                                            <FundRequestBsnWarning fund={fund} setDigidExpired={setDigidExpired} />
                                        }
                                    />
                                ),
                        )}

                        {steps[step] == 'confirm_criteria' && !autoSubmit && (
                            <FundRequestStepConfirmCriteria
                                fund={fund}
                                step={step}
                                onSubmitConfirmCriteria={submitConfirmCriteria}
                                onPrevStep={prevStep}
                                submitInProgress={submitInProgress}
                                progress={
                                    <FundRequestProgress step={step} steps={steps} criteriaSteps={criteriaStepKeys} />
                                }
                                bsnWarning={<FundRequestBsnWarning fund={fund} setDigidExpired={setDigidExpired} />}
                            />
                        )}

                        {steps[step] == 'contact_information' && (
                            <FundRequestStepContactInformation
                                fund={fund}
                                contactInformation={contactInformation}
                                onSubmitContactInformation={submitContactInformation}
                                setContactInformation={setContactInformation}
                                contactInformationError={contactInformationError}
                                onPrevStep={prevStep}
                                shouldAddContactInfoRequired={shouldAddContactInfoRequired}
                                progress={
                                    <FundRequestProgress step={step} steps={steps} criteriaSteps={criteriaStepKeys} />
                                }
                                bsnWarning={<FundRequestBsnWarning fund={fund} setDigidExpired={setDigidExpired} />}
                            />
                        )}

                        {steps[step] == 'application_overview' && (
                            <FundRequestValuesOverview
                                fund={fund}
                                onSubmitRequest={submitRequest}
                                criteriaSteps={criteriaSteps}
                                contactInformation={contactInformation}
                                emailSetupShow={emailSetupShow}
                                onPrevStep={prevStep}
                                progress={
                                    <FundRequestProgress step={step} steps={steps} criteriaSteps={criteriaStepKeys} />
                                }
                                bsnWarning={<FundRequestBsnWarning fund={fund} setDigidExpired={setDigidExpired} />}
                            />
                        )}

                        {steps[step] == 'done' && (
                            <FundRequestStepDone
                                finishError={finishError}
                                errorReason={errorReason}
                                progress={
                                    <FundRequestProgress step={step} steps={steps} criteriaSteps={criteriaStepKeys} />
                                }
                            />
                        )}

                        {!['application_overview', 'done'].includes(steps[step]) && (
                            <FundRequestHelpBlock fund={fund} />
                        )}
                    </div>
                </div>
            )}

            {digiExpired && (
                <div className="block block-sign_up">
                    <div className="block-wrapper form">
                        <FundRequestProgress step={step} steps={steps} criteriaSteps={criteriaStepKeys} />

                        <div className="sign_up-pane">
                            <h1 className="sr-only">DigiD sessie verlopen</h1>
                            <h2 className="sign_up-pane-header">DigiD sessie verlopen</h2>
                            <div className="sign_up-pane-body">
                                <div className="row">
                                    <div className="form-group col col-xs-8 col-xs-offset-2">
                                        <div className="block-icon">
                                            <IconTimeout />
                                        </div>
                                        <div className="text-center">
                                            <h2 className="sign_up-pane-heading">
                                                <strong>DigiD sessie verlopen</strong>
                                            </h2>
                                            <p className="sign_up-pane-text">
                                                Log opnieuw in met DigiD en begin opnieuw met de aanvraag.
                                            </p>
                                            <div className="sign_up-pane-separator" />
                                        </div>
                                        <div className="sign_up-options">
                                            <div className="sign_up-option" onClick={startDigId}>
                                                <div className="sign_up-option-media">
                                                    <img
                                                        className="sign_up-option-media-img"
                                                        src={assetUrl('/assets/img/icon-auth/icon-auth-digid.svg')}
                                                        alt="logo DigiD"
                                                    />
                                                </div>
                                                <div className="sign_up-option-details">
                                                    <div className="sign_up-option-title">DigiD</div>
                                                    <div className="sign_up-option-description">
                                                        Log opnieuw in met DigiD om opnieuw te beginnen.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group col col-lg-12">
                                        <br />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </BlockShowcase>
    );
}
