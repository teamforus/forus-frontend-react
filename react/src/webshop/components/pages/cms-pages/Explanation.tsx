import React, { Fragment } from 'react';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useCmsPage from './hooks/useCmsPage';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import ExplanationFaq from './elements/ExplanationFaq';

export default function Explanation() {
    const translate = useTranslate();

    const page = useCmsPage('explanation');

    return (
        <BlockShowcase
            breadcrumbItems={[
                { name: translate('explanation.breadcrumbs.home'), state: 'home' },
                { name: translate('explanation.breadcrumbs.explanation') },
            ]}>
            {page && (
                <Fragment>
                    {page.description_position == 'after' ? (
                        <>
                            <ExplanationFaq page={page} />
                            <CmsBlocks page={page} />
                        </>
                    ) : (
                        <>
                            <CmsBlocks page={page} />
                            <ExplanationFaq page={page} />
                        </>
                    )}
                </Fragment>
            )}
        </BlockShowcase>
    );
}
