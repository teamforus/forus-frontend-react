// ModalPrecheckRestart.tsx
import React from 'react';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';
import useTranslate from '../../../dashboard/hooks/useTranslate';

interface ModalPrecheckRestartProps {
    show: boolean;
    loading?: boolean;
    onClose: () => void;
    onRestart: () => void;
}

export default function ModalPrecheckRestart({ show, loading = false, onClose, onRestart }: ModalPrecheckRestartProps) {
    const translate = useTranslate();

    if (!show) return null;

    return (
        <div className={`modal modal-precheck-restart modal-animated ${loading ? '' : 'modal-loaded'}`}>
            {/* Backdrop */}
            <div
                className="modal-backdrop"
                onClick={onClose}
                aria-label={translate('modal_precheck_restart.close', {}, 'Sluiten')}
            />

            {/* Modal window */}
            <div className="modal-window">
                {/* Close button */}
                <div
                    className="modal-close mdi mdi-close"
                    onClick={onClose}
                    tabIndex={0}
                    onKeyDown={clickOnKeyEnter}
                    aria-label={translate('modal_precheck_restart.close', {}, 'Sluiten')}
                    role="button"
                />

                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-header-title">
                        {translate('modal_precheck_restart.title', {}, 'Herstarten regelingencheck')}
                    </h2>
                </div>

                {/* Body */}
                <div className="modal-body">
                    <div className="modal-section">
                        <p className="modal-section-description">
                            {translate(
                                'modal_precheck_restart.description',
                                {},
                                'Weet je zeker dat je wil herstarten? Alle berichten en advies worden dan verwijderd.',
                            )}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button className="button button-sm button-light" onClick={onClose}>
                        {translate('modal_precheck_restart.cancel', {}, 'Annuleren')}
                    </button>
                    <button className="button button-sm button-primary" onClick={onRestart}>
                        {translate('modal_precheck_restart.confirm', {}, 'Ja, herstarten')}
                    </button>
                </div>
            </div>
        </div>
    );
}
