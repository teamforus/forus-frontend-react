import React, { Fragment, useState } from 'react';
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

export default function ModalFundEditPhysicalCardSettings({
    modal,
    fund,
    setFund,
    className,
}: {
    modal: ModalState;
    className?: string;
    fund: Fund;
    setFund: React.Dispatch<React.SetStateAction<Fund>>;
}) {
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const fundService = useFundService();

    const [options] = useState([
        { value: false, name: 'Nee' },
        { value: true, name: 'Ja' },
    ]);

    const form = useFormBuilder<{
        allow_physical_cards: boolean;
        allow_physical_card_requests: boolean;
        allow_physical_card_linking: boolean;
        allow_physical_card_deactivation: boolean;
        allow_physical_cards_on_application: boolean;
    }>(
        {
            allow_physical_cards: fund.allow_physical_cards,
            allow_physical_card_requests: fund.allow_physical_card_requests,
            allow_physical_card_linking: fund.allow_physical_card_linking,
            allow_physical_card_deactivation: fund.allow_physical_card_deactivation,
            allow_physical_cards_on_application: fund.allow_physical_cards_on_application,
        },
        (values) => {
            setProgress(0);
            form.setErrors(null);

            fundService
                .update(fund.organization_id, fund.id, values)
                .then((res) => {
                    setFund(res.data.data);
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

    return (
        <Modal
            modal={modal}
            title={'Physical cards settings'}
            className={className}
            onSubmit={form.submit}
            footer={
                <Fragment>
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Annuleren
                    </button>
                    <button type="submit" className="button button-primary">
                        Bevestigen
                    </button>
                </Fragment>
            }>
            <div className="flex flex-vertical flex-gap">
                <FormPane title={'Physical cards settings'}>
                    <FormGroup
                        label={'Enable physical cards'}
                        error={form.errors?.allow_physical_cards}
                        info={'lorem ipsum'}
                        input={(id) => (
                            <SelectControl
                                id={id}
                                propKey={'value'}
                                className={'form-control'}
                                value={form.values.allow_physical_cards}
                                options={options}
                                onChange={(allow_physical_cards: boolean) => {
                                    form.update({ allow_physical_cards });
                                }}
                            />
                        )}
                    />
                    {form.values.allow_physical_cards && (
                        <FormPane title={'Physical cards'}>
                            <div className="row">
                                <div className="col col-xs-12 col-sm-6">
                                    <FormGroup
                                        label={'Allow request physical cards'}
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
                            </div>
                            <div className="row">
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
                                <div className="col col-xs-12 col-sm-6">
                                    <FormGroup
                                        label={'Allow fund application physical cards'}
                                        error={form.errors?.allow_physical_cards_on_application}
                                        info={'lorem ipsum'}
                                        input={(id) => (
                                            <SelectControl
                                                id={id}
                                                propKey={'value'}
                                                className={'form-control'}
                                                value={form.values.allow_physical_cards_on_application}
                                                options={options}
                                                onChange={(allow_physical_cards_on_application: boolean) => {
                                                    form.update({ allow_physical_cards_on_application });
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
