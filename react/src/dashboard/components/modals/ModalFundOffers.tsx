import React, { useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import FundProvider from '../../props/models/FundProvider';
import Organization from '../../props/models/Organization';
import Product from '../../props/models/Product';
import { PaginationData } from '../../props/ApiResponses';
import { useTranslation } from 'react-i18next';
import useProductService from '../../services/ProductService';
import useProviderFundService from '../../services/ProviderFundService';
import useFilter from '../../hooks/useFilter';
import Paginator from '../../modules/paginator/components/Paginator';
import { currencyFormat, strLimit } from '../../helpers/string';
import StateNavLink from '../../modules/state_router/StateNavLink';

type LocalProduct = Product & {
    allowed: boolean;
    subsidy_amount: number;
    subsidy_user_amount: number;
    subsidy_user_limit: number;
    subsidy_limit_total: number;
    subsidy_limit_total_unlimited: boolean;
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
    const { t } = useTranslation();
    const productService = useProductService();
    const providerFundService = useProviderFundService();

    const [offers, setOffers] = useState<PaginationData<Product>>(null);
    const [enabledProducts, setEnabledProducts] = useState<number[]>([]);

    const filter = useFilter({
        per_page: 10,
    });

    const mapOffersAllowedProperty = useCallback(
        (offers) => {
            offers.data.forEach((offer: LocalProduct) => {
                offer.allowed = enabledProducts.indexOf(offer.id) !== -1;
                const fund = offer.funds.find((fund) => fund.id === providerFund.fund_id);

                if (fund) {
                    offer.subsidy_amount = parseFloat(offer.price) - parseFloat(fund.price);
                    offer.subsidy_user_amount = parseFloat(fund.price);
                    offer.subsidy_user_limit = fund.limit_per_identity;
                    offer.subsidy_limit_total = fund.limit_total;
                    offer.subsidy_limit_total_unlimited = fund.limit_total_unlimited;
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
            className={classList([
                'modal',
                'modal-animated',
                'modal-fund-offers',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />
            <div className="modal-window">
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">{t('modals.modal_funds_offers.title')}</div>
                <div className="modal-body form">
                    <div className="modal-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>{t('modals.modal_funds_offers.labels.name')}</th>
                                            <th>{t('modals.modal_funds_offers.labels.stock')}</th>
                                            <th>{t('modals.modal_funds_offers.labels.price')}</th>
                                            <th>{t('modals.modal_funds_offers.labels.subsidy_amount')}</th>
                                            <th>{t('modals.modal_funds_offers.labels.subsidy_user_amount')}</th>
                                            <th>{t('modals.modal_funds_offers.labels.subsidy_user_limit')}</th>
                                            <th>{t('modals.modal_funds_offers.labels.subsidy_limit_total')}</th>
                                            <th className="text-right">
                                                {t('modals.modal_funds_offers.labels.status')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {offers?.data?.map((offer: LocalProduct) => (
                                            <tr key={offer.id}>
                                                <td title={offer.name}>
                                                    <StateNavLink
                                                        name={'products-show'}
                                                        params={{
                                                            organizationId: organization.id,
                                                            id: offer.id,
                                                        }}
                                                        target={'_blank'}
                                                        className={'text-primary text-medium'}>
                                                        {strLimit(offer.name, 45)}
                                                    </StateNavLink>
                                                </td>
                                                <td>{offer.unlimited_stock ? 'Ongelimiteerd' : offer.stock_amount}</td>
                                                <td>
                                                    <div className="offer-price">{offer.price_locale}</div>
                                                </td>
                                                <td>{offer.allowed ? currencyFormat(offer.subsidy_amount) : '-'}</td>
                                                <td>
                                                    {offer.allowed ? currencyFormat(offer.subsidy_user_amount) : '-'}
                                                </td>
                                                <td>
                                                    {offer.allowed && offer.subsidy_user_limit
                                                        ? offer.subsidy_user_limit
                                                        : '-'}
                                                </td>
                                                <td>
                                                    {offer.allowed
                                                        ? offer.subsidy_limit_total_unlimited
                                                            ? 'Onbeperkt'
                                                            : offer.subsidy_limit_total
                                                        : '-'}
                                                </td>

                                                <td className="text-right">
                                                    <div
                                                        className={`tag ${
                                                            offer.allowed ? 'tag-success' : 'tag-default'
                                                        }`}>
                                                        {offer.allowed
                                                            ? t(`modals.modal_funds_offers.labels.available`)
                                                            : t(`modals.modal_funds_offers.labels.rejected`)}
                                                    </div>
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
                    <button className="button button-default button-close" onClick={modal.close}>
                        {t('modal_funds_add.buttons.close')}
                    </button>
                    {offers?.meta.last_page > 1 && (
                        <div className="pagination-offers">
                            <Paginator meta={offers.meta} filters={filter.values} updateFilters={filter.update} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}