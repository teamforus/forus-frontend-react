import React, { Fragment, MouseEvent, useCallback, useMemo } from 'react';
import TableEntityMain from '../../../elements/tables/elements/TableEntityMain';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import classNames from 'classnames';
import Label from '../../../elements/label/Label';
import TableDateOnly from '../../../elements/tables/elements/TableDateOnly';
import SponsorProduct, { DealHistoryItem } from '../../../../props/models/Sponsor/SponsorProduct';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import TableRowActions from '../../../elements/tables/TableRowActions';
import useTranslate from '../../../../hooks/useTranslate';
import FundProvider from '../../../../props/models/FundProvider';
import Organization from '../../../../props/models/Organization';
import useUpdateProduct from '../hooks/useUpdateProduct';
import Fund from '../../../../props/models/Fund';
import TableDateTime from '../../../elements/tables/elements/TableDateTime';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

type ProductLocal = SponsorProduct & {
    allowed?: boolean;
    active_deal?: DealHistoryItem;
};

export default function FundProviderProductRowData({
    deal,
    fund,
    product,
    organization,
    fundProvider,
    onStartChat,
    history = false,
    onChange,
    onChangeProvider,
}: {
    deal: DealHistoryItem;
    fund: Fund;
    product: ProductLocal;
    organization: Organization;
    fundProvider: FundProvider;
    onStartChat?: (e: MouseEvent, product: ProductLocal) => void;
    history?: boolean;
    onChange: () => void;
    onChangeProvider: (data: FundProvider) => void;
}) {
    const translate = useTranslate();
    const { disableProduct, deleteSponsorProduct, editProduct, isProductConfigurable } = useUpdateProduct();

    const isInformationalProduct = useMemo(() => {
        return product?.price_type === 'informational';
    }, [product?.price_type]);

    const disableProviderProduct = useCallback(
        (product: ProductLocal) => {
            disableProduct(fundProvider, product).then((res) => onChangeProvider(res));
        },
        [disableProduct, fundProvider, onChangeProvider],
    );

    const editProviderProduct = useCallback(
        (product: ProductLocal) => {
            editProduct(fund, fundProvider, product).then((res) => onChangeProvider(res));
        },
        [fund, editProduct, fundProvider, onChangeProvider],
    );

    const deleteProductItem = useCallback(
        (product: ProductLocal) => {
            deleteSponsorProduct(organization, fundProvider, product).then(() => onChange());
        },
        [deleteSponsorProduct, onChange, fundProvider, organization],
    );

    return (
        <Fragment>
            {!history && (
                <td title={product.name}>
                    <TableEntityMain
                        title={product.name}
                        titleLimit={45}
                        subtitleProperties={[
                            { label: 'Prijs:', value: product.price_locale },
                            ...(product.price_type != 'informational'
                                ? [
                                      {
                                          label: 'Totaal:',
                                          value: product.unlimited_stock ? 'Ongelimiteerd' : product.stock_amount,
                                      },
                                      { label: 'Gebruikt:', value: product.sold_amount },
                                  ]
                                : []),
                        ]}
                        media={product.photos[0]}
                        mediaRound={false}
                        mediaSize={'md'}
                        mediaPlaceholder={'product'}
                    />
                </td>
            )}

            {fund.show_subsidies && (!isInformationalProduct || !history) && (
                <td>
                    {deal ? (
                        <Fragment>
                            <div className={'text-strong'}>
                                {deal.payment_type === 'subsidy' ? deal.amount_locale : 'Ja'}
                            </div>
                            <div className="text-muted-dark">{deal.payment_type_locale}</div>
                        </Fragment>
                    ) : fundProvider?.allow_products ? (
                        <Fragment>
                            <div className={'text-strong'}>Ja</div>
                            <div className="text-muted-dark">Budget</div>
                        </Fragment>
                    ) : (
                        <TableEmptyValue />
                    )}
                </td>
            )}

            {fund.show_subsidies && (!isInformationalProduct || !history) && (
                <td>
                    {deal ? (
                        <Fragment>
                            {deal.amount_identity === null ? (
                                <TableEmptyValue />
                            ) : (
                                <div className={'text-strong'}>{deal.amount_identity_locale}</div>
                            )}
                        </Fragment>
                    ) : fundProvider?.allow_products ? (
                        <Fragment>
                            <div className={'text-strong'}>{product?.price_locale}</div>
                        </Fragment>
                    ) : (
                        <TableEmptyValue />
                    )}
                </td>
            )}

            {fund.show_requester_limits && (!isInformationalProduct || !history) && (
                <Fragment>
                    <td>{deal?.limit_total ? deal.limit_total : <TableEmptyValue />}</td>
                    <td>{deal?.limit_per_identity ? deal.limit_per_identity : <TableEmptyValue />}</td>
                </Fragment>
            )}

            {onStartChat && (
                <td>
                    <a
                        className={classNames(
                            'td-icon-text',
                            'td-icon-text-link',
                            !product.fund_provider_product_chat && 'td-icon-text-muted',
                            product.fund_provider_product_chat?.sponsor_unseen_messages > 0 && 'td-icon-text-primary',
                        )}
                        role={'button'}
                        onClick={(e) => onStartChat(e, product)}>
                        <em className="mdi mdi-message-text" />
                        {product.fund_provider_product_chat?.sponsor_unseen_messages > 0 &&
                            product.fund_provider_product_chat?.sponsor_unseen_messages.toString()}
                    </a>
                </td>
            )}

            {history ? (
                <td>{deal?.active ? <Label type="success">Actief</Label> : <Label type="default">Archief</Label>}</td>
            ) : (
                <td>
                    {product.is_available && (fundProvider?.allow_products || product.allowed) ? (
                        <Label type="success">Actief</Label>
                    ) : (
                        <Label type="default">In afwachting</Label>
                    )}
                </td>
            )}

            <td>
                <TableDateOnly value={deal?.expire_at_locale} />
            </td>

            {history && (
                <td>
                    <TableDateTime value={deal?.created_at_locale} />
                </td>
            )}

            {history && (
                <td>
                    <TableDateTime value={deal?.updated_at_locale} />
                </td>
            )}

            <td className={'table-td-actions text-right'}>
                <TableRowActions
                    disabled={history && !deal?.active}
                    buttons={
                        history && !deal?.active ? (
                            <Fragment></Fragment>
                        ) : (
                            <Fragment>
                                {product.is_available ? (
                                    <Fragment>
                                        {!fundProvider?.allow_products && product.allowed && (
                                            <div
                                                title={translate('product.buttons.stop_product')}
                                                role={'button'}
                                                className={'button button-text button-menu'}
                                                onClick={(e) => {
                                                    e?.preventDefault();
                                                    e?.stopPropagation();
                                                    disableProviderProduct(product);
                                                }}>
                                                <em className="mdi mdi-close-circle-outline" />
                                            </div>
                                        )}

                                        {!fundProvider?.allow_products && !product.allowed && (
                                            <div
                                                title={translate('product.buttons.approve_product')}
                                                role={'button'}
                                                className={'button button-text button-menu'}
                                                onClick={(e) => {
                                                    e?.preventDefault();
                                                    e?.stopPropagation();
                                                    editProviderProduct(product);
                                                }}>
                                                <em className="mdi mdi-play-circle-outline" />
                                            </div>
                                        )}

                                        {fundProvider?.allow_products && isProductConfigurable(fund) && (
                                            <div
                                                title={translate('product.buttons.edit_product')}
                                                role={'button'}
                                                className={'button button-text button-menu'}
                                                onClick={(e) => {
                                                    e?.preventDefault();
                                                    e?.stopPropagation();
                                                    editProviderProduct(product);
                                                }}>
                                                <em className="mdi mdi-cog-outline" />
                                            </div>
                                        )}
                                    </Fragment>
                                ) : (
                                    <div className="flex flex-center">
                                        <div className="flex-self-center">
                                            <Label type="text" nowrap={true}>
                                                Niet beschikbaar
                                            </Label>
                                            <div className="hidden" />
                                        </div>
                                    </div>
                                )}
                            </Fragment>
                        )
                    }
                    content={(fd) => (
                        <div className="dropdown dropdown-actions">
                            {!history && (
                                <StateNavLink
                                    name={DashboardRoutes.FUND_PROVIDER_PRODUCT}
                                    params={{
                                        id: product.id,
                                        fundId: fundProvider.fund_id,
                                        fundProviderId: fundProvider.id,
                                        organizationId: organization.id,
                                    }}
                                    className="dropdown-item">
                                    <em className="mdi mdi-eye-outline icon-start" />
                                    Bekijken
                                </StateNavLink>
                            )}

                            {!fundProvider?.allow_products && !product.allowed && (
                                <div
                                    className="dropdown-item"
                                    onClick={() => {
                                        fd.close();
                                        editProviderProduct(product);
                                    }}>
                                    <em className="mdi mdi-play-circle-outline icon-start" />
                                    {translate('product.buttons.approve_product')}
                                </div>
                            )}

                            {!fundProvider?.allow_products && product.allowed && (
                                <div
                                    className="dropdown-item"
                                    onClick={() => {
                                        fd.close();
                                        disableProviderProduct(product);
                                    }}>
                                    <em className="mdi mdi-close-circle-outline icon-start" />
                                    {translate('product.buttons.stop_product')}
                                </div>
                            )}

                            {(fundProvider?.allow_products || product.allowed) && isProductConfigurable(fund) && (
                                <a
                                    onClick={() => {
                                        fd.close();
                                        editProviderProduct(product);
                                    }}
                                    className="dropdown-item">
                                    <em className="mdi mdi-cog-outline icon-start" />
                                    {translate('product.buttons.edit_product')}
                                </a>
                            )}

                            {!history && onStartChat && (
                                <a
                                    onClick={(e) => {
                                        fd.close();
                                        onStartChat(e, product);
                                    }}
                                    className="dropdown-item">
                                    <em className="mdi mdi-message-text-outline icon-start" />
                                    Stuur een bericht
                                </a>
                            )}

                            {!history && organization.manage_provider_products && (
                                <StateNavLink
                                    name={DashboardRoutes.FUND_PROVIDER_PRODUCT_CREATE}
                                    params={{
                                        fundId: fundProvider.fund_id,
                                        source: product.id,
                                        fundProviderId: fundProvider.id,
                                        organizationId: organization.id,
                                    }}
                                    query={{ source_id: product.id }}
                                    className="dropdown-item">
                                    <em className="mdi mdi-content-copy icon-start" />
                                    Kopieren
                                </StateNavLink>
                            )}

                            {!history && product?.sponsor_organization_id && (
                                <Fragment>
                                    <StateNavLink
                                        name={DashboardRoutes.FUND_PROVIDER_PRODUCT_EDIT}
                                        params={{
                                            id: product.id,
                                            fundId: fundProvider.fund_id,
                                            fundProviderId: fundProvider.id,
                                            organizationId: organization.id,
                                        }}
                                        className="dropdown-item">
                                        <em className="mdi mdi-pencil-outline icon-start" />
                                        Bewerken
                                    </StateNavLink>

                                    <a
                                        className="dropdown-item"
                                        onClick={() => {
                                            fd.close();
                                            deleteProductItem(product);
                                        }}>
                                        <em className="mdi mdi-delete-outline icon-start" />
                                        Verwijderen
                                    </a>
                                </Fragment>
                            )}
                        </div>
                    )}
                />
            </td>
        </Fragment>
    );
}
