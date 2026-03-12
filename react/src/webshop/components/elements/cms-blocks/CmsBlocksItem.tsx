import React from 'react';
import Markdown from '../markdown/Markdown';
import ImplementationPageBlock from '../../../props/models/ImplementationPageBlock';
import Label from '../label/Label';

export default function CmsBlocksItem({
    block,
    blocksPerRow,
}: {
    block: ImplementationPageBlock;
    blocksPerRow: number;
}) {
    return (
        <div className="fund-item">
            {block.media?.sizes?.public && (
                <div className="fund-media">
                    <img src={block.media.sizes.public} alt="" />
                </div>
            )}
            <div className="fund-information">
                {block.title && <h2 className="fund-title">{block.title}</h2>}
                {block.label && (
                    <Label type="primary" className="fund-label">
                        {block.label}
                    </Label>
                )}

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
                        {blocksPerRow > 1 && (
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
    );
}
