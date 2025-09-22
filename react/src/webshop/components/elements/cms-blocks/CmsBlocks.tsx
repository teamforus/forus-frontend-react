import React, { Fragment } from 'react';
import ImplementationPage from '../../../props/models/ImplementationPage';
import Markdown from '../markdown/Markdown';
import classNames from 'classnames';
import Section from '../sections/Section';
import CmsBlocksItem from './CmsBlocksItem';
import CmsBlocksItemLink from './CmsBlocksItemLink';

export default function CmsBlocks({
    page,
    largeMarkdown = false,
}: {
    page: ImplementationPage;
    largeMarkdown?: boolean;
}) {
    if (!page.description_html && page.blocks.length === 0) {
        return null;
    }

    return (
        <Section type={'cms'}>
            <div className="block block-cms">
                {page.description_html && (
                    <Markdown
                        content={page.description_html}
                        align={page.description_alignment}
                        className={classNames(largeMarkdown && 'block-markdown-large')}
                    />
                )}

                {page.blocks.length > 0 && (
                    <div
                        className={classNames(
                            `block block-cms-funds`,
                            page.blocks_per_row > 1 && 'block-cms-funds-compact',
                            page.blocks_per_row === 2 && 'block-cms-funds-2-in-row',
                        )}>
                        {page.blocks?.map((block) => (
                            <Fragment key={block.id}>
                                {block.button_enabled && page.blocks_per_row > 1 ? (
                                    <CmsBlocksItemLink block={block} />
                                ) : (
                                    <CmsBlocksItem block={block} blocksPerRow={page.blocks_per_row} />
                                )}
                            </Fragment>
                        ))}
                    </div>
                )}
            </div>
        </Section>
    );
}
