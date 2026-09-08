import React, { ReactNode } from 'react';

export default function BlockDangerZone({
    title,
    description,
    overview,
    children,
    footer,
}: {
    title?: string;
    description?: string | Array<string>;
    overview?: Array<{ title: string; description: string }>;
    children?: ReactNode;
    footer?: ReactNode;
}) {
    return (
        <div className="block block-danger-zone">
            {(title || description) && (
                <div className="danger-zone-header">
                    <div className="danger-zone-title">
                        <em className="mdi mdi-alert danger-zone-icon" />
                        {title}
                    </div>

                    {description && (
                        <div className="danger-zone-description">
                            {Array.isArray(description)
                                ? description
                                : [description].map((value, index) => <div key={index}>{value}</div>)}
                        </div>
                    )}
                </div>
            )}

            {children}

            {overview && (
                <div className="danger-zone-overview">
                    {overview.map((value: { title: string; description: string }, index: number) => (
                        <div key={index} className="danger-zone-overview-item">
                            <div className="danger-zone-overview-title">{value.title}</div>
                            <div>{value.description}</div>
                        </div>
                    ))}
                </div>
            )}

            {footer}
        </div>
    );
}
