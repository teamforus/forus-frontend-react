import React from 'react';
import classNames from 'classnames';

export default function BlockWarning({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={classNames('block block-warning', className)} role="alert" aria-live="polite">
            <div className="block-warning-icon" aria-hidden="true">
                <div className="icon">
                    <em className="mdi mdi-information-outline" aria-hidden="true" />
                </div>
            </div>
            <div className="block-warning-content">{children}</div>
        </div>
    );
}
