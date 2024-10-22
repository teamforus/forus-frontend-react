import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFundRequestValidatorService } from '../../../services/FundRequestValidatorService';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import FundRequest from '../../../props/models/FundRequest';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushDanger from '../../../hooks/usePushDanger';
import usePushSuccess from '../../../hooks/usePushSuccess';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import BlockCardNotes from '../../elements/block-card-notes/BlockCardNotes';
import BlockCardEmails from '../../elements/block-card-emails/BlockCardEmails';
import useOpenModal from '../../../hooks/useOpenModal';
import ModalNotification from '../../modals/ModalNotification';
import FundRequestRecord from '../../../props/models/FundRequestRecord';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import { ResponseError } from '../../../props/ApiResponses';
import ModalFundRequestClarify from '../../modals/ModalFundRequestClarify';
import ModalFundRequestDecline from '../../modals/ModalFundRequestDecline';
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
import Note from '../../../props/models/Note';
import FundRequestStateLabel from '../../elements/resource-states/FundRequestStateLabel';
import KeyValueItem from '../../elements/key-value/KeyValueItem';
import TableRowActions from '../../elements/tables/TableRowActions';
import Icon from '../../../../../assets/forus-platform/resources/_platform-common/assets/img/fund-request-icon.svg';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';

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

            return {
                ...criterion,
                description: `${criterion.record_type.name} ${operator} ${value} zijn.`,
            };
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
            has_actions:
                (isPending && isAssigned) ||
                (isAssigned && isDisregarded) ||
                (!isAssigned && isDisregarded && fundRequest.replaced),
        };
    }, [activeOrganization.bsn_enabled, authIdentity?.address, fundRequest, isValidatorsSupervisor]);

    const updateNotesRef = useRef<() => void>(null);
    const fetchEmailsRef = useRef<() => void>(null);

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
            <ModalFundRequestDecline
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
        (note: Note) => fundRequestService.noteDestroy(activeOrganization.id, fundRequestMeta.id, note.id),
        [activeOrganization?.id, fundRequestMeta?.id, fundRequestService],
    );

    const storeNote = useCallback(
        (data: object) => fundRequestService.storeNote(activeOrganization.id, fundRequestMeta.id, data),
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
                    <div className="flex flex-row">
                        <div className="card-title flex flex-grow flex-gap">
                            <Icon />

                            <div className="flex flex-gap-sm flex-self-center">
                                Aanvraag ID
                                <div className="text-strong">#{fundRequestMeta.id}</div>
                            </div>
                        </div>

                        {['pending', 'disregarded'].includes(fundRequestMeta.state) && (
                            <div className="flex flex-gap">
                                {fundRequestMeta.employee && (
                                    <div className="block block-fund-request-assigned">
                                        <div className="block-fund-request-assigned-key">
                                            {translate('validation_requests.labels.assigned_to_employee')}:
                                        </div>

                                        {fundRequestMeta.is_assigned ? (
                                            <div className="block-fund-request-assigned-value">
                                                <em className="mdi mdi-account" />
                                                Toegewezen aan mij
                                            </div>
                                        ) : (
                                            <div className="block-fund-request-assigned-value">
                                                <em className="mdi mdi-account-outline" />
                                                {fundRequestMeta.employee.email}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="button-group">
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

                                    {(fundRequestMeta.can_resign || fundRequestMeta.can_resign_as_supervisor) && (
                                        <button className="button button-default" onClick={requestResign}>
                                            <em className="mdi mdi-close icon-start" />
                                            {translate('validation_requests.buttons.resign')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card-section">
                    <div className="card-block card-block-keyvalue">
                        <KeyValueItem label={translate('validation_requests.labels.status')}>
                            <FundRequestStateLabel fundRequest={fundRequest} />
                        </KeyValueItem>

                        <KeyValueItem label={translate('validation_requests.labels.fund')}>
                            <Fragment>
                                {fundRequestMeta.fund.name}
                                <span
                                    className="keyvalue-value-info-block-toggle"
                                    onClick={() => setShowCriteria(!showCriteria)}>
                                    Voorwaarden ({fundRequestMeta.fund.criteria.length})
                                    <em className={`mdi mdi-chevron-${showCriteria ? 'up' : 'down'}`} />
                                </span>
                            </Fragment>
                        </KeyValueItem>

                        {showCriteria && (
                            <div className="keyvalue-item-info-block">
                                <ul>
                                    {fundRequestMeta.fund.criteria.map((criterion) => (
                                        <li key={criterion.id}>
                                            <em className="mdi mdi-check" />
                                            {criterion.description}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <KeyValueItem label={translate('validation_requests.labels.created_date')}>
                            {fundRequestMeta.created_at_locale}
                        </KeyValueItem>

                        <KeyValueItem label={translate('validation_requests.labels.assigned_to_employee')}>
                            {fundRequestMeta.employee?.email || 'Nog niet toegewezen'}
                        </KeyValueItem>

                        {['pending', 'disregarded'].includes(fundRequestMeta.state) && (
                            <KeyValueItem label={translate('validation_requests.labels.lead_time')}>
                                {fundRequestMeta.lead_time_locale}
                            </KeyValueItem>
                        )}

                        {fundRequestMeta.state == 'disregarded' && (
                            <KeyValueItem label={translate('validation_requests.labels.disregarded_at')}>
                                {fundRequestMeta.resolved_at_locale}
                            </KeyValueItem>
                        )}

                        {fundRequestMeta.state == 'approved' && (
                            <KeyValueItem label={translate('validation_requests.labels.accepted_at')}>
                                {fundRequestMeta.resolved_at_locale}
                            </KeyValueItem>
                        )}

                        {fundRequestMeta.state == 'declined' && (
                            <KeyValueItem label={translate('validation_requests.labels.declined_at')}>
                                {fundRequestMeta.resolved_at_locale}
                            </KeyValueItem>
                        )}

                        <KeyValueItem
                            label={translate('validation_requests.labels.email')}
                            className={fundRequestMeta.email ? 'text-black' : 'text-muted'}>
                            {fundRequestMeta.email || 'Geen E-mail'}
                        </KeyValueItem>

                        <KeyValueItem
                            label={translate('validation_requests.labels.bsn')}
                            className={fundRequestMeta.bsn ? 'text-black' : 'text-muted'}>
                            {fundRequestMeta.bsn || 'Geen BSN'}
                        </KeyValueItem>
                    </div>
                </div>

                {fundRequestMeta.has_actions && (
                    <div className="card-footer card-footer-primary">
                        <div className="flex">
                            <div className="flex-grow"></div>
                            <div className="flex-row">
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

                                {fundRequestMeta.state == 'disregarded' &&
                                    !fundRequestMeta.can_disregarded_undo &&
                                    fundRequestMeta.replaced && (
                                        <button className="button button-default" type="button" disabled={true}>
                                            <em className="mdi mdi-backup-restore icon-start" />
                                            {translate('validation_requests.buttons.disregard_undo_disabled_replaced')}
                                        </button>
                                    )}
                            </div>
                        </div>
                    </div>
                )}
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
                            <div className="card-title">
                                {translate('validation_requests.labels.records')} ({fundRequestMeta.records.length})
                            </div>
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
                                        {fundRequestMeta.hasContent && <th className="cell-chevron th-narrow" />}
                                        <th style={{ width: '20%' }}>{translate('validation_requests.labels.type')}</th>
                                        <th style={{ width: '20%' }}>
                                            {translate('validation_requests.labels.value')}
                                        </th>
                                        <th style={{ width: '20%' }}>{translate('validation_requests.labels.date')}</th>
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

                                            <td className="td-narrow text-right">
                                                {fundRequestMeta.is_assigned ? (
                                                    <TableRowActions
                                                        content={() => (
                                                            <div className="dropdown dropdown-actions">
                                                                {activeOrganization.allow_fund_request_record_edit && (
                                                                    <div
                                                                        className="dropdown-item"
                                                                        onClick={() => editRecord(record)}>
                                                                        <em className="mdi mdi-pencil icon-start" />
                                                                        Bewerking
                                                                    </div>
                                                                )}
                                                                <div
                                                                    className="dropdown-item"
                                                                    onClick={() => clarifyRecord(record)}>
                                                                    <em className="mdi mdi-message-text icon-start" />
                                                                    Aanvullingsverzoek
                                                                </div>
                                                            </div>
                                                        )}
                                                    />
                                                ) : (
                                                    <TableEmptyValue />
                                                )}
                                            </td>
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
