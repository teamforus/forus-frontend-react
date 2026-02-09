import React, { Fragment, ReactNode, useMemo } from 'react';
import classNames from 'classnames';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import StateNavLink from '../../../modules/state_router/StateNavLink';

export interface EmptyButtonType {
    type?: 'default' | 'primary' | 'danger';
    state?: DashboardRoutes;
    stateParams?: object;
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
    imageIconSvg,
    textAlign = 'center',
    button = null,
    type = 'card',
    actions,
}: {
    title?: string;
    description?: string;
    imageIcon?: string;
    imageIconImg?: string;
    imageIconSvg?: ReactNode;
    textAlign?: 'left' | 'center' | 'right';
    button?: EmptyButtonType;
    type?: 'card' | 'card-section' | 'card-section-content';
    actions?: ReactNode;
}) {
    const descriptionLines = useMemo(() => {
        return description?.split('\n') || [];
    }, [description]);

    const Wrapper = ({ children }: { children: ReactNode }) => {
        if (type == 'card') {
            return (
                <div className={'card'}>
                    <div className="card-section">{children}</div>
                </div>
            );
        }

        if (type == 'card-section') {
            return <div className="card-section">{children}</div>;
        }

        return children;
    };

    return (
        <Wrapper>
            <div
                className={classNames(
                    'block',
                    'block-empty',
                    textAlign === 'left' && 'text-left',
                    textAlign === 'right' && 'text-right',
                    textAlign === 'center' && 'text-center',
                )}
                data-dusk="emptyCard">
                {imageIconImg && (
                    <div className="empty-icon">
                        <img className="empty-icon-img empty-icon-img-border" src={imageIconImg} alt={''} />
                    </div>
                )}

                {imageIconSvg && (
                    <div className="empty-icon">
                        <div className="empty-icon-img empty-icon-img-border">{imageIconSvg}</div>
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

                {(button || actions) && (
                    <div className="empty-actions">
                        {button && (
                            <StateNavLink
                                name={button.state}
                                params={button.stateParams}
                                onClick={button.onClick}
                                className={classNames(
                                    'button',
                                    (!button.type || button.type === 'default') && 'button-default',
                                    button.type === 'primary' && 'button-primary',
                                    button.type === 'danger' && 'button-danger',
                                )}
                                dataDusk={button.dusk || 'btnEmptyBlock'}>
                                {button.icon && (!button.iconPosition || button.iconPosition == 'start') && (
                                    <em className={`mdi mdi-${button.icon} icon-start`} />
                                )}
                                {button.text}
                                {button.icon && button.iconPosition == 'end' && (
                                    <em className={`mdi mdi-${button.icon} icon-end`} />
                                )}
                            </StateNavLink>
                        )}

                        {actions}
                    </div>
                )}
            </div>
        </Wrapper>
    );
}
