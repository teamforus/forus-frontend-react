import React, { Fragment, useRef, useState } from 'react';

export default function SliderDetailed({
    description,
    elements,
}: {
    description?: string;
    elements: {
        title: string;
        imgSrc?: string;
        imgAlt?: string;
        background: string;
        description?: string;
        imgMobileSrc?: string;
    }[];
}) {
    const $element = useRef<HTMLDivElement>(null);
    const [activeItem, setActiveItem] = useState(0);

    return (
        <div className="block block-slider-detailed" ref={$element}>
            {description && (
                <div className="wrapper">
                    <div className="block-slider-description">{description}</div>
                </div>
            )}

            {elements.map((element, index) => (
                <Fragment key={index}>
                    {index == activeItem && (
                        <div
                            className={`block-slider-image-wrapper ${index == activeItem ? 'active' : ''}`}
                            key={index}>
                            {element.imgSrc && (
                                <Fragment>
                                    <div
                                        className={`block-slider-arrow`}
                                        onClick={() => {
                                            if (activeItem === 0) {
                                                setActiveItem(elements.length - 1);
                                            } else {
                                                setActiveItem(activeItem - 1);
                                            }
                                        }}>
                                        <em className="mdi mdi-chevron-left" />
                                    </div>
                                    <div className="block-slider-image">
                                        <img className="hide-sm" src={element.imgSrc} alt={element.imgAlt} />
                                        <img className="show-sm" src={element.imgMobileSrc} alt={element.imgAlt} />
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
                                        <em className="mdi mdi-chevron-right" />
                                    </div>
                                </Fragment>
                            )}
                        </div>
                    )}
                </Fragment>
            ))}

            <div className="wrapper">
                <div className="block-slider-list">
                    {elements.map((element, index) => (
                        <div className={`block-slider-list-item ${index == activeItem ? 'active' : ''}`} key={index}>
                            <div className="block-slider-list-item-image show-sm">
                                <img className="hide-sm" src={element.imgSrc} alt={element.imgAlt} />
                                <img className="show-sm" src={element.imgMobileSrc} alt={element.imgAlt} />
                            </div>

                            <div
                                className="block-slider-list-item-info hide-sm"
                                style={{
                                    background: index == activeItem ? element.background : 'none',
                                }}>
                                <div className="block-slider-list-item-title">{element.title}</div>
                                <div className="block-slider-list-item-description">{element.description}</div>
                            </div>

                            <div
                                className="block-slider-list-item-info show-sm"
                                style={{
                                    background: element.background,
                                }}>
                                <div
                                    className="block-slider-list-item-info-arrow"
                                    style={{ background: element.background }}
                                />
                                <div className="block-slider-list-item-title">{element.title}</div>
                                <div className="block-slider-list-item-description">{element.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
