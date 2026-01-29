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
    fund: Fund;
    modal: ModalState;
    className?: string;
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
    }>(
        {
            allow_physical_cards: fund.allow_physical_cards,
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
            title={'Fysieke pas instellingen'}
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
                <FormPane title={'Instellingen'}>
                    <FormGroup
                        label={'Kies een fysieke pas'}
                        error={form.errors?.allow_physical_cards}
                        info={
                            <Fragment>
                                Met deze optie kan een fysieke pas aan een fonds worden gekoppeld. De fysieke pas kunt u
                                instellen onder het menu Fysieke passen
                            </Fragment>
                        }
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
                    {form.values.allow_physical_cards && <Fragment></Fragment>}
                </FormPane>
            </div>
        </Modal>
    );
}
