import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useParams } from 'react-router-dom';
import useProductService from '../../../services/ProductService';
import Product from '../../../props/models/Product';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useAssetUrl from '../../../hooks/useAssetUrl';
import TranslateHtml from '../../elements/translate-html/TranslateHtml';
import { PaginationData } from '../../../props/ApiResponses';
import useFilter from '../../../hooks/useFilter';
import Paginator from '../../../modules/paginator/components/Paginator';
import { useNavigateState } from '../../../modules/state_router/Router';
import FundProviderChat from '../../../props/models/FundProviderChat';
import useOpenModal from '../../../hooks/useOpenModal';
import ModalNotification from '../../modals/ModalNotification';
import useProductChatService from '../../../services/ProductChatService';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import ProductFund from '../../../props/models/ProductFund';
import ToggleControl from '../../elements/forms/controls/ToggleControl';
import ModalFundProviderChatProvider from '../../modals/ModalFundProviderChatProvider';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import KeyValueItem from '../../elements/key-value/KeyValueItem';

type ProductFundLocal = ProductFund & {
    chat?: FundProviderChat;
};

export default function ProductsView() {
    const { id } = useParams();

    const translate = useTranslate();
    const activeOrganization = useActiveOrganization();
    const assetUrl = useAssetUrl();

    const productService = useProductService();
    const paginatorService = usePaginatorService();
    const productChatService = useProductChatService();

    const navigateState = useNavigateState();
    const openModal = useOpenModal();

    const [product, setProduct] = useState<Product>(null);
    const [funds, setFunds] = useState<PaginationData<ProductFundLocal>>(null);
    const [fundToggles, setFundToggles] = useState({});
    const [paginatorKey] = useState('product_funds');

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();

    const filter = useFilter({
        q: '',
        per_page: paginatorService.getPerPage(paginatorKey),
    });

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
                                navigateState('products', { organizationId: activeOrganization.id });
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
                .catch(() => pushDanger('Fout! Er ging iets mis.'));
        },
        [product, productService, pushDanger, pushSuccess],
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
            .listProductFunds(product.organization_id, product.id, { ...filter.activeValues, organization_id: null })
            .then(async (res) => setFunds(mapFundsWithChats(res.data, await fetchChats(product))))
            .catch(console.error);
    }, [fetchChats, filter.activeValues, mapFundsWithChats, product, productService]);

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
            .catch(() => navigateState('products', { organizationId: activeOrganization.id }));
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
                    name={'offices'}
                    params={{ id: product.id, organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {product.organization.name}
                </StateNavLink>
                <div className="breadcrumb-item active">{product.name}</div>
            </div>

            <div className="block block-product">
                <div className="card">
                    <div className="card-section">
                        <div className="flex">
                            <div className="flex-col">
                                <div className="block-product-media">
                                    <img
                                        src={
                                            product.photo?.sizes?.small ||
                                            assetUrl('/assets/img/placeholders/product-small.png')
                                        }
                                        alt={product.name}
                                    />
                                </div>
                            </div>

                            <div className="flex-col flex-grow">
                                <div className="flex flex-row">
                                    <div className="flex-col flex-grow">
                                        <div className="block-product-details">
                                            <div className="block-product-name">{product.name}</div>
                                            <div className="block-product-price">{product.price_locale}</div>
                                        </div>
                                    </div>
                                    <div className="flex-col"></div>
                                </div>

                                {product.description_html && (
                                    <div
                                        className="block-product-description-body"
                                        dangerouslySetInnerHTML={{ __html: product.description_html }}
                                    />
                                )}

                                <div className="block-product-separator"></div>

                                <div className="card-block card-block-keyvalue">
                                    <div className="keyvalue-title">{translate('product.labels.details')}</div>
                                    <KeyValueItem label={translate('product.labels.expire')}>
                                        {product.expire_at ? product.expire_at_locale : 'Onbeperkt'}
                                    </KeyValueItem>

                                    <KeyValueItem label={translate('product.labels.sold')}>
                                        {product.sold_amount}
                                    </KeyValueItem>

                                    <KeyValueItem label={translate('product.labels.reserved')}>
                                        {product.reserved_amount}
                                    </KeyValueItem>

                                    <KeyValueItem label={translate('product.labels.available_offers')}>
                                        {product.unlimited_stock
                                            ? translate('product.labels.unlimited')
                                            : product.stock_amount}
                                    </KeyValueItem>

                                    <KeyValueItem label={translate('product.labels.ean')}>
                                        <div className="flex flex-vertical flex-gap">
                                            <div>{product.ean ? product.ean : '-'}</div>

                                            <div className="block block-info-box block-info-box-secondary block-info-box-dashed">
                                                <em className="info-box-icon mdi mdi-information" />

                                                <div className="info-box-content">
                                                    <div className="block block-markdown">
                                                        <TranslateHtml i18n={'product.tooltips.ean'} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </KeyValueItem>

                                    <KeyValueItem label={translate('product.labels.sku')}>
                                        <div className="flex flex-vertical flex-gap">
                                            <div>{product.sku ? product.sku : '-'}</div>

                                            <div className="block block-info-box block-info-box-secondary block-info-box-dashed">
                                                <em className="info-box-icon mdi mdi-information" />

                                                <div className="info-box-content">
                                                    <div className="block block-markdown">
                                                        <TranslateHtml i18n={'product.tooltips.sku'} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </KeyValueItem>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-footer card-footer-primary flex flex-end">
                        <a className="button button-primary" onClick={() => deleteProduct(product)}>
                            <em className="mdi mdi-delete icon-start"> </em>
                            {translate('product.buttons.delete')}
                        </a>
                        <StateNavLink
                            className="button button-default"
                            name={'products-edit'}
                            params={{
                                organizationId: activeOrganization.id,
                                id: product.id,
                            }}>
                            <em className="mdi mdi-pen icon-start"> </em>
                            {translate('product.buttons.edit')}
                        </StateNavLink>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex-row">
                        <div className="flex-col flex-grow">
                            <div className="card-title">Fondsen</div>
                        </div>
                        <div className="flex-col flex-grow block block-inline-filters">
                            <div className="form">
                                <div className="form-group">
                                    <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Zoeken"
                                        value={filter.values.q}
                                        onChange={(e) => filter.update({ q: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {funds?.meta.total > 0 ? (
                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <tbody>
                                        <tr>
                                            <th className="th-narrow">Afbeelding</th>
                                            <th>Naam</th>
                                            <th>Geaccepteerd</th>
                                            {!product.sponsor_organization && <th>Beschikbaar</th>}
                                            <th className="th-narrow">Berichten</th>
                                            <th className="th-narrow" />
                                        </tr>
                                        {funds?.data?.map((fund) => (
                                            <tr key={fund.id}>
                                                <td>
                                                    <img
                                                        className="td-media"
                                                        alt={fund.name}
                                                        src={
                                                            fund.logo?.sizes?.thumbnail ||
                                                            assetUrl('/assets/img/placeholders/product-thumbnail.png')
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <div className="td-title">
                                                        {fund.name}
                                                        <div className="td-title-icon td-title-icon-suffix">
                                                            {fund.provider_excluded && (
                                                                <em className="mdi mdi-eye-off-outline" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>{fund.organization.name}</div>
                                                </td>
                                                <td>
                                                    {fund.approved ? (
                                                        <div className="label label-success">Geaccepteerd</div>
                                                    ) : (
                                                        <div className="label label-default">Wachtend</div>
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
                                                <td className="nowrap">
                                                    <a
                                                        className={`button button-default ${
                                                            !fund.approved || fund.provider_excluded
                                                                ? 'button-disabled'
                                                                : ''
                                                        }`}
                                                        href={`${fund.implementation.url_webshop}products/${product.id}`}
                                                        target="_blank"
                                                        rel="noreferrer">
                                                        <em className="mdi mdi-eye-outline icon-start"> </em>
                                                        {fund.provider_excluded
                                                            ? 'Verborgen op webshop'
                                                            : 'Bekijk op webshop'}
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
                                        name={'provider-funds'}
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
                            filters={filter.values}
                            updateFilters={filter.update}
                            perPageKey={paginatorKey}
                        />
                    </div>
                )}
            </div>
        </Fragment>
    );
}
