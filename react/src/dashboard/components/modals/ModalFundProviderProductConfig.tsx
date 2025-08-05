import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import Fund from '../../props/models/Fund';
import useTranslate from '../../hooks/useTranslate';
import { ResponseError } from '../../props/ApiResponses';
import useSetProgress from '../../hooks/useSetProgress';
import usePushApiError from '../../hooks/usePushApiError';
import classNames from 'classnames';
import FundProvider from '../../props/models/FundProvider';
import FormGroupInfo from '../elements/forms/elements/FormGroupInfo';
import { useFundService } from '../../services/FundService';
import SponsorProduct from '../../props/models/Sponsor/SponsorProduct';
import SelectControl from '../elements/select-control/SelectControl';
import CheckboxControl from '../elements/forms/controls/CheckboxControl';
import FormGroup from '../elements/forms/elements/FormGroup';
import DatePickerControl from '../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../helpers/dates';
import { currencyFormat } from '../../helpers/string';
import usePushSuccess from '../../hooks/usePushSuccess';
import FormPane from '../elements/forms/elements/FormPane';

export default function ModalFundProviderProductConfig({
    modal,
    onUpdate,
    fundProvider,
    product,
    fund,
}: {
    modal: ModalState;
    onUpdate: (product: FundProvider) => void;
    fundProvider: FundProvider;
    product: SponsorProduct;
    fund: Fund;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const fundService = useFundService();

    const [budgetExtendedSettings, setBudgetExtendedSettings] = useState(false);
    const [hasExtendedSettings] = useState(fund?.show_qr_limits || fund?.show_requester_limits);

    const deal = useMemo(() => {
        return product.deals_history.find((deal) => deal.active) || null;
    }, [product.deals_history]);

    const stockAmount = useMemo(
        () => (product.unlimited_stock ? 100 : product.stock_amount),
        [product.stock_amount, product.unlimited_stock],
    );

    const form = useFormBuilder<{
        expire_at?: string;
        expires_with_fund?: 0 | 1;
        limit_total?: number;
        limit_total_unlimited?: boolean;
        limit_per_identity?: number;
        limit_per_identity_unlimited?: boolean;
        amount?: string;
        gratis?: boolean;
        payment_type?: 'budget' | 'subsidy';
        allow_scanning?: 0 | 1;
    }>(
        deal
            ? {
                  payment_type: deal.payment_type,
                  allow_scanning: deal.allow_scanning ? 1 : 0,
                  expire_at: deal.expire_at ? deal.expire_at : fundProvider.fund.end_date,
                  expires_with_fund: !deal.expire_at ? 1 : 0,
                  limit_total: product.unlimited_stock
                      ? deal.limit_total
                      : Math.min(deal.limit_total, product.stock_amount),
                  limit_total_unlimited: deal.limit_total_unlimited ?? true,
                  limit_per_identity: product.unlimited_stock
                      ? deal.limit_per_identity
                      : Math.min(deal.limit_per_identity, product.stock_amount),
                  limit_per_identity_unlimited: deal.limit_per_identity_unlimited ?? true,
                  ...(deal.payment_type === 'subsidy'
                      ? { amount: deal.amount, gratis: deal.amount === product.price }
                      : {}),
              }
            : {
                  payment_type: 'budget',
                  allow_scanning: 1,
                  expire_at: fundProvider.fund.end_date,
                  expires_with_fund: 1,
                  limit_total: stockAmount,
                  limit_total_unlimited: true,
                  limit_per_identity: stockAmount,
                  limit_per_identity_unlimited: true,
                  amount: '',
                  gratis: false,
              },
        (values) => {
            setProgress(0);

            const { payment_type, allow_scanning, expire_at, expires_with_fund, gratis, amount } = values;

            const {
                limit_total,
                limit_per_identity,
                limit_total_unlimited = true,
                limit_per_identity_unlimited = true,
            } = values;

            const extendedSettings =
                payment_type === 'subsidy' ||
                (payment_type === 'budget' && hasExtendedSettings && budgetExtendedSettings);

            const productData = {
                id: product.id,
                ...{ payment_type },
            };

            const productDataExtended = {
                amount: payment_type === 'budget' ? null : gratis ? product.price : amount,
                expire_at: expires_with_fund ? null : expire_at,
                allow_scanning: allow_scanning,
                limit_total: limit_total_unlimited ? null : limit_total,
                limit_total_unlimited,
                limit_per_identity: limit_per_identity_unlimited ? null : limit_per_identity,
                limit_per_identity_unlimited,
            };

            const stripPrefixFromKeys = function (obj: object, prefix: string) {
                return Object.fromEntries(
                    Object.entries(obj).map(([key, value]) => [
                        key.startsWith(prefix) ? key.slice(prefix.length) : key,
                        value,
                    ]),
                );
            };

            fundService
                .updateProvider(fund.organization_id, fund.id, fundProvider.id, {
                    enable_products: [
                        {
                            ...productData,
                            amount: null,
                            expire_at: null,
                            allow_scanning: 1,
                            limit_total: null,
                            limit_total_unlimited: true,
                            limit_per_identity: null,
                            limit_per_identity_unlimited: true,
                            ...(extendedSettings ? productDataExtended : {}),
                        },
                    ],
                })
                .then((res) => {
                    onUpdate(res.data.data);
                    pushSuccess('Gelukt!', 'Product geaccepteerd.');
                    modal.close();
                })
                .catch((err: ResponseError) => {
                    form.setErrors(stripPrefixFromKeys(err.data?.errors || {}, 'enable_products.0.'));
                    pushApiError(err);
                })
                .finally(() => {
                    form.setIsLocked(false);
                    setProgress(100);
                });
        },
    );

    useEffect(() => {
        if (deal?.payment_type === 'budget') {
            if (deal.limit_total || deal.limit_per_identity || !deal.allow_scanning || deal.expire_at) {
                setBudgetExtendedSettings(true);
            }
        }
    }, [deal]);

    return (
        <div className={classNames('modal', 'modal-animated', 'modal-md', modal.loading && 'modal-loading')}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">Stel een limiet in</div>

                <div className="modal-body">
                    <div className="modal-section">
                        <div className="flex flex-vertical flex-gap">
                            <FormPane title={'Type aanbod'}>
                                <FormGroupInfo
                                    info={<Fragment>Het type aanbod dat wordt ingesteld voor dit product.</Fragment>}
                                    error={form.errors.payment_type}>
                                    <SelectControl
                                        id={'select_provider'}
                                        value={form.values.payment_type}
                                        propKey={'key'}
                                        propValue={'label'}
                                        multiline={true}
                                        allowSearch={true}
                                        onChange={(payment_type: 'budget' | 'subsidy') => form.update({ payment_type })}
                                        options={[
                                            { key: 'budget', label: 'Budget' },
                                            fund?.show_subsidies ? { key: 'subsidy', label: 'Subsidie' } : null,
                                        ].filter((item) => item)}
                                    />
                                </FormGroupInfo>

                                {form.values.payment_type === 'budget' && hasExtendedSettings && (
                                    <CheckboxControl
                                        checked={budgetExtendedSettings}
                                        flat={true}
                                        onChange={(e) => setBudgetExtendedSettings(e.target.checked)}
                                        title={'Aangepaste instellingen'}
                                    />
                                )}
                            </FormPane>

                            {form.values.payment_type === 'subsidy' && (
                                <FormPane title={'Bijdrage van de sponsor'}>
                                    <FormGroupInfo
                                        info={
                                            <Fragment>
                                                Bijdrage vanuit de sponsor. Bij een volledige bijdrage is het aanbod
                                                voor de inwoner gratis.
                                            </Fragment>
                                        }
                                        error={form.errors.amount}>
                                        {form.values.gratis ? (
                                            <input className="form-control" disabled={true} value={product.price} />
                                        ) : (
                                            <input
                                                className="form-control"
                                                disabled={form.values.gratis}
                                                value={form.values.amount ?? ''}
                                                onChange={(e) => {
                                                    form.update({ amount: e.target.value });
                                                }}
                                                type="number"
                                                placeholder="Bijdrage"
                                                step=".05"
                                                min={0}
                                            />
                                        )}
                                    </FormGroupInfo>

                                    {(product.price_type === 'free' || product.price_type === 'regular') && (
                                        <CheckboxControl
                                            title={'Volledige bijdrage'}
                                            checked={form.values.gratis}
                                            onChange={(e) => {
                                                form.update({ gratis: e.target.checked });
                                            }}
                                        />
                                    )}
                                </FormPane>
                            )}

                            {(form.values.payment_type === 'subsidy' ||
                                (form.values.payment_type === 'budget' &&
                                    hasExtendedSettings &&
                                    budgetExtendedSettings)) && (
                                <Fragment>
                                    {fund.show_qr_limits && (
                                        <FormPane title={'Toon QR-code op de webshop'}>
                                            <FormGroupInfo
                                                info={
                                                    <Fragment>
                                                        Met deze optie stelt de sponsor in of het QR-logo als
                                                        betaaloptie voor dit aanbod zichtbaar is in de webshop.
                                                    </Fragment>
                                                }
                                                error={form.errors.allow_scanning}>
                                                <SelectControl
                                                    id={'allow_scanning'}
                                                    value={form.values.allow_scanning}
                                                    propKey={'key'}
                                                    propValue={'label'}
                                                    multiline={true}
                                                    allowSearch={true}
                                                    onChange={(allow_scanning: 1 | 0) =>
                                                        form.update({ allow_scanning })
                                                    }
                                                    options={[
                                                        { key: 1, label: 'Ja' },
                                                        { key: 0, label: 'Nee' },
                                                    ]}
                                                />
                                            </FormGroupInfo>
                                        </FormPane>
                                    )}

                                    {fund.show_requester_limits && (
                                        <FormPane title={'Verloopdatum van het aanbod'}>
                                            <div className="row">
                                                <div className="col col-md-6 col col-md-xs12">
                                                    <FormGroup
                                                        label={'Einddatum'}
                                                        input={(id) => (
                                                            <FormGroupInfo
                                                                info={
                                                                    <Fragment>
                                                                        Stel hier in tot wanneer het aanbod geldig is.
                                                                        Standaard staat de verloopdatum gelijk aan de
                                                                        einddatum van de regeling.
                                                                    </Fragment>
                                                                }>
                                                                <SelectControl
                                                                    id={id}
                                                                    value={form.values.expires_with_fund ? 1 : 0}
                                                                    propKey={'key'}
                                                                    propValue={'label'}
                                                                    multiline={true}
                                                                    allowSearch={true}
                                                                    onChange={(expires_with_fund: 1 | 0) => {
                                                                        form.update({ expires_with_fund });
                                                                    }}
                                                                    options={[
                                                                        {
                                                                            key: 1,
                                                                            label: 'Verloopt met einddatum regeling',
                                                                        },
                                                                        { key: 0, label: 'Aangepaste verloopdatum' },
                                                                    ]}
                                                                />
                                                            </FormGroupInfo>
                                                        )}
                                                    />
                                                </div>
                                                <div className="col col-md-6 col col-md-xs12">
                                                    <FormGroup
                                                        label={'Verloopdatum'}
                                                        error={form.errors['enable_products.0.expire_at']}
                                                        input={() => (
                                                            <FormGroupInfo
                                                                info={
                                                                    <Fragment>
                                                                        De datum tot wanneer het aanbod geldig is.
                                                                    </Fragment>
                                                                }
                                                                error={form.errors.expire_at}>
                                                                <DatePickerControl
                                                                    disabled={!!form.values.expires_with_fund}
                                                                    value={dateParse(
                                                                        form.values.expires_with_fund
                                                                            ? fund.end_date
                                                                            : form.values.expire_at,
                                                                    )}
                                                                    placeholder={translate('jjjj-MM-dd')}
                                                                    onChange={(date) => {
                                                                        if (!form.values.expires_with_fund) {
                                                                            form.update({
                                                                                expire_at: dateFormat(date),
                                                                            });
                                                                        }
                                                                    }}
                                                                />
                                                            </FormGroupInfo>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </FormPane>
                                    )}

                                    {fund.show_requester_limits && (
                                        <FormPane title={'Limiet op het aanbod'}>
                                            <div className="row">
                                                <div className="col col-md-6 col col-md-xs12">
                                                    <FormGroup
                                                        label={
                                                            product.unlimited_stock
                                                                ? 'Totaal aantal (onbeperkt beschikbaar)'
                                                                : `Totaal aantal (${product.stock_amount} beschikbaar)`
                                                        }
                                                        input={(id) => (
                                                            <Fragment>
                                                                <FormGroupInfo
                                                                    info={
                                                                        <Fragment>
                                                                            Totaal aantal keren dat er gebruik kan
                                                                            worden gemaakt van dit aanbod.
                                                                        </Fragment>
                                                                    }
                                                                    error={form.errors.limit_total}>
                                                                    <input
                                                                        id={id}
                                                                        className="form-control"
                                                                        required={true}
                                                                        onChange={(e) => {
                                                                            form.update({
                                                                                limit_total: e.target.value
                                                                                    ? parseFloat(e.target.value)
                                                                                    : null,
                                                                            });
                                                                        }}
                                                                        type="number"
                                                                        value={
                                                                            form.values.limit_total_unlimited
                                                                                ? ''
                                                                                : form.values.limit_total || ''
                                                                        }
                                                                        placeholder="Totaal aantal"
                                                                        disabled={form.values.limit_total_unlimited}
                                                                        min={1}
                                                                        max={
                                                                            product.unlimited_stock
                                                                                ? ''
                                                                                : product.stock_amount
                                                                        }
                                                                    />
                                                                </FormGroupInfo>
                                                                <CheckboxControl
                                                                    title={'Niet beperken'}
                                                                    checked={form.values.limit_total_unlimited}
                                                                    onChange={(e) => {
                                                                        form.update({
                                                                            limit_total_unlimited: e.target.checked,
                                                                        });
                                                                    }}
                                                                />
                                                            </Fragment>
                                                        )}
                                                    />
                                                </div>
                                                <div className="col col-md-6 col col-md-xs12">
                                                    <FormGroup
                                                        label={
                                                            product.unlimited_stock
                                                                ? 'Aantal per aanvrager (onbeperkt beschikbaar)'
                                                                : `Aantal per aanvrager (${product.stock_amount} beschikbaar)`
                                                        }
                                                        error={form.errors['enable_products.0.expire_at']}
                                                        input={(id) => (
                                                            <Fragment>
                                                                <FormGroupInfo
                                                                    info={
                                                                        <Fragment>
                                                                            Hoe vaak dit aanbod mag worden gebruikt per
                                                                            tegoed. Let op: als er meerdere personen aan
                                                                            het tegoed zijn toegevoegd, geldt dit aantal
                                                                            per persoon.
                                                                        </Fragment>
                                                                    }
                                                                    error={form.errors.limit_per_identity}>
                                                                    <input
                                                                        id={id}
                                                                        className="form-control"
                                                                        required={true}
                                                                        value={
                                                                            form.values.limit_per_identity_unlimited
                                                                                ? ''
                                                                                : form.values.limit_per_identity || ''
                                                                        }
                                                                        onChange={(e) =>
                                                                            form.update({
                                                                                limit_per_identity: e.target.value
                                                                                    ? parseFloat(e.target.value)
                                                                                    : null,
                                                                            })
                                                                        }
                                                                        type="number"
                                                                        disabled={
                                                                            form.values.limit_per_identity_unlimited
                                                                        }
                                                                        placeholder="Aantal per aanvrager"
                                                                        min={1}
                                                                        max={
                                                                            product.unlimited_stock
                                                                                ? ''
                                                                                : product.stock_amount
                                                                        }
                                                                    />
                                                                </FormGroupInfo>
                                                                <CheckboxControl
                                                                    title={'Niet beperken'}
                                                                    checked={form.values.limit_per_identity_unlimited}
                                                                    onChange={(e) => {
                                                                        form.update({
                                                                            limit_per_identity_unlimited:
                                                                                e.target.checked,
                                                                        });
                                                                    }}
                                                                />
                                                            </Fragment>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </FormPane>
                                    )}
                                </Fragment>
                            )}

                            {form.values.payment_type === 'subsidy' && (
                                <div className="block block-provider-product-overview">
                                    <div className="provider-product-overview-title">Transactie details</div>
                                    <div className="row">
                                        {(product.price_type === 'free' || product.price_type === 'regular') && (
                                            <div className="col col-md-3 col-xs-3">
                                                <div className="provider-product-overview-label">Totaalprijs</div>
                                                <div className="provider-product-overview-value">
                                                    {product.price_locale}
                                                </div>
                                            </div>
                                        )}

                                        {(product.price_type === 'discount_fixed' ||
                                            product.price_type === 'discount_percentage') && (
                                            <div className="col col-md-3 col-xs-3">
                                                <div className="provider-product-overview-label">Korting</div>
                                                {product.price_type === 'discount_fixed' && (
                                                    <div className="provider-product-overview-value">
                                                        {currencyFormat(parseFloat(product.price_discount))}
                                                    </div>
                                                )}

                                                {product.price_type === 'discount_percentage' && (
                                                    <div className="provider-product-overview-value">
                                                        {product.price_discount + '%'}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="col col-md-3 col-xs-3">
                                            <div className="provider-product-overview-label">Sponsor betaalt</div>
                                            <div className="provider-product-overview-value">
                                                {currencyFormat(
                                                    parseFloat(
                                                        form.values?.gratis
                                                            ? product.price
                                                            : form.values?.amount?.toString() || deal?.amount || '0',
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                        {product.price_type === 'regular' && (
                                            <div className="col col-md-3 col-xs-3">
                                                <div className="provider-product-overview-label">
                                                    Prijs voor de klant
                                                </div>
                                                <div className="provider-product-overview-value">
                                                    {currencyFormat(
                                                        Math.max(
                                                            0,
                                                            form.values?.gratis
                                                                ? 0
                                                                : parseFloat(product.price) -
                                                                      parseFloat(
                                                                          form.values?.amount?.toString() ||
                                                                              deal?.amount ||
                                                                              '0',
                                                                      ),
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        {translate('modals.modal_voucher_create.buttons.cancel')}
                    </button>

                    <button type="submit" className="button button-primary">
                        {translate('modals.modal_voucher_create.buttons.submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}
