import React, { FormEvent, useCallback, useMemo, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import useSetProgress from '../../hooks/useSetProgress';
import SponsorVoucher from '../../props/models/Sponsor/SponsorVoucher';
import FormError from '../elements/forms/errors/FormError';
import { usePhysicalCardsRequestService } from '../../services/PhysicalCardsRequestService';
import useTranslate from '../../hooks/useTranslate';
import { ResponseError } from '../../props/ApiResponses';
import usePushApiError from '../../hooks/usePushApiError';
import FormGroup from '../elements/forms/elements/FormGroup';
import SelectControl from '../elements/select-control/SelectControl';

export default function ModalOrderPhysicalCard({
    modal,
    voucher,
    className,
    onRequested,
}: {
    modal: ModalState;
    voucher: SponsorVoucher;
    className?: string;
    onRequested: () => void;
}) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const setProgress = useSetProgress();

    const physicalCardsRequestService = usePhysicalCardsRequestService();

    const [state, setState] = useState<'form' | 'confirmation' | 'success'>('form');
    const [addressPreview, setAddressPreview] = useState<string[]>([]);

    const types = useMemo(() => {
        return voucher?.fund?.fund_physical_card_types.map((type) => ({
            ...type,
            name: type.physical_card_type?.name,
        }));
    }, [voucher?.fund?.fund_physical_card_types]);

    const form = useFormBuilder<{
        address: string;
        house: string;
        house_addition: string;
        postcode: string;
        city: string;
        fund_physical_card_type_id?: number;
    }>(
        {
            address: '',
            house: '',
            house_addition: '',
            postcode: '',
            city: '',
            fund_physical_card_type_id: voucher?.fund?.fund_physical_card_types?.[0]?.id,
        },
        async (values) => {
            setProgress(0);

            physicalCardsRequestService
                .store(voucher.fund.organization_id, voucher.address, values)
                .then(() => {
                    form.setErrors(null);
                    setState('success');
                    onRequested();
                })
                .catch((err: ResponseError) => {
                    form.setIsLocked(false);
                    form.setErrors(err.data.errors);
                    pushApiError(err);
                    setState('form');
                })
                .finally(() => setProgress(100));
        },
    );

    const requestCard = useCallback(
        (e?: FormEvent<HTMLFormElement>) => {
            e?.preventDefault();
            setProgress(0);

            physicalCardsRequestService
                .validate(voucher.fund.organization_id, voucher.address, form.values)
                .then(() => {
                    const { address, house, house_addition, postcode, city } = form.values;

                    form.setErrors(null);
                    setState('confirmation');

                    setAddressPreview([
                        [address, house, house_addition].filter((value) => value).join(' '),
                        [postcode, city].filter((value) => value).join(' '),
                    ]);
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data.errors);
                    pushApiError(err);
                })
                .finally(() => setProgress(100));
        },
        [form, physicalCardsRequestService, pushApiError, setProgress, voucher.address, voucher.fund.organization_id],
    );

    return (
        <div
            className={`modal modal-animated modal-physical-card-order ${state === 'form' ? 'modal-sm' : 'modal-md'} ${
                modal.loading ? 'modal-loading' : ''
            } ${className}`}>
            <div className="modal-backdrop" onClick={modal.close} />

            {state == 'form' && (
                <form className="modal-window form" onSubmit={requestCard}>
                    <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                    <div className="modal-header">
                        {translate('modals.modal_physical_card_order.modal_section.request_new_card.title', {
                            fund_name: voucher.fund.name,
                        })}
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-heading text-center">
                                {translate(
                                    'modals.modal_physical_card_order.modal_section.request_new_card.description',
                                )}
                            </div>
                            <FormGroup
                                label={'Card type'}
                                error={form.errors?.physical_card_type_id}
                                input={(id) => (
                                    <SelectControl
                                        id={id}
                                        propKey={'id'}
                                        propValue={'name'}
                                        className={'form-control'}
                                        value={form.values.fund_physical_card_type_id}
                                        options={types}
                                        onChange={(fund_physical_card_type_id?: number) => {
                                            form.update({ fund_physical_card_type_id });
                                        }}
                                    />
                                )}
                            />

                            <div className="form-group">
                                <label
                                    className="form-label form-label-required"
                                    htmlFor="modals.modal_physical_card_order.modal_section.request_new_card.address">
                                    {translate(
                                        'modals.modal_physical_card_order.modal_section.request_new_card.address',
                                    )}
                                </label>

                                <input
                                    className="form-control"
                                    id="modals.modal_physical_card_order.modal_section.request_new_card.address"
                                    defaultValue={form.values.address}
                                    placeholder={translate(
                                        'modals.modal_physical_card_order.modal_section.request_new_card.address_placeholder',
                                    )}
                                    onChange={(e) => form.update({ address: e.target.value })}
                                />

                                <FormError error={form.errors?.address} />
                            </div>

                            <div className="form-group">
                                <label
                                    className="form-label form-label-required"
                                    htmlFor="modals.modal_physical_card_order.modal_section.request_new_card.house">
                                    {translate('modals.modal_physical_card_order.modal_section.request_new_card.house')}
                                </label>

                                <input
                                    className="form-control"
                                    id="modals.modal_physical_card_order.modal_section.request_new_card.house"
                                    defaultValue={form.values.house}
                                    placeholder={translate(
                                        'modals.modal_physical_card_order.modal_section.request_new_card.house_placeholder',
                                    )}
                                    onChange={(e) => form.update({ house: e.target.value })}
                                />

                                <FormError error={form.errors?.house} />
                            </div>

                            <div className="form-group">
                                <label
                                    className="form-label"
                                    htmlFor="modals.modal_physical_card_order.modal_section.request_new_card.house_addition">
                                    {translate(
                                        'modals.modal_physical_card_order.modal_section.request_new_card.house_addition',
                                    )}
                                </label>

                                <input
                                    className="form-control"
                                    defaultValue={form.values.house_addition}
                                    id="modals.modal_physical_card_order.modal_section.request_new_card.house_addition"
                                    placeholder={translate(
                                        'modals.modal_physical_card_order.modal_section.request_new_card.house_addition_placeholder',
                                    )}
                                    onChange={(e) => form.update({ house_addition: e.target.value })}
                                />

                                <FormError error={form.errors?.house_addition} />
                            </div>

                            <div className="form-group">
                                <label
                                    className="form-label form-label-required"
                                    htmlFor="modals.modal_physical_card_order.modal_section.request_new_card.postcode">
                                    {translate(
                                        'modals.modal_physical_card_order.modal_section.request_new_card.postcode',
                                    )}
                                </label>

                                <input
                                    className="form-control"
                                    defaultValue={form.values.postcode}
                                    id="modals.modal_physical_card_order.modal_section.request_new_card.postcode"
                                    placeholder={translate(
                                        'modals.modal_physical_card_order.modal_section.request_new_card.postcode_placeholder',
                                    )}
                                    onChange={(e) => form.update({ postcode: e.target.value })}
                                />

                                <FormError error={form.errors?.postcode} />
                            </div>

                            <div className="form-group">
                                <label
                                    className="form-label form-label-required"
                                    htmlFor="modals.modal_physical_card_order.modal_section.request_new_card.city">
                                    {translate('modals.modal_physical_card_order.modal_section.request_new_card.city')}
                                </label>

                                <input
                                    className="form-control"
                                    defaultValue={form.values.city}
                                    id="modals.modal_physical_card_order.modal_section.request_new_card.city"
                                    placeholder={translate(
                                        'modals.modal_physical_card_order.modal_section.request_new_card.city_placeholder',
                                    )}
                                    onChange={(e) => form.update({ city: e.target.value })}
                                />

                                <FormError error={form.errors?.city} />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="button-group flex-center">
                            <button className="button button-default" type="button" onClick={modal.close}>
                                {translate('modals.modal_physical_card_order.buttons.request_new_card.cancel')}
                            </button>

                            <button className="button button-primary" type="submit">
                                {translate('modals.modal_physical_card_order.buttons.request_new_card.confirm')}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {state == 'confirmation' && (
                <div className="modal-window">
                    <div className="modal-close mdi mdi-close" onClick={modal.close} aria-label="close" role="button" />

                    <div className="modal-header">
                        {translate('modals.modal_physical_card_order.modal_section.confirm_card.header')}
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-text text-center">
                                {translate('modals.modal_physical_card_order.modal_section.confirm_card.title')}
                                <br />
                                <br />
                                {addressPreview.map((line, index) => (
                                    <div key={index} className="text-strong">
                                        {line}
                                    </div>
                                ))}
                                <br />
                                {translate('modals.modal_physical_card_order.modal_section.confirm_card.description')}
                                <br /> <br />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="button-group flex-center">
                            <button className="button button-default" type="button" onClick={() => setState('form')}>
                                {translate('modals.modal_physical_card_order.buttons.confirm_card.adjust')}
                            </button>
                            <button className="button button-primary" type="button" onClick={() => form.submit()}>
                                {translate('modals.modal_physical_card_order.buttons.confirm_card.submit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {state == 'success' && (
                <div className="modal-window">
                    <div className="modal-close mdi mdi-close" onClick={modal.close} aria-label="close" role="button" />

                    <div className="modal-header">
                        {translate('modals.modal_physical_card_order.modal_section.request_card_success.title')}
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-text text-center">
                                <div className="modal-heading-icon">
                                    <div className="mdi mdi-check-circle-outline" />
                                </div>
                                <div className="modal-heading">
                                    {translate(
                                        'modals.modal_physical_card_order.modal_section.request_card_success.title',
                                    )}
                                </div>
                                <div className="modal-text">
                                    {translate(
                                        'modals.modal_physical_card_order.modal_section.request_card_success.heading',
                                    )}
                                    <br />
                                    <br />
                                    <div>{addressPreview[0]}</div>
                                    <div>{addressPreview[1]}</div>
                                    <br />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="button-group flex-center">
                            <button className="button button-primary" type="button" onClick={modal.close}>
                                {translate('modals.modal_physical_card_order.buttons.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
