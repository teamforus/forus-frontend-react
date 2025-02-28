import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useParams } from 'react-router-dom';
import SponsorProduct, { DealHistory } from '../../../props/models/Sponsor/SponsorProduct';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import FundProviderChat from '../../../props/models/FundProviderChat';
import useOpenModal from '../../../hooks/useOpenModal';
import usePushSuccess from '../../../hooks/usePushSuccess';
import { strLimit } from '../../../helpers/string';
import Tooltip from '../../elements/tooltip/Tooltip';
import FundProviderProductEditor from './elements/FundProviderProductEditor';
import useUpdateProduct from '../fund-provider/hooks/useUpdateProduct';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useSetProgress from '../../../hooks/useSetProgress';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import FundProvider from '../../../props/models/FundProvider';
import useFundProviderChatService from '../../../services/FundProviderChatService';
import ModalFundProviderChatSponsor from '../../modals/ModalFundProviderChatSponsor';
import ModalFundProviderChatMessage from '../../modals/ModalFundProviderChatMessage';
import useTranslate from '../../../hooks/useTranslate';
import ProductDetailsBlock from '../products-view/elements/ProductDetailsBlock';
import ToggleControl from '../../elements/forms/controls/ToggleControl';
import usePushApiError from '../../../hooks/usePushApiError';

