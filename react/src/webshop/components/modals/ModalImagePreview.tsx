import React from 'react';
import classNames from 'classnames';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';

export default function ModalImagePreview({ modal, imageSrc }: { modal: ModalState; imageSrc?: string }) {
    const translate = useTranslate();

    return (
        <div className={classNames('modal', 'modal-animated', 'modal-file-preview', !modal.loading && 'modal-loaded')}>
            <div
                className="modal-backdrop"
                onClick={modal.close}
                aria-label={translate('modal_image_preview.buttons.close')}
            />

            <div className="modal-window">
                <a
                    className="mdi mdi-close modal-close"
                    tabIndex={0}
                    onClick={modal.close}
                    onKeyDown={clickOnKeyEnter}
                    aria-label={translate('modal_image_preview.buttons.close')}
                    role="button"
                />
                <div className="modal-header">
                    <h2 className="modal-header-title">{translate('modal_image_preview.title')}</h2>
                </div>
                <div className="modal-body">
                    <div className="modal-file-preview-image">
                        <img src={imageSrc} alt={translate('modal_image_preview.alt_text')} />
                    </div>
                </div>
            </div>
        </div>
    );
}
