// AnswerOptionButton.tsx
// Renders a selectable answer button used by the chatbot.
// Sends the option text to the backend and triggers a visual selection state.
// Handles styling based on whether it's selected or disabled.

import { useChatbotProvider } from '../../../../contexts/ChatbotContext';
import type { AnswerOptionButtonProps } from '../../../../props/types/PrecheckChatbotTypes';
import Overlay from '../../../elements/overlay/Overlay';
import { useState } from 'react';
import type { SlotSummaryItem } from '../../../../props/types/PrecheckChatbotTypes';
import React from 'react';

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
    let className = `button text-sm sm:text-base w-fit rounded-full font-semibold `;
    className += disabled && !isSelected ? 'bg-gray-200' : 'bg-blue-200';
    className += disabled && isSelected ? ' bg-gray-500 text-white' : '';
    className += disabled ? ' cursor-not-allowed ' : ' cursor-pointer hover:bg-blue-300';

    if (step === 'confirm_data' && option.label === 'Wijzigen') {
        return (
            <div>
                <button type={'button'} className={className} onClick={() => setShowOverlay(true)} disabled={disabled}>
                    {option.label}
                </button>
                {/* Confirmation overlay content: title, message, and two buttons */}
                <Overlay show={showOverlay} onClose={() => setShowOverlay(false)}>
                    <h2 className="text-xl font-bold mb-2">Check je gegevens</h2>
                    <p className="font-semibold">Klik alle gegevens aan die je wil wijzigen.</p>
                    <div className="mt-4">
                        {slots &&
                            slots.map((item) => (
                                <label key={item.slot} className="block mb-2">
                                    <input
                                        type="checkbox"
                                        value={item.slot}
                                        checked={selectedSlots.includes(item)}
                                        onChange={(e) => {
                                            const updated = e.target.checked
                                                ? [...selectedSlots, item]
                                                : selectedSlots.filter((k) => k.slot !== item.slot);
                                            setSelectedSlots(updated);
                                        }}
                                        className="mr-2"
                                    />
                                    {item.message_slot}
                                </label>
                            ))}
                    </div>
                    <button
                        className="mt-4 bg-lime-700 text-white px-3 p-1 m-2 rounded hover:bg-lime-900"
                        onClick={handleConfirm}>
                        Wijzigen
                    </button>
                    <button
                        className="mt-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-800"
                        onClick={() => setShowOverlay(false)}>
                        Sluiten
                    </button>
                </Overlay>
            </div>
        );
    }

    return (
        <button type={'button'} className={className} onClick={handleSend} disabled={disabled}>
            {option.label}
        </button>
    );
}
