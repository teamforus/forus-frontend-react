import React from 'react';
import BlockShowcase from '../elements/block-showcase/BlockShowcase';

export default function WIP({
    title = 'Work in progress',
    description = 'This page is under construction.',
}: {
    title?: string;
    description?: string;
}) {
    return (
        <BlockShowcase wrapper={true} breadcrumbItems={[{ name: 'Home', state: 'home' }, { name: 'WIP' }]}>
            <div className="card">
                <div className="card-header">
                    <div className="card-title">{title}</div>
                </div>
                <div className="card-body">
                    <div className="card-section">
                        <div className="card-heading">{description}</div>
                    </div>
                </div>
            </div>
        </BlockShowcase>
    );
}
