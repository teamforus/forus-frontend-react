import React, { useCallback, useRef, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import BlockReimbursementCategories from '../elements/block-reimbursement-categories/BlockReimbursementCategories';

export default function ModalReimbursementCategoriesEdit({
    modal,
    onClose,
    className,
}: {
    modal: ModalState;
    onClose?: () => void;
    className?: string;
}) {
    const reimbursementsBlock = useRef<() => Promise<boolean>>();
    const [showModal, setShowModal] = useState(true);

    const createCategory = useCallback(() => {
        setShowModal(false);
        reimbursementsBlock.current().then(() => setShowModal(true));
    }, []);

    const closeModal = useCallback(() => {
        onClose();
        modal.close();
    }, [modal, onClose]);

    return (
        <div
            className={`modal modal-lg modal-animated ${
                modal.loading || !showModal ? 'modal-loading' : ''
            } ${className}`}>
            <div className="modal-backdrop" onClick={closeModal} />

            <div className="modal-window">
                <form className="form">
                    <div className="modal-close mdi mdi-close" onClick={closeModal} role="button" />
                    <div className="modal-header">Declaratie categorieën toevoegen</div>

                    <div className="modal-body modal-body-visible">
                        <BlockReimbursementCategories compact={true} createCategoryRef={reimbursementsBlock} />
                    </div>

                    <div className="modal-footer text-center">
                        <button className="button button-default" onClick={closeModal} type="button">
                            Sluiten
                        </button>
                        <button className="button button-primary" type="button" onClick={createCategory}>
                            Categorie toevoegen
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
