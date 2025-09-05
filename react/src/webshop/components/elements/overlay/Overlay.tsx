// Overlay.tsx
// Generic overlay (modal) component.
// Closes on Escape key press or when clicking outside the modal content.
// Useful for dialogs, help screens, or blocking prompts.

import React from 'react';
import type { OverlayProps } from '../../../props/types/PrecheckChatbotTypes';
import { useEffect } from 'react';

export default function Overlay({ show, onClose, children }: OverlayProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    });
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-500/50 z-50 flex items-center justify-center" onClick={onClose}>
            <div
                className="bg-white rounded-lg w-[90%] max-w-md sm:max-w-lg p-4 shadow-lg"
                onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}
