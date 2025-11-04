import React, { useCallback, useEffect, useRef, useState, ReactElement } from 'react';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';

export default function ModalNotification({
    modal,
    type,
    onClose,
    onCancel,
    onConfirm,
    cancelBtnText,
    confirmBtnText,
    closeBtnText,
    className,
    title,
    header,
    email,
    description,
    mdiIconClass,
    mdiIconType = 'primary',
    appendElement,
}: {
    modal: ModalState;
    type: 'info' | 'confirm' | 'action-result';
    onClose?: () => void;
    onCancel?: () => void;
    onConfirm?: () => void;
    cancelBtnText?: string;
    confirmBtnText?: string;
    closeBtnText?: string;
    className?: string;
    title?: string;
    header?: string;
    email?: string;
    description?: string;
    mdiIconClass?: string;
    mdiIconType?: 'primary' | 'warning' | 'success' | 'default';
    appendElement?: ReactElement | ReactElement[];
}) {
    const translate = useTranslate();

    const [showCloseBtn] = useState(type == 'info');
    const [showCancelBtn] = useState(['danger', 'confirm'].includes(type));
    const [showConfirmBtn] = useState(['confirm', 'action-result'].includes(type));

    const refCloseBtn = useRef<HTMLButtonElement>(null);
    const refConfirmBtn = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        window.setTimeout(() => {
            switch (type) {
                case 'info':
                    refCloseBtn.current?.focus();
                    break;
                case 'confirm':
                case 'action-result':
                    refConfirmBtn.current?.focus();
                    break;
            }
        }, 1000);
    }, [type]);

    const close = useCallback(() => {
        onClose?.();
        modal?.close();
    }, [onClose, modal]);

    const cancel = useCallback(() => {
        onCancel?.();
        close?.();
    }, [onCancel, close]);

    const confirm = useCallback(() => {
        onConfirm?.();
        close?.();
    }, [onConfirm, close]);

    return (
        <div
            className={`modal modal-notification modal-animated ${className} ${modal.loading ? '' : 'modal-loaded'}`}
            role="dialog">
            <div
                className="modal-backdrop"
                onClick={close}
                aria-label={closeBtnText || translate('modal.buttons.close')}
                role="button"
            />
            <div className="modal-window">
                <div
                    className="modal-close mdi mdi-close"
                    onClick={cancel}
                    tabIndex={0}
                    onKeyDown={clickOnKeyEnter}
                    aria-label={closeBtnText || translate('modal.buttons.close')}
                    role="button"
                />
                <div className="modal-header">
                    <h2 className="modal-header-title" role="heading" id="notificationDialogTitle">
                        {title}
                    </h2>
                </div>

                <div className="modal-body">
                    <div className="modal-section">
                        {mdiIconClass && (
                            <div className={`modal-section-icon modal-section-icon-${mdiIconType}`}>
                                {mdiIconType && mdiIconClass && <div className={`mdi mdi-${mdiIconClass}`} />}
                            </div>
                        )}

                        {header && <div className="modal-section-title">{translate(header)}</div>}

                        {description && !Array.isArray(description) && (
                            <div className="modal-section-description" id="notificationDialogSubtitle">
                                {translate(description, { email: email })}
                            </div>
                        )}

                        {description && Array.isArray(description) && (
                            <div className="modal-section-description" id="notificationDialogSubtitle">
                                {description.map((line, index) => (
                                    <div key={index}>{translate(line)}</div>
                                ))}
                            </div>
                        )}

                        {appendElement}
                    </div>
                </div>

                <div className="modal-footer">
                    {showCloseBtn && (
                        <button className="button button-sm button-light" data-close="data-close" onClick={close}>
                            {closeBtnText || translate('modal.buttons.close')}
                        </button>
                    )}

                    {showCancelBtn && (
                        <button className="button button-sm button-light" data-cancel="data-cancel" onClick={cancel}>
                            {cancelBtnText || translate('modal.buttons.cancel')}
                        </button>
                    )}

                    {showConfirmBtn && (
                        <button
                            className="button button-sm button-primary"
                            data-confirm="data-confirm"
                            onClick={confirm}>
                            {confirmBtnText || translate('modal.buttons.confirm')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
