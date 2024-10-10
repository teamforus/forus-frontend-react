import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFundRequestValidatorService } from '../../../services/FundRequestValidatorService';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import FundRequest from '../../../props/models/FundRequest';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushDanger from '../../../hooks/usePushDanger';
import usePushSuccess from '../../../hooks/usePushSuccess';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import ClickOutside from '../../elements/click-outside/ClickOutside';
import { strLimit } from '../../../helpers/string';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import BlockCardNotes from '../../elements/block-card-notes/BlockCardNotes';
import BlockCardEmails from '../../elements/block-card-emails/BlockCardEmails';
import useOpenModal from '../../../hooks/useOpenModal';
import ModalNotification from '../../modals/ModalNotification';
import FundRequestRecord from '../../../props/models/FundRequestRecord';
import { ModalState } from '../../../modules/modals/context/ModalContext';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import { ResponseError } from '../../../props/ApiResponses';
import ModalFundRequestClarify from '../../modals/ModalFundRequestClarify';
import ModalFundRequestRecordDecline from '../../modals/ModalFundRequestRecordDecline';
import ModalFundRequestRecordsDecline from '../../modals/ModalFundRequestRecordsDecline';
import ModalFundRequestRecordEdit from '../../modals/ModalFundRequestRecordEdit';
import ModalFundRequestRecordCreate from '../../modals/ModalFundRequestRecordCreate';
import ModalFundRequestDisregard from '../../modals/ModalFundRequestDisregard';
import ModalFundRequestDisregardUndo from '../../modals/ModalFundRequestDisregardUndo';
import ModalFundRequestAssignValidator from '../../modals/ModalFundRequestAssignValidator';
import useEnvData from '../../../hooks/useEnvData';
import FundRequestRecordTabs from './elements/FundRequestRecordTabs';
import FundRequestPerson from './elements/FundRequestPerson';
import useTranslate from '../../../hooks/useTranslate';
import EmailLog from '../../../props/models/EmailLog';
import { useFileService } from '../../../services/FileService';
import usePushApiError from '../../../hooks/usePushApiError';
import classNames from 'classnames';
import ModalApproveFundRequest from '../../modals/ModalApproveFundRequest';
import FundRequestStateLabel from '../../elements/resource-states/FundRequestStateLabel';

