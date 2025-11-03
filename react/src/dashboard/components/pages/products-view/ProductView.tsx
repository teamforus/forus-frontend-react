import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import useTranslate from '../../../hooks/useTranslate';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useProductService from '../../../services/ProductService';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useProductChatService from '../../../services/ProductChatService';
import { useNavigateState } from '../../../modules/state_router/Router';
import useOpenModal from '../../../hooks/useOpenModal';
import Product from '../../../props/models/Product';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import usePushSuccess from '../../../hooks/usePushSuccess';
import ModalNotification from '../../modals/ModalNotification';
import FundProviderChat from '../../../props/models/FundProviderChat';
import ModalFundProviderChatProvider from '../../modals/ModalFundProviderChatProvider';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import ProductDetailsBlock from './elements/ProductDetailsBlock';
import ToggleControl from '../../elements/forms/controls/ToggleControl';
import Paginator from '../../../modules/paginator/components/Paginator';
import ProductFund from '../../../props/models/ProductFund';
import usePushApiError from '../../../hooks/usePushApiError';
import Label from '../../elements/image_cropper/Label';
import TableEntityMain from '../../elements/tables/elements/TableEntityMain';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import TableRowActions from '../../elements/tables/TableRowActions';
import classNames from 'classnames';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { NumberParam, StringParam } from 'use-query-params';

type ProductFundLocal = ProductFund & {
    chat?: FundProviderChat;
};

