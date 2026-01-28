import React from 'react';
import classNames from 'classnames';
import { ModalState } from '../../modules/modals/context/ModalContext';

export default function ModalMailPreview({
    modal,
    title,
    content_html,
}: {
    modal: ModalState;
    title?: string;
    content_html?: string;
}) {
    return (
        <div className={classNames('modal', 'modal-animated', modal.loading && 'modal-loading')}>
            <div className="modal-backdrop" onClick={modal.close} />

            <div className="modal-window">
                <div className="modal-header">
                    Titel: <span>{title}</span>
                    <div className="modal-close mdi mdi-close" onClick={modal.close} role="button" />
                </div>
                <div className="modal-body">
                    <div className="block block-mail_preview">
                        <div className="mail_preview-wrapper">
                            <div className="mail_preview-inner">
                                <div className="mail_preview-body">
                                    <div
                                        className="block block-markdown block-markdown-center"
                                        dangerouslySetInnerHTML={{ __html: content_html }}
                                    />
                                    <div className="mail_preview-footer" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
