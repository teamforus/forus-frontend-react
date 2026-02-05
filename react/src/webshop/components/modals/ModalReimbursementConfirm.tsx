import React, { useCallback } from 'react';
import classNames from 'classnames';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import Reimbursement from '../../props/models/Reimbursement';
import ReimbursementDetailsCard from '../pages/reimbursements/elements/ReimbursementDetailsCard';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';
import useTranslate from '../../../dashboard/hooks/useTranslate';

export default function ModalReimbursementConfirm({
    modal,
    onConfirm,
    reimbursement,
}: {
    modal: ModalState;
    onConfirm: () => void;
    reimbursement: Partial<Reimbursement>;
}) {
    const translate = useTranslate();

    const confirm = useCallback(() => {
        modal.close();
        onConfirm?.();
    }, [modal, onConfirm]);

    return (
        <div
            className={classNames(
                'modal',
                'modal-reimbursement-confirm',
                'modal-animated',
                !modal.loading && 'modal-loaded',
            )}
            data-dusk="modalReimbursementConfirmation"
            aria-describedby="pinCodeDialogSubtitle"
            aria-labelledby="pinCodeDialogTitle"
            role="dialog">
            <div
                className="modal-backdrop"
                onClick={modal.close}
                aria-label={translate('reimbursement_confirmation.buttons.close')}
            />
            <div className="modal-window">
                <div
                    className="modal-close mdi mdi-close"
                    onClick={modal.close}
                    tabIndex={0}
                    onKeyDown={clickOnKeyEnter}
                    aria-label={translate('reimbursement_confirmation.buttons.close')}
                    role="button"
                />
                <div className="modal-header">
                    <h2 className="modal-header-title">{translate('reimbursement_confirmation.title')}</h2>
                </div>
                <div className="modal-body">
                    <div className="modal-section">
                        <div className="modal-warning">{translate('reimbursement_confirmation.description')}</div>
                        <ReimbursementDetailsCard reimbursement={reimbursement} compact={true} />
                    </div>
                </div>
                <div className="modal-footer">
                    <button
                        className="button button-primary-outline button-sm"
                        onClick={modal.close}
                        data-dusk="modalReimbursementConfirmationCancel">
                        {translate('reimbursement_confirmation.buttons.cancel')}
                    </button>
                    <button
                        className="button button-primary button-sm"
                        onClick={confirm}
                        data-dusk="modalReimbursementConfirmationSubmit">
                        {translate('reimbursement_confirmation.buttons.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
}
