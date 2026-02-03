import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useFundRequestValidatorService } from '../../../services/FundRequestValidatorService';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import FundRequest, { FundRequestRecordGroup } from '../../../props/models/FundRequest';
import useSetProgress from '../../../hooks/useSetProgress';
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
import ModalFundRequestDecline from '../../modals/ModalFundRequestDecline';
import ModalFundRequestRecordCreate from '../../modals/ModalFundRequestRecordCreate';
import ModalFundRequestDisregard from '../../modals/ModalFundRequestDisregard';
import ModalFundRequestDisregardUndo from '../../modals/ModalFundRequestDisregardUndo';
import ModalFundRequestAssignValidator from '../../modals/ModalFundRequestAssignValidator';
import useEnvData from '../../../hooks/useEnvData';
import IdentityPerson from './elements/IdentityPerson';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import ModalApproveFundRequest from '../../modals/ModalApproveFundRequest';
import Note from '../../../props/models/Note';
import FundRequestStateLabel from '../../elements/resource-states/FundRequestStateLabel';
import KeyValueItem from '../../elements/key-value/KeyValueItem';
import Icon from '../../../../../assets/forus-platform/resources/_platform-common/assets/img/fund-request-icon.svg';
import useEmailLogService from '../../../services/EmailLogService';
import { Permission } from '../../../props/models/Organization';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import { sortBy } from 'lodash';
import Employee from '../../../props/models/Employee';
import classNames from 'classnames';
import FundRequestRecordsHasClarifications from './elements/FundRequestRecordsHasClarifications';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import FundRequestRecordGroupRow from './elements/FundRequestRecordGroupRow';

export type FundRequestRecordLocal = FundRequestRecord & { hasContent: boolean; group_id?: number };

export type FundRequestRecordGroupLocal = FundRequestRecordGroup & {
    records?: Array<FundRequestRecordLocal>;
    hasContent?: boolean;
};

export type FundRequestLocal = FundRequest & {
    // records: Array<FundRequestRecordLocal>;
    record_has_clarifications: Array<FundRequestRecordLocal>;
    record_groups: Array<FundRequestRecordGroupLocal>;
    assignable_employees: Array<Employee>;
    can_disregarded: boolean;
    can_disregarded_undo: boolean;
    is_assignable: boolean;
    is_assignable_as_supervisor: boolean;
    is_assigned: boolean;
    can_add_partner_bsn: boolean;
    can_resign: boolean;
    can_resign_as_supervisor: boolean;
    has_actions: boolean;
};

