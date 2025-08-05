import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import PhotoSelector from '../../../elements/photo-selector/PhotoSelector';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import FormError from '../../../elements/forms/errors/FormError';
import { useNavigateState } from '../../../../modules/state_router/Router';
import { useMediaService } from '../../../../services/MediaService';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import useSetProgress from '../../../../hooks/useSetProgress';
import Organization from '../../../../props/models/Organization';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import MarkdownEditor from '../../../elements/forms/markdown-editor/MarkdownEditor';
import Tooltip from '../../../elements/tooltip/Tooltip';
import Product from '../../../../props/models/Product';
import useProductService from '../../../../services/ProductService';
import DatePickerControl from '../../../elements/forms/controls/DatePickerControl';
import SelectControl from '../../../elements/select-control/SelectControl';
import ProductCategoriesControl from './ProductCategoriesControl';
import FundProvider from '../../../../props/models/FundProvider';
import { useFundService } from '../../../../services/FundService';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalNotification from '../../../modals/ModalNotification';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import { useOrganizationService } from '../../../../services/OrganizationService';
import { ApiResponseSingle, ResponseError } from '../../../../props/ApiResponses';
import CheckboxControl from '../../../elements/forms/controls/CheckboxControl';
import { dateFormat, dateParse } from '../../../../helpers/dates';
import { hasPermission } from '../../../../helpers/utils';
import { strLimit } from '../../../../helpers/string';
import useTranslate from '../../../../hooks/useTranslate';
import TranslateHtml from '../../../elements/translate-html/TranslateHtml';
import FormGroupInfo from '../../../elements/forms/elements/FormGroupInfo';
import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';
import usePushApiError from '../../../../hooks/usePushApiError';
import FormGroup from '../../../elements/forms/elements/FormGroup';

