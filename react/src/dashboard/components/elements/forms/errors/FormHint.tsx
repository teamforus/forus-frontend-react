import React from 'react';

export default function FormHint({ text }: { text?: string }) {
    return text ? <div className="form-hint">{text}</div> : null;
}
