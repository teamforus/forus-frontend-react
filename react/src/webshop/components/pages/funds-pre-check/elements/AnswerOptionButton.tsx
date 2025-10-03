// AnswerOptionButton.tsx
// Renders a selectable answer button used by the chatbot.
// Sends the option text to the backend and triggers a visual selection state.
// Handles styling based on whether it's selected or disabled.

import { useChatbotProvider } from '../../../../contexts/ChatbotContext';
import type { AnswerOptionButtonProps } from '../../../../props/types/PrecheckChatbotTypes';
import { useState } from 'react';
import type { SlotSummaryItem } from '../../../../props/types/PrecheckChatbotTypes';
import React from 'react';
import ModalPrecheckAnswerCheck from '../../../modals/ModalPrecheckAnswerCheck';

/**
 * Props:
 * - option: The label shown on the button
 * - disabled: Whether the button is inactive (e.g. already answered)
 * - isSelected: If this option was selected by the user
 * - onSelect: Callback to mark this option as selected
 */
export default function AnswerOptionButton({
    option,
    disabled,
    isSelected,
    onSelect,
    step,
    slots,
}: AnswerOptionButtonProps) {
    const { sendMessage } = useChatbotProvider();
    const [showOverlay, setShowOverlay] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState<SlotSummaryItem[]>([]);

    const handleSend = async () => {
        onSelect();
        await sendMessage(option);
    };

    const handleConfirm = async () => {
        setShowOverlay(false);
        if (selectedSlots.length > 0) {
            onSelect();
            const label_slots = selectedSlots.map((item) => item.label_slot);
            const value_slots = selectedSlots.map((item) => ({ value: item.slot, label: item.label_slot }));
            await sendMessage({
                label: 'Wijzigen: ' + label_slots.join(', '),
                value: value_slots,
            });
        }
    };

    // Base styles + conditional styling based on state
    let className = `button button-sm answer-button `;
    className += disabled && !isSelected ? 'button-disabled' : '';
    className += disabled && isSelected ? 'answer-button--is-selected' : '';

    if (step === 'confirm_data' && option.label === 'Wijzigen') {
        return (
            <div>
                <button type={'button'} className={className} onClick={() => setShowOverlay(true)} disabled={disabled}>
                    {option.label}
                </button>
                <ModalPrecheckAnswerCheck
                    show={showOverlay}
                    slots={slots}
                    selectedSlots={selectedSlots}
                    onToggleSlot={(slot, checked) => {
                        const updated = checked
                            ? [...selectedSlots, slot]
                            : selectedSlots.filter((s) => s.slot !== slot.slot);
                        setSelectedSlots(updated);
                    }}
                    onClose={() => setShowOverlay(false)}
                    onConfirm={handleConfirm}
                />
            </div>
        );
    }

    return (
        <button type={'button'} className={className} onClick={handleSend} disabled={disabled}>
            {option.label}
        </button>
    );
}
