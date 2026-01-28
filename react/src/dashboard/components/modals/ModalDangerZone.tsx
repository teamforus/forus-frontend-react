import React, { ReactNode } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { ModalButton } from './elements/ModalButton';
import classNames from 'classnames';
import CheckboxControl from '../elements/forms/controls/CheckboxControl';

export default function ModalDangerZone({
    modal,
    title,
    className,
    description,
    description_title,
    description_text,
    confirmation,
    buttonCancel,
    buttonSubmit,
    buttons,
}: {
    modal: ModalState;
    title?: string;
    className?: string;
    description?: string | Array<string>;
    description_title?: string;
    description_text?: string | Array<string> | ReactNode;
    confirmation?: string;
    buttonCancel?: ModalButton;
    buttonSubmit?: ModalButton;
    buttons?: Array<ModalButton>;
}) {
    const [confirmed, setConfirmed] = React.useState(false);

    return (
        <div
            data-dusk="modalDangerZone"
            className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading', className)}>
            <div className="modal-backdrop" onClick={buttonCancel?.onClick || modal.close} />
            <div className="modal-window">
                <div className="modal-body form">
                    <div className="modal-section">
                        {(title || description) && (
                            <div className="block block-danger_zone">
                                <div className="danger_zone-title">
                                    <em className="mdi mdi-alert" />
                                    {title}
                                </div>

                                {description && (
                                    <div className="danger_zone-description">
                                        {Array.isArray(description)
                                            ? description
                                            : [description].map((value, index) => <div key={index}>{value}</div>)}
                                    </div>
                                )}
                            </div>
                        )}

                        {description_title && <div className="modal-heading">{description_title}</div>}

                        {typeof description_text === 'string' || Array.isArray(description_text) ? (
                            <div className="modal-text">
                                {(Array.isArray(description_text)
                                    ? description_text
                                    : description_text.split('\n')
                                ).map((value: string, index: number) =>
                                    value ? <div key={index}>{value}</div> : <div key={index}>&nbsp;</div>,
                                )}
                            </div>
                        ) : (
                            <div className="modal-text">{description_text}</div>
                        )}

                        {confirmation && (
                            <div className="form text-center">
                                <CheckboxControl
                                    checked={confirmed}
                                    narrow={true}
                                    onChange={(_, checked) => setConfirmed(checked)}
                                    title={confirmation}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer text-center">
                    {buttonCancel && (
                        <ModalButton button={buttonCancel} dusk="btnDangerZoneCancel" text="Annuleren" type="default" />
                    )}

                    {buttonSubmit && (
                        <ModalButton
                            disabled={confirmation && !confirmed}
                            button={{ ...buttonSubmit, disableOnClick: true }}
                            dusk="btnDangerZoneSubmit"
                            text="Bevestigen"
                            type="danger"
                        />
                    )}

                    {buttons?.map((button, index) => (
                        <ModalButton key={index} button={button} text={''} type="default" submit={true} />
                    ))}
                </div>
            </div>
        </div>
    );
}
