import React, { Fragment, useCallback } from 'react';
import classNames from 'classnames';
import TableRowActions from '../../../elements/tables/TableRowActions';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import FundRequestRecordTabs from './FundRequestRecordTabs';
import FundRequestRecord from '../../../../props/models/FundRequestRecord';
import { FundRequestLocal, FundRequestRecordGroupLocal, FundRequestRecordLocal } from '../FundRequestsView';
import ModalFundRequestClarify from '../../../modals/ModalFundRequestClarify';
import useOpenModal from '../../../../hooks/useOpenModal';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import Organization from '../../../../props/models/Organization';
import ModalFundRequestRecordEdit from '../../../modals/ModalFundRequestRecordEdit';
import ModalNotification from '../../../modals/ModalNotification';
import useTranslate from '../../../../hooks/useTranslate';
import Label from '../../../elements/image_cropper/Label';

export default function FundRequestRecordRow({
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
        (requestRecord: FundRequestRecord) => {
            openModal((modal) => (
                <ModalFundRequestClarify
                    modal={modal}
                    fundRequest={fundRequest}
                    organization={organization}
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
            <tr data-dusk={`tableFundRequestRecordRow${record.id}`} id={`recordRow${record.id}`}>
                {group.hasContent && (
                    <td className="cell-chevron">
                        {record.hasContent && (
                            <a
                                className={classNames(
                                    'mdi',
                                    'td-menu-icon',
                                    uncollapsedRecords.includes(record.id) ? 'mdi-menu-up' : 'mdi-menu-down',
                                )}
                                data-dusk={`fundRequestRecordToggleCollapse${record.id}`}
                                onClick={() => {
                                    setUncollapsedRecords((shownRecords) => {
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
                    <td className={record.value !== null ? 'text-muted' : ''}>{record?.value || 'Niet beschikbaar'}</td>
                )}

                {record?.record_type.type == 'select' && (
                    <td className={record.value !== null ? 'text-muted' : ''}>
                        {record?.record_type.options?.find((option) => option.value == record?.value)?.name ||
                            'Niet beschikbaar'}
                    </td>
                )}

                <td>{translate(`validation_requests.sources.${record.source}`)}</td>
                <td>{record.files.length > 0 && translate('validation_requests.labels.yes')}</td>
                <td>{record.clarifications.length > 0 && translate('validation_requests.labels.yes')}</td>

                <td>
                    {record.clarifications.length > 0 && (
                        <Label
                            type={
                                record.clarifications[record.clarifications.length - 1].state == 'pending'
                                    ? 'default'
                                    : 'success'
                            }>
                            {translate(
                                `validation_requests.clarification_states.${record.clarifications[record.clarifications.length - 1].state}`,
                            )}
                        </Label>
                    )}
                </td>

                <td className="td-narrow text-right">
                    {fundRequest.is_assigned ? (
                        <TableRowActions
                            dataDusk={`fundRequestRecordMenuBtn${record.id}`}
                            content={(e) => (
                                <div className="dropdown dropdown-actions">
                                    <div
                                        className="dropdown-item"
                                        onClick={() => {
                                            e.close();
                                            clarifyRecord(record);
                                        }}>
                                        <em className="mdi mdi-message-text icon-start" />
                                        Aanvullingsverzoek
                                    </div>
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
                    <td className="collapse-content" colSpan={8}>
                        <FundRequestRecordTabs fundRequestRecord={record} />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
