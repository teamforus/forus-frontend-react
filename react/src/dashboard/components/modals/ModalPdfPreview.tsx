import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import { useTranslation } from 'react-i18next';
import PdfPreview from '../elements/pdf-preview/PdfPreview';

export default function ModalPdfPreview({
    modal,
    className,
    rawPdfFile,
}: {
    modal: ModalState;
    className?: string;
    rawPdfFile?: Blob;
}) {
    const { t } = useTranslation();

    return (
        <div
            className={classList([
                'modal',
                'modal-animated',
                'modal-pdf-preview',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />

            <div className="modal-window">
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">{t('modal_pdf_preview.header.title')}</div>
                <div className="modal-body">
                    <div className="modal-section">
                        <PdfPreview rawPdfFile={rawPdfFile} />
                    </div>
                </div>
            </div>
        </div>
    );
}
