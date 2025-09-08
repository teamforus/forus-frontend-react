import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import { ResponseError } from '../../props/ApiResponses';
import useSetProgress from '../../hooks/useSetProgress';
import usePushApiError from '../../hooks/usePushApiError';
import Modal from './elements/Modal';
import FormGroup from '../elements/forms/elements/FormGroup';
import FormPane from '../elements/forms/elements/FormPane';
import usePushSuccess from '../../hooks/usePushSuccess';
import { useFundService } from '../../services/FundService';
import Fund from '../../props/models/Fund';
import SelectControl from '../elements/select-control/SelectControl';
import { usePhysicalCardTypeService } from '../../services/PhysicalCardTypeService';
import PhysicalCardType from '../../props/models/PhysicalCardType';

export default function ModalAssignPhysicalCardToFund({
    fund,
    modal,
    onDone,
    exclude,
    className,
}: {
    fund: Fund;
    modal: ModalState;
    onDone?: (fund: Fund) => void;
    exclude: number[];
    className?: string;
}) {
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const fundService = useFundService();
    const physicalCardTypeService = usePhysicalCardTypeService();

    const [physicalCardTypes, setPhysicalCardTypes] = useState<Partial<PhysicalCardType>[]>([]);

    const form = useFormBuilder<{
        physical_card_type_id: number;
    }>(
        {
            physical_card_type_id: null,
        },
        (values) => {
            setProgress(0);
            form.setErrors(null);

            fundService
                .update(fund.organization_id, fund.id, { enable_physical_card_types: [values?.physical_card_type_id] })
                .then((res) => {
                    onDone?.(res.data.data);
                    pushSuccess('Opgeslagen!');
                    modal.close();
                })
                .catch((err: ResponseError) => {
                    pushApiError(err);
                    form.setErrors(err.data.errors);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    const fetchPhysicalCardType = useCallback(() => {
        setProgress(0);

        physicalCardTypeService
            .list(fund.organization_id)
            .then((res) =>
                setPhysicalCardTypes([
                    { id: null, name: 'Select a card type' },
                    ...res.data.data.filter((type) => !exclude?.includes(type.id)),
                ]),
            )
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [exclude, fund.organization_id, physicalCardTypeService, pushApiError, setProgress]);

    useEffect(() => {
        fetchPhysicalCardType();
    }, [fetchPhysicalCardType]);

    return (
        <Modal
            modal={modal}
            title={'Assign physical card'}
            className={className}
            onSubmit={form.submit}
            footer={
                <Fragment>
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Annuleren
                    </button>
                    <button
                        type="submit"
                        className="button button-primary"
                        disabled={!form.values?.physical_card_type_id}>
                        Bevestigen
                    </button>
                </Fragment>
            }>
            <div className="flex flex-vertical flex-gap">
                <FormPane title={'Select a card'}>
                    <FormGroup
                        label={'Enable physical cards'}
                        error={form.errors?.allow_physical_cards}
                        info={'lorem ipsum'}
                        input={(id) => (
                            <SelectControl
                                id={id}
                                propKey={'id'}
                                propValue={'name'}
                                className={'form-control'}
                                value={form.values.physical_card_type_id}
                                options={physicalCardTypes}
                                onChange={(physical_card_type_id: number) => {
                                    form.update({ physical_card_type_id });
                                }}
                            />
                        )}
                    />
                </FormPane>
            </div>
        </Modal>
    );
}