export default function FundRequestsView() {
    const authIdentity = useAuthIdentity();
    const fundRequestId = parseInt(useParams().id);

    const envData = useEnvData();

    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();
    const setProgress = useSetProgress();

    const fileService = useFileService();
    const activeOrganization = useActiveOrganization();
    const fundRequestService = useFundRequestValidatorService();

    const [fundRequest, setFundRequest] = useState<FundRequest>(null);
    const [showCriteria, setShowCriteria] = useState(null);
    const [collapsedRecords, setCollapsedRecords] = useState<Array<number>>([]);

    const fund = useMemo(() => {
        return fundRequest?.fund;
    }, [fundRequest]);

    const enableCustomConfirmationModal = useMemo(() => {
        return (
            envData?.config?.fund_requests_use_custom_modal ||
            (activeOrganization?.allow_payouts &&
                ((fund?.allow_preset_amounts_validator && fund?.amount_presets?.length > 0) ||
                    fund?.allow_custom_amounts_validator))
        );
    }, [envData, activeOrganization, fund]);

    const isValidatorsSupervisor = useMemo(
        () => activeOrganization?.permissions.includes('manage_validators'),
        [activeOrganization],
    );

    const fundRequestMeta = useMemo(() => {
        if (!fundRequest) {
            return null;
        }

        const { state, records, allowed_employees, employee } = fundRequest;
        const isPending = state == 'pending';
        const isDisregarded = state == 'disregarded';

        const recordTypes = records.map((record) => record.record_type_key);

        const assignableEmployees = allowed_employees.filter((item) => {
            return item.identity_address !== authIdentity?.address && item.id !== employee?.id;
        });

        const hasAssignableEmployees = assignableEmployees.length > 0;
        const isAssigned = employee?.identity_address === authIdentity?.address;
        const hasPartnerBSN = recordTypes.includes('partner_bsn');

        fundRequest.fund.criteria = fundRequest.fund.criteria.map((criterion) => {
            const operators = {
                '>': 'moet meer dan',
                '>=': 'more or equal',
                '<': 'moet minder dan',
                '<=': 'less or equal',
                '*': 'elke waarde',
            };

            const operator = operators[criterion.operator] || 'moet';
            const value = `${criterion.record_type.key === 'net_worth' ? '€' : ''}${criterion.value}`;

            return { ...criterion, description: `${criterion.record_type.name} ${operator} ${value} zijn.` };
        });

        return {
            ...fundRequest,
            hasContent:
                records.filter((record) => {
                    return record.files?.length || record.clarifications?.length || record.history?.length;
                }).length > 0,
            records: fundRequest.records.map((record) => ({
                ...record,
                hasContent: record.files.length > 0 || record.clarifications.length > 0 || record.history.length > 0,
            })),

            assignable_employees: assignableEmployees,
            can_disregarded: isAssigned && isPending,
            can_disregarded_undo: isAssigned && isDisregarded,

            is_assignable: isPending && !employee,
            is_assignable_as_supervisor: !employee && isPending && hasAssignableEmployees && isValidatorsSupervisor,

            is_assigned: isAssigned,
            can_add_partner_bsn: activeOrganization.bsn_enabled && isPending && isAssigned && !hasPartnerBSN,

            can_resign: isPending && isAssigned,
            can_resign_as_supervisor: isPending && employee && isValidatorsSupervisor,
        };
    }, [activeOrganization.bsn_enabled, authIdentity?.address, fundRequest, isValidatorsSupervisor]);

    const [stateLabels] = useState({
        pending: 'label-primary-variant',
        declined: 'label-danger',
        approved: 'label-success',
        approved_partly: 'label-success',
        disregarded: 'label-default',
    });

    const updateNotesRef = useRef<() => void>(null);
    const fetchEmailsRef = useRef<() => void>(null);

    const showFundCriteria = useCallback((e) => {
        e.stopPropagation();
        setShowCriteria(true);
    }, []);

    const hideFundCriteria = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        setShowCriteria(false);
    }, []);

    const showInfoModal = useCallback(
        (title: string, message: string) => {
            openModal((modal) => (
                <ModalNotification modal={modal} title={title} description={message} className="modal-md" />
            ));
        },
        [openModal],
    );

    const fetchFundRequest = useCallback(() => {
        setProgress(0);

        fundRequestService
            .read(activeOrganization.id, fundRequestId)
            .then((res) => setFundRequest(res.data.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [fundRequestService, activeOrganization, fundRequestId, setProgress, pushApiError]);

    const reloadRequest = useCallback(() => {
        fundRequestService.read(activeOrganization.id, fundRequestMeta.id).then((res) => {
            setFundRequest(res.data.data);
            fetchEmailsRef?.current?.();
            updateNotesRef?.current?.();
        }, pushApiError);
    }, [activeOrganization.id, fundRequestMeta?.id, fundRequestService, pushApiError]);

    const approveRecord = useCallback(
        (requestRecord: FundRequestRecord) => {
            const onConfirm = (modal: ModalState) => {
                modal.close();
                fundRequestService
                    .approveRecord(activeOrganization.id, requestRecord.fund_request_id, requestRecord.id)
                    .then(() => {
                        reloadRequest();
                        pushSuccess('Gelukt!', 'Persoonsgegeven gevalideert.');
                    })
                    .catch((err: ResponseError) =>
                        showInfoModal(
                            'Fout: U kunt deze persoonsgegeven op dit moment niet beoordelen.',
                            err.data.message,
                        ),
                    );
            };

            openModal((modal) => (
                <ModalNotification
                    className={'modal-md'}
                    modal={modal}
                    title={'Weet u zeker dat u deze persoonsgegeven wil goedkeuren?'}
                    description={
                        'Een beoordeling kan niet ongedaan gemaakt worden. Kijk goed of u deze actie wilt verrichten.'
                    }
                    buttonCancel={{ onClick: modal.close }}
                    buttonSubmit={{ onClick: () => onConfirm(modal) }}
                />
            ));
        },
        [activeOrganization.id, fundRequestService, openModal, pushSuccess, reloadRequest, showInfoModal],
    );

    const declineRecord = useCallback(
        (requestRecord: FundRequestRecord) => {
            openModal((modal) => (
                <ModalFundRequestRecordDecline
                    modal={modal}
                    fundRequest={fundRequestMeta}
                    organization={activeOrganization}
                    fundRequestRecord={requestRecord}
                    onSubmitted={(err) => {
                        if (err) {
                            return showInfoModal(
                                'U kunt op dit moment deze persoonsgegeven niet weigeren.',
                                `Reden: ${err.data.message}`,
                            );
                        }

                        reloadRequest();
                        pushSuccess('Gelukt!', 'Aanvullingsverzoek op aanvraag verstuurd.');
                    }}
                />
            ));
        },
        [activeOrganization, fundRequestMeta, openModal, pushSuccess, reloadRequest, showInfoModal],
    );

    const clarifyRecord = useCallback(
        (requestRecord: FundRequestRecord) => {
            openModal((modal) => (
                <ModalFundRequestClarify
                    modal={modal}
                    fundRequest={fundRequestMeta}
                    organization={activeOrganization}
                    fundRequestRecord={requestRecord}
                    onSubmitted={(err) => {
                        if (err) {
                            return showInfoModal('Error', `Reden: ${err.data.message}`);
                        }

                        reloadRequest();
                        pushSuccess('Gelukt!', 'Aanvullingsverzoek op aanvraag verstuurd.');
                    }}
                />
            ));
        },
        [activeOrganization, fundRequestMeta, openModal, pushSuccess, reloadRequest, showInfoModal],
    );

    const requestApprove = useCallback(() => {
        if (!enableCustomConfirmationModal) {
            return openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    className={'modal-md'}
                    title={'Weet u zeker dat u deze persoonsgegeven wil goedkeuren?'}
                    description={
                        'Een beoordeling kan niet ongedaan gemaakt worden. Kijk goed of u deze actie wilt verrichten.'
                    }
                    buttonCancel={{ onClick: modal.close }}
                    buttonSubmit={{
                        onClick: () => {
                            modal.close();
                            fundRequestService
                                .approve(activeOrganization.id, fundRequestMeta.id)
                                .then(() => reloadRequest())
                                .catch((err: ResponseError) => {
                                    showInfoModal(
                                        'Validatie van persoonsgegeven mislukt.',
                                        `Reden: ${err.data.message}`,
                                    );
                                });
                        },
                    }}
                />
            ));
        }

        fundRequestService
            .formula(activeOrganization.id, fundRequest?.id)
            .then((res) => {
                openModal((modal) => (
                    <ModalApproveFundRequest
                        modal={modal}
                        formula={res.data}
                        fundRequest={fundRequest}
                        onError={(err: ResponseError) => {
                            showInfoModal('Validatie van persoonsgegeven mislukt.', `Reden: ${err.data.message}`);
                        }}
                        onDone={reloadRequest}
                        activeOrganization={activeOrganization}
                    />
                ));
            })
            .catch(pushApiError);
    }, [
        enableCustomConfirmationModal,
        fundRequestService,
        activeOrganization,
        fundRequest,
        pushApiError,
        openModal,
        fundRequestMeta,
        reloadRequest,
        showInfoModal,
    ]);

    const requestDecline = useCallback(() => {
        openModal((modal) => (
            <ModalFundRequestRecordsDecline
                modal={modal}
                fundRequest={fundRequestMeta}
                organization={activeOrganization}
                onSubmitted={(err) => {
                    if (err) {
                        return showInfoModal(
                            'U kunt op dit moment deze aanvragen niet weigeren.',
                            `Reden: ${err.data.message}`,
                        );
                    }

                    reloadRequest();
                    pushSuccess('Gelukt!', 'Aanvraag is geweigerd.');
                }}
            />
        ));
    }, [activeOrganization, fundRequestMeta, openModal, pushSuccess, reloadRequest, showInfoModal]);

    const requestDisregard = useCallback(() => {
        openModal((modal) => (
            <ModalFundRequestDisregard
                modal={modal}
                fundRequest={fundRequestMeta}
                organization={activeOrganization}
                onSubmitted={(err) => {
                    if (err) {
                        return showInfoModal(
                            'U kunt op dit moment deze aanvragen niet weigeren.',
                            `Reden: ${err.data.message}`,
                        );
                    }

                    reloadRequest();
                    pushSuccess('Gelukt!', 'Aanvraag is niet behandelen.');
                }}
            />
        ));
    }, [activeOrganization, fundRequestMeta, openModal, pushSuccess, reloadRequest, showInfoModal]);

    const requestDisregardUndo = useCallback(() => {
        openModal((modal) => (
            <ModalFundRequestDisregardUndo
                modal={modal}
                fundRequest={fundRequestMeta}
                organization={activeOrganization}
                onSubmitted={(err) => {
                    if (err) {
                        return showInfoModal(
                            'U kunt op dit moment deze aanvragen niet weigeren.',
                            `Reden: ${err.data.message}`,
                        );
                    }

                    reloadRequest();
                    pushSuccess('Gelukt!', 'Aanvraag is niet behandelen.');
                }}
            />
        ));
    }, [activeOrganization, fundRequestMeta, openModal, pushSuccess, reloadRequest, showInfoModal]);

    const assignRequestAsSupervisor = useCallback(() => {
        openModal((modal) => (
            <ModalFundRequestAssignValidator
                modal={modal}
                fundRequest={fundRequestMeta}
                organization={activeOrganization}
                employees={fundRequestMeta.assignable_employees}
                onSubmitted={(err) => {
                    if (err) {
                        return showInfoModal(
                            'U kunt op dit moment deze aanvragen niet weigeren.',
                            `Reden: ${err.data.message}`,
                        );
                    }

                    reloadRequest();
                    pushSuccess('Gelukt!', 'Persoonsgegeven toegevoegd.');
                }}
            />
        ));
    }, [openModal, fundRequestMeta, activeOrganization, reloadRequest, pushSuccess, showInfoModal]);

    const assignRequest = useCallback(
        () =>
            fundRequestService
                .assign(activeOrganization?.id, fundRequestMeta.id)
                .then(() => {
                    pushSuccess('Gelukt!', 'U bent nu toegewezen aan deze aanvraag.');
                    reloadRequest();
                })
                .catch((res) => {
                    pushDanger('Mislukt!', 'U kunt op dit moment geen aanvullingsverzoek doen.');
                    console.error(res);
                }),
        [fundRequestService, activeOrganization?.id, fundRequestMeta?.id, pushSuccess, reloadRequest, pushDanger],
    );

    const requestResignAllEmployeesAsSupervisor = useCallback(() => {
        fundRequestService
            .resignAllEmployeesAsSupervisor(activeOrganization.id, fundRequestMeta.id)
            .then(() => {
                pushSuccess('Gelukt!', 'U heeft zich afgemeld van deze aanvraag.');
                reloadRequest();
            })
            .catch((res: ResponseError) => {
                pushDanger('Mislukt!', res?.data?.message);
            });
    }, [activeOrganization.id, fundRequestMeta, fundRequestService, pushDanger, pushSuccess, reloadRequest]);

    const requestResign = useCallback(() => {
        if (!fundRequestMeta.can_resign) {
            return requestResignAllEmployeesAsSupervisor();
        }

        fundRequestService
            .resign(activeOrganization.id, fundRequestMeta.id)
            .then(() => {
                pushSuccess('Gelukt!', 'U heeft zich afgemeld van deze aanvraag.');
                reloadRequest();
            })
            .catch(() => {
                pushDanger('Mislukt!', 'U kunt u zelf niet van deze aanvraag afhalen.');
            });
    }, [
        activeOrganization,
        fundRequestMeta,
        fundRequestService,
        pushDanger,
        pushSuccess,
        reloadRequest,
        requestResignAllEmployeesAsSupervisor,
    ]);

    const appendRecord = useCallback(() => {
        openModal((modal) => (
            <ModalFundRequestRecordCreate
                modal={modal}
                fundRequest={fundRequestMeta}
                organization={activeOrganization}
                onCreated={() => {
                    pushSuccess('Gelukt!', 'Persoonsgegeven toegevoegd.');
                    reloadRequest();
                }}
            />
        ));
    }, [activeOrganization, fundRequestMeta, openModal, pushSuccess, reloadRequest]);

    const editRecord = useCallback(
        (fundRequestRecord: FundRequestRecord) => {
            openModal((modal) => (
                <ModalFundRequestRecordEdit
                    modal={modal}
                    fundRequest={fundRequestMeta}
                    organization={activeOrganization}
                    fundRequestRecord={fundRequestRecord}
                    onEdit={() => {
                        pushSuccess('Gelukt!', 'Persoonsgegeven toegevoegd.');
                        reloadRequest();
                    }}
                />
            ));
        },
        [activeOrganization, fundRequestMeta, openModal, pushSuccess, reloadRequest],
    );

    const fetchNotes = useCallback(
        (query = {}) => fundRequestService.notes(activeOrganization.id, fundRequestMeta.id, query),
        [activeOrganization?.id, fundRequestMeta?.id, fundRequestService],
    );

    const fetchEmailLogs = useCallback(
        (query = {}) => fundRequestService.emailLogs(activeOrganization.id, fundRequestMeta.id, query),
        [activeOrganization?.id, fundRequestMeta?.id, fundRequestService],
    );

    const exportEmailLog = useCallback(
        (emailLog: EmailLog) => {
            fundRequestService
                .emailLogExport(activeOrganization.id, fundRequestMeta.id, emailLog.id)
                .then((res) => fileService.downloadFile(`email-log-${emailLog.id}.pdf`, res.data))
                .catch(pushApiError)
                .finally(() => setProgress(100));

            setProgress(0);
        },
        [activeOrganization?.id, fileService, fundRequestMeta?.id, fundRequestService, pushApiError, setProgress],
    );

    const deleteNote = useCallback(
        (note) => fundRequestService.noteDestroy(activeOrganization.id, fundRequestMeta.id, note.id),
        [activeOrganization?.id, fundRequestMeta?.id, fundRequestService],
    );

    const storeNote = useCallback(
        (data) => fundRequestService.storeNote(activeOrganization.id, fundRequestMeta.id, data),
        [activeOrganization?.id, fundRequestMeta?.id, fundRequestService],
    );

    useEffect(() => {
        fetchFundRequest();
    }, [fetchFundRequest]);

    if (!fundRequestMeta) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'fund-requests'}
                    params={{ organizationId: activeOrganization?.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {translate('validation_requests.header.title')}
                </StateNavLink>
                <div className="breadcrumb-item active">{`#${fundRequestMeta.id}`}</div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex">
                        <div className="flex flex-grow">
                            <div className="flex flex-vertical">
                                <div className="card-title">
                                    <div className="flex">
                                        <div className="flex flex-vertical">
                                            <div className="flex text-strong">
                                                <span className="text-muted">ID:&nbsp;</span>
                                                {fundRequestMeta.id}&nbsp;&nbsp;
                                            </div>
                                        </div>
                                        <div className="flex flex-vertical flex-center">
                                            <div className="flex flex-horizontal">
                                                <FundRequestStateLabel fundRequest={fundRequest} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-subtitle">
                                    <div className="flex text-muted-dark">
                                        <div className="mdi mdi-clock-outline text-muted-dark" />
                                        {fundRequestMeta.created_at_locale}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {['pending', 'disregarded'].includes(fundRequestMeta.state) && (
                            <div className="flex flex-self-start">
                                <div className="flex-row">
                                    {fundRequestMeta.is_assignable && (
                                        <button
                                            className={`button ${
                                                fundRequestMeta.is_assignable_as_supervisor
                                                    ? 'button-default'
                                                    : 'button-primary'
                                            }`}
                                            onClick={() => assignRequest()}>
                                            <em className="mdi mdi-account-plus icon-start" />
                                            {translate('validation_requests.buttons.assign_to_me')}
                                        </button>
                                    )}

                                    {fundRequestMeta.is_assignable_as_supervisor && (
                                        <button className="button button-primary" onClick={assignRequestAsSupervisor}>
                                            <em className="mdi mdi-account-details-outline icon-start" />
                                            {translate('validation_requests.buttons.assign')}
                                        </button>
                                    )}

                                    {fundRequestMeta.state == 'pending' &&
                                        fundRequestMeta.is_assigned &&
                                        !fundRequestMeta.can_disregarded_undo && (
                                            <button className="button button-primary" onClick={requestApprove}>
                                                <em className="mdi mdi-check icon-start" />
                                                {translate('validation_requests.buttons.accept_all')}
                                            </button>
                                        )}

                                    {fundRequestMeta.state == 'pending' &&
                                        fundRequestMeta.is_assigned &&
                                        !fundRequestMeta.can_disregarded_undo && (
                                            <button className="button button-danger" onClick={requestDecline}>
                                                <em className="mdi mdi-close icon-start" />
                                                {translate('validation_requests.buttons.decline_all')}
                                            </button>
                                        )}

                                    {fundRequestMeta.can_disregarded && (
                                        <button className="button button-default" onClick={requestDisregard}>
                                            <em className="mdi mdi-timer-sand-empty icon-start" />
                                            {translate('validation_requests.buttons.disregard')}
                                        </button>
                                    )}

                                    {fundRequestMeta.can_disregarded_undo && (
                                        <button className="button button-default" onClick={requestDisregardUndo}>
                                            <em className="mdi mdi-backup-restore icon-start" />
                                            {translate('validation_requests.buttons.disregard_undo')}
                                        </button>
                                    )}

                                    {(fundRequestMeta.can_resign || fundRequestMeta.can_resign_as_supervisor) && (
                                        <button className="button button-primary-light" onClick={requestResign}>
                                            <em className="mdi mdi-account-minus icon-start" />
                                            {translate('validation_requests.buttons.resign')}
                                        </button>
                                    )}

                                    {fundRequestMeta.state == 'disregarded' &&
                                        !fundRequestMeta.can_disregarded_undo &&
                                        fundRequestMeta.replaced && (
                                            <button className="button button-default" type="button" disabled={true}>
                                                <em className="mdi mdi-backup-restore icon-start" />
                                                {translate(
                                                    'validation_requests.buttons.disregard_undo_disabled_replaced',
                                                )}
                                            </button>
                                        )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table table-fixed">
                                <tbody>
                                    <tr>
                                        <td>
                                            <strong className="text-strong text-md text-primary">
                                                {translate('validation_requests.labels.fund')}
                                            </strong>
                                            <br />
                                            <div className="flex flex-horizontal">
                                                <div className="flex">
                                                    <strong className="text-black">{fundRequestMeta.fund.name}</strong>
                                                </div>
                                                <div className="flex flex-vertical">
                                                    <a
                                                        className={`mdi mdi-information block block-tooltip-details block-tooltip-details-inline ${
                                                            showCriteria ? 'active' : ''
                                                        }`}
                                                        onClick={showFundCriteria}>
                                                        {showCriteria && (
                                                            <ClickOutside
                                                                className="tooltip-content"
                                                                onClickOutside={hideFundCriteria}>
                                                                <ul className="tooltip-list">
                                                                    {fundRequestMeta.fund.criteria.map((criterion) => (
                                                                        <li
                                                                            key={criterion.id}
                                                                            className="tooltip-list-item">
                                                                            <em className="mdi mdi-check" />
                                                                            {criterion.description}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </ClickOutside>
                                                        )}
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="block block-tooltip-details block-tooltip-hover flex-inline flex-vertical">
                                                <strong className="text-strong text-md text-primary">
                                                    {translate('validation_requests.labels.email')}
                                                </strong>
                                                <strong className={fundRequestMeta.email ? 'text-black' : 'text-muted'}>
                                                    {strLimit(fundRequestMeta.email || 'Geen E-mail', 40)}
                                                </strong>
                                                {fundRequestMeta.email?.length > 40 && (
                                                    <div className="tooltip-content tooltip-content-fit tooltip-content-bottom">
                                                        <div className="triangle" />
                                                        <div className="nowrap">
                                                            {fundRequestMeta.email || 'Geen E-mail'}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <strong className="text-strong text-md text-primary">
                                                {translate('validation_requests.labels.bsn')}
                                            </strong>
                                            <br />
                                            <strong className={fundRequestMeta.bsn ? 'text-black' : 'text-muted'}>
                                                {fundRequestMeta.bsn || 'Geen BSN'}
                                            </strong>
                                        </td>
                                        {['pending', 'disregarded'].includes(fundRequestMeta.state) && (
                                            <td>
                                                <strong className="text-strong text-md text-primary">
                                                    {translate('validation_requests.labels.lead_time')}
                                                </strong>
                                                <br />
                                                <strong className="text-black">
                                                    {fundRequestMeta.lead_time_locale}
                                                </strong>
                                            </td>
                                        )}
                                        {fundRequestMeta.state == 'disregarded' && (
                                            <td>
                                                <strong className="text-strong text-md text-primary">
                                                    {translate('validation_requests.labels.disregarded_at')}
                                                </strong>
                                                <br />
                                                <strong className="text-black">
                                                    {fundRequestMeta.resolved_at_locale}
                                                </strong>
                                            </td>
                                        )}
                                        {fundRequestMeta.state == 'approved' && (
                                            <td>
                                                <strong className="text-strong text-md text-primary">
                                                    {translate('validation_requests.labels.accepted_at')}
                                                </strong>
                                                <br />
                                                <strong className="text-black">
                                                    {fundRequestMeta.resolved_at_locale}
                                                </strong>
                                            </td>
                                        )}
                                        {fundRequestMeta.state == 'declined' && (
                                            <td>
                                                <strong className="text-strong text-md text-primary">
                                                    {translate('validation_requests.labels.declined_at')}
                                                </strong>
                                                <br />
                                                <strong className="text-black">
                                                    {fundRequestMeta.resolved_at_locale}
                                                </strong>
                                            </td>
                                        )}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {fundRequestMeta.note && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">{translate('validation_requests.labels.note_title')}</div>
                    </div>
                    <div className="card-section">
                        <div className="flex">
                            <div className="flex">
                                <div className="card-block">{fundRequestMeta.note}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <div className="flex flex-horizontal">
                        <div className="flex flex-vertical flex-center flex-grow">
                            <div className="card-title">{translate('validation_requests.labels.records')}</div>
                        </div>
                        {fundRequestMeta.can_add_partner_bsn && (
                            <div className="flex flex-row">
                                <button className="button button-primary button-sm" onClick={appendRecord}>
                                    <em className="mdi mdi-plus icon-start" />
                                    {translate('validation_requests.buttons.add_partner_bsn')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="card-section">
                    <div className="card-block card-block-table card-block-request-record">
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        {fundRequestMeta.hasContent && <th className="cell-chevron" />}
                                        <th style={{ width: '20%' }}>{translate('validation_requests.labels.type')}</th>
                                        <th style={{ width: '20%' }}>
                                            {translate('validation_requests.labels.value')}
                                        </th>
                                        <th style={{ width: '20%' }}>{translate('validation_requests.labels.date')}</th>
                                        <th style={{ width: '20%' }}>
                                            {translate('validation_requests.labels.status')}
                                        </th>
                                        <th style={{ width: '20%' }} className="text-right">
                                            {translate('validation_requests.labels.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                {fundRequestMeta.records.map((record) => (
                                    <tbody key={record.id}>
                                        <tr>
                                            {fundRequestMeta.hasContent && (
                                                <td className="cell-chevron">
                                                    {record.hasContent && (
                                                        <a
                                                            className={classNames(
                                                                'mdi',
                                                                'td-menu-icon',
                                                                !collapsedRecords.includes(record.id)
                                                                    ? 'mdi-menu-up'
                                                                    : 'mdi-menu-down',
                                                            )}
                                                            onClick={() => {
                                                                setCollapsedRecords((shownRecords) => {
                                                                    return shownRecords?.includes(record.id)
                                                                        ? shownRecords?.filter((id) => id !== record.id)
                                                                        : [...shownRecords, record.id];
                                                                });
                                                            }}
                                                        />
                                                    )}
                                                </td>
                                            )}
                                            <td>{record.record_type.name}</td>

                                            {record?.record_type.type != 'select' && (
                                                <td className={record.value !== null ? 'text-muted' : ''}>
                                                    {record?.value || 'Niet beschikbaar'}
                                                </td>
                                            )}

                                            {record?.record_type.type == 'select' && (
                                                <td className={record.value !== null ? 'text-muted' : ''}>
                                                    {record?.record_type.options?.find(
                                                        (option) => option.value == record?.value,
                                                    )?.name || 'Niet beschikbaar'}
                                                </td>
                                            )}

                                            <td>{record.created_at_locale}</td>
                                            <td>
                                                <div
                                                    className={`label label-tag label-round ${
                                                        stateLabels[record.state]
                                                    }`}>
                                                    {translate(`validation_requests.status.${record.state}`)}
                                                </div>
                                            </td>
                                            {record.state != 'pending' && (
                                                <td className="text-right">
                                                    <div className="text-muted">
                                                        {translate(`validation_requests.status.${record.state}`)}
                                                    </div>
                                                </td>
                                            )}
                                            {record.state == 'pending' && !fundRequestMeta.is_assigned && (
                                                <td className="text-right">
                                                    {fundRequestMeta.employee ? (
                                                        <div className="td-text-insert text-muted">
                                                            <span>Toegewezen aan</span>
                                                            <div className="text-strong nowrap">
                                                                {strLimit(
                                                                    fundRequestMeta.employee?.email ||
                                                                        fundRequestMeta.employee?.identity_address,
                                                                    32,
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-muted">Zelf toewijzen</div>
                                                    )}
                                                </td>
                                            )}
                                            {record.state == 'pending' && fundRequestMeta.is_assigned && (
                                                <td className="text-right">
                                                    <div className="button-group flex-end">
                                                        {activeOrganization.allow_fund_request_record_edit && (
                                                            <button
                                                                className="button button-default button-icon"
                                                                onClick={() => editRecord(record)}>
                                                                <em className="mdi mdi-pencil" />
                                                            </button>
                                                        )}
                                                        <button
                                                            className="button button-primary-light button-icon"
                                                            onClick={() => clarifyRecord(record)}>
                                                            <em className="mdi mdi-message-text" />
                                                        </button>
                                                        {envData.config?.single_record_validation && (
                                                            <button
                                                                className="button button-danger button-icon"
                                                                onClick={() => declineRecord(record)}>
                                                                <em className="mdi mdi-close" />
                                                            </button>
                                                        )}
                                                        {envData.config?.single_record_validation && (
                                                            <button
                                                                className="button button-primary button-icon"
                                                                onClick={() => approveRecord(record)}>
                                                                <em className="mdi mdi-check" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                        {record.hasContent && !collapsedRecords.includes(record.id) && (
                                            <tr className="dim">
                                                <td className="collapse-content" colSpan={6}>
                                                    <FundRequestRecordTabs fundRequestRecord={record} />
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                ))}
                            </table>
                        </div>
                    </div>
                </div>

                {fundRequestMeta.fund.has_person_bsn_api && fundRequestMeta.bsn && fundRequestMeta.is_assigned && (
                    <FundRequestPerson organization={activeOrganization} request={fundRequestMeta} />
                )}
            </div>

            <BlockCardNotes
                isAssigned={fundRequestMeta.is_assigned}
                fetchNotes={fetchNotes}
                deleteNote={deleteNote}
                storeNote={storeNote}
                fetchNotesRef={updateNotesRef}
            />

            <BlockCardEmails
                fetchLogEmails={fetchEmailLogs}
                onExportEmail={exportEmailLog}
                fetchEmailsRef={fetchEmailsRef}
            />
        </Fragment>
    );
}
