import React, { useCallback } from 'react';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import Reimbursement from '../../props/models/Reimbursement';
import ReimbursementDetailsCard from '../pages/reimbursements/elements/ReimbursementDetailsCard';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';

export default function ModalReimbursementConfirm({
    modal,
    onConfirm,
    reimbursement,
}: {
    modal: ModalState;
    onConfirm: () => void;
    reimbursement: Partial<Reimbursement>;
}) {
    const confirm = useCallback(() => {
        modal.close();
        onConfirm?.();
    }, [modal, onConfirm]);

    return (
        <div
            className={`modal modal-reimbursement-confirm modal-animated ${modal.loading ? '' : 'modal-loaded'}`}
            data-dusk="modalReimbursementConfirmation"
            aria-describedby="pinCodeDialogSubtitle"
            aria-labelledby="pinCodeDialogTitle"
            role="dialog">
            <div className="modal-backdrop" onClick={modal.close} aria-label="Sluiten" />
            <div className="modal-window">
                <div
                    className="modal-close mdi mdi-close"
                    onClick={modal.close}
                    tabIndex={0}
                    onKeyDown={clickOnKeyEnter}
                    aria-label="Sluiten"
                    role="button"
                />
                <div className="modal-header">
                    <h2 className="modal-header-title">Declaratie indienen</h2>
                </div>
                <div className="modal-body">
                    <div className="modal-section">
                        <div className="modal-warning">Controleer de gegevens voordat u de declaratie verstuurd.</div>
                        <ReimbursementDetailsCard reimbursement={reimbursement} compact={true} />
                    </div>
                </div>
                <div className="modal-footer">
                    <button
                        className="button button-primary-outline button-sm"
                        onClick={modal.close}
                        data-dusk="modalReimbursementConfirmationCancel">
                        Annuleren
                    </button>
                    <button
                        className="button button-primary button-sm"
                        onClick={confirm}
                        data-dusk="modalReimbursementConfirmationSubmit">
                        Bevestigen
                    </button>
                </div>
            </div>
        </div>
    );
}
