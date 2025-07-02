import React, { useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import FundProvider from '../../props/models/FundProvider';
import Organization from '../../props/models/Organization';
import Product from '../../props/models/Product';
import { PaginationData } from '../../props/ApiResponses';
import useProductService from '../../services/ProductService';
import useProviderFundService from '../../services/ProviderFundService';
import useFilter from '../../hooks/useFilter';
import Paginator from '../../modules/paginator/components/Paginator';
import { strLimit } from '../../helpers/string';
import StateNavLink from '../../modules/state_router/StateNavLink';
import usePaginatorService from '../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../hooks/useTranslate';
import classNames from 'classnames';
import TableEmptyValue from '../elements/table-empty-value/TableEmptyValue';
import Label from '../elements/image_cropper/Label';

type LocalProduct = Product & {
    offer: {
        allowed?: boolean;
        amount?: string;
        user_amount?: string;
        user_limit?: number;
        limit_total?: number;
        limit_total_unlimited?: boolean;
    };
};

export default function ModalFundOffers({
    modal,
    providerFund,
    organization,
    className,
}: {
    modal: ModalState;
    providerFund: FundProvider;
    organization: Organization;
    className?: string;
}) {
    const translate = useTranslate();

    const productService = useProductService();
    const paginatorService = usePaginatorService();
    const providerFundService = useProviderFundService();

    const [offers, setOffers] = useState<PaginationData<Product>>(null);
    const [paginatorKey] = useState('modal_fund_offers');
    const [enabledProducts, setEnabledProducts] = useState<number[]>([]);

    const filter = useFilter({
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const mapOffersAllowedProperty = useCallback(
        (offers: PaginationData<Product>) => {
            offers.data.forEach((product: LocalProduct) => {
                product.offer = {};
                product.offer.allowed = enabledProducts.indexOf(product.id) !== -1;

                const fund = product.funds.find((fund) => fund.id === providerFund.fund_id);

                if (fund) {
                    const isSubsidy = fund.payment_type === 'subsidy';

                    product.offer.amount = isSubsidy ? fund.amount_locale : product.price_locale;
                    product.offer.user_amount = isSubsidy ? fund.price_locale : null;
                    product.offer.user_limit = fund.limit_per_identity;
                    product.offer.limit_total = fund.limit_total;
                    product.offer.limit_total_unlimited = fund.limit_total_unlimited;
                } else {
                    product.offer.amount = product.price_locale;
                    product.offer.user_amount = null;
                    product.offer.user_limit = null;
                    product.offer.limit_total = null;
                    product.offer.limit_total_unlimited = null;
                }
            });

            return offers;
        },
        [enabledProducts, providerFund.fund_id],
    );

    useEffect(() => {
        providerFundService.readFundProvider(organization.id, providerFund.id).then((res) => {
            setEnabledProducts(res.data.data.products);
        });
    }, [organization.id, providerFund.id, providerFundService]);

    useEffect(() => {
        productService.list(organization.id, filter.activeValues).then((res) => {
            setOffers(mapOffersAllowedProperty(res.data));
        });
    }, [filter.activeValues, mapOffersAllowedProperty, organization.id, productService]);

    return (
        <div
            className={classNames(
                'modal',
                'modal-animated',
                'modal-fund-offers',
                modal.loading && 'modal-loading',
                className,
            )}>
            <div className="modal-backdrop" onClick={modal.close} />
            <div className="modal-window">
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">{translate('modals.modal_funds_offers.title')}</div>
                <div className="modal-body form">
                    <div className="modal-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>{translate('modals.modal_funds_offers.labels.name')}</th>
                                            <th>{translate('modals.modal_funds_offers.labels.stock')}</th>
                                            <th>{translate('modals.modal_funds_offers.labels.price')}</th>
                                            <th>{translate('modals.modal_funds_offers.labels.subsidy_amount')}</th>
                                            <th>{translate('modals.modal_funds_offers.labels.subsidy_user_amount')}</th>
                                            <th>{translate('modals.modal_funds_offers.labels.subsidy_user_limit')}</th>
                                            <th>{translate('modals.modal_funds_offers.labels.subsidy_limit_total')}</th>
                                            <th className="text-right">
                                                {translate('modals.modal_funds_offers.labels.status')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {offers?.data?.map((product: LocalProduct) => (
                                            <tr key={product.id}>
                                                <td title={product.name}>
                                                    <StateNavLink
                                                        name={'products-show'}
                                                        params={{ organizationId: organization.id, id: product.id }}
                                                        target={'_blank'}
                                                        className={'text-primary text-semibold'}>
                                                        {strLimit(product.name, 45)}
                                                    </StateNavLink>
                                                </td>
                                                <td>
                                                    {product.unlimited_stock ? 'Ongelimiteerd' : product.stock_amount}
                                                </td>
                                                <td>
                                                    <div className="offer-price">{product.price_locale}</div>
                                                </td>
                                                <td>
                                                    {product.offer.allowed ? product.offer.amount : <TableEmptyValue />}
                                                </td>
                                                <td>
                                                    {product.offer.allowed ? (
                                                        product.offer.user_amount
                                                    ) : (
                                                        <TableEmptyValue />
                                                    )}
                                                </td>
                                                <td>
                                                    {product.offer?.allowed && product.offer?.user_limit ? (
                                                        product.offer?.user_limit
                                                    ) : (
                                                        <TableEmptyValue />
                                                    )}
                                                </td>
                                                <td>
                                                    {product.offer?.allowed ? (
                                                        product.offer?.limit_total_unlimited ? (
                                                            'Onbeperkt'
                                                        ) : (
                                                            product.offer?.limit_total
                                                        )
                                                    ) : (
                                                        <TableEmptyValue />
                                                    )}
                                                </td>

                                                <td className="text-right">
                                                    <Label type={product.offer?.allowed ? 'success' : 'default'}>
                                                        {product.offer?.allowed
                                                            ? translate(`modals.modal_funds_offers.labels.available`)
                                                            : translate(`modals.modal_funds_offers.labels.rejected`)}
                                                    </Label>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {!offers && (
                                <div className={'card'}>
                                    <div className="card-section">
                                        <div className="card-loading">
                                            <div className="mdi mdi-loading mdi-spin" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    {offers?.meta && (
                        <Paginator
                            className={'flex-grow'}
                            meta={offers.meta}
                            filters={filter.values}
                            updateFilters={filter.update}
                            perPageKey={paginatorKey}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
