import React, { ReactNode, useCallback } from 'react';
import { ModalState } from '../../../modules/modals/context/ModalContext';
import classNames from 'classnames';

export default function Modal({
    modal,
    size = 'md',
    title,
    body,
    bodyOverflowVisible = false,
    head,
    children,
    className,
    footer,
    onSubmit,
    dusk = null,
}: {
    modal: ModalState;
    title?: string | ReactNode;
    size?: 'sm' | 'md' | 'lg';
    children?: ReactNode | ReactNode[];
    head?: ReactNode | ReactNode[];
    body?: ReactNode | ReactNode[];
    bodyOverflowVisible?: boolean;
    footer?: ReactNode | ReactNode[];
    onSubmit?: () => void;
    className?: string;
    dusk?: string;
}) {
    const ModalWindow = useCallback(
        ({ children, onSubmit }: { children: ReactNode | ReactNode[]; onSubmit?: () => void }) => {
            if (onSubmit) {
                return (
                    <form className={'modal-window form'} onSubmit={onSubmit}>
                        {children}
                    </form>
                );
            }
            return <div className={'modal-window'}>{children}</div>;
        },
        [],
    );

    return (
        <div
            className={classNames(
                'modal',
                'modal-animated',
                size === 'sm' && 'modal-sm',
                size === 'md' && 'modal-md',
                size === 'lg' && 'modal-lg',
                modal.loading && 'modal-loading',
                className,
            )}
            data-dusk={dusk}>
            <div className="modal-backdrop" onClick={modal.close} />

            <ModalWindow onSubmit={onSubmit}>
                {head
                    ? head
                    : title && (
                          <div className="modal-header">
                              <div className={'modal-header-title'}>{title}</div>
                          </div>
                      )}

                {body ? (
                    body
                ) : (
                    <div className={classNames('modal-body', bodyOverflowVisible && 'modal-body-visible')}>
                        <div className={classNames('modal-section', onSubmit && 'modal-section-pad')}>{children}</div>
                    </div>
                )}

                {footer && <div className="modal-footer">{footer}</div>}
            </ModalWindow>
        </div>
    );
}
