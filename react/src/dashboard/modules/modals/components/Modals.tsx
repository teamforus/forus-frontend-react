import React, { Fragment, useContext } from 'react';
import { modalsContext } from '../context/ModalContext';

export default function Modals() {
    const { modals } = useContext(modalsContext);

    return (
        <Fragment>
            {modals
                .filter((modal) => !modal.hidden)
                .map((modal) => (
                    <Fragment key={modal.id}>{modal.builder(modal)}</Fragment>
                ))}
        </Fragment>
    );
}
