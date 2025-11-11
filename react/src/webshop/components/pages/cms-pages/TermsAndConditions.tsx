import React from 'react';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import useCmsPage from './hooks/useCmsPage';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function TermsAndConditions() {
    const page = useCmsPage('terms_and_conditions');
    const translate = useTranslate();

    return (
        <BlockShowcase
            breadcrumbItems={[
                { name: translate('terms_and_conditions.breadcrumbs.home'), state: WebshopRoutes.HOME },
                { name: translate('terms_and_conditions.breadcrumbs.terms_and_conditions') },
            ]}>
            {page && <CmsBlocks page={page} largeMarkdown={true} />}
        </BlockShowcase>
    );
}
