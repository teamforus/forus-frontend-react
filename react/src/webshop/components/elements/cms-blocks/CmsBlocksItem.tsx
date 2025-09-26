import React from 'react';
import Markdown from '../markdown/Markdown';
import ImplementationPageBlock from '../../../props/models/ImplementationPageBlock';
import useAssetUrl from '../../../hooks/useAssetUrl';

export default function CmsBlocksItem({
    block,
    blocksPerRow,
}: {
    block: ImplementationPageBlock;
    blocksPerRow: number;
}) {
    const assetUrl = useAssetUrl();

    return (
        <div className="fund-item">
            <div className="fund-media">
                <img
                    src={block.media?.sizes?.public || assetUrl('/assets/img/placeholders/product-small.png')}
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
