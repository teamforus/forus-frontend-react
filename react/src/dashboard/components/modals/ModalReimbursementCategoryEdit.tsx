import React, { useCallback } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import ReimbursementCategory from '../../props/models/ReimbursementCategory';
import useFormBuilder from '../../hooks/useFormBuilder';
import { useReimbursementCategoryService } from '../../services/ReimbursementCategoryService';
import useActiveOrganization from '../../hooks/useActiveOrganization';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushDanger from '../../hooks/usePushDanger';
import useSetProgress from '../../hooks/useSetProgress';
import FormError from '../elements/forms/errors/FormError';
import { ResponseError } from '../../props/ApiResponses';

export default function ModalReimbursementCategoryEdit({
    modal,
    category,
    onSubmit,
    onCancel,
    className,
}: {
    modal: ModalState;
    category?: ReimbursementCategory;
    onSubmit?: () => void;
    onCancel?: () => void;
    className?: string;
}) {
    const activeOrganization = useActiveOrganization();

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const reimbursementCategoryService = useReimbursementCategoryService();

    const form = useFormBuilder(
        {
            name: category?.name,
        },
        (values) => {
            setProgress(0);

            const promise = category
                ? reimbursementCategoryService.update(activeOrganization.id, category.id, values)
                : reimbursementCategoryService.store(activeOrganization.id, values);

            promise
                .then(() => {
                    pushSuccess('Gelukt!', 'Declaratie is bijgewerkt!');
                    modal.close();
                    onSubmit ? onSubmit() : null;
                })
                .catch((err: ResponseError) => {
                    pushDanger('Mislukt!', err.data?.message);
                    form.setErrors(err.data?.errors);
                    form.setIsLocked(false);
                })
                .finally(() => setProgress(100));
        },
    );

    const closeModal = useCallback(() => {
        onCancel();
        modal.close();
    }, [modal, onCancel]);

    return (
        <div className={`modal modal-md modal-animated ${modal.loading ? 'modal-loading' : ''} ${className}`}>
            <div className="modal-backdrop" onClick={closeModal} />

            <div className="modal-window">
                <form className="modal-window form" onSubmit={form.submit}>
                    <a className="mdi mdi-close modal-close" onClick={closeModal} role="button" />
                    <div className="modal-header">Declaratie categorie toevoegen</div>
                    <div className="modal-body modal-body-visible">
                        <div className="modal-section form">
                            <div className="form-group">
                                <label className="form-label">Categorie naam</label>
                                <input
                                    className="form-control"
                                    defaultValue={form.values.name}
                                    placeholder="Categorie naam"
                                    onChange={(e) => form.update({ name: e.target.value })}
                                />
                                <FormError error={form.errors?.name} />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer text-center">
                        <button className="button button-default" id="close" onClick={closeModal} type="button">
                            Sluiten
                        </button>
                        <button className="button button-primary" type="submit">
                            Bevestigen
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
