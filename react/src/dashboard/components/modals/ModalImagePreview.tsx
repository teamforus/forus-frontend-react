import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import { useTranslation } from 'react-i18next';

export default function ModalImagePreview({
    modal,
    className,
    imageSrc,
}: {
    modal: ModalState;
    className?: string;
    imageSrc?: string;
}) {
    const { t } = useTranslation();

    return (
        <div
            className={classList([
                'modal',
                'modal-animated',
                'modal-image-preview',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />

            <div className="modal-window">
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">{t('modal_image_preview.header.title')}</div>
                <div className="modal-body">
                    <div className="modal-section">
                        <div className="img-block">
                            <img src={imageSrc} alt={''} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
