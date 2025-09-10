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
import Fund from '../../props/models/Fund';
import SelectControl from '../elements/select-control/SelectControl';
import { usePhysicalCardTypeService } from '../../services/PhysicalCardTypeService';
import PhysicalCardType from '../../props/models/PhysicalCardType';
import { useFundPhysicalCardTypeService } from '../../services/FundPhysicalCardTypeService';
import FundPhysicalCardType from '../../props/models/FundPhysicalCardType';
import Organization from '../../props/models/Organization';

export default function ModalAssignPhysicalCardToFund({
    fund,
    modal,
    onDone,
    exclude,
    className,
    organization,
    fundPhysicalCardType,
}: {
    fund: Fund;
    modal: ModalState;
    onDone?: (fundPhysicalCardType: FundPhysicalCardType) => void;
    exclude: number[];
    className?: string;
    organization: Organization;
    fundPhysicalCardType?: FundPhysicalCardType;
}) {
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const physicalCardTypeService = usePhysicalCardTypeService();
    const fundPhysicalCardTypeService = useFundPhysicalCardTypeService();

    const [options] = useState([
        { value: false, name: 'Nee' },
        { value: true, name: 'Ja' },
    ]);

    const [physicalCardTypes, setPhysicalCardTypes] = useState<Partial<PhysicalCardType>[]>([]);

    const form = useFormBuilder<{
        fund_id: number;
        physical_card_type_id: number;
        allow_physical_card_linking: boolean;
        allow_physical_card_requests: boolean;
        allow_physical_card_deactivation: boolean;
    }>(
        {
            fund_id: fund.id,
            physical_card_type_id: fundPhysicalCardType?.physical_card_type_id,
            allow_physical_card_linking: fundPhysicalCardType
                ? fundPhysicalCardType?.allow_physical_card_linking
                : true,
            allow_physical_card_requests: fundPhysicalCardType
                ? fundPhysicalCardType?.allow_physical_card_requests
                : true,
            allow_physical_card_deactivation: fundPhysicalCardType
                ? fundPhysicalCardType?.allow_physical_card_deactivation
                : true,
        },
        (values) => {
            setProgress(0);
            form.setErrors(null);

            const promise = !fundPhysicalCardType
                ? fundPhysicalCardTypeService.store(organization.id, values)
                : fundPhysicalCardTypeService.update(organization.id, fundPhysicalCardType.id, values);

            promise
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
                        disabled={!fundPhysicalCardType && !form.values?.physical_card_type_id}>
                        Bevestigen
                    </button>
                </Fragment>
            }>
            <div className="flex flex-vertical flex-gap">
                <FormPane title={'Select a card type'}>
                    <FormGroup
                        label={'Enable physical cards'}
                        error={form.errors?.physical_card_type_id}
                        info={'lorem ipsum'}
                        input={(id) => (
                            <SelectControl
                                id={id}
                                propKey={'id'}
                                propValue={'name'}
                                className={'form-control'}
                                value={form.values.physical_card_type_id}
                                options={physicalCardTypes}
                                disabled={!!fundPhysicalCardType}
                                onChange={(physical_card_type_id: number) => {
                                    form.update({ physical_card_type_id });
                                }}
                            />
                        )}
                    />
                    {form.values.physical_card_type_id && (
                        <FormPane title={'Settings'}>
                            <div className="row">
                                <div className="col col-xs-12 col-sm-6">
                                    <FormGroup
                                        label={'Allow link physical card'}
                                        error={form.errors?.allow_physical_card_linking}
                                        info={'lorem ipsum'}
                                        input={(id) => (
                                            <SelectControl
                                                id={id}
                                                propKey={'value'}
                                                className={'form-control'}
                                                value={form.values.allow_physical_card_linking}
                                                options={options}
                                                onChange={(allow_physical_card_linking: boolean) => {
                                                    form.update({ allow_physical_card_linking });
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="col col-xs-12 col-sm-6">
                                    <FormGroup
                                        label={'Allow deactivate physical physical card'}
                                        error={form.errors?.allow_physical_card_deactivation}
                                        info={'lorem ipsum'}
                                        input={(id) => (
                                            <SelectControl
                                                id={id}
                                                propKey={'value'}
                                                className={'form-control'}
                                                value={form.values.allow_physical_card_deactivation}
                                                options={options}
                                                onChange={(allow_physical_card_deactivation: boolean) => {
                                                    form.update({ allow_physical_card_deactivation });
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col col-xs-12 col-sm-12">
                                    <FormGroup
                                        label={'Allow users to request a physical card'}
                                        error={form.errors?.allow_physical_card_requests}
                                        info={'lorem ipsum'}
                                        input={(id) => (
                                            <SelectControl
                                                id={id}
                                                propKey={'value'}
                                                className={'form-control'}
                                                value={form.values.allow_physical_card_requests}
                                                options={options}
                                                onChange={(allow_physical_card_requests: boolean) => {
                                                    form.update({ allow_physical_card_requests });
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </FormPane>
                    )}
                </FormPane>
            </div>
        </Modal>
    );
}
