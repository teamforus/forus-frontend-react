import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import EmailLog from '../../props/models/EmailLog';
import classNames from 'classnames';
import TableEmptyValue from '../elements/table-empty-value/TableEmptyValue';
import TableDateTime from '../elements/tables/elements/TableDateTime';

export default function ModalLogEmailShow({
    modal,
    emailLog,
    exportEmailLog,
}: {
    modal: ModalState;
    emailLog: EmailLog;
    exportEmailLog: (emailLog: EmailLog) => void;
}) {
    return (
        <div className={classNames('modal', 'modal-animated', 'modal-lg', modal.loading && 'modal-loading')}>
            <div className="modal-backdrop" onClick={modal.close} />

            <div className="modal-window">
                <div className="modal-header">
                    Berichtinformatie
                    <div className="modal-close mdi mdi-close" onClick={modal.close} role="button" />
                </div>
                <div className="modal-body form">
                    <div className="modal-section">
                        <div className="block block-email-log-preview">
                            <div className="form-group">
                                <div className="email-log-overview">
                                    <div className="email-log-overview-col">
                                        <div className="email-log-label">Verstuurd op</div>
                                        <div className="email-log-value">
                                            <TableDateTime value={emailLog.created_at_locale} />
                                        </div>
                                    </div>
                                    <div className="email-log-overview-col">
                                        <div className="email-log-label">Ontvanger</div>
                                        <div className="email-log-value">
                                            <div className={'text-primary text-medium'}>
                                                {emailLog.to_address || <TableEmptyValue />}
                                            </div>
                                            <div>{emailLog.to_name || <TableEmptyValue />}</div>
                                        </div>
                                    </div>
                                    <div className="email-log-overview-col">
                                        <div className="email-log-label">Afzender</div>
                                        <div className="email-log-value">
                                            <div className={'text-primary text-medium'}>
                                                {emailLog.from_address || <TableEmptyValue />}
                                            </div>
                                            <div>{emailLog.from_name || <TableEmptyValue />}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="form-label">Onderwerp</div>
                                <div className={'form-control form-control-dashed'}>{emailLog.subject}</div>
                            </div>
                            <div className="form-group">
                                <div className="form-label">Bericht</div>
                                <div className={'form-control form-control-dashed email-log-preview'}>
                                    {!modal.loading && emailLog.content && (
                                        <iframe
                                            sandbox={'allow-same-origin'}
                                            srcDoc={emailLog.content}
                                            onLoad={(e) => {
                                                const iframeDoc = e.currentTarget.contentWindow.document;
                                                const iframeDocHeight = iframeDoc.documentElement.scrollHeight;

                                                iframeDoc.querySelectorAll('a').forEach((el) => {
                                                    el.onclick = (e) => {
                                                        e.preventDefault();
                                                        window.open(el.href, '_blank', 'noopener,noreferrer')?.focus();
                                                    };
                                                });

                                                e.currentTarget.style.height = `${iframeDocHeight}px`;
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <div className="button-group">
                        <div className="button button-default" onClick={modal.close}>
                            Sluiten
                        </div>
                        <div
                            className="button button-primary"
                            onClick={() => {
                                modal.close();
                                exportEmailLog(emailLog);
                            }}>
                            Download as PDF
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
