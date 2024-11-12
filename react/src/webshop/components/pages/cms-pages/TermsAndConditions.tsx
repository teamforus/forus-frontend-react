import React from 'react';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import useCmsPage from './hooks/useCmsPage';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';

export default function TermsAndConditions() {
    const page = useCmsPage('terms_and_conditions');

    return (
        <BlockShowcase
            wrapper={true}
            breadcrumbItems={[{ name: 'Home', state: 'home' }, { name: 'Algemene voorwaarden' }]}>
            {page && <CmsBlocks page={page} wrapper={false} />}
        </BlockShowcase>
    );
}
