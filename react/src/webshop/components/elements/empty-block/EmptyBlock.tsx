import React from 'react';
import IconReimbursements from '../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-reimbursement.svg';
import IconFundRequest from '../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-fund-request.svg';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import ButtonType from '../../../../props/elements/ButtonType';

export default function EmptyBlock({
    title,
    text,
    description,
    hideLink,
    svgIcon,
    button,
    dataDusk,
}: {
    title?: string;
    text?: string;
    description?: string;
    hideLink?: boolean;
    svgIcon?: string;
    button?: ButtonType;
    dataDusk?: string;
}) {
    return (
        <div className="block block-empty" data-dusk={dataDusk}>
            {svgIcon === 'reimbursements' && (
                <div className="block-icon" aria-hidden="true">
                    <IconReimbursements />
                </div>
            )}
            {svgIcon === 'fund-requests' && (
                <div className="block-icon" aria-hidden="true">
                    <IconFundRequest />
                </div>
            )}

            {title && <h2 className="block-title">{title}</h2>}
            {description && <p className="block-description">{description}</p>}

            {!hideLink && (
                <StateNavLink className="block-link" name="start">
                    {text}
                    <em className="mdi mdi-arrow-right" aria-hidden="true" />
                </StateNavLink>
            )}

            {button && (
                <div className="block-actions">
                    <button
                        className={`button button-${button.type}`}
                        onClick={button.onClick}
                        data-dusk="btnEmptyBlock">
                        {button.icon && !button.iconEnd && <em className={`mdi mdi-${button.icon}`} />}
                        {button.text}
                        {button.icon && button.iconEnd && <em className={`icon-right mdi mdi-${button.icon}`} />}
                    </button>
                </div>
            )}
        </div>
    );
}
