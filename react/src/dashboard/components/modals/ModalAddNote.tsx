import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormError from '../elements/forms/errors/FormError';
import FormValuesModel from '../../types/FormValuesModel';
import { ApiResponseSingle, ResponseError } from '../../props/ApiResponses';
import Note from '../../props/models/Note';
import useSetProgress from '../../hooks/useSetProgress';
import classNames from 'classnames';
import usePushApiError from '../../hooks/usePushApiError';

export default function ModalAddNote({
    modal,
    title,
    description,
    className,
    storeNote,
    onCreated,
}: {
    modal: ModalState;
    title?: string;
    description?: string;
    className?: string;
    storeNote: (values: FormValuesModel) => Promise<ApiResponseSingle<Note>>;
    onCreated: (note?: Note) => void;
}) {
    const pushApiError = usePushApiError();
    const setProgress = useSetProgress();

    const form = useFormBuilder({ description: '' }, () => {
        setProgress(0);

        return storeNote(form.values)
            .then((res) => {
                onCreated(res?.data?.data);
                modal.close();
            })
            .catch((err: ResponseError) => {
                form.setErrors(err?.data?.errors);
                form.setIsLocked(false);
                pushApiError(err);
            })
            .finally(() => setProgress(100));
    });

    return (
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading', className)}>
            <div className="modal-backdrop" onClick={modal.close} />
            <form className="modal-window form" onSubmit={form.submit}>
                <div className="modal-close mdi mdi-close" onClick={modal.close} role="button" />
                <div className="modal-header">Notitie toevoegen</div>
                <div className="modal-body">
                    <div className="modal-section">
                        {title && <div className="modal-heading">{title}</div>}
                        {description && <div className="modal-text">{description}</div>}
                        <div className="form-group">
                            <label className="form-label form-label-required">Notitie</label>
                            <textarea
                                className="form-control"
                                value={form.values.description}
                                onChange={(e) => form.update({ description: e.target.value })}
                            />
                            <FormError error={form.errors?.description} />
                        </div>
                    </div>
                </div>
                <div className="modal-footer text-center">
                    <button
                        type="button"
                        className="button button-default"
                        disabled={form.isLoading}
                        onClick={modal.close}>
                        Annuleren
                    </button>
                    <button className="button button-primary" disabled={form.isLoading} type="submit">
                        {form.isLoading && <em className="mdi mdi-loading mdi-spin icon-start" />}
                        Bevestigen
                    </button>
                </div>
            </form>
        </div>
    );
}
