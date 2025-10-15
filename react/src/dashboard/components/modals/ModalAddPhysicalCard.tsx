import React, { useEffect, useMemo, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import useSetProgress from '../../hooks/useSetProgress';
import SponsorVoucher from '../../props/models/Sponsor/SponsorVoucher';
import Organization from '../../props/models/Organization';
import PincodeControl from '../elements/forms/controls/PincodeControl';
import FormError from '../elements/forms/errors/FormError';
import IconCardSuccess from '../../../../assets/forus-platform/resources/_platform-common/assets/img/modal/icon-physical-cards-success.svg';
import { usePhysicalCardService } from '../../services/PhysicalCardService';
import { ResponseError } from '../../props/ApiResponses';
import useTranslate from '../../hooks/useTranslate';
import TranslateHtml from '../elements/translate-html/TranslateHtml';
import usePushApiError from '../../hooks/usePushApiError';
import classNames from 'classnames';
import FormGroup from '../elements/forms/elements/FormGroup';
import SelectControl from '../elements/select-control/SelectControl';

export default function ModalAddPhysicalCard({
    modal,
    voucher,
    className,
    onAttached,
    organization,
}: {
    modal: ModalState;
    voucher: SponsorVoucher;
    className?: string;
    onAttached: () => void;
    organization: Organization;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const physicalCardService = usePhysicalCardService();

    const [code, setCode] = useState('');
    const [state, setState] = useState<'type' | 'form' | 'success'>('type');

    const types = useMemo(() => {
        return voucher?.fund?.fund_physical_card_types.map((type) => ({
            ...type,
            name: type.physical_card_type?.name,
        }));
    }, [voucher?.fund?.fund_physical_card_types]);

    const form = useFormBuilder<{
        code: string;
        fund_physical_card_type_id?: number;
    }>(
        {
            code: '',
            fund_physical_card_type_id: voucher?.fund?.fund_physical_card_types?.[0].id ?? null,
        },
        (values) => {
            setProgress(0);

            physicalCardService
                .storeVoucher(organization.id, voucher.id, values)
                .then((res) => {
                    setCode(res.data.data.code_locale);
                    setState('success');
                    onAttached();
                })
                .catch((err: ResponseError) => {
                    form.setIsLocked(false);
                    pushApiError(err);

                    if (err.status === 429) {
                        return form.setErrors({ code: [err.data.message] });
                    }

                    form.setErrors(err.data.errors);
                })
                .finally(() => setProgress(100));
        },
    );

    const { update: formUpdate } = form;

    const physicalCardType = useMemo(() => {
        return voucher?.fund?.fund_physical_card_types?.find((type) => {
            return type.id === form.values.fund_physical_card_type_id;
        })?.physical_card_type;
    }, [form.values.fund_physical_card_type_id, voucher?.fund?.fund_physical_card_types]);

    useEffect(() => {
        formUpdate({ code: physicalCardType?.code_prefix });
    }, [formUpdate, physicalCardType?.code_prefix]);

    return (
        <div
            className={classNames(
                'modal',
                'modal-animated',
                state !== 'form' && 'modal-md',
                modal.loading && 'modal-loading',
                className,
            )}>
            <div className="modal-backdrop" aria-label="Sluiten" role="button" onClick={modal.close} />
            {state === 'type' && (
                <form
                    className="modal-window form"
                    onSubmit={(e) => {
                        e?.preventDefault();
                        e?.stopPropagation();
                        setState('form');
                    }}>
                    <a className="mdi mdi-close modal-close" />
                    <div className="modal-header">
                        <div className="modal-title">Selecteer een fysieke pas</div>
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <FormGroup
                                label={'Kies een fysieke pas'}
                                error={form.errors?.fund_physical_card_type_id}
                                input={(id) => (
                                    <SelectControl
                                        id={id}
                                        propKey={'id'}
                                        propValue={'name'}
                                        className={'form-control'}
                                        value={form.values.fund_physical_card_type_id}
                                        options={types ?? []}
                                        onChange={(fund_physical_card_type_id?: number) => {
                                            form.update({ fund_physical_card_type_id });
                                        }}
                                    />
                                )}
                            />
                            <FormError error={form.errors?.code} />
                        </div>
                    </div>

                    <div className="modal-footer text-center">
                        <button
                            type="submit"
                            disabled={!form.values.fund_physical_card_type_id}
                            className="button button-primary">
                            {translate('modals.modal_voucher_physical_card.buttons.submit')}
                        </button>
                    </div>
                </form>
            )}

            {state === 'form' && (
                <form className="modal-window form" onSubmit={form.submit}>
                    <a className="mdi mdi-close modal-close" aria-label="Sluiten" onClick={modal.close} role="button" />
                    <div className="modal-header">
                        <div className="modal-title">
                            {translate('modals.modal_voucher_physical_card.header.card_title')}
                        </div>
                    </div>

                    <div className="modal-body">
                        <div className="modal-section text-center">
                            <div className="modal-heading flex flex-vertical">
                                {translate('modals.modal_voucher_physical_card.content.title')}

                                <p className="modal-text">
                                    {translate('modals.modal_voucher_physical_card.content.subtitle')}
                                </p>
                            </div>

                            {physicalCardType && (
                                <PincodeControl
                                    className={'block-pincode-compact'}
                                    value={form.values.code}
                                    valueType={'num'}
                                    blockSize={physicalCardType?.code_block_size}
                                    blockCount={physicalCardType?.code_blocks}
                                    cantDeleteSize={physicalCardType?.code_prefix?.length}
                                    onChange={(code) => form.update({ code })}
                                />
                            )}
                            <FormError error={form.errors?.code} />
                        </div>
                    </div>

                    <div className="modal-footer text-center">
                        <button type="button" className="button button-default" onClick={modal.close}>
                            {translate('modals.modal_voucher_physical_card.buttons.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={
                                form.values.code?.length !=
                                    physicalCardType?.code_block_size * physicalCardType?.code_blocks ||
                                !form.values.fund_physical_card_type_id
                            }
                            className="button button-primary">
                            {translate('modals.modal_voucher_physical_card.buttons.submit')}
                        </button>
                    </div>
                </form>
            )}

            {state === 'success' && (
                <div className="modal-window">
                    <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                    <div className="modal-header">
                        <div className="modal-title">
                            {translate('modals.modal_voucher_physical_card.success_card.title')}
                        </div>
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="flex flex-vertical flex-align-items-center flex-gap-lg">
                                <IconCardSuccess />
                                <TranslateHtml
                                    className={'modal-heading'}
                                    i18n={'modals.modal_voucher_physical_card.success_card.description'}
                                    values={{ code }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer text-center">
                        <button type="button" className="button button-primary" onClick={modal.close}>
                            {translate('modals.modal_voucher_physical_card.success_card.button')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
