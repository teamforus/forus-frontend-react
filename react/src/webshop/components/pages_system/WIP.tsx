import React from 'react';
import BlockShowcase from '../elements/block-showcase/BlockShowcase';
import useTranslate from '../../../dashboard/hooks/useTranslate';

export default function WIP() {
    const translate = useTranslate();

    return (
        <BlockShowcase
            breadcrumbItems={[
                { name: translate('wip.breadcrumbs.home'), state: 'home' },
                { name: translate('wip.breadcrumbs.wip') },
            ]}>
            <div className="card">
                <div className="card-header">
                    <div className="card-title">{translate('wip.breadcrumbs.title')}</div>
                </div>
                <div className="card-body">
                    <div className="card-section">
                        <div className="card-heading">{translate('wip.breadcrumbs.description')}</div>
                    </div>
                </div>
            </div>
        </BlockShowcase>
    );
}
