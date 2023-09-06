import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import { ModalButton } from './elements/ModalButton';

export default function ModalDangerZone({
    modal,
    title,
    className,
    description,
    buttonCancel,
    buttonSubmit,
    buttons,
}: {
    modal: ModalState;
    title: string;
    className?: string;
    description: string | Array<string>;
    buttonCancel?: ModalButton;
    buttonSubmit?: ModalButton;
    buttons?: Array<ModalButton>;
}) {
    return (
        <div
            className={classList([
                'modal',
                'modal-md',
                'modal-animated',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />
            <div className="modal-window">
                <div className="modal-body form">
                    <div className="modal-section">
                        <div className="block block-danger_zone">
                            <div className="danger_zone-title flex-center">
                                <em className="mdi mdi-alert" />
                                {title}
                            </div>

                            <div className="danger_zone-description">
                                {Array.isArray(description)
                                    ? description
                                    : [description].map((value, index) => <div key={index}>{value}</div>)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    {buttonCancel && <ModalButton button={buttonCancel} text="Annuleren" type="default" />}
                    {buttonSubmit && <ModalButton button={buttonSubmit} text="Bevestigen" type="danger" />}

                    {buttons?.map((button, index) => (
                        <ModalButton key={index} button={button} text={''} type="default" submit={true} />
                    ))}
                </div>
            </div>
        </div>
    );
}