export default function FundProviderProductView() {
    const { id, fundId, fundProviderId } = useParams();

    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();
    const { updateProduct, disableProduct } = useUpdateProduct();

    const fundService = useFundService();
    const fundProviderChatService = useFundProviderChatService();

    const [deal, setDeal] = useState<DealHistory>(null);
    const [fund, setFund] = useState<Fund>(null);
    const [product, setProduct] = useState<SponsorProduct>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [fundProvider, setFundProvider] = useState<FundProvider>(null);
    const [fundProviderProductChat, setFundProviderProductChat] = useState<FundProviderChat>(null);

    const productAllowed = useMemo(() => {
        return fundProvider?.products?.includes(product?.id);
    }, [fundProvider?.products, product?.id]);

    const productHasLimits = useMemo(() => {
        return product?.deals_history?.filter((deal) => deal.active).length > 0;
    }, [product?.deals_history]);

    const disableProviderProduct = useCallback(
        (product: SponsorProduct) => {
            disableProduct(fundProvider, product).then((res) => setFundProvider(res));
        },
        [disableProduct, fundProvider],
    );

    const confirmDangerAction = useCallback(
        (title: string, description_text: string, cancelButton = 'Annuleren', confirmButton = 'Bevestigen') => {
            return new Promise((resolve) => {
                openModal((modal) => (
                    <ModalDangerZone
                        modal={modal}
                        title={title}
                        description={description_text}
                        buttonCancel={{
                            text: cancelButton,
                            onClick: () => {
                                modal.close();
                                resolve(false);
                            },
                        }}
                        buttonSubmit={{
                            text: confirmButton,
                            onClick: () => {
                                modal.close();
                                resolve(true);
                            },
                        }}
                    />
                ));
            });
        },
        [openModal],
    );

    const fetchProduct = useCallback(async () => {
        try {
            const res = await fundService.getProviderProduct(
                activeOrganization.id,
                parseInt(fundId),
                parseInt(fundProviderId),
                parseInt(id),
            );

            return setProduct(res.data.data);
        } catch (err) {
            return pushApiError(err);
        }
    }, [fundService, activeOrganization.id, fundId, fundProviderId, id, pushApiError]);

    const resetLimits = useCallback(
        (deal: DealHistory) => {
            confirmDangerAction(
                'Limiet verwijderen?',
                [
                    'U staat op het punt limieten van het aanbod te verwijderen, hiermee wordt het aanbod niet uit de webshop verwijderd.',
                    'In plaats daarvan wordt het totale limiet, limiet per tegoed en de vervaldatum van het aanbod verwijderd.\n\n',
                    'Wilt u het aabod van de webshop verwijderen? Sluit dan dit venster en gebruik de schakelaar in het bovenste gedeelte van deze pagina.',
                ].join(' '),
            ).then((confirmed = false) => {
                if (!confirmed) {
                    return;
                }

                fundService
                    .updateProvider(fund.organization_id, fund.id, fundProvider.id, {
                        reset_products: [{ id: deal.product_id }],
                    })
                    .then((res) => {
                        setFundProvider(res.data.data);
                        fetchProduct().then(() => pushSuccess('De limieten zijn hersteld.'));
                    })
                    .catch(pushApiError)
                    .finally(() => setDeal(null));
            });
        },
        [
            fund?.id,
            pushSuccess,
            fundService,
            pushApiError,
            fetchProduct,
            fundProvider?.id,
            confirmDangerAction,
            fund?.organization_id,
        ],
    );

    const updateAllowBudgetItem = useCallback(
        (product: SponsorProduct, allowed: boolean) => {
            const enable_products = allowed ? [{ id: product.id }] : [];
            const disable_products = !allowed ? [product.id] : [];

            updateProduct(fundProvider, { enable_products, disable_products }).then((res) => {
                setFundProvider(res);
                fetchProduct().then((r) => r);
            });
        },
        [fetchProduct, fundProvider, updateProduct],
    );

    const onCancel = useCallback(() => {
        setDeal(null);
        setShowEditor(false);
    }, []);

    const onUpdate = useCallback(
        (fundProvider: FundProvider) => {
            setFundProvider(fundProvider);

            fetchProduct().then(() => {
                onCancel();
                pushSuccess('Het aanbod is goedgekeurd.');
            });
        },
        [fetchProduct, onCancel, pushSuccess],
    );

    const fetchChat = useCallback(() => {
        fundProviderChatService
            .list(activeOrganization.id, parseInt(fundId), parseInt(fundProviderId), {
                product_id: parseInt(id),
            })
            .then((res) => setFundProviderProductChat(res.data.data[0] || null))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [fundProviderChatService, activeOrganization.id, fundId, fundProviderId, id, pushApiError, setProgress]);

    const showTheChat = useCallback(() => {
        if (!fundProviderProductChat) {
            return;
        }

        openModal(
            (modal) => (
                <ModalFundProviderChatSponsor
                    modal={modal}
                    fund={fund}
                    product={product}
                    chat={fundProviderProductChat}
                    organization={activeOrganization}
                    fundProvider={fundProvider}
                />
            ),
            { onClosed: fetchChat },
        );
    }, [activeOrganization, fetchChat, fund, fundProvider, fundProviderProductChat, openModal, product]);

    const makeChat = useCallback(() => {
        openModal((modal) => (
            <ModalFundProviderChatMessage
                modal={modal}
                product={product}
                fund={fund}
                fundProvider={fundProvider}
                organization={activeOrganization}
                onSubmit={(chat) => {
                    setFundProviderProductChat(chat);
                    pushSuccess('Opgeslagen!');
                    showTheChat();
                }}
            />
        ));
    }, [activeOrganization, fund, fundProvider, openModal, product, pushSuccess, showTheChat]);

    const fetchFundProvider = useCallback(() => {
        setProgress(0);

        fundService
            .readProvider(activeOrganization.id, parseInt(fundId), parseInt(fundProviderId))
            .then((res) => setFundProvider(res.data.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization.id, fundId, fundProviderId, pushApiError]);

    const fetchFund = useCallback(() => {
        setProgress(0);

        fundService
            .readPublic(parseInt(fundId))
            .then((res) => setFund(res.data.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [fundId, fundService, pushApiError, setProgress]);

    useEffect(() => {
        fetchFund();
    }, [fetchFund]);

    useEffect(() => {
        fetchChat();
    }, [fetchChat]);

    useEffect(() => {
        fetchFundProvider();
    }, [fetchFundProvider]);

    useEffect(() => {
        if (fundProvider?.id) {
            fetchProduct().then((r) => r);
        }
    }, [fetchProduct, fundProvider?.id]);

    if (!product || !fund || !fundProvider) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'sponsor-provider-organizations'}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {translate('page_state_titles.organization-providers')}
                </StateNavLink>
                <StateNavLink
                    name={'sponsor-provider-organization'}
                    params={{
                        id: fundProvider.organization.id,
                        organizationId: activeOrganization.id,
                    }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {strLimit(fundProvider.organization.name, 40)}
                </StateNavLink>
                <StateNavLink
                    name={'fund-provider'}
                    params={{
                        id: fundProvider.id,
                        fundId: fund.id,
                        organizationId: activeOrganization.id,
                    }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {strLimit(fundProvider.fund.name, 40)}
                </StateNavLink>
                <div className="breadcrumb-item active">{strLimit(product.name, 40)}</div>
            </div>

            <div className="card">
                <div className="card-section">
                    <ProductDetailsBlock
                        viewType={'sponsor'}
                        product={product}
                        toggleElement={
                            <Fragment>
                                {fundProvider.fund.type == 'budget' && (
                                    <div className="form">
                                        <div className="form-group form-group-inline">
                                            <ToggleControl
                                                checked={fundProvider.allow_products || productAllowed}
                                                disabled={fundProvider.allow_products}
                                                onChange={(e) => updateAllowBudgetItem(product, e.target.checked)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {fundProvider.fund.type == 'subsidies' && (
                                    <Fragment>
                                        {product.is_available && !productAllowed && (
                                            <StateNavLink
                                                name={'fund-provider-product-subsidy-edit'}
                                                params={{
                                                    id: product.id,
                                                    fundId: fundProvider.fund_id,
                                                    fundProviderId: fundProvider.id,
                                                    organizationId: activeOrganization.id,
                                                }}
                                                className="button button-primary button-sm nowrap">
                                                <em className="mdi mdi-play icon-start" />
                                                {translate('product.buttons.subsidy_edit')}
                                            </StateNavLink>
                                        )}

                                        {product.is_available && productAllowed && (
                                            <div className="tag tag-success nowrap">
                                                {translate('product.buttons.subsidy_active')}
                                                <em
                                                    className="mdi mdi-close icon-end clickable"
                                                    onClick={() => disableProviderProduct(product)}
                                                />
                                            </div>
                                        )}
                                    </Fragment>
                                )}
                            </Fragment>
                        }
                    />
                </div>
                <div className="card-footer card-footer-primary flex flex-end">
                    {!product.sponsor_organization_id && !fundProviderProductChat && (
                        <button type="button" className="button button-primary-light" onClick={() => makeChat()}>
                            <em className="mdi mdi-message-text icon-start" />
                            Nieuw aanpassingsverzoek
                        </button>
                    )}

                    {product.sponsor_organization_id === activeOrganization.id && !fundProviderProductChat && (
                        <StateNavLink
                            className="button button-primary"
                            name={'fund-provider-product-edit'}
                            params={{
                                id: product.id,
                                fundId: fundProvider.fund_id,
                                fundProviderId: fundProvider.id,
                                organizationId: activeOrganization.id,
                            }}>
                            <em className="mdi mdi-pencil icon-start" />
                            Bewerken
                        </StateNavLink>
                    )}

                    {!product.sponsor_organization && fundProviderProductChat && (
                        <div className={'button-group flex flex-gap'}>
                            {fundProviderProductChat.sponsor_unseen_messages > 0 && (
                                <div>
                                    <span className="button button-text button-text-padless button-disabled">
                                        <span className="text text-black">
                                            {fundProviderProductChat.sponsor_unseen_messages} nieuwe
                                        </span>
                                    </span>
                                </div>
                            )}

                            <button
                                type="button"
                                className={`button button-icon ${
                                    fundProviderProductChat.sponsor_unseen_messages > 0
                                        ? 'button-primary-light'
                                        : 'button-default'
                                }`}
                                disabled={!fundProviderProductChat}
                                onClick={() => showTheChat()}>
                                <em
                                    className={`mdi mdi-message-text ${
                                        fundProviderProductChat && !fundProviderProductChat.sponsor_unseen_messages
                                            ? 'text-primary'
                                            : ''
                                    }`}
                                />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {activeOrganization.allow_budget_fund_limits &&
                fund.type == 'budget' &&
                !productHasLimits &&
                !deal &&
                !showEditor && (
                    <div className="card">
                        <div className="card-section">
                            <div className="block block-empty text-center">
                                {(productAllowed || fundProvider.allow_products) && (
                                    <div className="empty-details">
                                        Er zijn momenteel geen beperkingen op het aanbod ingesteld.
                                    </div>
                                )}

                                {!productAllowed && !fundProvider.allow_products && (
                                    <div className="empty-details">
                                        <div className="empty-details">Het aanbod is nog niet goedgekeurd</div>
                                    </div>
                                )}

                                <div className="empty-actions">
                                    <button className="button button-primary" onClick={() => setShowEditor(true)}>
                                        <em className="mdi mdi-cog-outline icon-start" />
                                        {fundProvider.allow_products || productAllowed
                                            ? 'Stel een limiet in'
                                            : 'Aanbod goedkeuren met ingesteld limit'}
                                    </button>

                                    {product.deals_history.length > 0 && (
                                        <button
                                            className="button button-default"
                                            onClick={() => setShowHistory(!showHistory)}>
                                            <em className="mdi mdi-clipboard-text-clock-outline icon-start" />
                                            {showHistory ? 'Toon geschiedenis' : 'Verbeg geschiedenis'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            {activeOrganization.allow_budget_fund_limits && fund.type == 'budget' && (deal || showEditor) && (
                <FundProviderProductEditor
                    fundProvider={fundProvider}
                    product={product}
                    fund={fund}
                    deal={deal}
                    onCancel={() => onCancel()}
                    onUpdate={(data) => onUpdate(data)}
                    onReset={(deal) => resetLimits(deal)}
                />
            )}

            {!deal &&
                product.deals_history.length > 0 &&
                (fund.type == 'subsidies' || showHistory || productHasLimits) && (
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">
                                <div className="ellipsis">{`Lopende en verlopen acties op ${product.name}`}</div>
                            </div>
                        </div>
                        <div className="card-section card-section-padless">
                            <div className="table-wrapper">
                                <table className="table">
                                    <tbody>
                                        <tr>
                                            <th className="td-narrow">Gebruikt</th>
                                            <th className="td-narrow">Gereserveerd</th>
                                            <th>
                                                <div className="flex flex-horizontal">
                                                    <div className="flex">Totaal aantal aanbiedingen</div>
                                                    <div className="flex">
                                                        <Tooltip text="Totaal aantal aanbiedingen waaraan uw organisatie wilt bijdragen" />
                                                    </div>
                                                </div>
                                            </th>
                                            <th>Limiet per aanvrager</th>
                                            {fund.type == 'subsidies' && <th>Bijdrage</th>}
                                            <th>Status</th>
                                            <th>Verloopdatum</th>
                                            <th className="text-right">Acties</th>
                                        </tr>

                                        {product.deals_history.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.voucher_transactions_count}</td>
                                                <td>{item.product_reservations_pending_count}</td>
                                                <td>
                                                    {item.limit_total_unlimited || item.limit_total === null
                                                        ? 'Onbeperkt'
                                                        : item.limit_total}
                                                </td>
                                                <td>
                                                    {item.limit_per_identity === null
                                                        ? 'Onbeperkt'
                                                        : item.limit_per_identity}
                                                </td>
                                                {fund.type == 'subsidies' && <td>{item.amount_locale}</td>}
                                                <td>
                                                    {item.expire_at_locale
                                                        ? item.expire_at_locale
                                                        : 'Verloopt met het fonds'}
                                                </td>
                                                <td>
                                                    {item.active ? (
                                                        <div className="tag tag-success">Actief</div>
                                                    ) : (
                                                        <div className="tag tag-default">Afgelopen</div>
                                                    )}
                                                </td>
                                                {!(fund.type == 'subsidies' || item.active) ? (
                                                    <td className="td-narrow">
                                                        <div className="text-right text-muted">-</div>
                                                    </td>
                                                ) : (
                                                    <td className="td-narrow">
                                                        <div className="button-group">
                                                            {fund.type == 'budget' && item.active && (
                                                                <Fragment>
                                                                    <button
                                                                        className="button button-default button-sm button-icon"
                                                                        type="button"
                                                                        onClick={() => setDeal(item)}>
                                                                        <em className="mdi mdi-cog-outline" />
                                                                    </button>

                                                                    <button
                                                                        className="button button-danger button-sm button-icon"
                                                                        type="button"
                                                                        onClick={() => resetLimits(item)}>
                                                                        <em className="mdi mdi-trash-can-outline" />
                                                                    </button>
                                                                </Fragment>
                                                            )}

                                                            {fund.type == 'subsidies' && (
                                                                <StateNavLink
                                                                    name="fund-provider-product-subsidy-edit"
                                                                    params={{
                                                                        id: product.id,
                                                                        fundId: fundProvider.fund_id,
                                                                        fundProviderId: fundProvider.id,
                                                                        organizationId: activeOrganization.id,
                                                                    }}
                                                                    query={{ deal_id: item.id }}
                                                                    className="button button-default button-sm">
                                                                    <em className="mdi mdi-eye-outline icon-start" />
                                                                    Bekijk
                                                                </StateNavLink>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
        </Fragment>
    );
}
