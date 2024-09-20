import React, { Fragment, ReactNode, useMemo } from 'react';
import { NavLink } from 'react-router-dom';

interface EmptyButtonType {
    to?: string;
    type?: string;
    icon?: string;
    text?: string;
    dusk?: string;
    iconPosition?: 'start' | 'end';
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export default function EmptyCard({
    title,
    description,
    imageIcon,
    imageIconImg,
    textAlign,
    button = null,
    buttons = [],
    type = 'card',
}: {
    title?: string;
    description?: string;
    imageIcon?: string;
    imageIconImg?: string;
    textAlign?: 'left' | 'center' | 'right';
    button?: EmptyButtonType;
    buttons?: Array<EmptyButtonType>;
    type?: 'card' | 'card-section';
}) {
    const descriptionLines = useMemo(() => {
        return description?.split('\n') || [];
    }, [description]);

    const Wrapper = ({ children }: { children: ReactNode }) => {
        return type == 'card' ? <div className={'card'}>{children}</div> : <Fragment>{children}</Fragment>;
    };

    return (
        <Wrapper>
            <div className="card-section">
                <div className={`block block-empty text-${textAlign || 'center'}`}>
                    {imageIconImg && (
                        <div className="empty-icon">
                            <img className="empty-icon-img empty-icon-img-border" src={imageIconImg} alt={''} />
                        </div>
                    )}

                    {imageIcon && (
                        <div className="empty-image">
                            <img src={imageIcon} alt="" />
                        </div>
                    )}

                    {title && <div className="empty-title">{title}</div>}

                    {descriptionLines.length > 0 && (
                        <div className="empty-details">
                            {descriptionLines.map((value, index) => (
                                <Fragment key={index}>
                                    {value}
                                    {index < descriptionLines.length - 1 && <br />}
                                </Fragment>
                            ))}
                        </div>
                    )}

                    {button && (
                        <div className={'empty-actions'}>
                            <div className="button-group">
                                {[button, ...buttons].map((button, index) => (
                                    <NavLink
                                        key={index}
                                        to={button.to}
                                        onClick={button.onClick}
                                        className={`button button-${button.type || 'default'}`}
                                        data-dusk={button.dusk || 'btnEmptyBlock'}>
                                        {button.icon && (!button.iconPosition || button.iconPosition == 'start') && (
                                            <em className={`mdi mdi-${button.icon} icon-start`} />
                                        )}
                                        {button.text}
                                        {button.icon && button.iconPosition == 'end' && (
                                            <em className={`mdi mdi-${button.icon} icon-end`} />
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Wrapper>
    );
}
