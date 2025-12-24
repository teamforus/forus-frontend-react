import { useCallback } from 'react';
import Voucher, { VoucherProduct } from '../../../dashboard/props/models/Voucher';
import useAssetUrl from '../../hooks/useAssetUrl';
import { uniqueId } from 'lodash';
import Office from '../../../dashboard/props/models/Office';
import Reservation from '../../../dashboard/props/models/Reservation';
import Organization from '../../../dashboard/props/models/Organization';

type CardTransaction = {
    id?: number;
    unique_id?: string;
    timestamp?: number;
    amount_locale?: string;
    type?: 'transaction' | 'product_voucher' | string;
    product?: VoucherProduct;
    target?: 'provider' | 'iban' | 'top_up' | 'payout';
    product_reservation?: Reservation;
    organization?: Organization;
    created_at_locale?: string;
    incoming?: boolean;
};

export type VoucherCardType = Voucher & {
    thumbnail?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    transactionsList?: Array<CardTransaction>;
    records_by_key?: { [key: string]: string };
    product?: VoucherProduct;
    offices?: Array<Office>;
};

export function useVoucherCombinedTransactionsList() {
    const composeTransactions = useCallback((voucher: Voucher): Array<CardTransaction> => {
        const transactions = voucher.transactions.slice().map((transaction) => ({
            id: transaction.id,
            unique_id: uniqueId('transaction_'),
            timestamp: transaction.timestamp,
            amount_locale: transaction.amount_locale,
            type: 'transaction',
            product: transaction.product,
            target: transaction.target,
            product_reservation: transaction.product_reservation,
            organization: transaction.organization,
            created_at_locale: transaction.created_at_locale,
            incoming: transaction.target === 'top_up',
        }));

        const productVouchers = (voucher.product_vouchers || []).map((product_voucher) => ({
            id: product_voucher.id,
            unique_id: uniqueId('transaction_'),
            timestamp: product_voucher.timestamp,
            amount_locale: product_voucher.amount_locale,
            type: 'product_voucher',
            product: product_voucher.product,
            target: null,
            product_reservation: product_voucher.product_reservation,
            organization: null,
            created_at_locale: product_voucher.created_at_locale,
            incoming: false,
        }));

        return [...transactions, ...productVouchers].sort((a, b) => b.timestamp - a.timestamp);
    }, []);

    return (voucher: Voucher) => {
        return voucher.transactions ? [...composeTransactions(voucher)] : [];
    };
}

export default function useComposeVoucherCardData() {
    const assetUrl = useAssetUrl();
    const voucherCombinedTransactionsList = useVoucherCombinedTransactionsList();

    const getVoucherThumbnail = useCallback(
        (voucher: Voucher) => {
            if (voucher.type == 'regular') {
                if (voucher.fund?.logo) {
                    return voucher.fund?.logo?.sizes?.thumbnail;
                } else if (voucher.fund?.organization?.logo) {
                    return voucher.fund?.organization?.logo?.sizes?.thumbnail;
                }
            }

            if (voucher.type == 'product' && voucher.product.photos[0]) {
                return voucher.product?.photos[0]?.sizes?.thumbnail;
            }

            return assetUrl('/assets/img/placeholders/product-thumbnail.png');
        },
        [assetUrl],
    );

    return useCallback(
        (voucher: Voucher): VoucherCardType => {
            const { product, fund, records } = voucher;

            return {
                ...voucher,
                thumbnail: getVoucherThumbnail(voucher),
                title: product ? product.name : fund.name,
                subtitle: product ? product.organization.name : fund.organization.name,
                description: product ? product.description_html : fund.description,
                transactionsList: voucherCombinedTransactionsList(voucher),
                records_by_key: records?.reduce(
                    (records, record) => ({ ...records, [record.record_type_key]: record.value_locale }),
                    {},
                ) as { [key: string]: string },
                product: voucher.product || null,
                offices: voucher.offices || [],
            };
        },
        [getVoucherThumbnail, voucherCombinedTransactionsList],
    );
}
