// ModalPrecheckRestart.tsx
import React from 'react';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import type { SlotSummaryItem } from '../../props/types/PrecheckChatbotTypes';
import UIControlCheckbox from '../../../dashboard/components/elements/forms/ui-controls/UIControlCheckbox';

interface ModalPrecheckAnswerCheckProps {
    show: boolean;
    loading?: boolean;
    slots: SlotSummaryItem[];
    selectedSlots: SlotSummaryItem[];
    onToggleSlot: (slot: SlotSummaryItem, checked: boolean) => void;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ModalPrecheckAnswerCheck({
    show,
    loading = false,
    slots,
    selectedSlots,
    onToggleSlot,
    onClose,
    onConfirm,
}: ModalPrecheckAnswerCheckProps) {
    const translate = useTranslate();

    if (!show) return null;

    return (
        <div className={`modal modal-precheck-answer-check modal-animated ${loading ? '' : 'modal-loaded'}`}>
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
                <div className="modal-header modal-answer-check-header">
                    <h2 className="modal-header-title ">
                        {translate('modal_precheck_answer_check.title', {}, 'Check je gegevens')}
                    </h2>
                </div>

                {/* Body */}
                <div className="modal-body">
                    <div className="modal-section modal-precheck-answer-check-section">
                        <p className="modal-section-description modal-answer-check-description">
                            {translate(
                                'modal_precheck_answer_check.description',
                                {},
                                'Klik alle gegevens aan die je wil wijzigen.',
                            )}
                        </p>
                        {/* Checkboxes */}
                        <div className="modal-answer-check-list">
                            {slots.map((item) => (
                                <UIControlCheckbox
                                    key={item.slot}
                                    name={`slot_${item.slot}`}
                                    value={item.slot}
                                    label={item.message_slot}
                                    checked={selectedSlots.some((s) => s.slot === item.slot)}
                                    onChangeValue={(checked) => onToggleSlot(item, checked)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button className="button button-sm button-light" onClick={onClose}>
                        {translate('modal_precheck.cancel', {}, 'Annuleren')}
                    </button>
                    <button
                        className="button button-sm button-primary"
                        onClick={onConfirm}
                        disabled={selectedSlots.length === 0}>
                        {translate('modal_precheck_answer_check.alter', {}, 'Wijzigen')}
                    </button>
                </div>
            </div>
        </div>
    );
}
