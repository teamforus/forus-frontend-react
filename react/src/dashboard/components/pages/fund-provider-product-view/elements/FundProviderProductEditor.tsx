import React, { useEffect, useMemo } from 'react';
import Tooltip from '../../../elements/tooltip/Tooltip';
import FormError from '../../../elements/forms/errors/FormError';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import { ResponseError } from '../../../../props/ApiResponses';
import DatePickerControl from '../../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../../helpers/dates';
import Product, { DealHistory } from '../../../../props/models/Product';
import Fund from '../../../../props/models/Fund';
import FundProvider from '../../../../props/models/FundProvider';
import { useFundService } from '../../../../services/FundService';
import useTranslate from '../../../../hooks/useTranslate';

export default function FundProviderProductEditor({
    deal,
    fund,
    product,
    onReset,
    onCancel,
    onUpdate,
    fundProvider,
    onValuesChange,
}: {
    deal?: DealHistory;
    fund: Fund;
    product: Product;
    onReset?: (deal: DealHistory) => void;
    onCancel?: () => void;
    onUpdate?: (data: FundProvider) => void;
    fundProvider: FundProvider;
    onValuesChange?: (values: object) => void;
}) {
    const translate = useTranslate();

    const fundService = useFundService();

    const isTypeSubsidies = useMemo(() => fund.type === 'subsidies', [fund.type]);

    const stockAmount = useMemo(
        () => (product.unlimited_stock ? 100 : product.stock_amount),
        [product.stock_amount, product.unlimited_stock],
    );

    const form = useFormBuilder<{
        expire_at?: string;
        expires_with_fund?: boolean;
        limit_total_unlimited?: boolean;
        limit_total?: number;
        limit_per_identity?: number;
        amount?: number;
        gratis?: boolean;
    }>(
        deal
            ? {
                  expire_at: deal.expire_at ? deal.expire_at : fundProvider.fund.end_date,
                  expires_with_fund: !deal.expire_at,
                  limit_total_unlimited: deal.limit_total_unlimited,
                  limit_total: product.unlimited_stock
                      ? deal.limit_total
                      : Math.min(deal.limit_total, product.stock_amount),
                  limit_per_identity: product.unlimited_stock
                      ? deal.limit_per_identity
                      : Math.min(deal.limit_per_identity, product.stock_amount),
                  ...(isTypeSubsidies
                      ? {
                            amount: parseFloat(deal.amount),
                            gratis: parseFloat(deal.amount) === parseFloat(product.price),
                        }
                      : {}),
              }
            : {
                  expire_at: fundProvider.fund.end_date,
                  expires_with_fund: true,
                  limit_total: stockAmount,
                  limit_per_identity: stockAmount,
                  limit_total_unlimited: product.unlimited_stock,
                  ...(isTypeSubsidies ? { amount: 0, gratis: false } : {}),
              },
        (values) => {
            const data = {
                enable_products: [
                    {
                        id: product.id,
                        amount: values.gratis ? product.price : values.amount,
                        limit_total: values.limit_total,
                        limit_total_unlimited: values.limit_total_unlimited ? 1 : 0,
                        limit_per_identity: values.limit_per_identity,
                        expire_at: values.expires_with_fund ? null : values.expire_at,
                    },
                ],
            };

            fundService
                .updateProvider(fund.organization_id, fund.id, fundProvider.id, data)
                .then((res) => onUpdate(res.data.data))
                .catch((err: ResponseError) => form.setErrors(err.data.errors))
                .finally(() => form.setIsLocked(false));
        },
    );

    useEffect(() => {
        onValuesChange?.(form.values);
    }, [form.values, onValuesChange]);

    return (
        <div className="card">
            <form className="form" onSubmit={form.submit}>
                <div className="card-header">
                    <div className="flex flex-horizontal">
                        <div className="flex flex-grow">
                            <div className="card-title">Subsidie starten</div>
                        </div>

                        {deal?.active && onReset && (
                            <div className="flex">
                                <div className="block block-inline-filters">
                                    <button className="button button-text" type="button" onClick={() => onReset(deal)}>
                                        <div className="mdi mdi-trash-can-outline icon-start" />
                                        Remove restriction
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="card-section card-section-primary form">
                    <div className="row">
                        <div className="col col-lg-8 col-md-12">
                            <div className="form-group form-group-inline tooltipped">
                                <Tooltip
                                    text={`Totaal aantal aanbiedingen dat vanuit ${fund.name} gebruikt mag worden`}
                                />
                                <div className="form-label form-label-required">Totaal aantal</div>
                                <div className="form-offset">
                                    <div className="row">
                                        <div className="col col-lg-6 col-xs-12">
                                            {product.unlimited_stock && form.values.limit_total_unlimited ? (
                                                <input className="form-control" disabled={true} value="Ongelimiteerd" />
                                            ) : (
                                                <input
                                                    className="form-control"
                                                    required={true}
                                                    value={form.values.limit_total || ''}
                                                    onChange={(e) => {
                                                        form.update({
                                                            limit_total: e.target.value
                                                                ? parseFloat(e.target.value)
                                                                : null,
                                                        });
                                                    }}
                                                    type="number"
                                                    placeholder="Totaal aanbod"
                                                    min={1}
                                                    max={product.unlimited_stock ? '' : product.stock_amount}
                                                />
                                            )}
                                            <FormError error={form.errors['enable_products.0.limit_total']} />

                                            {product.unlimited_stock ? (
                                                <div className="form-limit">Ongelimiteerd</div>
                                            ) : (
                                                <div className="form-limit">Limiet 1/{product.stock_amount}</div>
                                            )}
                                        </div>
                                        <div className="col col-lg-6 col-xs-12">
                                            {product.unlimited_stock && (
                                                <label className="checkbox" htmlFor="unlimited_stock_subsidy">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.values.limit_total_unlimited}
                                                        onChange={(e) => {
                                                            form.update({ limit_total_unlimited: e.target.checked });
                                                        }}
                                                        id="unlimited_stock_subsidy"
                                                    />
                                                    <div className="checkbox-label">
                                                        <div className="checkbox-box">
                                                            <div className="mdi mdi-check" />
                                                        </div>
                                                        Onbeperkt
                                                    </div>
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group form-group-inline tooltipped">
                                <Tooltip text="Hoevaak mag er per inwoner gebruik gemaakt worden van deze aanbieding?" />
                                <div className="form-label form-label-required">Aantal per aanvrager</div>
                                <div className="form-offset">
                                    <div className="row">
                                        <div className="col col-lg-6 col-xs-12">
                                            <input
                                                className="form-control"
                                                required={true}
                                                value={form.values.limit_per_identity || ''}
                                                onChange={(e) =>
                                                    form.update({
                                                        limit_per_identity: e.target.value
                                                            ? parseFloat(e.target.value)
                                                            : null,
                                                    })
                                                }
                                                type="number"
                                                placeholder="Limiet per aanvrager"
                                                min={1}
                                                max={product.unlimited_stock ? '' : product.stock_amount}
                                            />
                                            <FormError error={form.errors['enable_products.0.limit_per_identity']} />

                                            {product.unlimited_stock ? (
                                                <div className="form-limit">Ongelimiteerd</div>
                                            ) : (
                                                <div className="form-limit">Limiet 1/{product.stock_amount}</div>
                                            )}
                                        </div>
                                        <div className="col col-lg-6 col-xs-12" />
                                    </div>
                                </div>
                            </div>

                            {fund.type == 'subsidies' && (
                                <div className="form-group form-group-inline tooltipped">
                                    <Tooltip text="Volledige bijdrage vanuit de sponsor (voor de inwoner is het gratis)" />
                                    <div className="form-label form-label-required">Bijdrage</div>
                                    <div className="form-offset">
                                        <div className="row">
                                            <div className="col col-lg-6 col-xs-12">
                                                {form.values.gratis ? (
                                                    <input
                                                        className="form-control"
                                                        disabled={true}
                                                        value={product.price}
                                                    />
                                                ) : (
                                                    <input
                                                        className="form-control"
                                                        disabled={form.values.gratis}
                                                        value={form.values.amount}
                                                        onChange={(e) => {
                                                            form.update({
                                                                amount: e.target.value ? parseFloat(e.target.value) : 0,
                                                            });
                                                        }}
                                                        type="number"
                                                        placeholder="Bijdrage"
                                                        step=".05"
                                                        min={0}
                                                    />
                                                )}
                                                <FormError error={form.errors['enable_products.0.amount']} />
                                            </div>
                                            <div className="col col-lg-6 col-xs-12">
                                                {(product.price_type === 'free' ||
                                                    product.price_type === 'regular') && (
                                                    <label className="checkbox" htmlFor="subsidie">
                                                        <input
                                                            type="checkbox"
                                                            checked={form.values.gratis}
                                                            onChange={(e) => form.update({ gratis: e.target.checked })}
                                                            id="subsidie"
                                                        />
                                                        <div className="checkbox-label">
                                                            <div className="checkbox-box">
                                                                <em className="mdi mdi-check" />
                                                            </div>
                                                            Volledige bijdrage
                                                        </div>
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="form-group form-group-inline tooltipped">
                                <Tooltip text="Tot wanneer de subsidie geldig is. Kies de gewenste datum of de einddatum van het fonds." />
                                <div className="form-label">Verloopdatum</div>
                                <div className="form-offset">
                                    <div className="row">
                                        {form.values.expires_with_fund ? (
                                            <div className="col col-lg-6 col-xs-12">
                                                <input className="form-control" value={fund.end_date} disabled={true} />
                                                <FormError error={form.errors['enable_products.0.expire_at']} />
                                            </div>
                                        ) : (
                                            <div className="col col-lg-6 col-xs-12">
                                                <DatePickerControl
                                                    value={dateParse(form.values.expire_at)}
                                                    placeholder={translate('jjjj-MM-dd')}
                                                    onChange={(date) => form.update({ expire_at: dateFormat(date) })}
                                                />
                                                <FormError error={form.errors['enable_products.0.expire_at']} />
                                            </div>
                                        )}

                                        <div className="col col-lg-6 col-xs-12">
                                            <label className="checkbox" htmlFor="expires_with_fund">
                                                <input
                                                    type="checkbox"
                                                    checked={form.values.expires_with_fund}
                                                    onChange={(e) => {
                                                        form.update({ expires_with_fund: e.target.checked });
                                                    }}
                                                    id="expires_with_fund"
                                                />
                                                <div className="checkbox-label">
                                                    <div className="checkbox-box">
                                                        <div className="mdi mdi-check" />
                                                    </div>
                                                    Verloopt met het fonds
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {form.errors['enable_products.0'] && (
                                <div className="form-group form-group-inline">
                                    <div className="form-label">&nbsp;</div>
                                    <div className="form-offset">
                                        {form.errors['enable_products.0'].map((error: string, index: number) => (
                                            <div className={'form-error'} key={index}>
                                                {error}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="card-section card-section-primary">
                    <div className="text-center">
                        <a className="button button-default" onClick={onCancel}>
                            {translate('product_edit.buttons.cancel')}
                        </a>
                        <button className="button button-primary" type="submit">
                            {translate('product_edit.buttons.confirm')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
