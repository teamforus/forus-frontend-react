import React, { Fragment, ReactNode, useCallback } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { ModalButton } from './elements/ModalButton';
import useAssetUrl from '../../hooks/useAssetUrl';
import classNames from 'classnames';
import Modal from './elements/Modal';

export default function ModalNotification({
    modal,
    icon,
    title,
    className,
    description,
    buttonClose,
    buttonCancel,
    buttonSubmit,
    buttons,
}: {
    modal: ModalState;
    icon?: string;
    title: string;
    className?: string;
    description?: string | ReactNode | Array<string> | Array<ReactNode>;
    buttonClose?: ModalButton;
    buttonCancel?: ModalButton;
    buttonSubmit?: ModalButton;
    buttons?: Array<ModalButton>;
}) {
    const assetUrl = useAssetUrl();
    const getIcon = useCallback((icon: string) => assetUrl('./assets/img/modal/' + icon + '.png'), [assetUrl]);

    return (
        <Modal
            size={'lg'}
            modal={modal}
            className={classNames('modal-notification', className)}
            footer={
                <Fragment>
                    {buttonClose && <ModalButton button={buttonClose} text="Sluiten" type="default" />}
                    {buttonCancel && <ModalButton button={buttonCancel} text="Annuleren" type="default" />}
                    {buttonSubmit && <ModalButton button={buttonSubmit} text="Bevestigen" type="primary" />}

                    {buttons?.map((button, index) => (
                        <ModalButton key={index} button={button} text={''} type="default" submit={true} />
                    ))}
                </Fragment>
            }>
            {icon && (
                <div className="modal-icon-rounded">
                    <img src={getIcon(icon)} alt="Icon" />
                </div>
            )}

            <div className="modal-heading text-center">{title}</div>

            {description && (
                <div className="modal-text">
                    {(Array.isArray(description) ? description : [description]).map((value, index) => (
                        <div key={index}>{value}</div>
                    ))}
                </div>
            )}
        </Modal>
    );
}
