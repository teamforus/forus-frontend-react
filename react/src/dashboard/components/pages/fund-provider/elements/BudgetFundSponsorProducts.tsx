import React, { useCallback, useEffect, useState } from 'react';
import { PaginationData, ResponseError } from '../../../../props/ApiResponses';
import usePushDanger from '../../../../hooks/usePushDanger';
import FundProvider from '../../../../props/models/FundProvider';
import Organization from '../../../../props/models/Organization';
import useFilter from '../../../../hooks/useFilter';
import Paginator from '../../../../modules/paginator/components/Paginator';
import { useOrganizationService } from '../../../../services/OrganizationService';
import useSetProgress from '../../../../hooks/useSetProgress';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import TableRowActions from '../../../elements/tables/TableRowActions';
import useUpdateProduct from '../hooks/useUpdateProduct';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';

type ProductLocal = SponsorProduct & {
    allowed: boolean;
};

export default function BudgetFundSponsorProducts({
    fundProvider,
    organization,
    onChange,
}: {
    fundProvider: FundProvider;
    organization: Organization;
    onChange: (data: FundProvider) => void;
}) {
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const { updateProduct, deleteProduct } = useUpdateProduct();

    const organizationService = useOrganizationService();

    const [products, setProducts] = useState<PaginationData<ProductLocal>>(null);
    const [submitting, setSubmitting] = useState(null);

    const filter = useFilter({ q: '', per_page: 15 });

    const updateAllowBudgetItem = useCallback(
        (product: ProductLocal, allowed: boolean) => {
            setSubmitting(product.id);

            const enable_products = allowed ? [{ id: product.id }] : [];
            const disable_products = !allowed ? [product.id] : [];

            updateProduct(fundProvider, { enable_products, disable_products })
                .then((res) => onChange(res))
                .finally(() => setSubmitting(null));
        },
        [fundProvider, onChange, updateProduct],
    );

    const mapProduct = useCallback(
        (product: SponsorProduct) => ({
            ...product,
            allowed: fundProvider.products.indexOf(product.id) !== -1,
        }),
        [fundProvider.products],
    );

    const fetchProducts = useCallback(() => {
        setProgress(0);

        organizationService
            .sponsorProducts(organization.id, fundProvider.organization_id, filter.activeValues)
            .then((res) =>
                setProducts({
                    ...res.data,
                    data: res.data.data.map((product) => mapProduct(product)),
                }),
            )
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
            .finally(() => setProgress(100));
    }, [
        mapProduct,
        pushDanger,
        setProgress,
        organization.id,
        filter.activeValues,
        organizationService,
        fundProvider.organization_id,
    ]);

    const deleteProductItem = useCallback(
        (product: ProductLocal) => deleteProduct(organization, fundProvider, product).then(() => fetchProducts()),
        [deleteProduct, fetchProducts, fundProvider, organization],
    );

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    if (!products) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="row">
                    <div className="col-lg-8 flex">
                        <div className="card-title">Aanbod in beheer van {organization.name}</div>
                        <StateNavLink
                            name={'fund-provider-product-create'}
                            params={{
                                fundId: fundProvider.fund_id,
                                fundProviderId: fundProvider.id,
                                organizationId: organization.id,
                            }}
                            className="button button-text button-text button-text-muted">
                            <em className="mdi mdi-plus-circle icon-start" />
                            Voeg een aanbod toe
                        </StateNavLink>
                    </div>
                    <div className="col-lg-4">
                        <div className="card-header-drown">
                            <div className="block block-inline-filters">
                                <div className="form">
                                    <div className="form-group">
                                        <input
                                            className="form-control"
                                            value={filter.values.q}
                                            onChange={(e) => filter.update({ q: e.target.value })}
                                            placeholder="Zoeken"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {fundProvider.allow_products && products.meta.total > 0 && (
                <div className="card-section card-section-success card-section-narrow">
                    <em>
                        U kunt niet individuele producten uitzetten terwijl een globale instelling aan staat. Zet de
                        globale instelling uit om individuele producten goed te keuren.
                    </em>
                </div>
            )}

            <div className="card-section card-section-padless">
                <div className="table-wrapper">
                    <table className="table">
                        <tbody>
                            <tr>
                                <th className="td-narrow">Afbeelding</th>
                                <th>Naam</th>
                                <th>Aantal</th>
                                <th>Prijs</th>
                                <th>Geaccepteerd</th>
                                <th />
                            </tr>
                            {products.data.map((product) => (
                                <tr key={product.id}>
                                    <td className="td-narrow">
                                        <img
                                            className="td-media"
                                            src={
                                                product.photo
                                                    ? product.photo.sizes.small
                                                    : './assets/img/placeholders/product-small.png'
                                            }
                                            alt={product.name}
                                        />
                                    </td>
                                    <td>{product.name}</td>
                                    {product.unlimited_stock ? <td>Ongelimiteerd</td> : <td>{product.stock_amount}</td>}
                                    <td className="nowrap">{product.price_locale}</td>

                                    <td className="td-narrow">
                                        <div className="form pull-right">
                                            <label
                                                className={`form-toggle ${
                                                    fundProvider.state == 'accepted'
                                                        ? fundProvider.allow_products
                                                            ? 'form-toggle-active'
                                                            : ''
                                                        : 'form-toggle-off'
                                                }
                                            ${
                                                fundProvider.state !== 'accepted' ||
                                                fundProvider.allow_products ||
                                                submitting === product.id
                                                    ? 'form-toggle-disabled'
                                                    : ''
                                            }`}
                                                htmlFor={`product_${product.id}_enabled`}>
                                                <input
                                                    type="checkbox"
                                                    id={`product_${product.id}_enabled`}
                                                    checked={product.allowed}
                                                    onChange={(e) => updateAllowBudgetItem(product, e.target.checked)}
                                                />
                                                <div className="form-toggle-inner">
                                                    <div className="toggle-input">
                                                        <div className="toggle-input-dot" />
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </td>

                                    <td className="td-narrow text-right">
                                        <TableRowActions
                                            content={() => (
                                                <div className="dropdown dropdown-actions">
                                                    <StateNavLink
                                                        name={'fund-provider-product'}
                                                        params={{
                                                            id: product.id,
                                                            fundId: fundProvider.fund_id,
                                                            fundProviderId: fundProvider.id,
                                                            organizationId: organization.id,
                                                        }}
                                                        className="dropdown-item">
                                                        Bekijken
                                                    </StateNavLink>

                                                    <StateNavLink
                                                        className="dropdown-item"
                                                        name={'fund-provider-product-create'}
                                                        params={{
                                                            fundId: fundProvider.fund_id,
                                                            source: product.id,
                                                            fundProviderId: fundProvider.id,
                                                            organizationId: organization.id,
                                                        }}
                                                        query={{ source_id: product.id }}>
                                                        Kopieren
                                                    </StateNavLink>

                                                    <StateNavLink
                                                        className="dropdown-item"
                                                        name={'fund-provider-product-edit'}
                                                        params={{
                                                            id: product.id,
                                                            fundId: fundProvider.fund_id,
                                                            fundProviderId: fundProvider.id,
                                                            organizationId: organization.id,
                                                        }}>
                                                        Bewerken
                                                    </StateNavLink>

                                                    <a
                                                        className="dropdown-item"
                                                        onClick={() => deleteProductItem(product)}>
                                                        Verwijderen
                                                    </a>
                                                </div>
                                            )}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {products.meta.total == 0 && <EmptyCard type={'card-section'} title={'Geen aanbiedingen'} />}

            {products.meta && (
                <div className="card-section card-section-narrow" hidden={products?.meta?.total < 1}>
                    <Paginator meta={products.meta} filters={filter.values} updateFilters={filter.update} />
                </div>
            )}
        </div>
    );
}
