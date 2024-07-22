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
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import ModalFundRequestClarify from '../../modals/ModalFundRequestClarify';
import ModalFundRequestRecordDecline from '../../modals/ModalFundRequestRecordDecline';
import ModalFundRequestRecordsDecline from '../../modals/ModalFundRequestRecordsDecline';
import ModalFundRequestRecordEdit from '../../modals/ModalFundRequestRecordEdit';
import ModalFundRequestRecordCreate from '../../modals/ModalFundRequestRecordCreate';
import ModalFundRequestDisregard from '../../modals/ModalFundRequestDisregard';
import ModalFundRequestDisregardUndo from '../../modals/ModalFundRequestDisregardUndo';
import ModalFundRequestAssignValidator from '../../modals/ModalFundRequestAssignValidator';
import { useEmployeeService } from '../../../services/EmployeeService';
import useEnvData from '../../../hooks/useEnvData';
import Employee from '../../../props/models/Employee';
import FundRequestRecordTabs from './elements/FundRequestRecordTabs';
import FundRequestPerson from './elements/FundRequestPerson';
import useTranslate from '../../../hooks/useTranslate';
import EmailLog from '../../../props/models/EmailLog';
import { useFileService } from '../../../services/FileService';
import usePushApiError from '../../../hooks/usePushApiError';

type FundRequestRecordLocal = FundRequestRecord & { shown?: boolean; hasContent?: boolean };

