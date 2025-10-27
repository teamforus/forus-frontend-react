import React from 'react';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import StateNavLink from '../../modules/state_router/StateNavLink';
import BlockShowcase from '../elements/block-showcase/BlockShowcase';
import { WebshopRoutes } from '../../modules/state_router/RouterBuilder';

export default function NotFound({ error = '404' }: { error?: string }) {
    const translate = useTranslate();

    return (
        <BlockShowcase
            breadcrumbItems={[
                { name: translate('not_found.breadcrumbs.home'), state: WebshopRoutes.HOME },
                { name: translate('not_found.breadcrumbs.not_found') },
            ]}>
            <div className="block block-error-page">
                <div className="wrapper">
                    <div className="page-not-found-title">{error}</div>
                    <div className="page-not-found-subtitle">
                        {error === '404' ? translate(`error_page.${error}.title`) : error}
                    </div>
                    <div>
                        <StateNavLink name={WebshopRoutes.HOME} className="button button-primary">
                            <span>{translate(`error_page.${error}.button`)}</span>
                            <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                        </StateNavLink>
                    </div>
                </div>
            </div>
        </BlockShowcase>
    );
}