export default function ProductView() {
    const { id } = useParams();

    const translate = useTranslate();
    const activeOrganization = useActiveOrganization();

    const productService = useProductService();
    const paginatorService = usePaginatorService();
    const productChatService = useProductChatService();

    const navigateState = useNavigateState();
    const openModal = useOpenModal();

    const [product, setProduct] = useState<Product>(null);
    const [funds, setFunds] = useState<PaginationData<ProductFundLocal>>(null);
    const [fundToggles, setFundToggles] = useState({});
    const [paginatorKey] = useState('product_funds');

    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        q: string;
        page?: number;
        per_page?: number;
    }>(
        {
            q: '',
            page: 1,
            per_page: paginatorService.getPerPage(paginatorKey),
        },
        {
            queryParams: {
                q: StringParam,
                page: NumberParam,
                per_page: NumberParam,
            },
        },
    );

    const { headElement, configsElement } = useConfigurableTable(productService.getFundsColumns(product));

    const deleteProduct = useCallback(
        (product: Product) => {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    icon={'product-create'}
                    title={translate('products.confirm_delete.title')}
                    description={translate('products.confirm_delete.description')}
                    buttonSubmit={{
                        onClick: () => {
                            modal.close();

                            productService.destroy(activeOrganization.id, product.id).then(() => {
                                navigateState(DashboardRoutes.PRODUCTS, { organizationId: activeOrganization.id });
                            });
                        },
                    }}
                    buttonCancel={{
                        onClick: () => modal.close(),
                    }}
                />
            ));
        },
        [activeOrganization.id, navigateState, openModal, productService, translate],
    );

    const changeFundExclusion = useCallback(
        (fund: ProductFundLocal, is_available: boolean) => {
            const values = is_available ? { enable_funds: [fund.id] } : { disable_funds: [fund.id] };

            productService
                .updateExclusions(product.organization_id, product.id, values)
                .then(() => pushSuccess('Opgeslagen!'))
                .catch((err: ResponseError) => pushApiError(err));
        },
        [product, productService, pushApiError, pushSuccess],
    );

    const mapFundsWithChats = useCallback(
        (
            funds: PaginationData<ProductFundLocal>,
            chats: PaginationData<FundProviderChat>,
        ): PaginationData<ProductFundLocal> => {
            return {
                ...funds,
                data: funds.data.map((fund) => ({
                    ...fund,
                    chat: chats.data.find((chat) => fund.id == chat.fund_id),
                })),
            };
        },
        [],
    );

    const fetchProduct = useCallback(async () => {
        const res = await productService.read(activeOrganization.id, parseInt(id));
        setProduct(res.data.data);
    }, [activeOrganization, id, productService]);

    const fetchChats = useCallback(
        async (product: Product) => {
            return (await productChatService.list(product.organization_id, product.id, { per_page: 100 })).data;
        },
        [productChatService],
    );

    const fetchFunds = useCallback(() => {
        if (!product) {
            return;
        }

        productService
            .listProductFunds(product.organization_id, product.id, { ...filterValuesActive, organization_id: null })
            .then(async (res) => setFunds(mapFundsWithChats(res.data, await fetchChats(product))))
            .catch(console.error);
    }, [fetchChats, filterValuesActive, mapFundsWithChats, product, productService]);

    const showTheChat = (fund: ProductFundLocal) => {
        if (!fund.chat) {
            return;
        }

        openModal((modal) => (
            <ModalFundProviderChatProvider
                modal={modal}
                chat={fund.chat}
                product={product}
                providerOrganization={product.organization}
                sponsorOrganization={fund.organization}
                onClose={() => fetchFunds()}
            />
        ));
    };

    useEffect(() => {
        fetchProduct()
            .then()
            .catch(() => navigateState(DashboardRoutes.PRODUCTS, { organizationId: activeOrganization.id }));
    }, [activeOrganization.id, fetchProduct, navigateState]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        setFundToggles(
            funds?.data?.reduce(
                (list, fund) => ({
                    ...list,
                    [fund.id]: !!product.excluded_funds.find((exclFund) => exclFund.id === fund.id),
                }),
                {},
            ),
        );
    }, [funds, product?.excluded_funds]);

    if (!product) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={DashboardRoutes.OFFICES}
                    params={{ id: product.id, organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {product.organization.name}
                </StateNavLink>
                <div className="breadcrumb-item active">{product.name}</div>
            </div>

            <div className="card">
                <div className="card-section">
                    <ProductDetailsBlock product={product} viewType={'provider'} />
                </div>

                <div className="card-footer card-footer-primary flex flex-end">
                    <a className="button button-primary" onClick={() => deleteProduct(product)}>
                        <em className="mdi mdi-delete icon-start"> </em>
                        {translate('product.buttons.delete')}
                    </a>

                    <StateNavLink
                        className="button button-default"
                        name={DashboardRoutes.PRODUCT_EDIT}
                        params={{ organizationId: activeOrganization.id, id: product.id }}>
                        <em className="mdi mdi-pen icon-start"> </em>
                        {translate('product.buttons.edit')}
                    </StateNavLink>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex flex-grow flex-grow">
                        <div className="card-title">Fondsen</div>
                    </div>
                    <div className="card-header-filters">
                        <div className="block block-inline-filters form">
                            <div className="form-group">
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Zoeken"
                                    value={filterValues.q}
                                    onChange={(e) => filterUpdate({ q: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {funds?.meta.total > 0 ? (
                    <div className="card-section">
                        <div className="card-block card-block-table">
                            {configsElement}

                            <TableTopScroller>
                                <table className="table">
                                    {headElement}

                                    <tbody>
                                        {funds?.data?.map((fund) => (
                                            <tr key={fund.id}>
                                                <td>
                                                    <TableEntityMain
                                                        title={fund.name}
                                                        subtitle={fund.organization.name}
                                                        media={fund.logo}
                                                        mediaRound={false}
                                                        mediaSize={'md'}
                                                        mediaPlaceholder={'fund'}
                                                    />
                                                </td>
                                                <td>
                                                    {fund.approved ? (
                                                        <Label type="success">Geaccepteerd</Label>
                                                    ) : (
                                                        <Label type="default">Wachtend</Label>
                                                    )}
                                                </td>
                                                {!product.sponsor_organization && fundToggles && (
                                                    <td className="form">
                                                        <ToggleControl
                                                            id={`fund_exclusion_id_${fund.id}`}
                                                            checked={!fundToggles[fund.id]}
                                                            onChange={() => {
                                                                setFundToggles((fundToggles) => ({
                                                                    ...fundToggles,
                                                                    [fund.id]: !fundToggles[fund.id],
                                                                }));
                                                                changeFundExclusion(fund, fundToggles[fund.id]);
                                                            }}
                                                        />
                                                    </td>
                                                )}
                                                <td className="nowrap">
                                                    <button
                                                        className={`button button-icon ${
                                                            fund.chat?.provider_unseen_messages > 0
                                                                ? 'button-primary-light'
                                                                : 'button-default'
                                                        }`}
                                                        disabled={!fund.chat}
                                                        onClick={() => showTheChat(fund)}>
                                                        <em
                                                            className={`mdi mdi-message-text ${
                                                                fund.chat && !fund.chat.provider_unseen_messages
                                                                    ? 'text-primary'
                                                                    : ''
                                                            }`}
                                                        />
                                                    </button>

                                                    {!fund.chat && <span>&nbsp;&nbsp; Geen berichten</span>}
                                                    {fund.chat?.provider_unseen_messages > 0 && (
                                                        <span>
                                                            &nbsp;&nbsp;{' '}
                                                            {`${fund.chat.provider_unseen_messages} nieuwe`}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className={'table-td-actions text-right'}>
                                                    <TableRowActions
                                                        content={() => (
                                                            <div className="dropdown dropdown-actions">
                                                                <a
                                                                    className={classNames(
                                                                        'dropdown-item',
                                                                        (!fund.approved || fund.provider_excluded) &&
                                                                            'disabled',
                                                                    )}
                                                                    href={`${fund.implementation.url_webshop}products/${product.id}`}
                                                                    target="_blank"
                                                                    rel="noreferrer">
                                                                    <em className="mdi mdi-eye-outline icon-start">
                                                                        {' '}
                                                                    </em>
                                                                    {fund.provider_excluded
                                                                        ? 'Verborgen op webshop'
                                                                        : 'Bekijk op webshop'}
                                                                </a>
                                                            </div>
                                                        )}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TableTopScroller>
                        </div>
                    </div>
                ) : (
                    <div className="card-section">
                        <div className={`block block-empty text-center}`}>
                            <div className="empty-details">
                                Uw aanbod kan nog niet op een website worden geplaatst omdat u zich eerst voor een fonds
                                moet aanmelden. Meld u aan voor één of meerdere fondsen.
                            </div>
                            <div className="empty-actions">
                                <div className="button-group">
                                    <StateNavLink
                                        name={DashboardRoutes.PROVIDER_FUNDS}
                                        params={{ organizationId: activeOrganization.id }}
                                        className="button button-primary">
                                        <em className="mdi mdi-plus icon-start" />
                                        Bekijk beschikbare fondsen
                                    </StateNavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {funds?.meta && (
                    <div className="card-section">
                        <Paginator
                            meta={funds.meta}
                            filters={filterValues}
                            updateFilters={filterUpdate}
                            perPageKey={paginatorKey}
                        />
                    </div>
                )}
            </div>
        </Fragment>
    );
}
