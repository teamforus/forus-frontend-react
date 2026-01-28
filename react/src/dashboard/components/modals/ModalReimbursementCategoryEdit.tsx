import React, { useCallback } from 'react';
import classNames from 'classnames';
import { ModalState } from '../../modules/modals/context/ModalContext';
import ReimbursementCategory from '../../props/models/ReimbursementCategory';
import useFormBuilder from '../../hooks/useFormBuilder';
import { useReimbursementCategoryService } from '../../services/ReimbursementCategoryService';
import useActiveOrganization from '../../hooks/useActiveOrganization';
import usePushSuccess from '../../hooks/usePushSuccess';
import useSetProgress from '../../hooks/useSetProgress';
import { ResponseError } from '../../props/ApiResponses';
import usePushApiError from '../../hooks/usePushApiError';
import FormGroup from '../elements/forms/elements/FormGroup';

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

    const pushApiError = usePushApiError();
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
                    onSubmit?.();
                })
                .catch((err: ResponseError) => {
                    pushApiError(err);
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
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading', className)}>
            <div className="modal-backdrop" onClick={closeModal} />

            <div className="modal-window">
                <form className="modal-window form" onSubmit={form.submit}>
                    <a className="mdi mdi-close modal-close" onClick={closeModal} role="button" />
                    <div className="modal-header">Declaratie categorie toevoegen</div>
                    <div className="modal-body modal-body-visible">
                        <div className="modal-section form">
                            <FormGroup
                                label="Categorie naam"
                                error={form.errors?.name}
                                input={(id) => (
                                    <input
                                        className="form-control"
                                        id={id}
                                        defaultValue={form.values.name}
                                        placeholder="Categorie naam"
                                        onChange={(e) => form.update({ name: e.target.value })}
                                    />
                                )}
                            />
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
