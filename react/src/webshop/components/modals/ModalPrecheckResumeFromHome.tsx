// ModalPrecheckRestart.tsx
import React from 'react';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';
import useTranslate from '../../../dashboard/hooks/useTranslate';

interface ModalPrecheckResumeFromHome {
    show: boolean;
    loading?: boolean;
    onClose: () => void;
    onRestart: () => void;
    onContinue: () => void;
}

export default function ModalPrecheckResumeFromHome({
    show,
    loading = false,
    onClose,
    onRestart,
    onContinue,
}: ModalPrecheckResumeFromHome) {
    const translate = useTranslate();

    if (!show) return null;

    return (
        <div className={`modal modal-precheck-resume-home modal-animated ${loading ? '' : 'modal-loaded'}`}>
            {/* Backdrop */}
            <div
                className="modal-backdrop"
                onClick={onClose}
                aria-label={translate('modal_precheck.close', {}, 'Sluiten')}
            />

            {/* Modal window */}
            <div className="modal-window">
                {/* Close button */}
                <div
                    className="modal-close mdi mdi-close"
                    onClick={onClose}
                    tabIndex={0}
                    onKeyDown={clickOnKeyEnter}
                    aria-label={translate('modal_precheck.close', {}, 'Sluiten')}
                    role="button"
                />

                {/* Header */}
                <div className="modal-header modal-resume-home-header">
                    <h2 className="modal-header-title">
                        {translate('modal_precheck_resume_home.title', {}, 'De huidige regelcheck is nog bezig')}
                    </h2>
                </div>

                {/* Body */}
                <div className="modal-body">
                    <div className="modal-section modal-precheck-resume-home-section">
                        <p className="modal-section-description modal-resume-home-description">
                            {translate(
                                'modal_precheck_resume_home.description',
                                {},
                                'Wil je verdergaan waar je was gebleven of de check weer opnieuw opstarten?',
                            )}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button className="button button-sm button-light" onClick={onContinue}>
                        {translate('modal_precheck_resume_home.continue', {}, 'Verdergaan')}
                    </button>
                    <button className="button button-sm button-primary" onClick={onRestart}>
                        {translate('modal_precheck_resume_home.resume', {}, 'Opnieuw opstarten')}
                    </button>
                </div>
            </div>
        </div>
    );
}
