import React from 'react';
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
    textAlign,
    button,
    buttons,
}: {
    title?: string;
    description?: string;
    textAlign?: 'left' | 'center' | 'right';
    button?: EmptyButtonType;
    buttons?: Array<EmptyButtonType>;
}) {
    return (
        <div className="card">
            <div className="card-section">
                <div className={`block block-empty text-${textAlign || 'center'}`}>
                    {title && <div className="empty-title">{title}</div>}
                    {description && <div className="empty-details">{description}</div>}

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
                                        {button.icon && button.iconPosition == 'start' && (
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
        </div>
    );
}

/*
.block.block-empty(ng-class="{center: 'text-center', right: 'text-right'}[$dir.align || 'center']")
    .empty-title(ng-if="$dir.text" ng-bind="$dir.title")
    .empty-details(ng-if="$dir.text" ng-bind="$dir.text")

    .empty-actions(ng-if="$dir.button")
        a(ng-if="$dir.button" href="{{ $dir.button.href }}").button.button-primary
            em.mdi.mdi-plus-circle.icon-start 
            span(ng-bind="$dir.button.text")

    .empty-actions(ng-if="$dir.buttonText && ($dir.buttonSref || $dir.buttonCallback)"): button.button(
        ng-click="$dir.buttonHandler($event)"
        ng-class="'button-' + $dir.buttonType"
        dusk="btnEmptyBlock")

        em.mdi(ng-if="$dir.buttonIcon && !$dir.buttonIconEnd" ng-class="'mdi-' + $dir.buttonIcon").icon-start
        ng-bind(ng-bind="$dir.buttonText")
        em.mdi(ng-if="$dir.buttonIcon && $dir.buttonIconEnd" ng-class="'mdi-' + $dir.buttonIcon").icon-end
*/