export default function FundRequestsView() {
    const authIdentity = useAuthIdentity();
    const fundRequestId = parseInt(useParams().id);

    const envData = useEnvData();

    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();
    const setProgress = useSetProgress();

    const emailLogService = useEmailLogService();
    const activeOrganization = useActiveOrganization();
    const fundRequestService = useFundRequestValidatorService();

    const [fundRequest, setFundRequest] = useState<FundRequest>(null);
    const [showCriteria, setShowCriteria] = useState(null);
    const [uncollapsedRecords, setUncollapsedRecords] = useState<Array<number>>([]);
    const [uncollapsedRecordGroups, setUncollapsedRecordGroups] = useState<Array<number>>([]);
    const [recordGroupsCollapsedState, setRecordGroupsCollapsedState] = useState(true);

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
        () => activeOrganization?.permissions.includes(Permission.MANAGE_VALIDATORS),
        [activeOrganization],
    );

    const fundRequestMeta: FundRequestLocal = useMemo(() => {
        if (!fundRequest) {
            return null;
        }

        const { state, allowed_employees, employee } = fundRequest;
        const isPending = state == 'pending';
        const isDisregarded = state == 'disregarded';

        const recordTypes = fundRequest.records.map((record) => record.record_type_key);

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

        const recordsNoGroup = [];

        // sort groups by priority fund, organization
        let recordGroups: Array<FundRequestRecordGroupLocal> = fundRequest.record_groups
            .sort(
                (a, b) =>
                    (a.fund_id != null ? 0 : a.organization_id != null ? 1 : 2) -
                    (b.fund_id != null ? 0 : b.organization_id != null ? 1 : 2),
            )
            .map((group) => ({ ...group, records: [] }));

        // assign records
        const records = fundRequest.records
            .map((record) => ({
                ...record,
                hasContent: record.files.length > 0 || record.clarifications.length > 0 || record.history.length > 0,
                group_id: null,
            }))
            .map((record) => {
                let assigned = false;

                recordGroups.forEach((group) => {
                    if (group.record_types.includes(record.record_type_key) && !assigned) {
                        group.records.push(record);
                        record.group_id = group.id;
                        assigned = true;
                    }
                });

                if (!assigned) {
                    recordsNoGroup.push(record);
                }

                return record;
            });

        recordGroups.push({
            id: 0,
            title: translate('validation_requests.labels.no_group'),
            order: 999,
            record_types: [],
            records: recordsNoGroup,
        });

        recordGroups = recordGroups
            .filter((group) => group.records.length > 0)
            .map((group) => ({
                ...group,
                hasContent:
                    group.records.filter((record) => {
                        return record.files?.length || record.clarifications?.length || record.history?.length;
                    }).length > 0,
            }));

        return {
            ...fundRequest,

            record_has_clarifications: records.filter((record) => record.clarifications?.length),
            record_groups: sortBy(recordGroups, 'order'),

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
    }, [activeOrganization.bsn_enabled, authIdentity?.address, fundRequest, isValidatorsSupervisor, translate]);

    const { headElement, configsElement } = useConfigurableTable(fundRequestService.getRecordGroupsColumns(), {
        trPrepend: <th className="cell-chevron th-narrow" />,
    });

    const updateNotesRef = useRef<() => void>(null);
    const fetchEmailsRef = useRef<() => void>(null);

    const showInfoModal = useCallback(
        (title: string, message: string) => {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    title={title}
                    description={message}
                    className="modal-md"
                    buttonClose={{ onClick: modal.close }}
                />
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
                        onClick: (_e, setDisabled) => {
                            setDisabled(true);
                            modal.setProcessing(true);

                            fundRequestService
                                .approve(activeOrganization.id, fundRequestMeta.id)
                                .then(() => {
                                    modal.setProcessing(false);
                                    reloadRequest();
                                })
                                .catch((err: ResponseError) => {
                                    modal.setProcessing(false);
                                    setDisabled(false);

                                    showInfoModal(
                                        'Validatie van persoonsgegeven mislukt.',
                                        `Reden: ${err.data.message}`,
                                    );
                                })
                                .finally(() => setTimeout(() => modal.close()));
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
                .catch(pushApiError),
        [fundRequestService, activeOrganization?.id, fundRequestMeta?.id, pushSuccess, reloadRequest, pushApiError],
    );

    const requestResignAllEmployeesAsSupervisor = useCallback(() => {
        fundRequestService
            .resignAllEmployeesAsSupervisor(activeOrganization.id, fundRequestMeta.id)
            .then(() => {
                pushSuccess('Gelukt!', 'U heeft zich afgemeld van deze aanvraag.');
                reloadRequest();
            })
            .catch(pushApiError);
    }, [activeOrganization.id, fundRequestMeta, fundRequestService, pushApiError, pushSuccess, reloadRequest]);

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
            .catch(pushApiError);
    }, [
        activeOrganization,
        fundRequestMeta,
        fundRequestService,
        pushApiError,
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

    const fetchNotes = useCallback(
        (query = {}) => fundRequestService.notes(activeOrganization.id, fundRequestMeta.id, query),
        [activeOrganization?.id, fundRequestMeta?.id, fundRequestService],
    );

    const fetchEmailLogs = useCallback(
        (query = {}) =>
            emailLogService.list(activeOrganization.id, {
                fund_request_id: fundRequestMeta.id,
                ...query,
            }),
        [activeOrganization?.id, fundRequestMeta?.id, emailLogService],
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
                    name={DashboardRoutes.FUND_REQUESTS}
                    params={{ organizationId: activeOrganization?.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {translate('validation_requests.header.title')}
                </StateNavLink>
                <div className="breadcrumb-item active">{`#${fundRequestMeta.id}`}</div>
            </div>

            <div className="card" data-dusk="fundRequestPageContent">
                <div className="card-header">
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
                                        data-dusk="fundRequestAssignBtn"
                                        onClick={() => assignRequest()}>
                                        <em className="mdi mdi-account-plus icon-start" />
                                        {translate('validation_requests.buttons.assign_to_me')}
                                    </button>
                                )}

                                {fundRequestMeta.is_assignable_as_supervisor && (
                                    <button
                                        className="button button-primary"
                                        onClick={assignRequestAsSupervisor}
                                        data-dusk="fundRequestAssignAsSupervisorBtn">
                                        <em className="mdi mdi-account-details-outline icon-start" />
                                        {translate('validation_requests.buttons.assign')}
                                    </button>
                                )}

                                {(fundRequestMeta.can_resign || fundRequestMeta.can_resign_as_supervisor) && (
                                    <button
                                        className="button button-default"
                                        onClick={requestResign}
                                        data-dusk="fundRequestResignBtn">
                                        <em className="mdi mdi-close icon-start" />
                                        {translate('validation_requests.buttons.resign')}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="card-section">
                    <div className="card-block card-block-keyvalue">
                        <KeyValueItem label={translate('validation_requests.labels.state')}>
                            <FundRequestStateLabel fundRequest={fundRequest} />
                        </KeyValueItem>

                        <KeyValueItem label={translate('validation_requests.labels.fund_name')}>
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

                        <KeyValueItem label={translate('validation_requests.labels.created_at')}>
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
                        <div className="flex flex-end">
                            {fundRequestMeta.state == 'pending' &&
                                fundRequestMeta.is_assigned &&
                                !fundRequestMeta.can_disregarded_undo && (
                                    <button
                                        className="button button-primary"
                                        onClick={requestApprove}
                                        data-dusk="fundRequestApproveBtn">
                                        <em className="mdi mdi-check icon-start" />
                                        {translate('validation_requests.buttons.accept_all')}
                                    </button>
                                )}

                            {fundRequestMeta.state == 'pending' &&
                                fundRequestMeta.is_assigned &&
                                !fundRequestMeta.can_disregarded_undo && (
                                    <button
                                        className="button button-danger"
                                        onClick={requestDecline}
                                        data-dusk="fundRequestDeclineBtn">
                                        <em className="mdi mdi-close icon-start" />
                                        {translate('validation_requests.buttons.decline_all')}
                                    </button>
                                )}

                            {fundRequestMeta.can_disregarded && (
                                <button
                                    className="button button-default"
                                    onClick={requestDisregard}
                                    data-dusk="fundRequestDisregardBtn">
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
                )}
            </div>

            {activeOrganization.has_person_bsn_api && fundRequestMeta.bsn && fundRequestMeta.is_assigned && (
                <IdentityPerson organization={activeOrganization} identityId={fundRequestMeta.identity_id} />
            )}

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

            {fundRequestMeta.record_has_clarifications.length > 0 && (
                <FundRequestRecordsHasClarifications
                    fundRequest={fundRequestMeta}
                    setUncollapsedRecords={setUncollapsedRecords}
                    setUncollapsedRecordGroups={setUncollapsedRecordGroups}
                />
            )}

            <div className="card">
                <div className="card-header">
                    <div className="flex flex-grow card-title">
                        {translate('validation_requests.labels.records')} ({fundRequestMeta.records.length})
                    </div>

                    <div className="card-header-filters">
                        <div className="block block-inline-filters">
                            <button
                                data-dusk="toggleCollapseBtn"
                                className="button button-default button-sm"
                                onClick={() => {
                                    setRecordGroupsCollapsedState((state) => {
                                        if (state) {
                                            setUncollapsedRecordGroups(
                                                fundRequestMeta.record_groups.map((group) => group.id),
                                            );
                                        } else {
                                            setUncollapsedRecordGroups([]);
                                        }

                                        return !state;
                                    });
                                }}>
                                <em
                                    className={classNames(
                                        'mdi',
                                        'icon-start',
                                        recordGroupsCollapsedState ? 'mdi-chevron-down' : 'mdi-chevron-up',
                                    )}
                                />
                                {translate(
                                    `validation_requests.buttons.${recordGroupsCollapsedState ? 'uncollapse' : 'collapse'}`,
                                )}
                            </button>

                            {fundRequestMeta.can_add_partner_bsn && (
                                <button
                                    className="button button-primary button-sm"
                                    data-dusk="addPartnerBsnBtn"
                                    onClick={appendRecord}>
                                    <em className="mdi mdi-plus icon-start" />
                                    {translate('validation_requests.buttons.add_partner_bsn')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <LoaderTableCard
                    empty={fundRequestMeta.record_groups.length == 0}
                    emptyTitle={translate('validation_requests.labels.empty_table')}>
                    <div className="card-section">
                        <div className="card-block card-block-table card-block-request-record">
                            {configsElement}

                            <TableTopScroller>
                                <table className="table">
                                    {headElement}

                                    {fundRequestMeta.record_groups.map((group: FundRequestRecordGroupLocal) => (
                                        <FundRequestRecordGroupRow
                                            key={group.id}
                                            organization={activeOrganization}
                                            group={group}
                                            fundRequest={fundRequestMeta}
                                            uncollapsedRecords={uncollapsedRecords}
                                            setUncollapsedRecords={setUncollapsedRecords}
                                            uncollapsedRecordGroups={uncollapsedRecordGroups}
                                            setUncollapsedRecordGroups={setUncollapsedRecordGroups}
                                            reloadRequest={reloadRequest}
                                        />
                                    ))}
                                </table>
                            </TableTopScroller>
                        </div>
                    </div>
                </LoaderTableCard>
            </div>

            <BlockCardNotes
                showCreate={fundRequestMeta.is_assigned}
                fetchNotes={fetchNotes}
                deleteNote={deleteNote}
                storeNote={storeNote}
                fetchNotesRef={updateNotesRef}
            />

            <BlockCardEmails
                fetchLogEmails={fetchEmailLogs}
                organization={activeOrganization}
                fetchEmailsRef={fetchEmailsRef}
            />
        </Fragment>
    );
}