export default function ProductsForm({
    organization,
    fundProvider,
    sourceId,
    id,
}: {
    organization: Organization;
    fundProvider?: FundProvider;
    sourceId?: number;
    id?: number;
}) {
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const [mediaFile, setMediaFile] = useState<Blob>(null);

    const mediaService = useMediaService();
    const fundService = useFundService();
    const productService = useProductService();
    const organizationService = useOrganizationService();

    const navigateState = useNavigateState();
    const openModal = useOpenModal();
    const appConfigs = useAppConfigs();

    const [reservationPoliciesText] = useState({
        accept: 'Automatisch accepteren',
        review: 'Handmatig controleren',
    });

    const [reservationExtraPaymentText] = useState({
        no: 'Nee',
        yes: 'Ja',
    });

    const [reservationFieldText] = useState({
        no: 'Nee',
        optional: 'Optioneel',
        required: 'Verplicht',
    });

    const [reservationNoteOptionText] = useState(() => [
        { value: 'no', label: 'Geen' },
        { value: 'custom', label: 'Aangepaste aankoopnotitie' },
    ]);

    const [reservationFieldOptions] = useState(() => [
        { value: 'no', label: 'Nee' },
        { value: 'optional', label: 'Optioneel' },
        { value: 'required', label: 'Verplicht' },
    ]);

    const reservationPolicies = useMemo(() => {
        const defaultValue = reservationPoliciesText[organization.reservations_auto_accept ? 'accept' : 'review'];

        return [
            { value: 'global', label: `Gebruik standaard instelling (${defaultValue})` },
            { value: 'accept', label: 'Automatisch accepteren' },
            { value: 'review', label: 'Handmatig controleren' },
        ];
    }, [organization?.reservations_auto_accept, reservationPoliciesText]);

    const extraPaymentsOptions = useMemo(() => {
        const defaultValue = reservationExtraPaymentText[organization.reservation_allow_extra_payments ? 'yes' : 'no'];

        return [
            { value: 'global', label: `Gebruik standaard instelling (${defaultValue})` },
            { value: 'no', label: 'Nee' },
            { value: 'yes', label: 'Ja' },
        ];
    }, [organization?.reservation_allow_extra_payments, reservationExtraPaymentText]);

    const reservationPhoneOptions = useMemo(() => {
        const defaultValue = reservationFieldText[organization.reservation_phone];

        return [
            { value: 'global', label: `Gebruik standaard instelling (${defaultValue})` },
            ...reservationFieldOptions,
        ];
    }, [organization?.reservation_phone, reservationFieldText, reservationFieldOptions]);

    const reservationAddressOptions = useMemo(() => {
        const defaultValue = reservationFieldText[organization.reservation_address];

        return [
            { value: 'global', label: `Gebruik standaard instelling (${defaultValue})` },
            ...reservationFieldOptions,
        ];
    }, [organization?.reservation_address, reservationFieldText, reservationFieldOptions]);

    const reservationBirthDateOptions = useMemo(() => {
        const defaultValue = reservationFieldText[organization.reservation_birth_date];

        return [
            { value: 'global', label: `Gebruik standaard instelling (${defaultValue})` },
            ...reservationFieldOptions,
        ];
    }, [organization?.reservation_birth_date, reservationFieldText, reservationFieldOptions]);

    const reservationNoteOptions = useMemo(() => {
        const defaultValue = organization.reservation_note ? 'Ja' : 'Nee';

        return [
            { value: 'global', label: `Gebruik standaard instelling (${defaultValue})` },
            ...reservationNoteOptionText,
        ];
    }, [organization?.reservation_note, reservationNoteOptionText]);

    const [priceTypes] = useState([
        { value: 'regular', label: 'Normaal' },
        { value: 'discount_fixed', label: 'Korting €' },
        { value: 'discount_percentage', label: 'Korting %' },
        { value: 'free', label: 'Gratis' },
    ]);

    const [showInfoBlockStock, setShowInfoBlockStock] = useState<boolean>(false);
    const [showInfoBlockStockReservationPolicy, setShowInfoBlockStockReservationPolicy] = useState<boolean>(false);

    const [isEditable, setIsEditable] = useState<boolean>(true);
    const [allowsReservations, setAllowsReservations] = useState<boolean>(true);
    const [nonExpiring, setNonExpiring] = useState<boolean>(false);
    const [mediaErrors] = useState<string[]>(null);
    const [product, setProduct] = useState<Product | SponsorProduct>(null);
    const [sourceProduct, setSourceProduct] = useState<Product | SponsorProduct>(null);
    const [products, setProducts] = useState<Product[]>(null);

    const goToFundProvider = useCallback(
        (provider: FundProvider) => {
            navigateState('fund-provider', {
                id: provider.id,
                fundId: provider.fund_id,
                organizationId: provider.fund.organization_id,
            });
        },
        [navigateState],
    );

    const uploadMedia = useCallback(() => {
        const syncPresets = ['thumbnail', 'small'];

        return new Promise((resolve, reject) => {
            if (mediaFile) {
                setProgress(0);

                return mediaService
                    .store('product_photo', mediaFile, syncPresets)
                    .then((res) => resolve(res.data.data.uid))
                    .catch((err) => reject(err.data.errors.file))
                    .finally(() => setProgress(100));
            }

            if (!product && sourceProduct?.photo?.uid) {
                setProgress(0);

                return mediaService
                    .clone(sourceProduct.photo?.uid, syncPresets)
                    .then((res) => resolve(res.data.data.uid))
                    .catch((err) => reject(err.data.errors.file))
                    .finally(() => setProgress(100));
            }

            return resolve(null);
        });
    }, [mediaFile, product, sourceProduct?.photo?.uid, setProgress, mediaService]);

    const fetchProduct = useCallback(
        (id: number) => {
            setProgress(0);

            if (fundProvider) {
                fundService
                    .getProviderProduct(organization.id, fundProvider.fund_id, fundProvider.id, id)
                    .then((res) => setProduct(res.data.data))
                    .catch(() => navigateState('products', { organizationId: organization.id }))
                    .finally(() => setProgress(100));
            } else {
                productService
                    .read(organization.id, id)
                    .then((res) => setProduct(res.data.data))
                    .catch(() => navigateState('products', { organizationId: organization.id }))
                    .finally(() => setProgress(100));
            }
        },
        [setProgress, fundProvider, fundService, organization.id, navigateState, productService],
    );

    const fetchSourceProduct = useCallback(
        (id: number) => {
            setProgress(0);

            fundService
                .getProviderProduct(organization.id, fundProvider.fund_id, fundProvider.id, id)
                .then((res) => setSourceProduct(res.data.data))
                .finally(() => setProgress(100));
        },
        [fundService, organization, setProgress, fundProvider],
    );

    const fetchProducts = useCallback(() => {
        setProgress(0);

        productService
            .list(organization.id)
            .then((res) => setProducts(res.data.data))
            .finally(() => setProgress(100));
    }, [productService, organization, setProgress]);

    const form = useFormBuilder<{
        ean?: string;
        sku?: string;
        name?: string;
        price?: number;
        price_type: 'regular' | 'discount_fixed' | 'discount_percentage' | 'free';
        price_discount?: number;
        expire_at?: string;
        sold_amount?: number;
        stock_amount?: number;
        total_amount?: number;
        unlimited_stock?: boolean;
        description?: string;
        description_html?: string;
        alternative_text?: string;
        reservation_enabled?: boolean;
        product_category_id?: number;
        reservation_phone: 'global' | 'no' | 'optional' | 'required';
        reservation_address: 'global' | 'no' | 'optional' | 'required';
        reservation_birth_date: 'global' | 'no' | 'optional' | 'required';
        reservation_extra_payments: 'global' | 'no' | 'yes';
        reservation_policy?: 'global' | 'accept' | 'review';
        reservation_note?: 'global' | 'no' | 'custom';
        reservation_note_text?: string;
    }>(null, (values) => {
        if (product && !product.unlimited_stock && form.values.stock_amount < 0) {
            form.setIsLocked(false);

            return form.setErrors({
                stock_amount: ['Nog te koop moet minimaal 0 zijn.'],
            });
        }

        uploadMedia().then((media_uid: string) => {
            setProgress(0);
            let promise: Promise<ApiResponseSingle<Product | SponsorProduct>>;
            const valueData = { ...values, media_uid };

            if (nonExpiring) {
                valueData.expire_at = null;
            }

            if (values.price_type !== 'regular') {
                delete valueData.price;
            }

            if (values.price_type === 'regular' || values.price_type === 'free') {
                delete valueData.price_discount;
            }

            if (values.unlimited_stock) {
                delete valueData.total_amount;
            }

            if (product) {
                const updateValues = { ...valueData, total_amount: values.sold_amount + values.stock_amount };

                if (!fundProvider) {
                    promise = productService.update(organization.id, product.id, updateValues);
                } else {
                    promise = organizationService.sponsorProductUpdate(
                        organization.id,
                        fundProvider.organization_id,
                        product.id,
                        updateValues,
                    );
                }
            } else {
                if (!fundProvider) {
                    promise = productService.store(organization.id, valueData);
                } else {
                    promise = organizationService.sponsorStoreProduct(
                        organization.id,
                        fundProvider.organization_id,
                        valueData,
                    );
                }
            }

            promise
                .then(() => {
                    pushSuccess('Gelukt!');

                    if (!fundProvider) {
                        return navigateState('products', { organizationId: organization.id });
                    }

                    goToFundProvider(fundProvider);
                })
                .catch((err: ResponseError) => {
                    form.setIsLocked(false);
                    form.setErrors(err.data.errors);
                    pushApiError(err);
                })
                .finally(() => setProgress(100));
        });
    });

    const { update: updateForm } = form;

    const cancel = useCallback(() => {
        if (fundProvider) {
            goToFundProvider(fundProvider);
        } else {
            navigateState('products', { organizationId: organization.id });
        }
    }, [fundProvider, goToFundProvider, navigateState, organization?.id]);

    useEffect(() => {
        setNonExpiring(!product || !product?.expire_at);
        setAllowsReservations(organization.reservations_enabled);
        setIsEditable(
            !product || !product.sponsor_organization_id || product.sponsor_organization_id === organization.id,
        );

        const maxProductCount = appConfigs.products_hard_limit;

        if (maxProductCount && !product && products && products.length >= maxProductCount) {
            openModal((modal) => {
                return (
                    <ModalNotification
                        icon={'product-error'}
                        modal={modal}
                        title={translate('product_edit.errors.already_added')}
                        buttonCancel={{
                            onClick: () => navigateState('products', { organizationId: organization.id }),
                        }}
                    />
                );
            });
        }
    }, [organization, appConfigs, product, products, openModal, translate, navigateState]);

    useEffect(() => {
        if (id) {
            fetchProduct(id);
        }

        if (sourceId) {
            fetchSourceProduct(sourceId);
        }
    }, [id, sourceId, fetchProduct, fetchSourceProduct]);

    useEffect(() => {
        if (id && !sourceId && product) {
            fetchProducts();
        }
    }, [fetchProducts, id, sourceId, product]);

    useEffect(() => {
        if ((id && !product) || (sourceId && !sourceProduct)) {
            return;
        }

        const model = sourceProduct || product;

        updateForm(
            model
                ? productService.apiResourceToForm(sourceProduct || product)
                : {
                      ean: '',
                      sku: '',
                      name: '',
                      price: undefined,
                      price_discount: undefined,
                      price_type: 'regular',
                      expire_at: undefined,
                      sold_amount: '',
                      stock_amount: '',
                      total_amount: '',
                      unlimited_stock: false,
                      description: '',
                      description_html: '',
                      alternative_text: '',
                      reservation_enabled: false,
                      reservation_fields: false,
                      product_category_id: null,
                      reservation_phone: 'global',
                      reservation_address: 'global',
                      reservation_birth_date: 'global',
                      reservation_extra_payments: 'global',
                      reservation_policy: 'global',
                      reservation_note: 'global',
                      reservation_note_text: '',
                  },
        );
    }, [product, sourceProduct, updateForm, productService, id, sourceId, organization]);

    if (!organization || (id && !product) || (sourceId && !sourceProduct) || !form.values) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            {fundProvider ? (
                <div className="block block-breadcrumbs">
                    <StateNavLink
                        name={'sponsor-provider-organizations'}
                        params={{ organizationId: organization.id }}
                        activeExact={true}
                        className="breadcrumb-item">
                        {translate('page_state_titles.organization-providers')}
                    </StateNavLink>
                    <StateNavLink
                        name={'sponsor-provider-organization'}
                        params={{ id: fundProvider.organization.id, organizationId: organization.id }}
                        activeExact={true}
                        className="breadcrumb-item">
                        {strLimit(fundProvider.organization.name, 40)}
                    </StateNavLink>
                    <StateNavLink
                        name={'fund-provider'}
                        params={{ id: fundProvider.id, fundId: fundProvider.fund.id, organizationId: organization.id }}
                        activeExact={true}
                        className="breadcrumb-item">
                        {strLimit(fundProvider.fund.name, 40)}
                    </StateNavLink>
                    <div className="breadcrumb-item active">{id ? strLimit(product.name, 40) : 'Voeg aanbod toe'}</div>
                </div>
            ) : (
                <div className="block block-breadcrumbs">
                    <StateNavLink
                        name={'products'}
                        params={{ organizationId: organization.id }}
                        activeExact={true}
                        className="breadcrumb-item">
                        Aanbod
                    </StateNavLink>
                    <div className="breadcrumb-item active">
                        {translate(id ? 'product_edit.header.title_edit' : 'product_edit.header.title_add')}
                    </div>
                </div>
            )}

            <form className="card form" onSubmit={form.submit}>
                <div className="card-header">
                    <div className="card-title">
                        {translate(id ? 'product_edit.header.title_edit' : 'product_edit.header.title_add')}
                    </div>
                </div>

                <div className="card-section card-section-primary">
                    <div className="row">
                        <div className="col col-md-8 col-md-offset-2 col-xs-12">
                            <div className="form-group">
                                <PhotoSelector
                                    type="office_photo"
                                    disabled={!isEditable}
                                    thumbnail={product?.photo?.sizes?.thumbnail}
                                    selectPhoto={(file) => setMediaFile(file)}
                                />
                                <FormError error={mediaErrors} />
                            </div>
                            <div className="form-group" />
                            <div className="form-group">
                                <label className="form-label">
                                    {translate('product_edit.labels.alternative_text')}
                                </label>
                                <input
                                    className="form-control"
                                    disabled={!isEditable}
                                    onChange={(e) => form.update({ alternative_text: e.target.value })}
                                    value={form.values.alternative_text || ''}
                                    type="text"
                                    placeholder={translate('product_edit.labels.alternative_text_placeholder')}
                                />
                                <FormError error={form.errors.alternative_text} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-section card-section-primary">
                    <div className="row">
                        <div className="col col-md-8 col-md-offset-2 col-xs-12">
                            <div className="form-group">
                                <label className="form-label form-label-required">
                                    {translate('product_edit.labels.name')}
                                </label>
                                <input
                                    type="text"
                                    disabled={!isEditable}
                                    className="form-control"
                                    placeholder={'Naam'}
                                    value={form.values.name || ''}
                                    onChange={(e) => form.update({ name: e.target.value })}
                                />
                                <FormError error={form.errors?.name} />
                            </div>

                            <div className="form-group tooltipped">
                                <label className="form-label form-label-required">
                                    {translate('product_edit.labels.description')}
                                </label>

                                <MarkdownEditor
                                    value={form.values.description_html || ''}
                                    disabled={!isEditable}
                                    onChange={(description) => form.update({ description })}
                                    placeholder={translate('product_edit.labels.description')}
                                />
                                <Tooltip
                                    text={
                                        'Bijvoorbeeld: aantal lessen, abonnementsvorm, omschrijving cursus, einddatum activiteit, voorwaarden, bijzonderheden, etc.'
                                    }
                                />
                                <FormError error={form.errors?.description} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-section card-section-primary">
                    <div className="row">
                        <div className="col col-md-8 col-md-offset-2 col-xs-12">
                            <div className="form-group tooltipped">
                                <label className="form-label">Aanbod type</label>

                                <div className="block block-label-tabs">
                                    <div className="label-tab-set">
                                        {priceTypes?.map((priceType) => (
                                            <div
                                                key={priceType.value}
                                                className={`label-tab label-tab-sm 
                                                    ${form.values.price_type === priceType.value ? 'active' : ''} 
                                                    ${!isEditable ? 'disabled' : ''}`}
                                                onClick={() => form.update({ price_type: priceType.value })}>
                                                {priceType.label}
                                            </div>
                                        ))}
                                    </div>
                                    <Tooltip text={translate('product_edit.tooltips.product_type')?.split('\n')} />
                                </div>
                            </div>

                            {form.values.price_type === 'regular' && (
                                <div className="form-group">
                                    <label className="form-label form-label-required">Bedrag</label>

                                    <input
                                        className="form-control"
                                        disabled={!isEditable}
                                        value={form.values.price || ''}
                                        onChange={(e) => {
                                            form.update({
                                                price: e.target.value ? parseFloat(e.target.value) : '',
                                            });
                                        }}
                                        type="number"
                                        placeholder="Bedrag in euro's"
                                        step="0.01"
                                    />
                                    <FormError error={form.errors.price} />
                                </div>
                            )}

                            {form.values.price_type === 'discount_percentage' && (
                                <div className="form-group">
                                    <label className="form-label">Kortingspercentage</label>

                                    <input
                                        className="form-control"
                                        disabled={!isEditable}
                                        value={form.values.price_discount || ''}
                                        onChange={(e) => {
                                            form.update({
                                                price_discount: e.target.value ? parseFloat(e.target.value) : '',
                                            });
                                        }}
                                        type="number"
                                        placeholder="20%"
                                        step="0.01"
                                        max={100}
                                    />
                                    <FormError error={form.errors.price_discount} />
                                </div>
                            )}

                            {form.values.price_type === 'discount_fixed' && (
                                <div className="form-group">
                                    <label className="form-label">Korting</label>

                                    <input
                                        className="form-control"
                                        disabled={!isEditable}
                                        value={form.values.price_discount}
                                        onChange={(e) => {
                                            form.update({
                                                price_discount: e.target.value ? parseFloat(e.target.value) : '',
                                            });
                                        }}
                                        type="number"
                                        placeholder="€ 20"
                                        step="0.01"
                                    />
                                    <FormError error={form.errors.price_discount} />
                                </div>
                            )}

                            {product && (
                                <div className="form-group">
                                    <label className="form-label">{translate('product_edit.labels.sold')}</label>
                                    <input
                                        className="form-control"
                                        disabled={true}
                                        value={form.values.sold_amount}
                                        onChange={(e) =>
                                            form.update({
                                                sold_amount: e.target.value ? parseFloat(e.target.value) : '',
                                            })
                                        }
                                        type="number"
                                        placeholder="Verkocht"
                                    />
                                    <FormError error={form.errors.sold_amount} />
                                </div>
                            )}

                            <div className="form-group tooltipped">
                                <label className="form-label form-label-required">
                                    {translate('product_edit.labels.total')}
                                </label>

                                {product && product.unlimited_stock && (
                                    <div className="form-value text-muted">
                                        {translate('product_edit.labels.stock_unlimited')}
                                    </div>
                                )}

                                {(!product || (product && !product.unlimited_stock)) && (
                                    <div className="row">
                                        {!form.values.unlimited_stock ? (
                                            <div className="col col-lg-7">
                                                <input
                                                    className="form-control"
                                                    disabled={!isEditable || !!product || form.values.unlimited_stock}
                                                    value={form.values.total_amount}
                                                    onChange={(e) => {
                                                        form.update({
                                                            total_amount: e.target.value
                                                                ? parseFloat(e.target.value)
                                                                : '',
                                                        });
                                                    }}
                                                    type="number"
                                                    placeholder="Aantal in voorraad"
                                                />
                                            </div>
                                        ) : (
                                            <div className="col col-lg-7">
                                                <input
                                                    className="form-control"
                                                    value={translate('product_edit.labels.stock_unlimited')}
                                                    disabled={true}
                                                />
                                            </div>
                                        )}

                                        <div className="col col-lg-5">
                                            <CheckboxControl
                                                disabled={!isEditable || (product && !product.unlimited_stock)}
                                                id="unlimited_stock"
                                                title={translate('product_edit.labels.stock_unlimited')}
                                                checked={form.values.unlimited_stock}
                                                onChange={(e) => {
                                                    form.update({ unlimited_stock: e.target.checked });
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <FormError error={form.errors.total_amount} />
                            </div>

                            {product && !product.unlimited_stock && (
                                <div className="form-group tooltipped">
                                    <label className="form-label">
                                        {translate('product_edit.labels.stock_amount')}
                                    </label>

                                    <div className="form-group-info">
                                        <div className="form-group-info-control">
                                            <input
                                                className="form-control"
                                                value={form.values.stock_amount}
                                                onChange={(e) =>
                                                    form.update({
                                                        stock_amount: e.target.value ? parseFloat(e.target.value) : '',
                                                    })
                                                }
                                                type="number"
                                                placeholder="Stock"
                                                disabled={!isEditable}
                                            />
                                        </div>
                                        <div className="form-group-info-button">
                                            <div
                                                className={`button button-default button-icon pull-left ${
                                                    showInfoBlockStock ? 'active' : ''
                                                }`}
                                                onClick={() => setShowInfoBlockStock(!showInfoBlockStock)}>
                                                <em className="mdi mdi-information" />
                                            </div>
                                        </div>
                                    </div>
                                    {showInfoBlockStock && (
                                        <div className="block block-info-box block-info-box-primary">
                                            <div className="info-box-icon mdi mdi-information" />
                                            <div className="info-box-content">
                                                <div className="block block-markdown">
                                                    {translate('tooltip.product.limit')}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <FormError error={form.errors.stock_amount} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card-section card-section-primary">
                    <div className="row">
                        <div className="col col-md-8 col-md-offset-2 col-xs-12">
                            <div className="form-group tooltipped">
                                <label className="form-label">{translate('product_edit.labels.ean')}</label>
                                <FormGroupInfo
                                    info={<TranslateHtml i18n={'product_edit.tooltips.ean'} />}
                                    error={form.errors?.ean}>
                                    <input
                                        className="form-control"
                                        value={form.values.ean || ''}
                                        onChange={(e) => form.update({ ean: e.target.value })}
                                        type="text"
                                        placeholder={translate('product_edit.labels.ean_placeholder')}
                                        disabled={!isEditable}
                                    />
                                </FormGroupInfo>
                            </div>

                            <div className="form-group tooltipped">
                                <label className="form-label">{translate('product_edit.labels.sku')}</label>
                                <FormGroupInfo
                                    info={<TranslateHtml i18n={'product_edit.tooltips.sku'} />}
                                    error={form.errors?.sku}>
                                    <input
                                        className="form-control"
                                        value={form.values.sku || ''}
                                        onChange={(e) => form.update({ sku: e.target.value })}
                                        type="text"
                                        placeholder={translate('product_edit.labels.sku_placeholder')}
                                        disabled={!isEditable}
                                    />
                                </FormGroupInfo>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-section card-section-primary">
                    <div className="row">
                        <div className="col col-md-8 col-md-offset-2 col-xs-12">
                            <div className="form-group tooltipped">
                                <label className="form-label">{translate('product_edit.labels.expire')}</label>
                                <div className="row">
                                    <div className="col col-lg-7">
                                        {nonExpiring ? (
                                            <input
                                                className="form-control"
                                                defaultValue={translate('product_edit.labels.unlimited')}
                                                disabled={true}
                                            />
                                        ) : (
                                            <DatePickerControl
                                                disabled={!isEditable}
                                                dateFormat={'dd-MM-yyyy'}
                                                value={dateParse(form.values.expire_at)}
                                                onChange={(date) => form.update({ expire_at: dateFormat(date) })}
                                                placeholder="dd-MM-jjjj"
                                            />
                                        )}
                                    </div>
                                    <div className="col col-lg-5">
                                        <CheckboxControl
                                            disabled={!isEditable}
                                            id="non_expiring"
                                            title={translate('product_edit.labels.unlimited')}
                                            checked={nonExpiring}
                                            onChange={() => setNonExpiring(!nonExpiring)}
                                        />
                                    </div>
                                    <Tooltip
                                        text={
                                            'De uiterlijke datum tot en met wanneer uw aanbieding loopt. Aanbieding wordt na deze datum verwijderd uit de webshop en kan niet meer worden opgehaald.'
                                        }
                                    />
                                </div>
                                <FormError error={form.errors.expire_at} />
                            </div>
                        </div>
                    </div>
                </div>

                {allowsReservations && (
                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-md-8 col-md-offset-2 col-xs-12">
                                <div className="form-group tooltipped">
                                    <label className="form-label">Reserveringen</label>

                                    <CheckboxControl
                                        disabled={!isEditable}
                                        id="reservation_enabled"
                                        title="De klant mag het aanbod reserveren"
                                        checked={form.values.reservation_enabled}
                                        onChange={(e) => form.update({ reservation_enabled: e.target.checked })}
                                    />
                                    <FormError error={form.errors.reservation_enabled} />

                                    <Tooltip text={translate('product_edit.tooltips.reservation_enabled')} />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            {form.values.reservation_enabled && (
                                <div className="col col-md-8 col-md-offset-2 col-xs-12">
                                    <div className="form-group tooltipped">
                                        <label className="form-label" htmlFor="reservation_policy">
                                            Reserveringen accepteren
                                        </label>

                                        <div className="form-group-info">
                                            <div className="form-group-info-control">
                                                <SelectControl
                                                    className="form-control"
                                                    propValue={'label'}
                                                    propKey={'value'}
                                                    allowSearch={false}
                                                    value={form.values.reservation_policy}
                                                    onChange={(reservation_policy: string) => {
                                                        form.update({ reservation_policy });
                                                    }}
                                                    options={reservationPolicies}
                                                />
                                            </div>
                                            <div className="form-group-info-button">
                                                <div
                                                    className={`button button-default button-icon pull-left ${
                                                        showInfoBlockStockReservationPolicy ? 'active' : ''
                                                    }`}
                                                    onClick={() => {
                                                        setShowInfoBlockStockReservationPolicy(
                                                            !showInfoBlockStockReservationPolicy,
                                                        );
                                                    }}>
                                                    <em className="mdi mdi-information" />
                                                </div>
                                            </div>
                                        </div>
                                        {showInfoBlockStockReservationPolicy && (
                                            <div className="block block-info-box block-info-box-primary">
                                                <div className="info-box-icon mdi mdi-information" />
                                                <div className="info-box-content">
                                                    <div className="block block-markdown">
                                                        Standaard instelling kunt u bij uw reserveringen aanpassen. Geef
                                                        hier optioneel aan of u de reservering handmatig of automatisch
                                                        wilt accepteren.
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <FormError error={form.errors.reservation_policy} />
                                    </div>

                                    <div className="form-group tooltipped">
                                        <label htmlFor="" className="form-label">
                                            Klantgegevens
                                        </label>

                                        <CheckboxControl
                                            disabled={!isEditable}
                                            id="reservation_fields"
                                            title="De klant vragen om aanvullende informatie op te geven"
                                            checked={form.values.reservation_fields}
                                            onChange={(e) => form.update({ reservation_fields: e.target.checked })}
                                        />
                                        <FormError error={form.errors.reservation_fields} />

                                        <Tooltip text={translate('product_edit.tooltips.reservation_fields')} />
                                    </div>

                                    {form.values.reservation_fields && (
                                        <Fragment>
                                            <div className="form-group tooltipped">
                                                <label className="form-label" htmlFor="reservation_phone">
                                                    Telefoonnummer klant
                                                </label>
                                                <SelectControl
                                                    className="form-control"
                                                    propKey={'value'}
                                                    propValue={'label'}
                                                    value={form.values.reservation_phone}
                                                    onChange={(reservation_phone: string) => {
                                                        form.update({ reservation_phone });
                                                    }}
                                                    options={reservationPhoneOptions}
                                                />
                                                <FormError error={form.errors.reservation_phone} />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label" htmlFor="reservation_address">
                                                    Adres klant
                                                </label>

                                                <SelectControl
                                                    className="form-control"
                                                    propKey={'value'}
                                                    propValue={'label'}
                                                    value={form.values.reservation_address}
                                                    onChange={(reservation_address: string) => {
                                                        form.update({ reservation_address });
                                                    }}
                                                    options={reservationAddressOptions}
                                                />
                                                <FormError error={form.errors.reservation_address} />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label" htmlFor="reservation_birth_date">
                                                    Geboortedatum klant
                                                </label>

                                                <SelectControl
                                                    className="form-control"
                                                    propKey={'value'}
                                                    propValue={'label'}
                                                    value={form.values.reservation_birth_date}
                                                    onChange={(reservation_birth_date: string) => {
                                                        form.update({ reservation_birth_date });
                                                    }}
                                                    options={reservationBirthDateOptions}
                                                />
                                                <FormError error={form.errors.reservation_birth_date} />
                                            </div>
                                        </Fragment>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="card-section card-section-primary">
                    <div className="row">
                        <div className="col col-md-8 col-md-offset-2 col-xs-12">
                            <FormGroup
                                label={translate('product_edit.labels.reservation_note')}
                                error={form.errors.reservation_note}
                                input={(id) => (
                                    <SelectControl
                                        className="form-control"
                                        propKey={'value'}
                                        propValue={'label'}
                                        id={id}
                                        value={form.values.reservation_note}
                                        onChange={(reservation_note: string) => {
                                            form.update({ reservation_note });
                                        }}
                                        options={reservationNoteOptions}
                                    />
                                )}
                            />

                            {form.values.reservation_note === 'custom' && (
                                <FormGroup
                                    label={translate('product_edit.labels.custom_reservation_note_text')}
                                    error={form.errors.reservation_note_text}
                                    input={() => (
                                        <textarea
                                            className="form-control r-n"
                                            placeholder={translate('product_edit.labels.custom_reservation_note_text')}
                                            value={form.values.reservation_note_text || ''}
                                            onChange={(e) => form.update({ reservation_note_text: e.target.value })}
                                        />
                                    )}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {organization.can_receive_extra_payments && hasPermission(organization, 'manage_payment_methods') && (
                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-md-8 col-md-offset-2 col-xs-12">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="reservation_extra_payments">
                                        {translate('product_edit.labels.extra_payments')}
                                    </label>

                                    <SelectControl
                                        className="form-control"
                                        propKey={'value'}
                                        propValue={'label'}
                                        disabled={!isEditable}
                                        value={form.values.reservation_extra_payments}
                                        onChange={(reservation_extra_payments: string) => {
                                            form.update({ reservation_extra_payments });
                                        }}
                                        options={extraPaymentsOptions}
                                    />
                                    <FormError error={form.errors.reservation_extra_payments} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="card-section card-section-primary">
                    <div className="row">
                        <div className="col col-md-8 col-md-offset-2 col-xs-12">
                            <ProductCategoriesControl
                                disabled={!isEditable}
                                value={form.values.product_category_id}
                                onChange={(product_category_id) => form.update({ product_category_id })}
                                errors={form.errors.product_category_id}
                            />
                        </div>
                    </div>
                </div>

                <div className="card-section card-section-primary">
                    <div className="text-center">
                        <button
                            className="button button-default"
                            type="button"
                            onClick={() => cancel()}
                            id="cancel_create_product">
                            {translate('product_edit.buttons.cancel')}
                        </button>

                        {isEditable && (
                            <button type="submit" className="button button-primary">
                                {translate('product_edit.buttons.confirm')}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </Fragment>
    );
}
