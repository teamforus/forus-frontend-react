import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import PhotoSelector from '../../../elements/photo-selector/PhotoSelector';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import { useNavigateState } from '../../../../modules/state_router/Router';
import { useMediaService } from '../../../../services/MediaService';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import useSetProgress from '../../../../hooks/useSetProgress';
import Organization from '../../../../props/models/Organization';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import MarkdownEditor from '../../../elements/forms/markdown-editor/MarkdownEditor';
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
import { dateFormat, dateParse } from '../../../../helpers/dates';
import { hasPermission } from '../../../../helpers/utils';
import { strLimit } from '../../../../helpers/string';
import useTranslate from '../../../../hooks/useTranslate';
import TranslateHtml from '../../../elements/translate-html/TranslateHtml';
import SponsorProduct from '../../../../props/models/Sponsor/SponsorProduct';
import usePushApiError from '../../../../hooks/usePushApiError';
import FormPane from '../../../elements/forms/elements/FormPane';
import FormContainer from '../../../elements/forms/elements/FormContainer';
import FormGroup from '../../../elements/forms/elements/FormGroup';

type PriceType = 'regular' | 'discount_fixed' | 'discount_percentage' | 'free';

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

    const [priceTypes] = useState<Array<{ value: PriceType; label: string }>>([
        { value: 'regular', label: 'Normaal' },
        { value: 'discount_fixed', label: 'Korting €' },
        { value: 'discount_percentage', label: 'Korting %' },
        { value: 'free', label: 'Gratis' },
    ]);

    const [isEditable, setIsEditable] = useState<boolean>(true);
    const [allowsReservations, setAllowsReservations] = useState<boolean>(true);
    const [nonExpiring, setNonExpiring] = useState<boolean>(false);
    const [mediaErrors] = useState<string[]>(null);
    const [product, setProduct] = useState<Product | SponsorProduct>(null);
    const [sourceProduct, setSourceProduct] = useState<Product | SponsorProduct>(null);
    const [products, setProducts] = useState<Product[]>(null);

    const allowsExtraPayments = useMemo(() => {
        return organization?.can_receive_extra_payments && hasPermission(organization, 'manage_payment_methods');
    }, [organization]);

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
        price_type: PriceType;
        price_discount?: number;
        expire_at?: string;
        sold_amount?: number;
        stock_amount?: number;
        total_amount?: number;
        unlimited_stock?: boolean;
        description?: string;
        description_html?: string;
        alternative_text?: string;
        qr_enabled?: boolean;
        reservation_enabled?: boolean;
        product_category_id?: number;
        reservation_phone: 'global' | 'no' | 'optional' | 'required';
        reservation_address: 'global' | 'no' | 'optional' | 'required';
        reservation_birth_date: 'global' | 'no' | 'optional' | 'required';
        reservation_extra_payments: 'global' | 'no' | 'yes';
        reservation_policy?: 'global' | 'accept' | 'review';
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
                      qr_enabled: true,
                      reservation_enabled: false,
                      reservation_fields: false,
                      product_category_id: null,
                      reservation_phone: 'global',
                      reservation_address: 'global',
                      reservation_birth_date: 'global',
                      reservation_extra_payments: 'global',
                      reservation_policy: 'global',
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
                    <FormContainer>
                        <FormPane title={'Product photo'}>
                            <FormGroup
                                error={mediaErrors}
                                input={() => (
                                    <PhotoSelector
                                        type="office_photo"
                                        disabled={!isEditable}
                                        thumbnail={product?.photo?.sizes?.thumbnail}
                                        selectPhoto={(file) => setMediaFile(file)}
                                    />
                                )}
                            />

                            <FormGroup
                                label={translate('product_edit.labels.alternative_text')}
                                error={form.errors?.alternative_text}
                                info={
                                    <Fragment>
                                        Describe the photo content for users with visual impairments. This will be used
                                        as alt text for accessibility.
                                    </Fragment>
                                }
                                input={(id) => (
                                    <input
                                        id={id}
                                        className="form-control"
                                        disabled={!isEditable}
                                        onChange={(e) => form.update({ alternative_text: e.target.value })}
                                        value={form.values.alternative_text || ''}
                                        type="text"
                                        placeholder={translate('product_edit.labels.alternative_text_placeholder')}
                                    />
                                )}
                            />
                        </FormPane>

                        <FormPane title={'Product description'}>
                            <FormGroup
                                label={translate('product_edit.labels.name')}
                                required={true}
                                error={form.errors?.name}
                                info={
                                    <Fragment>
                                        This name will appear in the webshop and on vouchers. Make it clear and
                                        recognizable for your customers.
                                    </Fragment>
                                }
                                input={(id) => (
                                    <input
                                        id={id}
                                        type="text"
                                        disabled={!isEditable}
                                        className="form-control"
                                        placeholder={'Naam'}
                                        value={form.values.name || ''}
                                        onChange={(e) => form.update({ name: e.target.value })}
                                    />
                                )}
                            />

                            <FormGroup
                                label={translate('product_edit.labels.description')}
                                required={true}
                                error={form.errors?.description}
                                input={() => (
                                    <MarkdownEditor
                                        value={form.values.description_html || ''}
                                        disabled={!isEditable}
                                        onChange={(description) => form.update({ description })}
                                        placeholder={translate('product_edit.labels.description')}
                                    />
                                )}
                            />
                        </FormPane>

                        <FormPane title={'Pricing and type'}>
                            <div className="row">
                                <div className="col col-xs-12 col-sm-6">
                                    <FormGroup
                                        label={translate('Aanbod type')}
                                        error={form.errors?.price_type}
                                        info={translate('product_edit.tooltips.product_type')}
                                        input={(id) => (
                                            <SelectControl
                                                id={id}
                                                propValue={'label'}
                                                propKey={'value'}
                                                disabled={!isEditable}
                                                value={form.values.price_type}
                                                onChange={(price_type: PriceType) => form.update({ price_type })}
                                                options={priceTypes}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="col col-xs-12 col-sm-6">
                                    {form.values.price_type === 'regular' && (
                                        <FormGroup
                                            label={'Bedrag'}
                                            required={true}
                                            error={form.errors.price}
                                            info={
                                                <Fragment>
                                                    Set the standard price in euros. This is the full price the customer
                                                    pays without any discount.
                                                </Fragment>
                                            }
                                            input={(id) => (
                                                <input
                                                    id={id}
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
                                            )}
                                        />
                                    )}

                                    {form.values.price_type === 'discount_percentage' && (
                                        <FormGroup
                                            label="Kortingspercentage"
                                            required={true}
                                            error={form.errors.price_discount}
                                            info={<Fragment>Enter the percentage discount.</Fragment>}
                                            input={(id) => (
                                                <input
                                                    id={id}
                                                    className="form-control"
                                                    disabled={!isEditable}
                                                    value={form.values.price_discount || ''}
                                                    onChange={(e) => {
                                                        form.update({
                                                            price_discount: e.target.value
                                                                ? parseFloat(e.target.value)
                                                                : '',
                                                        });
                                                    }}
                                                    type="number"
                                                    placeholder="20%"
                                                    step="0.01"
                                                    max={100}
                                                />
                                            )}
                                        />
                                    )}

                                    {form.values.price_type === 'discount_fixed' && (
                                        <FormGroup
                                            label={'Korting'}
                                            required={true}
                                            error={form.errors.price_discount}
                                            info={<Fragment>Enter the fixed discount amount in euros.</Fragment>}
                                            input={(id) => (
                                                <input
                                                    id={id}
                                                    className="form-control"
                                                    disabled={!isEditable}
                                                    value={form.values.price_discount}
                                                    onChange={(e) => {
                                                        form.update({
                                                            price_discount: e.target.value
                                                                ? parseFloat(e.target.value)
                                                                : '',
                                                        });
                                                    }}
                                                    type="number"
                                                    placeholder="€ 20"
                                                    step="0.01"
                                                />
                                            )}
                                        />
                                    )}

                                    {form.values.price_type === 'free' && (
                                        <FormGroup
                                            label={'Bedrag'}
                                            info={
                                                <Fragment>
                                                    This product will be listed as free. No price or discount is
                                                    required.
                                                </Fragment>
                                            }
                                            input={(id) => (
                                                <input
                                                    id={id}
                                                    className="form-control"
                                                    disabled={true}
                                                    value={'Gratis'}
                                                />
                                            )}
                                        />
                                    )}
                                </div>
                            </div>
                        </FormPane>

                        <FormPane title={'Availability and stock'}>
                            {(!product || (product && !product.unlimited_stock)) && (
                                <div className="row">
                                    <div className="col col-xs-12 col-sm-6">
                                        <FormGroup
                                            label={'Product availability'}
                                            required={true}
                                            info={
                                                <Fragment>
                                                    Choose whether the product has limited stock or can be sold without
                                                    restrictions.
                                                </Fragment>
                                            }
                                            input={(id) => (
                                                <SelectControl
                                                    id={id}
                                                    propKey={'value'}
                                                    propValue={'label'}
                                                    disabled={!isEditable || (product && !product.unlimited_stock)}
                                                    value={form.values.unlimited_stock}
                                                    options={[
                                                        { value: false, label: 'Set available quantity' },
                                                        { value: true, label: 'Onbeperkt aanbod' },
                                                    ]}
                                                    onChange={(unlimited_stock: boolean) => {
                                                        form.update({ unlimited_stock });
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>

                                    <div className="col col-xs-12 col-sm-6">
                                        <FormGroup
                                            label={translate('product_edit.labels.total')}
                                            required={true}
                                            info={
                                                <Fragment>
                                                    Choose whether the product has limited stock or can be sold without
                                                    restrictions.
                                                </Fragment>
                                            }
                                            error={form.errors.total_amount}
                                            input={(id) =>
                                                !form.values.unlimited_stock ? (
                                                    <input
                                                        id={id}
                                                        className="form-control"
                                                        disabled={
                                                            !isEditable || !!product || form.values.unlimited_stock
                                                        }
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
                                                ) : (
                                                    <input
                                                        id={id}
                                                        className="form-control"
                                                        value={translate('product_edit.labels.stock_unlimited')}
                                                        disabled={true}
                                                    />
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {product && (
                                <div className="row">
                                    <div className="col col-xs-12 col-sm-6">
                                        <FormGroup
                                            label={translate('product_edit.labels.sold')}
                                            error={form.errors.sold_amount}
                                            info={
                                                <Fragment>
                                                    This shows how many units have been sold so far. This value is
                                                    updated automatically.
                                                </Fragment>
                                            }
                                            input={(id) => (
                                                <input
                                                    id={id}
                                                    className="form-control"
                                                    disabled={true}
                                                    value={form.values.sold_amount}
                                                    onChange={(e) =>
                                                        form.update({
                                                            sold_amount: e.target.value
                                                                ? parseFloat(e.target.value)
                                                                : '',
                                                        })
                                                    }
                                                    type="number"
                                                    placeholder="Verkocht"
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="col col-xs-12 col-sm-6">
                                        <FormGroup
                                            label={translate('product_edit.labels.stock_amount')}
                                            error={form.errors.stock_amount}
                                            info={translate('tooltip.product.limit')}
                                            input={(id) =>
                                                product.unlimited_stock ? (
                                                    <input
                                                        id={id}
                                                        className="form-control"
                                                        disabled={true}
                                                        value={translate('product_edit.labels.stock_unlimited')}
                                                    />
                                                ) : (
                                                    <input
                                                        id={id}
                                                        className="form-control"
                                                        value={form.values.stock_amount}
                                                        onChange={(e) =>
                                                            form.update({
                                                                stock_amount: e.target.value
                                                                    ? parseFloat(e.target.value)
                                                                    : '',
                                                            })
                                                        }
                                                        type="number"
                                                        placeholder="Current stock"
                                                        disabled={!isEditable}
                                                    />
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </FormPane>

                        <FormPane title={'Product identifiers (EAN, SKU)'}>
                            <div className="row">
                                <div className="col col-xs-12 col-sm-6">
                                    <FormGroup
                                        label={translate('product_edit.labels.ean')}
                                        error={form.errors?.ean}
                                        info={<TranslateHtml i18n={'product_edit.tooltips.ean'} />}
                                        input={(id) => (
                                            <input
                                                id={id}
                                                className="form-control"
                                                value={form.values.ean || ''}
                                                onChange={(e) => form.update({ ean: e.target.value })}
                                                type="text"
                                                placeholder={translate('product_edit.labels.ean_placeholder')}
                                                disabled={!isEditable}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="col col-xs-12 col-sm-6">
                                    <FormGroup
                                        label={translate('product_edit.labels.sku')}
                                        error={form.errors?.sku}
                                        info={<TranslateHtml i18n={'product_edit.tooltips.sku'} />}
                                        input={(id) => (
                                            <input
                                                id={id}
                                                className="form-control"
                                                value={form.values.sku || ''}
                                                onChange={(e) => form.update({ sku: e.target.value })}
                                                type="text"
                                                placeholder={translate('product_edit.labels.sku_placeholder')}
                                                disabled={!isEditable}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </FormPane>

                        <FormPane title={'Product validity'}>
                            <div className="row">
                                <div className="col col-xs-12 col-sm-6">
                                    <FormGroup
                                        label={'Set expiration behavior'}
                                        info={
                                            <Fragment>
                                                Choose whether this product has an expiration date or remains available
                                                indefinitely.
                                            </Fragment>
                                        }
                                        input={(id) => (
                                            <SelectControl
                                                id={id}
                                                propKey={'value'}
                                                propValue={'label'}
                                                disabled={!isEditable}
                                                options={[
                                                    { value: true, label: 'Product does not expire' },
                                                    { value: false, label: 'Set a specific expiration date' },
                                                ]}
                                                value={nonExpiring}
                                                onChange={(nonExpiring: boolean) => setNonExpiring(!nonExpiring)}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="col col-xs-12 col-sm-6">
                                    <FormGroup
                                        label={translate('product_edit.labels.expire')}
                                        error={form.errors.expire_at}
                                        info={
                                            <Fragment>
                                                De uiterlijke datum tot en met wanneer uw aanbieding loopt. Aanbieding
                                                wordt na deze datum verwijderd uit de webshop en kan niet meer worden
                                                opgehaald.
                                            </Fragment>
                                        }
                                        input={(id) =>
                                            nonExpiring ? (
                                                <input
                                                    id={id}
                                                    className="form-control"
                                                    defaultValue={translate('product_edit.labels.unlimited')}
                                                    disabled={true}
                                                />
                                            ) : (
                                                <DatePickerControl
                                                    id={id}
                                                    disabled={!isEditable}
                                                    dateFormat={'dd-MM-yyyy'}
                                                    value={dateParse(form.values.expire_at)}
                                                    onChange={(date) => form.update({ expire_at: dateFormat(date) })}
                                                    placeholder="dd-MM-jjjj"
                                                />
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </FormPane>

                        {allowsReservations && (
                            <FormPane title={'Reservation and payment options'}>
                                <FormGroup
                                    className="form-group tooltipped"
                                    label={'QR-code scannen door klant toestaan'}
                                    error={form.errors.qr_enabled}
                                    info={
                                        <Fragment>
                                            Enable this if customers should be able to scan a QR code at your location
                                            to buy the product.
                                        </Fragment>
                                    }
                                    input={(id) => (
                                        <SelectControl
                                            disabled={!isEditable}
                                            id={id}
                                            propKey={'value'}
                                            propValue={'label'}
                                            value={form.values.qr_enabled}
                                            options={[
                                                { value: true, label: 'QR-code scannen toegestaan' },
                                                { value: false, label: 'QR-code scannen niet toegestaan' },
                                            ]}
                                            onChange={(value: boolean) => form.update({ qr_enabled: value })}
                                        />
                                    )}
                                />

                                <FormGroup
                                    className="form-group tooltipped"
                                    label={'Online betalen'}
                                    error={form.errors.reservation_enabled}
                                    info={translate('product_edit.tooltips.reservation_enabled')}
                                    input={(id) => (
                                        <SelectControl
                                            disabled={!isEditable}
                                            id={id}
                                            propKey={'value'}
                                            propValue={'label'}
                                            value={form.values.reservation_enabled}
                                            options={[
                                                { value: true, label: 'De klant mag het aanbod reserveren' },
                                                { value: false, label: 'De klant mag het aanbod niet reserveren' },
                                            ]}
                                            onChange={(value: boolean) => form.update({ reservation_enabled: value })}
                                        />
                                    )}
                                />

                                {form.values.reservation_enabled && (
                                    <FormPane title={'Reservation settings'}>
                                        <FormGroup
                                            label={'Reserveringen accepteren'}
                                            error={form.errors.reservation_policy}
                                            info={
                                                <Fragment>
                                                    Standaard instelling kunt u bij uw reserveringen aanpassen. Geef
                                                    hier optioneel aan of u de reservering handmatig of automatisch wilt
                                                    accepteren.
                                                </Fragment>
                                            }
                                            input={(id) => (
                                                <SelectControl
                                                    id={id}
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
                                            )}
                                        />

                                        <FormGroup
                                            label={'Request additional customer details'}
                                            error={form.errors.reservation_fields}
                                            info={translate('product_edit.tooltips.reservation_fields')}
                                            input={(id) => (
                                                <SelectControl
                                                    id={id}
                                                    disabled={!isEditable}
                                                    propKey={'value'}
                                                    propValue={'label'}
                                                    value={form.values.reservation_fields}
                                                    options={[
                                                        {
                                                            value: true,
                                                            label: 'De klant vragen om aanvullende informatie op te geven',
                                                        },
                                                        {
                                                            value: false,
                                                            label: 'De klant geen aanvullende informatie vragen',
                                                        },
                                                    ]}
                                                    onChange={(value: boolean) => {
                                                        form.update({ reservation_fields: value });
                                                    }}
                                                />
                                            )}
                                        />

                                        {form.values.reservation_fields && (
                                            <FormPane title={'Customer contact fields'}>
                                                <FormGroup
                                                    label={'Telefoonnummer klant'}
                                                    error={form.errors.reservation_phone}
                                                    input={(id) => (
                                                        <SelectControl
                                                            id={id}
                                                            className="form-control"
                                                            propKey={'value'}
                                                            propValue={'label'}
                                                            value={form.values.reservation_phone}
                                                            onChange={(reservation_phone: string) => {
                                                                form.update({ reservation_phone });
                                                            }}
                                                            options={reservationPhoneOptions}
                                                        />
                                                    )}
                                                />

                                                <FormGroup
                                                    label={'Adres klant'}
                                                    error={form.errors.reservation_address}
                                                    input={(id) => (
                                                        <SelectControl
                                                            id={id}
                                                            className="form-control"
                                                            propKey={'value'}
                                                            propValue={'label'}
                                                            value={form.values.reservation_address}
                                                            onChange={(reservation_address: string) => {
                                                                form.update({ reservation_address });
                                                            }}
                                                            options={reservationAddressOptions}
                                                        />
                                                    )}
                                                />

                                                <FormGroup
                                                    label={'Geboortedatum klant'}
                                                    error={form.errors.reservation_birth_date}
                                                    input={(id) => (
                                                        <SelectControl
                                                            id={id}
                                                            className="form-control"
                                                            propKey={'value'}
                                                            propValue={'label'}
                                                            value={form.values.reservation_birth_date}
                                                            onChange={(reservation_birth_date: string) => {
                                                                form.update({ reservation_birth_date });
                                                            }}
                                                            options={reservationBirthDateOptions}
                                                        />
                                                    )}
                                                />
                                            </FormPane>
                                        )}
                                    </FormPane>
                                )}
                            </FormPane>
                        )}

                        {allowsExtraPayments && (
                            <FormPane title={'Extra payment options'}>
                                <FormGroup
                                    label={translate('product_edit.labels.extra_payments')}
                                    error={form.errors.reservation_extra_payments}
                                    input={() => (
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
                                    )}
                                />
                            </FormPane>
                        )}

                        <ProductCategoriesControl
                            disabled={!isEditable}
                            value={form.values.product_category_id}
                            onChange={(product_category_id) => form.update({ product_category_id })}
                            errors={form.errors.product_category_id}
                        />
                    </FormContainer>
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
