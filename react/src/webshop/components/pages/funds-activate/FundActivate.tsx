import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useEnvData from '../../../hooks/useEnvData';
import useAppConfigs from '../../../hooks/useAppConfigs';
import { useDigiDService } from '../../../services/DigiDService';
import { useNavigateState } from '../../../modules/state_router/Router';
import FundsListItemModel from '../../../services/types/FundsListItemModel';
import { ResponseError } from '../../../../dashboard/props/ApiResponses';
import usePushInfo from '../../../../dashboard/hooks/usePushInfo';
import usePushDanger from '../../../../dashboard/hooks/usePushDanger';
import usePushSuccess from '../../../../dashboard/hooks/usePushSuccess';
import Fund from '../../../props/models/Fund';
import Identity from '../../../../dashboard/props/models/Identity';
import Voucher from '../../../../dashboard/props/models/Voucher';
import FundRequest from '../../../../dashboard/props/models/FundRequest';
import { useFundService } from '../../../services/FundService';
import { useVoucherService } from '../../../services/VoucherService';
import { useIdentityService } from '../../../../dashboard/services/IdentityService';
import { useFundRequestService } from '../../../services/FundRequestService';
import { startCase } from 'lodash';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import useAssetUrl from '../../../hooks/useAssetUrl';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { StringParam, useQueryParams } from 'use-query-params';
import useFormBuilder from '../../../../dashboard/hooks/useFormBuilder';
import PincodeControl from '../../../../dashboard/components/elements/forms/controls/PincodeControl';
import FormError from '../../../../dashboard/components/elements/forms/errors/FormError';
import UIControlCheckbox from '../../../../dashboard/components/elements/forms/ui-controls/UIControlCheckbox';
import FundCriteriaCustomOverview from '../funds/elements/FundCriteriaCustomOverview';
import BlockCard2FAWarning from '../../elements/block-card-2fa-warning/BlockCard2FAWarning';
import { useInterval } from '../../../../dashboard/hooks/useInterval';
import useOpenModal from '../../../../dashboard/hooks/useOpenModal';
import ModalNotification from '../../modals/ModalNotification';
import useFetchAuthIdentity from '../../../hooks/useFetchAuthIdentity';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import BlockLoader from '../../elements/block-loader/BlockLoader';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import FundCriterion from '../../../../dashboard/props/models/FundCriterion';

