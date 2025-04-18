import FilterModel from '../../../types/FilterModel';
import { useCallback, useEffect, useState } from 'react';
import React from 'react';
import useOpenModal from '../../../hooks/useOpenModal';
import LoadingCard from '../loading-card/LoadingCard';
import useSetProgress from '../../../hooks/useSetProgress';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import EmailLog from '../../../props/models/EmailLog';
import LoaderTableCard from '../loader-table-card/LoaderTableCard';
import TableDateTime from '../tables/elements/TableDateTime';
import TableEmptyValue from '../table-empty-value/TableEmptyValue';
import { strLimit } from '../../../helpers/string';
import TableRowActions from '../tables/TableRowActions';
import ModalLogEmailShow from '../../modals/ModalLogEmailShow';
import { ApiResponse, PaginationData } from '../../../props/ApiResponses';
import usePushApiError from '../../../hooks/usePushApiError';
import Paginator from '../../../modules/paginator/components/Paginator';
import { trimStart } from 'lodash';
import { extractText } from '../../../helpers/utils';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import useEmailLogService from '../../../services/EmailLogService';
import { useFileService } from '../../../services/FileService';
import Organization from '../../../props/models/Organization';

export default function BlockCardEmails({
    organization,
    fetchLogEmails,
    fetchEmailsRef,
}: {
    organization: Organization;
    fetchLogEmails: (value: FilterModel) => Promise<ApiResponse<EmailLog>>;
    fetchEmailsRef?: React.MutableRefObject<() => void>;
}) {
    const openModal = useOpenModal();
    const pushApiError = usePushApiError();
    const setProgress = useSetProgress();

    const fileService = useFileService();
    const paginatorService = usePaginatorService();

    const emailLogService = useEmailLogService();

    const [emailLogs, setEmailLogs] = useState<PaginationData<EmailLog>>(null);
    const [paginatorKey] = useState('fund_request_email_logs');

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        q: string;
        page: number;
        per_page: number;
    }>({
        q: '',
        page: 1,
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const exportEmailLog = useCallback(
        (emailLog: EmailLog) => {
            emailLogService
                .export(organization.id, emailLog.id)
                .then((res) => fileService.downloadFile(`email-log-${emailLog.id}.pdf`, res.data))
                .catch(pushApiError)
                .finally(() => setProgress(100));

            setProgress(0);
        },
        [organization.id, fileService, emailLogService, pushApiError, setProgress],
    );

    const openEmail = useCallback(
        (logEmail: EmailLog) => {
            openModal((modal) => {
                return <ModalLogEmailShow modal={modal} emailLog={logEmail} exportEmailLog={exportEmailLog} />;
            });
        },
        [openModal, exportEmailLog],
    );

    const fetchEmails = useCallback(() => {
        setProgress(0);

        fetchLogEmails(filterValuesActive)
            .then((res) => setEmailLogs(res.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [fetchLogEmails, filterValuesActive, setProgress, pushApiError]);

    useEffect(() => {
        fetchEmails();
    }, [fetchEmails]);

    useEffect(() => {
        if (emailLogs?.[0]) {
            openEmail(emailLogs[0]);
        }
    }, [emailLogs, openEmail]);

    useEffect(() => {
        if (fetchEmailsRef) {
            fetchEmailsRef.current = fetchEmails;
        }
    }, [fetchEmailsRef, fetchEmails]);

    if (!emailLogs) {
        return <LoadingCard />;
    }

    return (
        <div className="card" data-dusk="emailLogs">
            <div className="card-header">
                <div className="flex flex-grow card-title">
                    Berichten&nbsp;
                    <span className="span-count">{emailLogs?.meta?.total}</span>
                </div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <div className="form">
                            <div className="form-group">
                                <input
                                    type="search"
                                    className="form-control"
                                    placeholder="Zoeken"
                                    value={filterValues.q}
                                    onChange={(e) => filterUpdate({ q: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <LoaderTableCard empty={!emailLogs.meta.total} emptyTitle={'De lijst van berichten is leeg'}>
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <tbody>
                                    <tr className={'nowrap'}>
                                        <th>Verstuurd op</th>
                                        <th>Titel en bericht</th>
                                        <th>Ontvanger</th>
                                        <th>Afzender</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                    {emailLogs?.data.map((emailLog) => (
                                        <tr key={emailLog.id} data-dusk={`emailLogRow${emailLog.id}`}>
                                            <td className="nowrap">
                                                <TableDateTime value={emailLog.created_at_locale} />
                                            </td>
                                            <td>
                                                <div className={'text-semibold'}>{emailLog.subject}</div>
                                                <div className={'text-md ellipsis'}>
                                                    {strLimit(
                                                        trimStart(
                                                            extractText(emailLog.content).trim(),
                                                            emailLog.subject,
                                                        ).trim(),
                                                        64,
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={'text-primary text-semibold'}>
                                                    {emailLog.to_address || <TableEmptyValue />}
                                                </div>
                                                <div>{emailLog.to_name || <TableEmptyValue />}</div>
                                            </td>
                                            <td>
                                                <div className={'text-primary text-semibold'}>
                                                    {emailLog.from_address || <TableEmptyValue />}
                                                </div>
                                                <div>{emailLog.from_name || <TableEmptyValue />}</div>
                                            </td>
                                            <td className={'text-right'}>
                                                <TableRowActions
                                                    dataDusk={`btnEmailLogMenu${emailLog.id}`}
                                                    content={({ close }) => (
                                                        <div className="dropdown dropdown-actions">
                                                            <a
                                                                className={'dropdown-item'}
                                                                data-dusk="openEmail"
                                                                onClick={() => {
                                                                    openEmail(emailLog);
                                                                    close();
                                                                }}>
                                                                <em className="mdi mdi-eye icon-start" />
                                                                Bekijken
                                                            </a>
                                                            <a
                                                                className={'dropdown-item'}
                                                                data-dusk="exportEmail"
                                                                onClick={() => {
                                                                    exportEmailLog(emailLog);
                                                                    close();
                                                                }}>
                                                                <em className="mdi mdi-content-save-outline icon-start" />
                                                                Download
                                                            </a>
                                                        </div>
                                                    )}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {emailLogs?.meta && (
                    <div className="card-section">
                        <Paginator
                            meta={emailLogs.meta}
                            filters={filterValues}
                            updateFilters={filterUpdate}
                            perPageKey={paginatorKey}
                        />
                    </div>
                )}
            </LoaderTableCard>
        </div>
    );
}
