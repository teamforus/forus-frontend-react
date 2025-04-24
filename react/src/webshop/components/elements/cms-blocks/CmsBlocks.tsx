import React from 'react';
import ImplementationPage from '../../../props/models/ImplementationPage';
import Markdown from '../markdown/Markdown';
import useAssetUrl from '../../../hooks/useAssetUrl';
import classNames from 'classnames';
import Section from '../sections/Section';

export default function CmsBlocks({ page }: { page: ImplementationPage }) {
    const assetUrl = useAssetUrl();

    if (!page.description_html && page.blocks.length === 0) {
        return null;
    }

    return (
        <Section type={'cms'}>
            <div className="block block-cms">
                {page.description_html && (
                    <Markdown content={page.description_html} align={page.description_alignment} />
                )}

                {page.blocks.length > 0 && (
                    <div
                        className={classNames(
                            `block block-cms-funds`,
                            page.blocks_per_row > 1 && 'block-cms-funds-compact',
                            page.blocks_per_row === 2 && 'block-cms-funds-2-in-row',
                        )}>
                        {page.blocks?.map((block) => (
                            <div key={block.id} className="fund-item">
                                <div className="fund-media">
                                    <img
                                        src={
                                            block.media?.sizes?.public ||
                                            assetUrl('/assets/img/placeholders/product-small.png')
                                        }
                                        alt=""
                                    />
                                </div>
                                <div className="fund-information">
                                    {block.title && <h2 className="fund-title">{block.title}</h2>}
                                    {block.label && <div className="fund-label label label-primary">{block.label}</div>}

                                    <div className="fund-description">
                                        <Markdown content={block.description_html} />
                                    </div>

                                    {block.button_enabled && (
                                        <div className="fund-button">
                                            <a
                                                className="button button-primary fund-button-button"
                                                target={block.button_target_blank ? '_blank' : '_self'}
                                                rel={block.button_target_blank ? 'noreferrer' : ''}
                                                href={block.button_link}>
                                                {block.button_text}
                                                <div className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                            </a>
                                            {page.blocks_per_row > 1 && (
                                                <a
                                                    className="button button-text button-text-primary fund-button-link"
                                                    target={block.button_target_blank ? '_blank' : '_self'}
                                                    rel={block.button_target_blank ? 'noreferrer' : ''}
                                                    href={block.button_link}
                                                    aria-label={block.button_link_label}>
                                                    {block.button_text}
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Section>
    );
}