export default function FundActivate() {
    const { id } = useParams();
    const assetUrl = useAssetUrl();
    const setProgress = useSetProgress();
    const translate = useTranslate();

    const [state, setState] = useState('');

    const envData = useEnvData();
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();

    const fundService = useFundService();
    const digIdService = useDigiDService();
    const voucherService = useVoucherService();
    const identityService = useIdentityService();
    const fundRequestService = useFundRequestService();

    const pushInfo = usePushInfo();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const navigateState = useNavigateState();
    const fetchAuthIdentity = useFetchAuthIdentity();

    const [digidResponse, setDigidResponse] = useQueryParams({
        digid_error: StringParam,
        digid_success: StringParam,
    });

    const [fund, setFund] = useState<FundsListItemModel>(null);
    const [vouchers, setVouchers] = useState<Array<Voucher>>(null);
    const [vouchersActive, setVouchersActive] = useState<Array<Voucher>>(null);

    const [criteriaChecked, setCriteriaChecked] = useState(false);
    const [criteriaCheckedWarning, setCriteriaCheckedWarning] = useState(false);

    const [fundRequests, setFundRequests] = useState<Array<FundRequest>>(null);
    const [pendingRequest, setPendingRequest] = useState<FundRequest>(null);
    const [options, setOptions] = useState(null);

    const [fetchingData, setFetchingData] = useState(false);

    const getTimeToSkipDigid = useCallback(
        (identity: Identity, fund: Fund, witOffset = true) => {
            if (!identity || !fund) {
                return null;
            }

            const timeOffset = witOffset ? appConfigs.bsn_confirmation_offset || 300 : 0;

            if (fund.bsn_confirmation_time === null || !identity.bsn) {
                return null;
            }

            return Math.max(fund.bsn_confirmation_time - (identity.bsn_time + timeOffset), 0);
        },
        [appConfigs.bsn_confirmation_offset],
    );

    const skipBsnLimit = useMemo(() => {
        return Date.now() + getTimeToSkipDigid(authIdentity, fund, false) * 1000;
    }, [authIdentity, fund, getTimeToSkipDigid]);

    const skipBsnLimitSoft = useMemo(() => {
        return Date.now() + getTimeToSkipDigid(authIdentity, fund, true) * 1000;
    }, [authIdentity, fund, getTimeToSkipDigid]);

    // Start digid sign-in
    const startDigId = useCallback(
        (fund: Fund) => {
            digIdService
                .startFundRequest(fund.id)
                .then((res) => (document.location = res.data.redirect_url))
                .catch((err: ResponseError) => {
                    if (err.status === 403 && err.data.message) {
                        return pushDanger(err.data.message);
                    }

                    navigateState('error', { errorCode: err.headers['error-code'] });
                });
        },
        [digIdService, navigateState, pushDanger],
    );

    // Apply for the fund
    const applyFund = useCallback(
        function (fund: Fund): Promise<Voucher> {
            return new Promise((resolve, reject) => {
                fundService
                    .apply(fund.id)
                    .then((res) => {
                        pushSuccess(`Succes! ${res.data.data.fund.name} tegoed geactiveerd!`);
                        resolve(res.data.data);
                    })
                    .catch((err: ResponseError) => {
                        pushDanger(err.data.message);
                        reject(err);
                    });
            });
        },
        [fundService, pushDanger, pushSuccess],
    );

    const codeForm = useFormBuilder({ code: '' }, (values) => {
        if (!values.code) {
            return codeForm.setErrors({ code: true });
        }

        let code = values.code;

        if (typeof code == 'string') {
            code = code.replace(/[oO]/g, '0');
            code = code.substring(0, 4) + '-' + code.substring(4);
        }

        fundService
            .redeem(code)
            .then((res) => {
                if (res.data.vouchers.length === 1) {
                    return navigateState('voucher', res.data.vouchers[0]);
                }

                return res.data.vouchers.length > 0 ? navigateState('vouchers') : navigateState('funds');
            })
            .catch((err: ResponseError) => {
                if ((err.status == 404 || err.status === 403) && err.data.meta) {
                    codeForm.setErrors({ code: [err.data.meta.message] });
                } else if (err.data.meta || err.status == 429) {
                    openModal((modal) => (
                        <ModalNotification
                            modal={modal}
                            type={'info'}
                            title={err.data.meta.title}
                            description={err.data.meta.message}
                        />
                    ));
                } else {
                    openModal((modal) => (
                        <ModalNotification modal={modal} type={'info'} title={'Error'} description={err.data.message} />
                    ));
                }

                codeForm.setIsLocked(false);
                codeForm.setIsLoading(true);

                window.setTimeout(() => codeForm.setIsLoading(false), 1000);
            });
    });

    const fundRequestIsAvailable = useMemo(() => {
        return (
            fund?.allow_fund_requests &&
            (!appConfigs?.digid_mandatory || (appConfigs?.digid_mandatory && authIdentity?.bsn))
        );
    }, [appConfigs, authIdentity, fund]);

    const checkFund = useCallback(
        (fromDigid = false) => {
            if (fetchingData) {
                return;
            }

            setFetchingData(true);

            identityService.identity().then((res) => {
                const identity = res.data;
                const timeToSkipBsn = getTimeToSkipDigid(identity, fund);

                if (!fromDigid && (timeToSkipBsn === null || timeToSkipBsn <= 0)) {
                    return startDigId(fund);
                }

                fundService
                    .check(fund.id)
                    .then((res) => {
                        const { backoffice, prevalidations } = res.data;
                        const { vouchers, prevalidation_vouchers } = res.data;

                        const { backoffice_fallback, backoffice_redirect } = backoffice || {};
                        const { backoffice_error, backoffice_error_key } = backoffice || {};

                        // Backoffice not responding and fallback is disabled
                        if (backoffice && backoffice_error && !backoffice_fallback) {
                            return setState(`backoffice_error_${backoffice_error_key || 'not_eligible'}`);
                        }

                        // Fund requesting is not available after successful signing with DigiD
                        if (!prevalidations && !vouchers && !prevalidation_vouchers.length && !fundRequestIsAvailable) {
                            return setState('error_not_available');
                        }

                        // User is not eligible and has to be redirected
                        if (backoffice_redirect) {
                            return (document.location = backoffice_redirect);
                        }

                        if (prevalidation_vouchers.length > 0) {
                            return prevalidation_vouchers.length > 1
                                ? navigateState('vouchers')
                                : navigateState('voucher', prevalidation_vouchers[0]);
                        }

                        navigateState('fund-request', { id: fund.id }, {}, { state: { from: 'fund-activate' } });
                    })
                    .catch((err: ResponseError) => {
                        if (err.status === 403 && err.data.message) {
                            pushDanger(err.data.message);
                        }

                        if (err.data?.meta || err.status == 429) {
                            openModal((modal) => (
                                <ModalNotification
                                    modal={modal}
                                    type={'info'}
                                    header={err.data.meta.title}
                                    description={err.data.meta.message}
                                />
                            ));
                        }

                        setDigidResponse({ digid_error: null, digid_success: null });
                        setState('select');
                    })
                    .finally(() => setFetchingData(false));
            });
        },
        [
            fetchingData,
            fund,
            fundRequestIsAvailable,
            fundService,
            getTimeToSkipDigid,
            identityService,
            navigateState,
            openModal,
            pushDanger,
            setDigidResponse,
            startDigId,
        ],
    );

    const getTimeToSkip = useCallback(() => {
        const timeToSkipBsn = Math.max((skipBsnLimit - Date.now()) / 1000, 0);
        const timeToSkipBsnSoft = Math.max((skipBsnLimitSoft - Date.now()) / 1000, 0);

        return { timeToSkipBsn, timeToSkipBsnSoft };
    }, [skipBsnLimit, skipBsnLimitSoft]);

    const selectDigiDOption = useCallback(
        (fund: Fund) => {
            const hasCustomCriteria = ['IIT', 'bus_2020', 'meedoen'].includes(fund.key);
            const autoValidation = fund.auto_validation;

            //- Show custom criteria screen
            if (autoValidation && appConfigs.digid && hasCustomCriteria) {
                return getTimeToSkip().timeToSkipBsnSoft > 0 ? setState('digid') : startDigId(fund);
            }

            checkFund();
        },
        [appConfigs.digid, checkFund, startDigId, getTimeToSkip],
    );

    const confirmCriteria = useCallback(() => {
        checkFund();
    }, [checkFund]);

    const handleDigiDResponse = useCallback(() => {
        const { digid_success, digid_error } = digidResponse;

        if ((!digid_success && !digid_error) || !fund) {
            return;
        }

        // got digid error, abort
        if (digid_error) {
            const custom404Link = {
                name: 'fund-activate',
                params: { id: fund.id },
                icon: 'mdi-arrow-left',
                text: 'Ga terug naar de startpagina',
                button: true,
            };

            navigateState(
                'error',
                { errorCode: `digid_${digid_error}` },
                {},
                {
                    state: {
                        hideHomeLinkButton: true,
                        customLink: digid_error === 'error_0040' ? custom404Link : null,
                    },
                },
            );
        }

        // digid sign-in flow
        if (digid_success == 'signed_up' || digid_success == 'signed_in') {
            pushSuccess('Succes! Ingelogd met DigiD.');

            setDigidResponse({
                digid_error: null,
                digid_success: null,
            });

            window.setTimeout(() => selectDigiDOption(fund), 1000);
        }
    }, [digidResponse, fund, navigateState, pushSuccess, selectDigiDOption, setDigidResponse]);

    const findCriterionState = useCallback(
        (criterion: FundCriterion) => {
            return pendingRequest?.records?.find((record) => record?.fund_criterion_id == criterion?.id)?.state;
        },
        [pendingRequest],
    );

    const fetchFund = useCallback(() => {
        setProgress(0);

        fundService
            .read(parseInt(id), { check_criteria: 1 })
            .then((res) => setFund(res.data.data))
            .finally(() => setProgress(100));
    }, [fundService, setProgress, id]);

    const fetchVouchers = useCallback(() => {
        if (!authIdentity || !fund) {
            setVouchers(null);
            setVouchersActive(null);
            return;
        }

        setProgress(0);

        voucherService
            .list()
            .then((res) => {
                setVouchers(res.data.data);
                setVouchersActive(res.data.data.filter((voucher) => voucher.fund_id === fund.id && !voucher.expired));
            })
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
            .catch((err: ResponseError) => {
                pushDanger('Mislukt!', err.data.message);
                navigateState('fund', { id: id });
            })
            .finally(() => setProgress(100));
    }, [authIdentity, fund, fundRequestService, id, navigateState, pushDanger, setProgress]);

    const getAvailableOptions = useCallback(
        (fund: Fund) => {
            const options = [];

            if (fund.allow_prevalidations) {
                options.push('code');
            }

            if (appConfigs.digid) {
                options.push('digid');
            }

            if (!appConfigs.digid && !appConfigs.digid_mandatory && fund.allow_fund_requests) {
                options.push('request');
            }

            return options;
        },
        [appConfigs],
    );

    const initState = useCallback(
        (fund: Fund) => {
            const options = getAvailableOptions(fund);

            // The fund is already taken by identity partner
            if (fund.taken_by_partner) {
                return setState('taken_by_partner');
            }

            if (options.length == 0) {
                return navigateState('funds');
            }

            if (options[0] === 'request') {
                return navigateState('fund-request', fund);
            }

            if (options.length === 1 && options[0] !== 'digid') {
                return setState(options[0]);
            }

            setOptions(options);
            setState('select');
        },
        [getAvailableOptions, navigateState],
    );

    useEffect(() => {
        fetchFund();
    }, [fetchFund]);

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
        handleDigiDResponse();
    }, [handleDigiDResponse]);

    useEffect(() => {
        if (!fund || !vouchersActive || !fundRequests) {
            return;
        }

        const pendingRequest = fundRequests?.find((request) => request.state === 'pending');

        // Fund request already in progress
        if (pendingRequest) {
            setPendingRequest(pendingRequest);
            setState('fund_already_applied');
            return;
        }

        // The fund is already taken by identity partner
        if (fund?.taken_by_partner) {
            return setState('taken_by_partner');
        }

        // Voucher already received, go to the voucher
        if (vouchersActive?.length > 0) {
            return navigateState('voucher', { address: vouchersActive[0]?.address });
        }

        // All the criteria are meet, request the voucher
        if (fund.criteria.filter((criterion) => !criterion.is_valid).length == 0) {
            applyFund(fund)
                .then((voucher) => navigateState('voucher', { address: voucher.address }))
                .catch(() => navigateState('fund', { id: fund.id }));
        }
    }, [applyFund, fund, navigateState, vouchersActive, fundRequests]);

    useEffect(() => {
        if (!fund || !vouchers) {
            return;
        }

        initState(fund);
    }, [fund, initState, vouchers]);

    useInterval(() => {
        const { timeToSkipBsn } = getTimeToSkip();

        if ((!timeToSkipBsn || timeToSkipBsn <= 0) && state === 'digid') {
            setState('select');
            pushInfo('DigiD session expired.', 'You need to confirm your Identity by DigiD again.');
        }
    }, 1000);

    return (
        <BlockShowcase wrapper={true} breadcrumbs={<></>} loaderElement={<BlockLoader type={'full'} />}>
            {fund && vouchers && appConfigs && (
                <div className="block block-sign_up">
                    <div className="block-wrapper">
                        {state && state != 'select' && state != 'digid' && state != 'code' && (
                            <h1 className="block-title">
                                {translate('fund_request.sign_up.header.main', {
                                    fund_name: startCase(fund.name || ''),
                                })}
                            </h1>
                        )}

                        {state == 'select' && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">
                                        {translate('fund_request.sign_up.header.main', {
                                            fund_name: startCase(fund.name || ''),
                                        })}
                                    </h2>
                                </div>
                                <div className="sign_up-pane-body">
                                    <h3 className="sign_up-pane-text">
                                        <div className="sign_up-pane-heading">
                                            {translate(
                                                `signup.items.${envData.client_key}.signup_option`,
                                                null,
                                                `signup.items.signup_option`,
                                            )}
                                        </div>
                                    </h3>
                                    <div className="sign_up-options">
                                        {options?.includes('code') && (
                                            <div
                                                className="sign_up-option"
                                                onClick={() => setState('code')}
                                                onKeyDown={clickOnKeyEnter}
                                                tabIndex={0}>
                                                <div className="sign_up-option-media">
                                                    <img
                                                        className="sign_up-option-media-img"
                                                        src={assetUrl('/assets/img/icon-auth/icon-auth-me_app.svg')}
                                                        alt=""
                                                    />
                                                </div>
                                                <div className="sign_up-option-details">
                                                    <div className="sign_up-option-title">Ik heb een activatiecode</div>
                                                    <div className="sign_up-option-description">
                                                        Ga verder met het activeren van je tegoed door gebruik te maken
                                                        van een activatiecode
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {options?.includes('digid') && (
                                            <div
                                                className="sign_up-option"
                                                onClick={() => selectDigiDOption(fund)}
                                                onKeyDown={clickOnKeyEnter}
                                                tabIndex={0}>
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
                                                        Open het DigiD inlogscherm
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {options?.includes('request') && (
                                            <StateNavLink
                                                name="fund-request"
                                                params={{ id: fund?.id }}
                                                tabIndex={0}
                                                onKeyDown={clickOnKeyEnter}
                                                className="sign_up-option">
                                                <div className="sign_up-option-media">
                                                    <img
                                                        className="sign_up-option-media-img"
                                                        src={assetUrl('/assets/img/icon-auth/icon-auth-me_app.svg')}
                                                        alt=""
                                                    />
                                                </div>
                                                <div className="sign_up-option-details">
                                                    <div className="sign_up-option-title">
                                                        Ik wil een tegoed aanvragen
                                                    </div>
                                                    <div className="sign_up-option-description">
                                                        Doorloop het aanvraagformulier om een tegoed aan te vragen
                                                    </div>
                                                </div>
                                            </StateNavLink>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {state == 'code' && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">Vul uw activatiecode in</h2>
                                </div>
                                <div className="sign_up-pane-body sign_up-pane-body-padless-bottom">
                                    <form className="form" onSubmit={codeForm.submit}>
                                        <div className="form-group text-center">
                                            <div className="form-label">{translate('popup_auth.input.code')}</div>
                                            <PincodeControl
                                                value={codeForm.values.code}
                                                onChange={(code) => codeForm.update({ code: code?.trim() })}
                                                blockCount={2}
                                                blockSize={4}
                                                valueType={'alphaNum'}
                                            />
                                            <FormError error={codeForm.errors.code} />
                                        </div>
                                        <div className="form-group" />
                                        <div className="form-group text-center">
                                            <button
                                                className={`button button-primary`}
                                                disabled={codeForm.values.code.length != 8 || codeForm.isLoading}
                                                type="submit">
                                                {translate('popup_auth.buttons.submit')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                <div className="sign_up-pane-footer">
                                    {options?.length > 1 && (
                                        <div
                                            className="button button-text button-text-padless"
                                            onClick={() => setState('select')}>
                                            <em className="mdi mdi-chevron-left icon-lefts" />
                                            Terug
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {state == 'digid' && !fetchingData && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">
                                        {translate(
                                            `fund_activate.header.${envData.client_key}.title`,
                                            null,
                                            `fund_activate.header.title`,
                                        )}
                                    </h2>
                                </div>
                                <div className="sign_up-pane-body">
                                    <div className="form">
                                        <FundCriteriaCustomOverview fundKey={fund.key} />

                                        <div className="sign_up-pane-text">
                                            <UIControlCheckbox
                                                id={'confirm_criteria'}
                                                checked={criteriaChecked}
                                                label={'Ik verklaar dat ik voldoe aan de bovenstaande voorwaarden'}
                                                onChange={(e) => setCriteriaChecked(e.target.checked)}
                                            />
                                        </div>

                                        {fund.key == 'IIT' && (
                                            <div className="sign_up-pane-text">
                                                <UIControlCheckbox
                                                    id={'confirm_criteria_warning'}
                                                    checked={criteriaCheckedWarning}
                                                    label={
                                                        'Ik weet dat het verstrekken van onjuiste informatie strafbaar is, dat ik een onterecht of een teveel ontvangen vergoeding terug moet betalen en dat ik een boete kan krijgen.'
                                                    }
                                                    onChange={(e) => setCriteriaCheckedWarning(e.target.checked)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="sign_up-pane-footer">
                                    <div className="row">
                                        <div className="col col-lg-6 text-left">&nbsp;</div>
                                        <div className="col col-lg-6 text-right">
                                            {criteriaChecked && (fund.key != 'IIT' || criteriaCheckedWarning) && (
                                                <div
                                                    className="button button-text button-text-padless"
                                                    onClick={() => confirmCriteria()}
                                                    role="button">
                                                    {translate('fund_request.sign_up.pane.footer.next')}
                                                    <em className="mdi mdi-chevron-right icon-right" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {state == 'digid' && fetchingData && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-body">
                                    <br />
                                    <div className="sign_up-pane-loading">
                                        <div className="mdi mdi-loading mdi-spin" />
                                    </div>
                                    <div className="sign_up-pane-text text-center text-muted">
                                        Een moment geduld, het verzoek wordt verwerkt.
                                    </div>
                                    <br />
                                </div>
                            </div>
                        )}

                        {state == 'error_not_available' && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">Aanvraag mislukt</h2>
                                </div>
                                <div className="sign_up-pane-body">
                                    <p className="sign_up-pane-text text-center">
                                        U kunt zich niet aanmelden voor {fund.name}.
                                    </p>
                                    <div className="block-icon">
                                        <img
                                            src={assetUrl('/assets/img/icon-sign_up-error.svg')}
                                            alt="icon sign-up error"
                                        />
                                    </div>
                                    <p className="sign_up-pane-text text-center">
                                        Neem contact op met {fund.organization.name}.
                                    </p>
                                    <div className="text-center">
                                        <StateNavLink
                                            name={'funds'}
                                            className="button button-text button-text-primary button-text-padless">
                                            Terug
                                        </StateNavLink>
                                    </div>
                                    <div className="form-group col col-lg-12 hidden-xs">
                                        <br />
                                    </div>
                                </div>
                            </div>
                        )}

                        {state == 'taken_by_partner' && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">Dit tegoed is al geactiveerd</h2>
                                </div>
                                <div className="sign_up-pane-body text-center">
                                    <p className="sign_up-pane-heading sign_up-pane-heading-lg">Aanvraag mislukt</p>
                                    <p className="sign_up-pane-text">
                                        U krijgt deze melding omdat het tegoed is geactiveerd door een <br />
                                        familielid of voogd. <br />
                                        <br />
                                        De tegoeden zijn beschikbaar in het account van de persoon die <br />
                                        deze als eerste heeft geactiveerd.
                                    </p>
                                    <div className="block-icon">
                                        <img
                                            src={assetUrl('/assets/img/icon-sign_up-error.svg')}
                                            alt="icon sign-up error"
                                        />
                                    </div>
                                    <p className="sign_up-pane-text text-center">
                                        Neem voor vragen contact op met {fund.organization.name}.
                                    </p>
                                    <div className="text-center">
                                        <StateNavLink
                                            name={'funds'}
                                            className="button button-text button-text-primary button-text-padless">
                                            Terug
                                        </StateNavLink>
                                    </div>
                                    <div className="form-group col col-lg-12 hidden-xs">
                                        <br />
                                    </div>
                                </div>
                            </div>
                        )}

                        {state == 'backoffice_error_not_resident' && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">Aanvraag mislukt</h2>
                                </div>
                                <div className="sign_up-pane-body text-center">
                                    <p className="sign_up-pane-text">
                                        Volgens onze gegevens bent u geen inwoner van de gemeente Nijmegen. De
                                        {fund.name} geldt alleen voor inwoners van de gemeente Nijmegen. <br />
                                        <br />
                                        Mogelijk heeft uw eigen gemeente wel regelingen waarvoor u in aanmerking komt.
                                        Neem hiervoor contact op met de gemeente waar u woonachtig bent.{' '}
                                    </p>
                                    <div className="block-icon">
                                        <img
                                            src={assetUrl('/assets/img/icon-sign_up-error.svg')}
                                            alt="icon sign-up error"
                                        />
                                    </div>
                                    <p className="sign_up-pane-text text-center">
                                        Voor meer informatie of vragen kunt u contact opnemen met gemeente Nijmegen.
                                        <br />
                                        E-mailadres:{' '}
                                        <a className="txt_link var" href="mailto:inkomensondersteuning@nijmegen.nl">
                                            inkomensondersteuning@nijmegen.nl
                                        </a>
                                        <br />
                                        Telefoonnumer: 14 024
                                    </p>
                                    <div className="text-center">
                                        <StateNavLink
                                            name={'funds'}
                                            className="button button-text button-text-primary button-text-padless">
                                            Terug
                                        </StateNavLink>
                                    </div>
                                    <div className="form-group col col-lg-12 hidden-xs">
                                        <br />
                                    </div>
                                </div>
                            </div>
                        )}

                        {state == 'backoffice_error_not_eligible' && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">
                                        Aanvraag mislukt. U voldoet niet aan de voorwaarden.
                                    </h2>
                                </div>
                                <div className="sign_up-pane-body text-center">
                                    <p className="sign_up-pane-heading sign_up-pane-heading-lg">Het is niet gelukt</p>
                                    <p className="sign_up-pane-text">
                                        Sorry, uw aanvraag voor {fund.name} is helaas niet gelukt.
                                    </p>
                                    <div className="block-icon">
                                        <img
                                            src={assetUrl('/assets/img/icon-sign_up-error.svg')}
                                            alt="icon sign-up error"
                                        />
                                    </div>
                                    <p className="sign_up-pane-text text-center">
                                        Neem voor meer informatie contact op met gemeente Nijmegen.
                                    </p>
                                    <div className="text-center">
                                        <StateNavLink
                                            name="funds"
                                            className="button button-text button-text-primary button-text-padless">
                                            Terug
                                        </StateNavLink>
                                    </div>
                                    <div className="form-group col col-lg-12 hidden-xs">
                                        <br />
                                    </div>
                                </div>
                            </div>
                        )}

                        {state == 'backoffice_error_taken_by_partner' && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">Aanvraag mislukt</h2>
                                </div>
                                <div className="sign_up-pane-body text-center">
                                    <p className="sign_up-pane-text">
                                        Volgens onze informatie hebben wij al een aanvraag van uw partner ontvangen. Het
                                        is daarom niet mogelijk om een aanvraag te doen.
                                    </p>
                                    <div className="block-icon">
                                        <img
                                            src={assetUrl('/assets/img/icon-sign_up-error.svg')}
                                            alt="icon sign-up error"
                                        />
                                    </div>
                                    <p className="sign_up-pane-text text-center">
                                        Wilt u hiervoor een bezwaar indienen of heeft u vragen, neem dan contact met ons
                                        op.
                                        <br />
                                        E-mailadres:{' '}
                                        <a href="mailto:inkomensondersteuning@nijmegen.nl">
                                            inkomensondersteuning@nijmegen.nl
                                        </a>
                                        <br />
                                        Telefoonnumer: 14 024
                                    </p>
                                    <div className="text-center">
                                        <StateNavLink
                                            name={'funds'}
                                            className="button button-text button-text-primary button-text-padless">
                                            Terug
                                        </StateNavLink>
                                    </div>
                                    <div className="form-group col col-lg-12 hidden-xs">
                                        <br />
                                    </div>
                                </div>
                            </div>
                        )}

                        {state == 'backoffice_error_no_response' && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">
                                        Er is een technische fout opgetreden, probeer het later opnieuw.
                                    </h2>
                                </div>
                                <div className="sign_up-pane-body text-center">
                                    <p className="sign_up-pane-heading sign_up-pane-heading-lg">Het is niet gelukt</p>
                                    <p className="sign_up-pane-text">
                                        Sorry, uw aanvraag voor {fund.name} is helaas niet gelukt.
                                    </p>
                                    <div className="block-icon">
                                        <img
                                            src={assetUrl('/assets/img/icon-sign_up-error.svg')}
                                            alt="icon sign-up error"
                                        />
                                    </div>
                                    <p className="sign_up-pane-text text-center">
                                        Neem voor meer informatie contact op met gemeente Nijmegen.
                                    </p>
                                    <div className="text-center">
                                        <StateNavLink
                                            name={'funds'}
                                            className="button button-text button-text-primary button-text-padless">
                                            Terug
                                        </StateNavLink>
                                    </div>
                                    <div className="form-group col col-lg-12 hidden-xs">
                                        <br />
                                    </div>
                                </div>
                            </div>
                        )}

                        {state == 'fund_already_applied' && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">
                                        {translate('fund_request.sign_up.header.title_fund_already_applied')}
                                    </h2>
                                </div>
                                <div className="sign_up-pane-body">
                                    <div className="sign_up-pane-media">
                                        <img
                                            src={assetUrl('/assets/img/fund-request-error.png')}
                                            alt="icon fund request error"
                                        />
                                    </div>
                                    <p className="sign_up-pane-text">
                                        {translate('fund_request.sign_up.subtitles.fund_already_applied')}
                                    </p>
                                    <ul className="sign_up-pane-list sign_up-pane-list-criteria">
                                        {fund.criteria?.map((criterion) => (
                                            <li
                                                key={criterion.id}
                                                className={
                                                    {
                                                        pending: 'item-progress',
                                                        approved: 'item-valid',
                                                        declined: 'item-declined',
                                                    }[findCriterionState(criterion)]
                                                }>
                                                <div className="item-icon">
                                                    <em
                                                        className={`mdi ${
                                                            {
                                                                pending: 'mdi-help',
                                                                approved: 'mdi-check-bold',
                                                                declined: 'mdi-close-thick',
                                                            }[findCriterionState(criterion)]
                                                        }`}
                                                    />
                                                </div>

                                                {criterion.title && criterion.title}

                                                {!criterion.title &&
                                                    translate(
                                                        `fund_request.sign_up.pane.criterion_${
                                                            {
                                                                '>': 'more',
                                                                '<': 'less',
                                                                '=': 'same',
                                                            }[criterion.operator]
                                                        }`,
                                                        {
                                                            name: criterion?.record_type?.name,
                                                            value: criterion?.value,
                                                        },
                                                    )}
                                            </li>
                                        ))}
                                    </ul>
                                    <span>{translate('fund_request.sign_up.pane.fund_already_applied')}</span>
                                </div>
                            </div>
                        )}

                        {state == 'select' && (
                            <div>
                                <br />
                                {fund && <BlockCard2FAWarning fund={fund} buttonPosition={'bottom'} />}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </BlockShowcase>
    );
}
