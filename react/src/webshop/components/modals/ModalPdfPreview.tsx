import React from 'react';
import classNames from 'classnames';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import PdfPreview from '../../../dashboard/components/elements/pdf-preview/PdfPreview';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';
import useTranslate from '../../../dashboard/hooks/useTranslate';

export default function ModalPdfPreview({
    modal,
    className = '',
    rawPdfFile,
}: {
    modal: ModalState;
    className?: string;
    rawPdfFile?: Blob;
}) {
    const translate = useTranslate();

    return (
        <div
            className={classNames(
                'modal',
                'modal-animated',
                'modal-file-preview',
                className,
                !modal.loading && 'modal-loaded',
            )}>
            <div className="modal-backdrop" onClick={modal.close} aria-label={translate('pdf_preview.buttons.close')} />

            <div className="modal-window">
                <a
                    className="mdi mdi-close modal-close"
                    tabIndex={0}
                    onClick={modal.close}
                    onKeyDown={clickOnKeyEnter}
                    aria-label={translate('pdf_preview.buttons.close')}
                    role="button"
                />
                <div className="modal-header">
                    <h2 className="modal-header-title">{translate('pdf_preview.header.title')}</h2>
                </div>
                <div className="modal-body">
                    <PdfPreview className={'file-pdf'} rawPdfFile={rawPdfFile} />
                </div>
            </div>
        </div>
    );
}