type FundRequestLocal = {
    is_assigned?: boolean;
    is_assignable?: boolean;
    is_sponsor_employee?: boolean;
    is_assignable_as_supervisor?: boolean;
    can_disregarded?: boolean;
    can_disregarded_undo?: boolean;
    can_resign?: boolean;
    can_resign_as_supervisor?: boolean;
    can_add_partner_bsn?: boolean;
    hasContent?: boolean;
    collapsed?: boolean;
    records?: Array<FundRequestRecordLocal>;
    bsn_expanded?: boolean;
} & FundRequest;

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
    const employeeService = useEmployeeService();
    const activeOrganization = useActiveOrganization();
    const fundRequestService = useFundRequestValidatorService();

    const [employees, setEmployees] = useState<PaginationData<Employee>>(null);
    const [fundRequest, setFundRequest] = useState<FundRequestLocal>(null);
    const [showCriteria, setShowCriteria] = useState(null);

    const isValidatorsSupervisor = useMemo(
        () => activeOrganization?.permissions.includes('manage_validators'),
        [activeOrganization],
    );

    const [stateLabels] = useState({
        pending: 'label-primary-variant',
        declined: 'label-danger',
        approved: 'label-success',
        approved_partly: 'label-success',
        disregarded: 'label-default',
    });

    const [stateLabelIcons] = useState({
        pending: 'circle-outline',
        declined: 'circle-off-outline',
        approved: 'circle-slice-8',
        approved_partly: 'circle-slice-4',
        disregarded: 'circle-outline',
    });

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

    const mapRequestFlags = useCallback(
        (fundRequest: FundRequestLocal) => {
            const { state, records, replaced, allowed_employees } = fundRequest;
            const isPending = state == 'pending';

            const recordTypes = records.map((record) => record.record_type_key);
            const pendingRecords = records.filter((record) => record.state == 'pending');
            const assignedRecords = records.filter(
                (record) => record.employee?.identity_address === authIdentity.address,
            );
            const assignableRecords = pendingRecords.filter((record) => record.is_assignable);

            const assignedPendingRecords = assignedRecords.filter((record) => record.state === 'pending');
            const assignedDisregardedRecords = assignedRecords.filter((record) => record.state === 'disregarded');

            const isSponsorEmployee = activeOrganization.id === fundRequest.fund.organization_id;
            const hasAssignableRecords = assignableRecords.length > 0;

            const hasAssignableEmployees =
                allowed_employees.filter((employee) => employee.identity_address !== authIdentity?.address).length > 0;

            const isAssigned = assignedPendingRecords.length > 0 || assignedDisregardedRecords.length > 0;
            const hasPartnerBSN = recordTypes.includes('partner_bsn');
            const canAddPartnerBsn =
                isSponsorEmployee && activeOrganization.bsn_enabled && isAssigned && !hasPartnerBSN;

            const hasPendingInternallyAssignedRecords =
                pendingRecords.filter((record) => {
                    return record.employee?.organization_id === activeOrganization.id;
                }).length > 0;

            fundRequest.records = fundRequest.records.map((record) => ({
                ...record,
                shown: true,
                hasContent: record.files.length > 0 || record.clarifications.length > 0 || record.history.length > 0,
            }));

            fundRequest.hasContent =
                records.filter((record) => {
                    return record.files?.length || record.clarifications?.length || record.history?.length;
                }).length > 0;

            fundRequest.can_disregarded = isPending && isSponsorEmployee && assignedPendingRecords.length > 0;
            fundRequest.can_disregarded_undo = isSponsorEmployee && assignedDisregardedRecords.length > 0 && !replaced;

            fundRequest.is_assignable = isPending && hasAssignableRecords;
            fundRequest.is_sponsor_employee = isSponsorEmployee;
            fundRequest.is_assignable_as_supervisor = isPending && hasAssignableEmployees && isValidatorsSupervisor;

            fundRequest.is_assigned = isAssigned;
            fundRequest.can_add_partner_bsn = canAddPartnerBsn;

            fundRequest.can_resign = assignedPendingRecords.length > 0 && assignedDisregardedRecords.length == 0;
            fundRequest.can_resign_as_supervisor =
                isPending && isValidatorsSupervisor && hasPendingInternallyAssignedRecords;

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

            return { ...fundRequest };
        },
        [activeOrganization, authIdentity, isValidatorsSupervisor],
    );

    const fetchEmployees = useCallback(() => {
        setProgress(0);

        employeeService
            .list(activeOrganization.id, { per_page: 100, permission: 'validate_records' })
            .then((res) => setEmployees(res.data))
            .catch((res) => pushDanger('Error', res?.data?.message || 'Unknwon error.'))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, employeeService, pushDanger, setProgress]);

    const fetchFundRequest = useCallback(() => {
        setProgress(0);

        fundRequestService
            .read(activeOrganization.id, fundRequestId)
            .then((res) => setFundRequest(mapRequestFlags(res.data.data)))
            .catch((res) => pushDanger('Error', res?.data?.message || 'Unknwon error.'))
            .finally(() => setProgress(100));
    }, [mapRequestFlags, fundRequestService, activeOrganization, fundRequestId, setProgress, pushDanger]);

    const reloadRequest = useCallback(() => {
        fundRequestService.read(activeOrganization.id, fundRequest.id).then((res) => {
            fundRequest.records.forEach((record) => {
                const newRecord: FundRequestRecord & { shown?: boolean } = res.data.data.records.filter(
                    (_record) => _record.id == record.id,
                )[0];

                if (newRecord) {
                    newRecord.shown = record.shown;
                }
            });

            setFundRequest(
                mapRequestFlags({
                    ...res.data.data,
                    ...{
                        hasContent: fundRequest.hasContent,
                        person: fundRequest.person,
                        person_relative: fundRequest.person_relative,
                        person_breadcrumbs: fundRequest.person_breadcrumbs,
                    },
                }),
            );

            fetchEmailsRef?.current?.();
        }, console.error);
    }, [activeOrganization.id, fundRequest, fundRequestService, mapRequestFlags]);

    const approveRecord = useCallback(
        (requestRecord: FundRequestRecord) => {
            const onConfirm = (modal: ModalState) => {
                modal.close();
                fundRequestService
                    .approveRecord(activeOrganization.id, requestRecord.fund_request_id, requestRecord.id)
                    .then(
                        () => {
                            reloadRequest();
                            pushSuccess('Gelukt!', 'Persoonsgegeven gevalideert.');
                        },
                        (res) =>
                            showInfoModal(
                                'Fout: U kunt deze persoonsgegeven op dit moment niet beoordelen.',
                                res.data.message,
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
                    fundRequest={fundRequest}
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
        [activeOrganization, fundRequest, openModal, pushSuccess, reloadRequest, showInfoModal],
    );

    const clarifyRecord = useCallback(
        (requestRecord: FundRequestRecord) => {
            openModal((modal) => (
                <ModalFundRequestClarify
                    modal={modal}
                    fundRequest={fundRequest}
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
        [activeOrganization, fundRequest, openModal, pushSuccess, reloadRequest, showInfoModal],
    );

    const requestApprove = useCallback(() => {
        openModal((modal) => (
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
                            .approve(activeOrganization.id, fundRequest.id)
                            .then(() => reloadRequest())
                            .catch((err: ResponseError) => {
                                showInfoModal('Validatie van persoonsgegeven mislukt.', `Reden: ${err.data.message}`);
                            });
                    },
                }}
            />
        ));
    }, [activeOrganization?.id, fundRequest?.id, fundRequestService, openModal, reloadRequest, showInfoModal]);

    const requestDecline = useCallback(() => {
        openModal((modal) => (
            <ModalFundRequestRecordsDecline
                modal={modal}
                fundRequest={fundRequest}
                organization={activeOrganization}
                onSubmitted={(err) => {
                    if (err) {
                        return showInfoModal(
                            'U kunt op dit moment deze aanvragen niet weigeren.',
                            'Reden: ' + err.data.message,
                        );
                    }

                    reloadRequest();
                    pushSuccess('Gelukt!', 'Aanvraag is geweigerd.');
                }}
            />
        ));
    }, [activeOrganization, fundRequest, openModal, pushSuccess, reloadRequest, showInfoModal]);

    const requestDisregard = useCallback(() => {
        openModal((modal) => (
            <ModalFundRequestDisregard
                modal={modal}
                fundRequest={fundRequest}
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
    }, [activeOrganization, fundRequest, openModal, pushSuccess, reloadRequest, showInfoModal]);

    const requestDisregardUndo = useCallback(() => {
        openModal((modal) => (
            <ModalFundRequestDisregardUndo
                modal={modal}
                fundRequest={fundRequest}
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
    }, [activeOrganization, fundRequest, openModal, pushSuccess, reloadRequest, showInfoModal]);

    const assignRequestAsSupervisor = useCallback(() => {
        openModal((modal) => (
            <ModalFundRequestAssignValidator
                modal={modal}
                fundRequest={fundRequest}
                organization={activeOrganization}
                employees={employees.data.filter((employee) => employee.identity_address != authIdentity.address)}
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
    }, [
        openModal,
        fundRequest,
        activeOrganization,
        employees,
        authIdentity.address,
        reloadRequest,
        pushSuccess,
        showInfoModal,
    ]);

    const assignRequest = useCallback(
        () =>
            fundRequestService
                .assign(activeOrganization?.id, fundRequest.id)
                .then(() => {
                    pushSuccess('Gelukt!', 'U bent nu toegewezen aan deze aanvraag.');
                    reloadRequest();
                })
                .catch((res) => {
                    pushDanger('Mislukt!', 'U kunt op dit moment geen aanvullingsverzoek doen.');
                    console.error(res);
                }),
        [fundRequestService, activeOrganization?.id, fundRequest?.id, pushSuccess, reloadRequest, pushDanger],
    );

    const requestResignAllEmployeesAsSupervisor = useCallback(() => {
        fundRequestService
            .resignAllEmployeesAsSupervisor(activeOrganization.id, fundRequest.id)
            .then(() => {
                pushSuccess('Gelukt!', 'U heeft zich afgemeld van deze aanvraag.');
                reloadRequest();
            })
            .catch((res: ResponseError) => {
                pushDanger('Mislukt!', res?.data?.message);
            });
    }, [activeOrganization.id, fundRequest, fundRequestService, pushDanger, pushSuccess, reloadRequest]);

    const requestResign = useCallback(() => {
        if (!fundRequest.can_resign) {
            return requestResignAllEmployeesAsSupervisor();
        }

        fundRequestService
            .resign(activeOrganization.id, fundRequest.id)
            .then(() => {
                pushSuccess('Gelukt!', 'U heeft zich afgemeld van deze aanvraag.');
                reloadRequest();
            })
            .catch(() => {
                pushDanger('Mislukt!', 'U kunt u zelf niet van deze aanvraag afhalen.');
            });
    }, [
        activeOrganization,
        fundRequest,
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
                fundRequest={fundRequest}
                organization={activeOrganization}
                onCreated={() => {
                    pushSuccess('Gelukt!', 'Persoonsgegeven toegevoegd.');
                    reloadRequest();
                }}
            />
        ));
    }, [activeOrganization, fundRequest, openModal, pushSuccess, reloadRequest]);

    const editRecord = useCallback(
        (fundRequestRecord: FundRequestRecord) => {
            openModal((modal) => (
                <ModalFundRequestRecordEdit
                    modal={modal}
                    fundRequest={fundRequest}
                    organization={activeOrganization}
                    fundRequestRecord={fundRequestRecord}
                    onEdit={() => {
                        pushSuccess('Gelukt!', 'Persoonsgegeven toegevoegd.');
                        reloadRequest();
                    }}
                />
            ));
        },
        [activeOrganization, fundRequest, openModal, pushSuccess, reloadRequest],
    );

    const fetchNotes = useCallback(
        (query = {}) => fundRequestService.notes(activeOrganization.id, fundRequest.id, query),
        [activeOrganization?.id, fundRequest?.id, fundRequestService],
    );

    const fetchEmailLogs = useCallback(
        (query = {}) => fundRequestService.emailLogs(activeOrganization.id, fundRequest.id, query),
        [activeOrganization?.id, fundRequest?.id, fundRequestService],
    );

    const exportEmailLog = useCallback(
        (emailLog: EmailLog) => {
            fundRequestService
                .emailLogExport(activeOrganization.id, fundRequest.id, emailLog.id)
                .then((res) => fileService.downloadFile(`email-log-${emailLog.id}.pdf`, res.data))
                .catch(pushApiError)
                .finally(() => setProgress(100));

            setProgress(0);
        },
        [activeOrganization?.id, fileService, fundRequest?.id, fundRequestService, pushApiError, setProgress],
    );

    const deleteNote = useCallback(
        (note) => fundRequestService.noteDestroy(activeOrganization.id, fundRequest.id, note.id),
        [activeOrganization?.id, fundRequest?.id, fundRequestService],
    );

    const storeNote = useCallback(
        (data) => fundRequestService.storeNote(activeOrganization.id, fundRequest.id, data),
        [activeOrganization?.id, fundRequest?.id, fundRequestService],
    );

    const fundRequestRecord = useCallback((record: FundRequestRecordLocal, values: Partial<FundRequestRecordLocal>) => {
        setFundRequest((request) => {
            Object.assign(request.records?.find((item) => item.id == record.id) || {}, values);

            return { ...request };
        });
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        fetchFundRequest();
    }, [fetchFundRequest]);

    if (!fundRequest) {
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
                <div className="breadcrumb-item active">{`#${fundRequest.id}`}</div>
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
                                                {fundRequest.id}&nbsp;&nbsp;
                                            </div>
                                        </div>
                                        <div className="flex flex-vertical flex-center">
                                            <div className="flex flex-horizontal">
                                                {!(fundRequest.state == 'pending' && fundRequest.is_assigned) && (
                                                    <div
                                                        className={`label label-tag label-round ${
                                                            stateLabels[fundRequest.state] || ''
                                                        }`}>
                                                        <em
                                                            className={`mdi mdi-${
                                                                stateLabelIcons[fundRequest.state]
                                                            } icon-start`}
                                                        />
                                                        <span>{fundRequest.state_locale}</span>
                                                    </div>
                                                )}

                                                {fundRequest.state == 'pending' && fundRequest.is_assigned && (
                                                    <div className="label label-tag label-round label-warning">
                                                        <span className="mdi mdi-circle-outline icon-start" />
                                                        <span>In behandeling</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-subtitle">
                                    <div className="flex text-muted-dark">
                                        <div className="mdi mdi-clock-outline text-muted-dark" />
                                        {fundRequest.created_at_locale}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {['pending', 'disregarded'].includes(fundRequest.state) && (
                            <div className="flex flex-self-start">
                                <div className="flex-row">
                                    {fundRequest.is_assignable && (
                                        <button
                                            className={`button ${
                                                fundRequest.is_assignable_as_supervisor
                                                    ? 'button-default'
                                                    : 'button-primary'
                                            }`}
                                            onClick={() => assignRequest()}>
                                            <em className="mdi mdi-account-plus icon-start" />
                                            {translate('validation_requests.buttons.assign_to_me')}
                                        </button>
                                    )}

                                    {fundRequest.is_assignable_as_supervisor && (
                                        <button className="button button-primary" onClick={assignRequestAsSupervisor}>
                                            <em className="mdi mdi-account-details-outline icon-start" />
                                            {translate('validation_requests.buttons.assign')}
                                        </button>
                                    )}

                                    {fundRequest.state == 'pending' &&
                                        fundRequest.is_assigned &&
                                        !fundRequest.can_disregarded_undo && (
                                            <button className="button button-primary" onClick={requestApprove}>
                                                <em className="mdi mdi-check icon-start" />
                                                {translate('validation_requests.buttons.accept_all')}
                                            </button>
                                        )}

                                    {fundRequest.state == 'pending' &&
                                        fundRequest.is_assigned &&
                                        !fundRequest.can_disregarded_undo && (
                                            <button className="button button-danger" onClick={requestDecline}>
                                                <em className="mdi mdi-close icon-start" />
                                                {translate('validation_requests.buttons.decline_all')}
                                            </button>
                                        )}

                                    {fundRequest.can_disregarded && (
                                        <button className="button button-default" onClick={requestDisregard}>
                                            <em className="mdi mdi-timer-sand-empty icon-start" />
                                            {translate('validation_requests.buttons.disregard')}
                                        </button>
                                    )}

                                    {fundRequest.can_disregarded_undo && (
                                        <button className="button button-default" onClick={requestDisregardUndo}>
                                            <em className="mdi mdi-backup-restore icon-start" />
                                            {translate('validation_requests.buttons.disregard_undo')}
                                        </button>
                                    )}

                                    {(fundRequest.can_resign || fundRequest.can_resign_as_supervisor) && (
                                        <button className="button button-primary-light" onClick={requestResign}>
                                            <em className="mdi mdi-account-minus icon-start" />
                                            {translate('validation_requests.buttons.resign')}
                                        </button>
                                    )}

                                    {fundRequest.state == 'disregarded' &&
                                        !fundRequest.can_disregarded_undo &&
                                        fundRequest.replaced && (
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
                                                    <strong className="text-black">{fundRequest.fund.name}</strong>
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
                                                                    {fundRequest.fund.criteria.map((criterion) => (
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
                                                <strong className={fundRequest.email ? 'text-black' : 'text-muted'}>
                                                    {strLimit(fundRequest.email || 'Geen E-mail', 40)}
                                                </strong>
                                                {fundRequest.email?.length > 40 && (
                                                    <div className="tooltip-content tooltip-content-fit tooltip-content-bottom">
                                                        <div className="triangle" />
                                                        <div className="nowrap">
                                                            {fundRequest.email || 'Geen E-mail'}
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
                                            <strong className={fundRequest.bsn ? 'text-black' : 'text-muted'}>
                                                {fundRequest.bsn || 'Geen BSN'}
                                            </strong>
                                        </td>
                                        {['pending', 'disregarded'].includes(fundRequest.state) && (
                                            <td>
                                                <strong className="text-strong text-md text-primary">
                                                    {translate('validation_requests.labels.lead_time')}
                                                </strong>
                                                <br />
                                                <strong className="text-black">{fundRequest.lead_time_locale}</strong>
                                            </td>
                                        )}
                                        {fundRequest.state == 'disregarded' && (
                                            <td>
                                                <strong className="text-strong text-md text-primary">
                                                    {translate('validation_requests.labels.disregarded_at')}
                                                </strong>
                                                <br />
                                                <strong className="text-black">{fundRequest.resolved_at_locale}</strong>
                                            </td>
                                        )}
                                        {fundRequest.state == 'approved' && (
                                            <td>
                                                <strong className="text-strong text-md text-primary">
                                                    {translate('validation_requests.labels.accepted_at')}
                                                </strong>
                                                <br />
                                                <strong className="text-black">{fundRequest.resolved_at_locale}</strong>
                                            </td>
                                        )}
                                        {fundRequest.state == 'declined' && (
                                            <td>
                                                <strong className="text-strong text-md text-primary">
                                                    {translate('validation_requests.labels.declined_at')}
                                                </strong>
                                                <br />
                                                <strong className="text-black">{fundRequest.resolved_at_locale}</strong>
                                            </td>
                                        )}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {fundRequest.note && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">{translate('validation_requests.labels.note_title')}</div>
                    </div>
                    <div className="card-section">
                        <div className="flex">
                            <div className="flex">
                                <div className="card-block">{fundRequest.note}</div>
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
                        {fundRequest.can_add_partner_bsn && (
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
                                        {fundRequest.hasContent && <th className="cell-chevron" />}
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
                                {fundRequest.records.map((record) => (
                                    <tbody key={record.id}>
                                        <tr>
                                            {fundRequest.hasContent && (
                                                <td className="cell-chevron">
                                                    {record.hasContent && (
                                                        <a
                                                            className={`mdi mdi-menu-${
                                                                record.shown ? 'up' : 'down'
                                                            } td-menu-icon`}
                                                            onClick={() => {
                                                                fundRequestRecord(record, { shown: !record?.shown });
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
                                            {record.state == 'pending' && !record.is_assigned && (
                                                <td className="text-right">
                                                    {record.employee_id && (
                                                        <div className="td-text-insert text-muted">
                                                            <span>Toegewezen aan</span>
                                                            <div className="text-strong nowrap">
                                                                {strLimit(
                                                                    record.employee?.email ||
                                                                        record.employee?.identity_address,
                                                                    32,
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {!record.employee_id && record.is_assignable && (
                                                        <div className="text-muted">Zelf toewijzen</div>
                                                    )}
                                                    {!record.employee_id && !record.is_assignable && (
                                                        <div className="text-muted">Niet beschikbaar</div>
                                                    )}
                                                </td>
                                            )}
                                            {record.state == 'pending' && record.is_assigned && (
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
                                        {record.hasContent && record.shown && (
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

                {fundRequest.fund.has_person_bsn_api &&
                    fundRequest.bsn &&
                    fundRequest.is_sponsor_employee &&
                    fundRequest.is_assigned && (
                        <FundRequestPerson organization={activeOrganization} request={fundRequest} />
                    )}
            </div>

            <BlockCardNotes
                isAssigned={fundRequest.is_assigned}
                fetchNotes={fetchNotes}
                deleteNote={deleteNote}
                storeNote={storeNote}
            />

            <BlockCardEmails
                fetchLogEmails={fetchEmailLogs}
                onExportEmail={exportEmailLog}
                fetchEmailsRef={fetchEmailsRef}
            />
        </Fragment>
    );
}
