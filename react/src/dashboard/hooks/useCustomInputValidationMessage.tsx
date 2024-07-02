import React, { useCallback } from 'react';

export type InputValidationTexts = {
    patternMismatch?: string;
    rangeOverflow?: string;
    typeMismatch?: string;
    tooLong?: string;
    tooShort?: string;
    valueMissing?: string;
};

export default function useCustomInputValidationMessage() {
    return useCallback((e: React.ChangeEvent<HTMLInputElement>, messages: InputValidationTexts = null) => {
        e.target.setCustomValidity('');

        if (messages?.valueMissing && e.target.validity.valueMissing) {
            e.target.setCustomValidity(messages.valueMissing);
        }

        if (messages?.typeMismatch && e.target.validity.typeMismatch) {
            e.target.setCustomValidity(messages.typeMismatch);
        }

        if (messages?.tooLong && e.target.validity.tooLong) {
            e.target.setCustomValidity(messages.tooLong);
        }

        if (messages?.tooShort && e.target.validity.tooShort) {
            e.target.setCustomValidity(messages.tooShort);
        }

        if (messages?.patternMismatch && e.target.validity.patternMismatch) {
            e.target.setCustomValidity(messages.patternMismatch);
        }
    }, []);
}
