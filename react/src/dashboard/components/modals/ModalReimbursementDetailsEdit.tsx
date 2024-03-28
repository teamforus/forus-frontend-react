import React, { useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { ApiResponseSingle, ResponseError } from '../../props/ApiResponses';
import Reimbursement from '../../props/models/Reimbursement';
import Organization from '../../props/models/Organization';
import useFormBuilder from '../../hooks/useFormBuilder';
import { useReimbursementsService } from '../../services/ReimbursementService';
import { useReimbursementCategoryService } from '../../services/ReimbursementCategoryService';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushDanger from '../../hooks/usePushDanger';
import useSetProgress from '../../hooks/useSetProgress';
import FormError from '../elements/forms/errors/FormError';
import SelectControlOptions from '../elements/select-control/templates/SelectControlOptions';
import SelectControl from '../elements/select-control/SelectControl';
import ReimbursementCategory from '../../props/models/ReimbursementCategory';
import useOpenModal from '../../hooks/useOpenModal';
import ModalReimbursementCategoriesEdit from '../modals/ModalReimbursementCategoriesEdit';

export default function ModalReimbursementDetailsEdit({
    modal,
    description,
    reimbursement,
    organization,
    onSubmit,
    className,
}: {
    modal: ModalState;
    description: string;
    reimbursement: Reimbursement;
    organization: Organization;
    onSubmit: (res: ApiResponseSingle<Reimbursement>) => void;
    className?: string;
}) {
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const reimbursementService = useReimbursementsService();
    const reimbursementCategoryService = useReimbursementCategoryService();

    const [showModal, setShowModal] = useState(true);
    const [categories, setCategories] = useState<Array<Partial<ReimbursementCategory>>>(null);

    const form = useFormBuilder(
        {
            provider_name: reimbursement.provider_name || '',
            reimbursement_category_id: reimbursement.reimbursement_category?.id || null,
        },
        (values) => {
            setProgress(0);

            reimbursementService
                .update(organization.id, reimbursement.id, {
                    provider_name: values.provider_name,
                    reimbursement_category_id: values.reimbursement_category_id,
                })
                .then((res) => {
                    pushSuccess('Gelukt!', 'Declaratie is bijgewerkt!');
                    onSubmit(res);
                    modal.close();
                })
                .catch((err: ResponseError) => {
                    pushDanger('Mislukt!', err.data.message);
                    form.setErrors(err.data.errors);
                    form.setIsLocked(false);
                })
                .finally(() => setProgress(100));
        },
    );

    const fetchCategories = useCallback(() => {
        setProgress(0);

        reimbursementCategoryService
            .list(organization.id, { per_page: 100 })
            .then((res) => setCategories([{ id: null, name: 'Geen categorie' }, ...res.data.data]))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
            .finally(() => setProgress(100));
    }, [organization.id, pushDanger, reimbursementCategoryService, setProgress]);

    const manageCategories = useCallback(() => {
        setShowModal(false);
        openModal((modal) => <ModalReimbursementCategoriesEdit modal={modal} onClose={() => setShowModal(true)} />);
    }, [openModal]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return (
        <div
            className={`modal modal-md modal-animated ${
                modal.loading || !showModal ? 'modal-loading' : ''
            } ${className}`}>
            <div className="modal-backdrop" onClick={modal.close} />

            <div className="modal-window">
                <form className="form" onSubmit={form.submit}>
                    <div className="modal-close mdi mdi-close" onClick={modal.close} role="button" />
                    <div className="modal-header">Bewerk aanbieder</div>

                    <div className="modal-body modal-body-visible">
                        <div className="modal-section">
                            {description && <div className="modal-text">{description}</div>}

                            <div className="form-group">
                                <label className="form-label form-label-required">Aanbieder</label>
                                <input
                                    className="form-control"
                                    placeholder="Aanbieder"
                                    value={form.values.provider_name}
                                    onChange={(e) => form.update({ provider_name: e.target.value })}
                                />
                                <FormError error={form.errors.provider_name} />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Categorie</label>
                                <div className="form-group-offset">
                                    <div className="row">
                                        <div className="col col-xs-9">
                                            <SelectControl
                                                className={'form-control'}
                                                options={categories}
                                                optionsComponent={SelectControlOptions}
                                                propKey={'id'}
                                                allowSearch={false}
                                                value={form.values.reimbursement_category_id}
                                                onChange={(reimbursement_category_id?: number) => {
                                                    form.update({ reimbursement_category_id });
                                                }}
                                            />
                                        </div>

                                        <div className="col col-xs-3">
                                            <button
                                                className="button button-primary button-fill"
                                                onClick={() => manageCategories()}
                                                type="button">
                                                Wijzig categorieën
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <FormError error={form.errors.category_name} />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer text-center">
                        <button className="button button-default" onClick={modal.close} type="button">
                            Annuleren
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
