import React, { useCallback, useEffect, useState } from 'react';
import FormError from '../../../../dashboard/components/elements/forms/errors/FormError';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import classNames from 'classnames';
import useFormBuilder from '../../../../dashboard/hooks/useFormBuilder';
import { ResponseError } from '../../../../dashboard/props/ApiResponses';
import { useProductReservationService } from '../../../services/ProductReservationService';
import Product from '../../../props/models/Product';

export type AddressType = {
    postal_code?: string;
    street?: string;
    house_nr?: string;
    house_nr_addition?: string;
    city?: string;
};

export default function BlockReservationAddress({
    addressProfile,
    address,
    product,
    onAddressSubmit,
    setIsEditingAddress,
}: {
    addressProfile: AddressType;
    address: AddressType;
    setAddress: React.Dispatch<React.SetStateAction<AddressType>>;
    setIsEditingAddress: React.Dispatch<React.SetStateAction<boolean>>;
    product: Product;
    onAddressSubmit: (save: boolean, values: AddressType) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const translate = useTranslate();
    const productReservationService = useProductReservationService();

    const validateAddress = useCallback(
        (values: AddressType) => {
            return productReservationService.validateAddress({
                street: values.street,
                house_nr: values.house_nr,
                house_nr_addition: values.house_nr_addition,
                city: values.city,
                postal_code: values.postal_code,
                product_id: product?.id,
            });
        },
        [product?.id, productReservationService],
    );

    const form = useFormBuilder<
        {
            city?: string;
            street?: string;
            house_nr?: string;
            house_nr_addition?: string;
            postal_code?: string;
        },
        { save: boolean }
    >(address || {}, (values, _e, data) => {
        setSubmitting(true);

        validateAddress(values)
            .then(() => {
                setEditing(false);
                form.setErrors(null);
                onAddressSubmit(data.save, form.values);
            })
            .catch((err: ResponseError) => {
                form.setErrors(err.data.errors);
            })
            .finally(() => {
                form.setIsLocked(false);
                setSubmitting(false);
            });
    });

    const getAddressString = useCallback((address: AddressType) => {
        return [address?.city, address?.street, address?.house_nr, address?.house_nr_addition, address?.postal_code]
            .filter((value) => value)
            .join(', ');
    }, []);

    const addressFilled = useCallback((address: AddressType) => {
        return !!(address?.city && address?.street && address?.house_nr && address?.postal_code);
    }, []);

    useEffect(() => {
        if (!address) {
            setEditing(true);
        }
    }, [address]);

    useEffect(() => {
        setIsEditingAddress(editing);
    }, [editing, setIsEditingAddress]);

    return (
        <div className={'block block-reservation-address form form-compact'} data-dusk={'productReserveAddress'}>
            {address && (
                <div
                    className={classNames('address-overview', editing && 'address-overview-edit')}
                    data-dusk={'productReserveAddressPreview'}>
                    <div className="address-overview-icon">
                        <em className="mdi mdi-map-marker-radius-outline" />
                    </div>
                    <div className="address-overview-details">
                        <div className="address-overview-details-title">Adres wijzigen</div>
                        <div
                            className="address-overview-details-subtitle"
                            data-dusk={'productReserveAddressPreviewText'}>
                            {getAddressString(address)}
                        </div>
                    </div>

                    <div className="address-overview-actions">
                        {!editing && (
                            <button
                                className="button button-text button-sm"
                                onClick={() => setEditing(true)}
                                data-dusk="productReserveAddressPreviewEdit">
                                <em className="mdi mdi-pencil-outline icon-start" />
                                Wijzigen
                            </button>
                        )}
                    </div>
                </div>
            )}
            {editing && (
                <div className="address-form" data-dusk="productReserveAddressForm">
                    <div className="address-form-title">Mijn adresgegevens</div>
                    <div className="row">
                        <div className="col col-xs-12 col-lg-6 form-group">
                            <label className="form-label" htmlFor="reservation_modal_street">
                                {translate('modal_reserve_product.fill_notes.labels.street')}
                            </label>
                            <input
                                className="form-control"
                                id="reservation_modal_street"
                                type="text"
                                value={form.values.street || ''}
                                onChange={(e) => form.update({ street: e.target.value })}
                                data-dusk="productReserveFormStreet"
                            />
                            <FormError error={form.errors?.street} />
                        </div>
                        <div className="col col-xs-12 col-lg-6">
                            <div className="row">
                                <div className="col col-xs-12 col-lg-6 form-group">
                                    <label className="form-label" htmlFor="reservation_modal_house_nr">
                                        {translate('modal_reserve_product.fill_notes.labels.house_nr')}
                                    </label>
                                    <input
                                        className="form-control"
                                        id="reservation_modal_house_nr"
                                        type="text"
                                        value={form.values.house_nr || ''}
                                        onChange={(e) => form.update({ house_nr: e.target.value })}
                                        data-dusk="productReserveFormHouseNumber"
                                    />
                                    <FormError error={form.errors?.house_nr} />
                                </div>
                                <div className="col col-xs-12 col-lg-6 form-group">
                                    <label className="form-label" htmlFor="reservation_modal_house_nr_addition">
                                        {translate('modal_reserve_product.fill_notes.labels.house_nr_addition')}
                                    </label>
                                    <input
                                        className="form-control"
                                        id="reservation_modal_house_nr_addition"
                                        type="text"
                                        value={form.values.house_nr_addition || ''}
                                        onChange={(e) => form.update({ house_nr_addition: e.target.value })}
                                        data-dusk="productReserveFormHouseNumberAddition"
                                    />
                                    <FormError error={form.errors?.house_nr_addition} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col col-xs-12 col-lg-6 form-group">
                            <label className="form-label" htmlFor="reservation_modal_postal_code">
                                {translate('modal_reserve_product.fill_notes.labels.postal_code')}
                            </label>
                            <input
                                className="form-control"
                                id="reservation_modal_postal_code"
                                type="text"
                                value={form.values.postal_code || ''}
                                onChange={(e) => form.update({ postal_code: e.target.value })}
                                data-dusk="productReserveFormPostalCode"
                            />
                            <FormError error={form.errors?.postal_code} />
                        </div>

                        <div className="col col-xs-12 col-lg-6 form-group">
                            <label className="form-label" htmlFor="reservation_modal_city">
                                {translate('modal_reserve_product.fill_notes.labels.city')}
                            </label>
                            <input
                                className="form-control"
                                id="reservation_modal_city"
                                type="text"
                                value={form.values.city || ''}
                                onChange={(e) => form.update({ city: e.target.value })}
                                data-dusk="productReserveFormCity"
                            />
                            <FormError error={form.errors?.city} />
                        </div>
                    </div>
                </div>
            )}
            {editing && (
                <div className="address-actions">
                    <div className="button-group">
                        <button
                            type="button"
                            className="button button-light button-sm"
                            disabled={Object.values(form.values).filter((value) => !!value).length === 0}
                            data-dusk="productReserveAddressFormClear"
                            onClick={() =>
                                form.update({
                                    postal_code: '',
                                    street: '',
                                    house_nr: '',
                                    house_nr_addition: '',
                                    city: '',
                                })
                            }>
                            Velden leeg maken
                        </button>
                    </div>
                    <div className="flex flex-grow" />
                    <div className="button-group">
                        {addressFilled(address) && (
                            <button
                                type="button"
                                className="button button-light button-sm"
                                data-dusk="productReserveAddressFormCancel"
                                disabled={submitting}
                                onClick={() => {
                                    setEditing(false);
                                    form.update(address);
                                    onAddressSubmit(false, address);
                                }}>
                                Annuleren
                            </button>
                        )}
                        {!addressProfile && (
                            <button
                                type="button"
                                className="button button-primary-outline button-sm"
                                disabled={submitting || !addressFilled(form.values)}
                                data-dusk="productReserveAddressFormApply"
                                onClick={() => form.submit(null, { save: false })}>
                                Doorgaan zonder opslaan
                            </button>
                        )}
                        <button
                            type="button"
                            className="button button-primary button-sm"
                            disabled={submitting || !addressFilled(form.values)}
                            data-dusk="productReserveAddressFormSave"
                            onClick={() => form.submit(null, { save: true })}>
                            Opslaan en doorgaan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
