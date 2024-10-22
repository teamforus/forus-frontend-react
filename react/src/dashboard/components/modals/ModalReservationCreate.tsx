import React, { useEffect, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import Organization from '../../props/models/Organization';
import Reservation from '../../props/models/Reservation';
import Product from '../../props/models/Product';
import useFormBuilder from '../../hooks/useFormBuilder';
import useVoucherService from '../../services/VoucherService';
import useProductReservationService from '../../services/ProductReservationService';
import FormError from '../elements/forms/errors/FormError';
import SelectControl from '../elements/select-control/SelectControl';
import SelectControlOptions from '../elements/select-control/templates/SelectControlOptions';
import FormGroupInfo from '../elements/forms/elements/FormGroupInfo';
import useTranslate from '../../hooks/useTranslate';
import classNames from 'classnames';
import TranslateHtml from '../elements/translate-html/TranslateHtml';

export default function ModalReservationCreate({
    modal,
    className,
    onCreated,
    organization,
}: {
    modal: ModalState;
    className?: string;
    onCreated: (reservation: Reservation) => void;
    organization: Organization;
}) {
    const translate = useTranslate();
    const voucherService = useVoucherService();
    const productReservationService = useProductReservationService();

    const [step, setStep] = useState<'voucher' | 'product' | 'overview'>('voucher');
    const [products, setProducts] = useState<Array<Partial<Product>>>(null);
    const [product, setProduct] = useState<Partial<Product>>(null);

    const formVouchers = useFormBuilder({ number: '' }, (values) => {
        voucherService
            .readProvider(values.number || 'null')
            .then((res) => {
                const voucher = res.data.data;

                if (voucher.fund.type === 'subsidies' && !organization.reservations_subsidy_enabled) {
                    // Your organization doesn't allow action products reservations.
                    return formVouchers.setErrors({
                        number: 'Uw organisatie mag geen reserveringen aanmaken voor kortingspassen. Neem contact op met support!',
                    });
                }

                if (voucher.fund.type === 'budget' && !organization.reservations_budget_enabled) {
                    // Your organization doesn't allow budget products reservations.
                    return formVouchers.setErrors({
                        number: 'Uw organisatie mag geen reserveringen aanmaken voor budgetten. Neem contact op met support!',
                    });
                }

                if (!voucher.allowed_organizations.map((item) => item.id).includes(organization.id)) {
                    // The voucher is valid but can't be used with current organization.
                    return formVouchers.setErrors({
                        number: 'Deze tegoed is geldig maar mag niet gescant worden door uw organisatie.',
                    });
                }

                voucherService
                    .readProviderProducts(values.number, {
                        organization_id: organization.id,
                        per_page: 100,
                        reservable: 1,
                    })
                    .then((res) => {
                        const products = res.data.data;
                        const productsId = products.map((item) => item.id);

                        if (products.length === 0) {
                            // Voucher is valid, but there are no products available for this number.
                            return formVouchers.setErrors({
                                number: 'Deze tegoed is geldig maar er zijn tegoeden beschikbaar voor het gekozen product.',
                            });
                        }

                        if (!productsId.includes(formProducts.values?.product_id)) {
                            formProducts.update({ product_id: null });
                        }

                        setProducts([{ id: null, name: 'Select product...' }, ...res.data.data]);
                        setStep('product');
                    })
                    .finally(() => formVouchers.setIsLocked(false));
            })
            .catch((res) => {
                const { errors, message } = res.data;
                formVouchers.setErrors({ number: errors ? errors.number : [message] });
            })
            .finally(() => formVouchers.setIsLocked(false));
    });

    const formProducts = useFormBuilder(
        {
            note: '',
            product_id: null,
        },
        (values) => {
            const data = { ...values, number: formVouchers.values.number };

            productReservationService
                .store(organization.id, data)
                .then((res) => {
                    onCreated(res.data.data);
                    modal.close();
                })
                .catch((res) => {
                    const { errors, message } = res.data;

                    formProducts.setErrors({ product_id: errors ? errors.product_id || errors.number : [message] });
                    setStep('product');
                })
                .finally(() => formProducts.setIsLocked(false));
        },
    );

    useEffect(() => {
        setProduct(products?.find((item) => item.id == formProducts.values.product_id));
    }, [formProducts?.values?.product_id, products]);

    return (
        <div
            className={classNames(
                'modal',
                'modal-animated',
                'modal-reservation-create',
                modal.loading && 'modal-loading',
                className,
            )}>
            <div className="modal-backdrop" onClick={modal.close} />
            {step === 'voucher' && (
                <form className="modal-window form" onSubmit={formVouchers.submit}>
                    <div className="modal-close mdi mdi-close" onClick={modal.close} />
                    <div className="modal-header">Reservering aanmaken</div>
                    <div className="modal-body modal-body-visible">
                        <div className="modal-section">
                            <div className="modal-text text-center">
                                Vul het pasnummer van de klant in. Vraag de klant naar de <br />
                                persoonlijke 12-cijferige code die op de pas staat.
                            </div>
                            <div className="row">
                                <div className="col col-sm-11 col-xs-12">
                                    <div className="form-group form-group-inline form-group-inline-md">
                                        <label className="form-label form-label-required">Pasnummer</label>
                                        <input
                                            className="form-control"
                                            type="number"
                                            placeholder="Nummer"
                                            value={formVouchers.values.number || ''}
                                            onChange={(e) => formVouchers.update({ number: e.target.value })}
                                            step={1}
                                            min={1}
                                        />
                                        <FormError error={formVouchers.errors.number} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer text-center">
                        <button className="button button-default" type="button" onClick={() => modal.close()}>
                            {translate('modals.modal_voucher_create.buttons.cancel')}
                        </button>
                        <button className="button button-primary" type="submit">
                            {translate('modals.modal_voucher_create.buttons.submit')}
                        </button>
                    </div>
                </form>
            )}
            {step === 'product' && (
                <form className="modal-window form" onSubmit={() => setStep('overview')}>
                    <div className="modal-close mdi mdi-close" onClick={modal.close} />
                    <div className="modal-header">Aanbieding selecteren</div>
                    <div className="modal-body modal-body-visible">
                        <div className="modal-section">
                            <div className="modal-text text-center">
                                Kies het aanbod waarvoor u de reservering wilt aanmaken. <br />
                                De notitie wordt toegevoegd aan het transactieoverzicht.
                            </div>
                            <div className="row">
                                <div className="col col-sm-11 col-xs-12">
                                    <div className="form-group form-group-inline form-group-inline-md">
                                        <label className="form-label">Aanbod</label>
                                        <div className="form-offset">
                                            <FormGroupInfo
                                                info={<TranslateHtml i18n={'reservation_create.tooltips.product'} />}>
                                                <SelectControl
                                                    className="form-control"
                                                    propKey={'id'}
                                                    options={products}
                                                    value={formProducts.values.product_id}
                                                    onChange={(product_id: number) =>
                                                        formProducts.update({ product_id })
                                                    }
                                                    optionsComponent={SelectControlOptions}
                                                />
                                            </FormGroupInfo>
                                        </div>
                                        <FormError error={formProducts.errors.product_id} />
                                    </div>
                                    <div className="form-group form-group-inline form-group-inline-md">
                                        <label className="form-label form-label-required">Notitie</label>
                                        <textarea
                                            className="form-control"
                                            placeholder="Notitie"
                                            value={formProducts.values.note}
                                            onChange={(e) => formProducts.update({ note: e.target.value })}
                                        />
                                        <FormError error={formProducts.errors.note} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer text-center">
                        <button className="button button-default" type="button" onClick={() => setStep('voucher')}>
                            Annuleren
                        </button>
                        <button className="button button-primary" type="submit">
                            Bevestigen
                        </button>
                    </div>
                </form>
            )}
            {step === 'overview' && (
                <form className="modal-window form" onSubmit={formProducts.submit}>
                    <div className="modal-close mdi mdi-close" onClick={modal.close} />
                    <div className="modal-header">Aanbieding selecteren</div>
                    <div className="modal-body modal-body-visible">
                        <div className="modal-section">
                            <div className="modal-text text-center">
                                Controleer of u de juiste gegevens heeft ingevuld. Na bevestiging wordt de reservering
                                aangemaakt.
                            </div>
                            <div className="row">
                                <div className="col col-lg-8 col-lg-offset-2">
                                    <div className="block block-compact-datalist">
                                        <div className="datalist-row">
                                            <div className="datalist-key">
                                                <strong>Pasnummer</strong>
                                            </div>
                                            <div className="datalist-value text-primary text-right">
                                                <strong>{formVouchers.values.number}</strong>
                                            </div>
                                        </div>
                                        <div className="datalist-row">
                                            <div className="datalist-key">
                                                <strong>Aanbod</strong>
                                            </div>
                                            <div className="datalist-value text-primary text-right">
                                                <strong>{product?.name}</strong>
                                            </div>
                                        </div>
                                        <div className="datalist-row">
                                            <div className="datalist-key">
                                                <strong>Bedrag</strong>
                                            </div>
                                            <div className="datalist-value text-primary text-right">
                                                <strong>{product?.price_locale}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer text-center">
                        <button className="button button-default" type={'button'} onClick={() => setStep('product')}>
                            Annuleren
                        </button>
                        <button className="button button-primary" type="submit">
                            Bevestigen
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
