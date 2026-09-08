import React, { Fragment, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import TableRowActions from '../../../elements/tables/TableRowActions';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import FundRequestRecordTabs from './FundRequestRecordTabs';
import FundRequestRecord from '../../../../props/models/FundRequestRecord';
import { FundRequestLocal, FundRequestRecordGroupLocal, FundRequestRecordLocal } from '../FundRequestsView';
import ModalFundRequestClarificationEdit from '../../../modals/fund-request-clarification/ModalFundRequestClarificationEdit';
import useOpenModal from '../../../../hooks/useOpenModal';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import Organization from '../../../../props/models/Organization';
import ModalFundRequestRecordEdit from '../../../modals/record-edit/ModalFundRequestRecordEdit';
import ModalNotification from '../../../modals/ModalNotification';
import useTranslate from '../../../../hooks/useTranslate';
import Label from '../../../elements/label/Label';
import EmptyValue from '../../../elements/empty-value/EmptyValue';
import Tooltip from '../../../elements/tooltip/Tooltip';
import FundRequestClarification from '../../../../props/models/FundRequestClarification';
import ModalFundRequestClarificationClose from '../../../modals/fund-request-clarification/ModalFundRequestClarificationClose';

export default function FundRequestGroupRecordRow({
    organization,
    record,
    group,
    fundRequest,
    uncollapsedRecords,
    setUncollapsedRecords,
    reloadRequest,
}: {
    organization: Organization;
    record: FundRequestRecordLocal;
    group: FundRequestRecordGroupLocal;
    fundRequest: FundRequestLocal;
    uncollapsedRecords: Array<number>;
    setUncollapsedRecords: React.Dispatch<React.SetStateAction<number[]>>;
    reloadRequest: () => void;
}) {
    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();
    const translate = useTranslate();

    const recordHasCriterion = useMemo(() => {
        return (
            record.fund_criterion_id &&
            fundRequest.fund?.criteria?.find(
                (criterion) =>
                    criterion.id === record.fund_criterion_id &&
                    !['children_same_address_nth', 'partner_same_address_nth'].includes(criterion.record_type_key),
            )
        );
    }, [fundRequest, record]);

    const pendingClarification = useMemo(() => {
        return record.clarifications.find((clarification) => clarification.state === 'pending');
    }, [record.clarifications]);

    const stateLabelType = useMemo(() => {
        const state = record.clarifications[record.clarifications.length - 1]?.state;

        if (!state) {
            return undefined;
        }

        return state == 'pending' ? 'default' : state == 'closed' ? 'primary-light' : 'success';
    }, [record?.clarifications]);

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

    const clarifyRecord = useCallback(
        (requestRecord: FundRequestRecord, clarification?: FundRequestClarification) => {
            openModal((modal) => (
                <ModalFundRequestClarificationEdit
                    modal={modal}
                    fundRequest={fundRequest}
                    organization={organization}
                    clarification={clarification}
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
        [organization, fundRequest, openModal, pushSuccess, reloadRequest, showInfoModal],
    );

    const closeClarification = useCallback(
        (clarification: FundRequestClarification) => {
            openModal((modal) => (
                <ModalFundRequestClarificationClose
                    modal={modal}
                    fundRequest={fundRequest}
                    organization={organization}
                    clarification={clarification}
                    onSubmitted={(err) => {
                        if (err) {
                            return showInfoModal('Error', `Reden: ${err.data.message}`);
                        }

                        reloadRequest();
                        pushSuccess('Gelukt!', 'Aanvullingsverzoek gesloten.');
                    }}
                />
            ));
        },
        [organization, fundRequest, openModal, pushSuccess, reloadRequest, showInfoModal],
    );

    const editRecord = useCallback(
        (fundRequestRecord: FundRequestRecord) => {
            openModal((modal) => (
                <ModalFundRequestRecordEdit
                    modal={modal}
                    fundRequest={fundRequest}
                    organization={organization}
                    fundRequestRecord={fundRequestRecord}
                    onEdit={() => {
                        pushSuccess('Gelukt!', 'Persoonsgegeven toegevoegd.');
                        reloadRequest();
                    }}
                />
            ));
        },
        [organization, fundRequest, openModal, pushSuccess, reloadRequest],
    );

    return (
        <Fragment>
            <tr
                className={classNames('tr-narrow', record.hasContent && 'tr-clickable')}
                data-dusk={`tableFundRequestRecordRow${record.id}`}
                id={`recordRow${record.id}`}
                onClick={() => {
                    if (!record.hasContent) {
                        return;
                    }

                    setUncollapsedRecords((shownRecords) => {
                        return shownRecords?.includes(record.id)
                            ? shownRecords?.filter((id) => id !== record.id)
                            : [...shownRecords, record.id];
                    });
                }}>
                {group.hasContent && <td className="td-narrow"></td>}
                <td>
                    <div className="td-collapsable" data-dusk={`fundRequestRecordToggleCollapse${record.id}`}>
                        {record.hasContent && (
                            <div className="collapsable-icon">
                                <div
                                    className={classNames(
                                        `mdi icon-collapse `,
                                        uncollapsedRecords.includes(record.id) ? 'mdi-menu-down' : 'mdi-menu-right',
                                    )}
                                />
                            </div>
                        )}

                        <div className="collapsable-content text-semibold">{record.record_type.name}</div>
                    </div>
                </td>

                {record?.record_type.type != 'select' && (
                    <td className={classNames(record.value !== null && 'text-muted')}>
                        {record?.value || 'Niet beschikbaar'}
                    </td>
                )}

                {record?.record_type.type == 'select' && (
                    <td className={classNames(record.value !== null && 'text-muted')}>
                        {record?.record_type.options?.find((option) => option.value == record?.value)?.name ||
                            'Niet beschikbaar'}
                    </td>
                )}

                <td>
                    <div className="flex flex-gap-xs">
                        {translate(`validation_requests.sources.${record.source}`)}
                        {record.history.length > 0 && (
                            <Tooltip size="sm" text={translate('validation_requests.tooltips.edited')} />
                        )}
                    </div>
                </td>
                <td>{record.files.length > 0 ? translate('validation_requests.labels.yes') : <EmptyValue />}</td>
                <td>
                    {record.clarifications.length > 0 ? translate('validation_requests.labels.yes') : <EmptyValue />}
                </td>

                <td>
                    {record.clarifications.length > 0 ? (
                        <Label type={stateLabelType}>
                            {translate(
                                `validation_requests.clarification_states.${record.clarifications[record.clarifications.length - 1].state}`,
                            )}
                        </Label>
                    ) : (
                        <EmptyValue />
                    )}
                </td>

                <td className="td-narrow text-right">
                    {fundRequest.is_assigned ? (
                        <TableRowActions
                            dataDusk={`fundRequestRecordMenuBtn${record.id}`}
                            content={(e) => (
                                <div className="dropdown dropdown-actions">
                                    {recordHasCriterion && (
                                        <>
                                            {pendingClarification ? (
                                                <div
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        e.close();
                                                        clarifyRecord(record, pendingClarification);
                                                    }}>
                                                    <em className="mdi mdi-message-text icon-start" />
                                                    Wijzig aanvulverzoek
                                                </div>
                                            ) : (
                                                <div
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        e.close();
                                                        clarifyRecord(record);
                                                    }}>
                                                    <em className="mdi mdi-message-text icon-start" />
                                                    Aanvullingsverzoek
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {organization.allow_fund_request_record_edit && (
                                        <div
                                            className="dropdown-item"
                                            onClick={() => {
                                                e.close();
                                                editRecord(record);
                                            }}
                                            data-dusk="fundRequestRecordEditBtn">
                                            <em className="mdi mdi-pencil icon-start" />
                                            Bewerking
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                    ) : (
                        <TableEmptyValue />
                    )}
                </td>
            </tr>
            {record.hasContent && uncollapsedRecords.includes(record.id) && (
                <tr className="tr-dim">
                    {group.hasContent && <td className="td-narrow"></td>}
                    <td className="collapse-content" colSpan={7}>
                        <FundRequestRecordTabs
                            fundRequestRecord={record}
                            canManageClarifications={fundRequest.is_assigned}
                            editClarification={(clarification) => clarifyRecord(record, clarification)}
                            closeClarification={(clarification) => closeClarification(clarification)}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
