import React from 'react';
import Markdown from '../markdown/Markdown';
import ImplementationPageBlock from '../../../props/models/ImplementationPageBlock';
import useAssetUrl from '../../../hooks/useAssetUrl';
import Label from '../label/Label';

export default function CmsBlocksItemLink({ block }: { block: ImplementationPageBlock }) {
    const assetUrl = useAssetUrl();

    return (
        <a
            target={block.button_target_blank ? '_blank' : '_self'}
            rel={block.button_target_blank ? 'noreferrer' : ''}
            href={block.button_link}
            className="fund-item">
            <div className="fund-media">
                <img
                    src={block.media?.sizes?.public || assetUrl('/assets/img/placeholders/product-small.png')}
                    alt=""
                />
            </div>
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

                <div className="fund-button">
                    <span className="button button-primary fund-button-button">
                        {block.button_text}
                        <div className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                    </span>
                    <span className="button button-text button-text-primary fund-button-link">{block.button_text}</span>
                </div>
            </div>
        </a>
    );
}
