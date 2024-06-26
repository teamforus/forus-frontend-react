import ApiResponse, { ApiResponseSingle } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import Product from '../props/models/Product';
import Voucher from '../../dashboard/props/models/Voucher';
import { getUnixTime, parse } from 'date-fns';

export class ProductService<T = Product> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/products';

    /**
     * Fetch list
     */
    public list(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }

    public sample(fund_type: 'budget' | 'subsidies', per_page = 6): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/sample`, { fund_type, per_page });
    }

    public read(id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${id}`);
    }

    public bookmark(id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${id}/bookmark`);
    }

    public removeBookmark(id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${id}/remove-bookmark`);
    }

    protected calcExpireDate(dates: Array<Array<string>>) {
        const dateParse = (date: string | { date: string }, date_locale: string) => {
            return date
                ? {
                      unix: getUnixTime(parse(typeof date === 'object' ? date.date : date, 'yyyy-MM-dd', new Date())),
                      locale: date_locale,
                  }
                : null;
        };

        const sortDateLocale = (dates: Array<{ unix?: number; locale?: string }>, asc = true) => {
            return [...dates].sort((a, b) => {
                return a.unix == b.unix ? 0 : a.unix < b.unix ? (asc ? -1 : 1) : asc ? 1 : -1;
            });
        };

        return (
            sortDateLocale(
                dates.filter((date) => date).map((date) => dateParse(date[0], date[1])),
                true,
            )[0] || null
        );
    }

    public checkEligibility(product: Product, vouchers: Array<Voucher> = []) {
        const fundIds = product.funds.map((fund) => fund.id);
        const productAvailable = !product.sold_out && !product.deleted && !product.expired;

        // regular active vouchers for product funds
        const regularActiveVouchers = vouchers.filter((voucher) => {
            return fundIds.indexOf(voucher.fund_id) != -1 && voucher.type === 'regular' && !voucher.expired;
        });

        const funds = [...product.funds].map((fund) => {
            const { reservations_enabled, reservation_extra_payments_enabled } = fund;

            const applicableVouchers = regularActiveVouchers.filter((voucher) => voucher.fund.id == fund.id);
            const reservableVouchers = applicableVouchers.filter(
                (voucher) => voucher.query_product && voucher.query_product.reservable,
            );

            const isReservable = reservableVouchers.length > 0;
            const isReservationAvailable = isReservable && productAvailable && reservations_enabled;
            const isReservationExtraPaymentAvailable = isReservationAvailable && reservation_extra_payments_enabled;

            const voucherDates = applicableVouchers
                .map((voucher) =>
                    voucher.query_product
                        ? [
                              voucher.query_product.reservable_expire_at,
                              voucher.query_product.reservable_expire_at_locale,
                          ]
                        : null,
                )
                .filter((date) => date);

            const productAndFundDates = [
                fund.end_at ? [fund.end_at, fund.end_at_locale] : null,
                product.expire_at ? [product.expire_at, product.expire_at_locale] : null,
            ].filter((date) => date);

            const shownExpireDate = this.calcExpireDate([...voucherDates, ...productAndFundDates]);

            const meta = {
                ...{ shownExpireDate, applicableVouchers, reservableVouchers },
                ...{ isReservationAvailable, isReservationExtraPaymentAvailable },
            };

            return { ...fund, meta };
        });

        const hasReservableFunds = funds.filter((fund) => fund.meta.isReservationAvailable).length > 0;

        return { regularActiveVouchers, funds, hasReservableFunds };
    }

    public getSortOptions(): Array<{
        id: number;
        label: string;
        value: { order_by: 'created_at' | 'price' | 'most_popular' | 'name'; order_dir: 'asc' | 'desc' };
    }> {
        return [
            { id: 1, label: 'Nieuwe eerst', value: { order_by: 'created_at', order_dir: 'desc' } },
            { id: 2, label: 'Oudste eerst', value: { order_by: 'created_at', order_dir: 'asc' } },
            { id: 3, label: 'Prijs (oplopend)', value: { order_by: 'price', order_dir: 'asc' } },
            { id: 4, label: 'Prijs (aflopend)', value: { order_by: 'price', order_dir: 'desc' } },
            { id: 5, label: 'Meest gewild', value: { order_by: 'most_popular', order_dir: 'desc' } },
            { id: 6, label: 'Naam (oplopend)', value: { order_by: 'name', order_dir: 'asc' } },
            { id: 7, label: 'Naam (aflopend)', value: { order_by: 'name', order_dir: 'desc' } },
        ];
    }

    public transformProductAlternativeText(product: Product): string {
        const default_text = 'logo aanbod ' + product.name;
        const provider_text = '.De aanbieder omschrijft het aanbod als volgt: ' + product.alternative_text;

        return default_text + (product.alternative_text ? provider_text : '');
    }
}

export function useProductService(): ProductService {
    return useState(new ProductService())[0];
}
