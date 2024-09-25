import React, { useRef, useState } from 'react';
import useAssetUrl from '../../hooks/useAssetUrl';
import StateNavLink from '../../modules/state_router/StateNavLink';

export default function SliderCompact({
    description,
    elements,
}: {
    description?: string;
    elements: {
        label: string;
        title: string;
        description?: string;
        imgSrc?: string;
        imgAlt?: string;
        background: string;
    }[];
}) {
    const assetUrl = useAssetUrl();

    const $element = useRef<HTMLDivElement>(null);
    const [activeItem, setActiveItem] = useState(0);

    return (
        <div className="block block-slider-compact" ref={$element}>
            {elements.map(
                (element, index) =>
                    index === activeItem && (
                        <div className={`block-slider-list-item ${index == activeItem ? 'active' : ''}`} key={index}>
                            <div className="block-slider-list-item-main" style={{ background: element.background }}>
                                <div className="block-slider-list-item-header">
                                    <div className="block-slider-list-item-label">{element.label}</div>
                                    <div className="block-slider-arrows">
                                        <div
                                            className={`block-slider-arrow`}
                                            onClick={() => {
                                                if (activeItem === 0) {
                                                    setActiveItem(elements.length - 1);
                                                } else {
                                                    setActiveItem(activeItem - 1);
                                                }
                                            }}>
                                            <em className="mdi mdi-arrow-left" />
                                        </div>
                                        <div className="separator">
                                            <img
                                                src={assetUrl(
                                                    `/assets/img/slider-compact-separator${index > 0 ? '-sm' : ''}.svg`,
                                                )}
                                                alt={``}
                                            />
                                        </div>
                                        <div
                                            className={`block-slider-arrow`}
                                            onClick={() => {
                                                if (activeItem === elements.length - 1) {
                                                    setActiveItem(0);
                                                } else {
                                                    setActiveItem(activeItem + 1);
                                                }
                                            }}>
                                            <em className="mdi mdi-arrow-right" />
                                        </div>
                                    </div>
                                </div>
                                <div className="block-slider-list-item-title">{element.title}</div>
                                <div className="block-slider-list-item-description">{element.description}</div>
                                <div className="block-slider-list-item-actions">
                                    <StateNavLink name="website" className="button button-light">
                                        Lees meer
                                    </StateNavLink>
                                </div>
                            </div>
                            {element.imgSrc && (
                                <div className="block-slider-list-item-image">
                                    <img src={element.imgSrc} alt={element.imgAlt} />
                                </div>
                            )}
                        </div>
                    ),
            )}

            {description && <div className="block-slider-compact-description">{description}</div>}
        </div>
    );
}
