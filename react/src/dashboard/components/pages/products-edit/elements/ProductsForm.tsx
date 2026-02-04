import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import { useNavigateState } from '../../../../modules/state_router/Router';
import { useMediaService } from '../../../../services/MediaService';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import useSetProgress from '../../../../hooks/useSetProgress';
import Organization, { Permission } from '../../../../props/models/Organization';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import MarkdownEditor from '../../../elements/forms/markdown-editor/MarkdownEditor';
import Product, { ProductPriceType } from '../../../../props/models/Product';
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
import FormGroup from '../../../elements/forms/elements/FormGroup';
import ReservationFieldsEditor from '../../reservations/elements/ReservationFieldsEditor';
import { uniqueId } from 'lodash';
import ReservationField from '../../../../props/models/ReservationField';
import useEnvData from '../../../../hooks/useEnvData';
import FormPaneContainer from '../../../elements/forms/elements/FormPaneContainer';

import FormGroupInput from '../../../elements/forms/elements/FormGroupInput';
import ProductsFormMediaUploader from './ProductsFormMediaUploader';
import Media from '../../../../props/models/Media';
import InfoBox from '../../../elements/info-box/InfoBox';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

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
    const envData = useEnvData();
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const mediaService = useMediaService();
    const fundService = useFundService();
    const productService = useProductService();
    const organizationService = useOrganizationService();

    const navigateState = useNavigateState();
    const openModal = useOpenModal();
    const appConfigs = useAppConfigs();

    const [media, setMedia] = useState<Media[]>([]);

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

    const [reservationFieldsConfigOptions] = useState(() => [
        { value: 'global', label: 'Gebruik standaard instelling' },
        { value: 'no', label: 'Nee' },
        { value: 'yes', label: 'Ja' },
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

    const [priceTypes] = useState<Array<{ value: ProductPriceType; label: string }>>([
        { value: 'regular', label: 'Normaal' },
        { value: 'discount_fixed', label: 'Korting €' },
        { value: 'discount_percentage', label: 'Korting %' },
        { value: 'free', label: 'Gratis' },
        { value: 'informational', label: 'Informatief' },
    ]);

    const [isEditable, setIsEditable] = useState<boolean>(true);
    const [allowsReservations, setAllowsReservations] = useState<boolean>(true);
    const [nonExpiring, setNonExpiring] = useState<boolean>(false);
    const [mediaErrors] = useState<string[]>(null);
    const [product, setProduct] = useState<Product | SponsorProduct>(null);
    const [sourceProduct, setSourceProduct] = useState<Product | SponsorProduct>(null);
    const [products, setProducts] = useState<Product[]>(null);
    const [fields, setFields] = useState<Array<ReservationField>>([]);
    const isProvider = useMemo(() => envData.client_type == 'provider', [envData.client_type]);

    const allowsExtraPayments = useMemo(() => {
        return (
            organization?.can_receive_extra_payments && hasPermission(organization, Permission.MANAGE_PAYMENT_METHODS)
        );
    }, [organization]);

    const goToFundProvider = useCallback(
        (provider: FundProvider) => {
            navigateState(DashboardRoutes.FUND_PROVIDER, {
                id: provider.id,
                fundId: provider.fund_id,
                organizationId: provider.fund.organization_id,
            });
        },
        [navigateState],
    );

    const uploadMedia = useCallback((): Promise<string[]> => {
        const syncPresets = ['thumbnail', 'small'];

        return new Promise((resolve, reject) => {
            if (!product && sourceProduct?.photos?.length > 0) {
                const sourceUids = sourceProduct?.photos;

                const promises = sourceUids.map((photo: Media) =>
                    mediaService.clone(photo?.uid, syncPresets).then((res) => [photo?.uid, res.data.data.uid]),
                );

                setProgress(0);

                Promise.all(promises)
                    .then((uids) => {
                        const mediaUids = media.map((item) => item.uid);

                        uids.forEach(([oldUid, newUid]) => {
                            const index = mediaUids.indexOf(oldUid);

                            if (index !== -1) {
                                mediaUids[index] = newUid;
                            }
                        });

                        resolve(mediaUids);
                    })
                    .catch((err) => reject(err.data.errors.file))
                    .finally(() => setProgress(100));

                return;
            }

            return resolve(null);
        });
    }, [product, sourceProduct?.photos, setProgress, mediaService, media]);

    const fetchProduct = useCallback(
        (id: number) => {
            setProgress(0);

            if (fundProvider) {
                fundService
                    .getProviderProduct(organization.id, fundProvider.fund_id, fundProvider.id, id)
                    .then((res) => {
                        setProduct(res.data.data);
                        setMedia(res.data.data.photos);
                    })
                    .catch(() => navigateState(DashboardRoutes.PRODUCTS, { organizationId: organization.id }))
                    .finally(() => setProgress(100));
            } else {
                productService
                    .read(organization.id, id)
                    .then((res) => {
                        setProduct(res.data.data);
                        setFields(res.data.data.reservation_fields.map((item) => ({ ...item, uid: uniqueId() })));
                        setMedia(res.data.data.photos);
                    })
                    .catch(() => navigateState(DashboardRoutes.PRODUCTS, { organizationId: organization.id }))
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
                .then((res) => {
                    setSourceProduct(res.data.data);
                    setMedia(res.data.data.photos);
                })
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
        price_type: ProductPriceType;
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
        reservation_note?: 'global' | 'no' | 'custom';
        reservation_fields_config?: 'global' | 'yes' | 'no';
        reservation_note_text?: string;
        info_duration?: null;
        info_when?: null;
        info_where?: null;
        info_more_info?: null;
        info_attention?: null;
    }>(null, (values) => {
        if (product && !product.unlimited_stock && form.values.stock_amount < 0) {
            form.setIsLocked(false);

            return form.setErrors({
                stock_amount: ['Nog te koop moet minimaal 0 zijn.'],
            });
        }

        uploadMedia()
            .then((media_uids: string[]) => {
                setProgress(0);
                let promise: Promise<ApiResponseSingle<Product | SponsorProduct>>;

                const valueData = {
                    ...values,
                    media_uids: media_uids ? media_uids : media.map((item) => item.uid),
                    fields,
                };

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
                            return navigateState(DashboardRoutes.PRODUCTS, { organizationId: organization.id });
                        }

                        goToFundProvider(fundProvider);
                    })
                    .catch((err: ResponseError) => {
                        form.setIsLocked(false);
                        form.setErrors(err.data.errors);
                        pushApiError(err);
                    })
                    .finally(() => setProgress(100));
            })
            .catch(pushApiError);
    });

    const { update: updateForm } = form;

    const isInformational = useMemo(() => {
        return form.values?.price_type === 'informational';
    }, [form.values?.price_type]);

    const cancel = useCallback(() => {
        if (fundProvider) {
            goToFundProvider(fundProvider);
        } else {
            navigateState(DashboardRoutes.PRODUCTS, { organizationId: organization.id });
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
                            onClick: () => navigateState(DashboardRoutes.PRODUCTS, { organizationId: organization.id }),
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
                      reservation_fields_enabled: false,
                      product_category_id: null,
                      reservation_phone: 'global',
                      reservation_address: 'global',
                      reservation_birth_date: 'global',
                      reservation_extra_payments: 'global',
                      reservation_policy: 'global',
                      reservation_note: 'global',
                      reservation_note_text: '',
                      reservation_fields_config: 'global',
                      info_duration: null,
                      info_when: null,
                      info_where: null,
                      info_more_info: null,
                      info_attention: null,
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
                        name={DashboardRoutes.SPONSOR_PROVIDER_ORGANIZATIONS}
                        params={{ organizationId: organization.id }}
                        activeExact={true}
                        className="breadcrumb-item">
                        {translate('page_state_titles.organization-providers')}
                    </StateNavLink>
                    <StateNavLink
                        name={DashboardRoutes.SPONSOR_PROVIDER_ORGANIZATION}
                        params={{ id: fundProvider.organization.id, organizationId: organization.id }}
                        activeExact={true}
                        className="breadcrumb-item">
                        {strLimit(fundProvider.organization.name, 40)}
                    </StateNavLink>
                    <StateNavLink
                        name={DashboardRoutes.FUND_PROVIDER}
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
                        name={DashboardRoutes.PRODUCTS}
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

                <div className="card-section">
                    <FormPaneContainer>
                        <FormPane title={'Afbeelding'}>
                            <FormGroup
                                error={mediaErrors}
                                input={() => (
                                    <ProductsFormMediaUploader media={media} setMedia={(media) => setMedia(media)} />
                                )}
                            />

                            <FormPane title={translate('product_edit.labels.alternative_text')}>
                                <FormGroup
                                    error={form.errors?.alternative_text}
                                    info={
                                        <Fragment>
                                            Geef een korte beschrijving van de afbeelding. Deze wordt getoond of
                                            voorgelezen wanneer de afbeelding niet zichtbaar is, bijvoorbeeld bij
                                            gebruik van een schermlezer voor mensen met een visuele beperking.
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

                            <InfoBox type={'primary'} iconColor={'primary'}>
                                <h4>Handige informatie</h4>
                                <ul>
                                    <li>U kan tot en met vijf verschillende afbeeldingen uploaden voor het aanbod.</li>
                                    <li>
                                        De afbeeldingen kunt u sorteren door op de linkerzijde van de afbeelding te
                                        slepen.
                                    </li>
                                    <li>
                                        De eerste afbeelding in de lijst zal als uitgelichte afbeelding op de webshop
                                        worden getoond.
                                    </li>
                                </ul>
                            </InfoBox>
                        </FormPane>

                        <FormPane title={'Beschrijving'}>
                            <FormGroup
                                label={translate('product_edit.labels.name')}
                                required={true}
                                error={form.errors?.name}
                                info={
                                    <Fragment>
                                        De titel is zichtbaar op de website en helpt bezoekers snel te zien wat het is.
                                        Geef het aanbod een duidelijke titel.
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

                        <FormPane title={'Aanvullende informatie'}>
                            <FormGroupInput
                                label={translate('product_edit.labels.info_duration')}
                                error={form.errors.info_duration}
                                value={form.values.info_duration || ''}
                                setValue={(info_duration: string) => form.update({ info_duration })}
                            />
                            <FormGroupInput
                                label={translate('product_edit.labels.info_when')}
                                error={form.errors.info_when}
                                value={form.values.info_when || ''}
                                setValue={(info_when: string) => form.update({ info_when })}
                            />
                            <FormGroupInput
                                label={translate('product_edit.labels.info_where')}
                                error={form.errors.info_where}
                                value={form.values.info_where || ''}
                                setValue={(info_where: string) => form.update({ info_where })}
                            />
                            <FormGroupInput
                                label={translate('product_edit.labels.info_more_info')}
                                error={form.errors.info_more_info}
                                value={form.values.info_more_info || ''}
                                setValue={(info_more_info: string) => form.update({ info_more_info })}
                            />

                            <FormGroupInput
                                label={translate('product_edit.labels.info_attention')}
                                error={form.errors.info_attention}
                                value={form.values.info_attention || ''}
                                setValue={(info_attention: string) => form.update({ info_attention })}
                            />
                        </FormPane>

                        <FormPane title={'Prijs en type'}>
                            <div className="row">
                                <div className="col col-xs-12 col-sm-6">
                                    <FormGroup
                                        label={translate('Soort aanbod')}
                                        error={form.errors?.price_type}
                                        info={translate('product_edit.tooltips.product_type')}
                                        input={(id) => (
                                            <SelectControl
                                                id={id}
                                                propValue={'label'}
                                                propKey={'value'}
                                                disabled={!isEditable || !!product}
                                                value={form.values.price_type}
                                                onChange={(price_type: ProductPriceType) => form.update({ price_type })}
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
                                                    Vul het bedrag in die de klant voor dit aanbod betaald. Dit is de
                                                    standaard prijs. Bijvoorbeeld: Fiets voor € 200,-
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
                                            info={
                                                <Fragment>
                                                    Vul het kortingspercentage in. Bijvoorbeeld: 20% korting op een
                                                    fiets.
                                                </Fragment>
                                            }
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
                                            info={
                                                <Fragment>
                                                    Vul het kortingsbedrag in Euros in. Bijvoorbeeld: € 20,- korting op
                                                    een fiets.
                                                </Fragment>
                                            }
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
                                                    Het aanbod heeft geen prijs en is gratis. Er is geen prijs of
                                                    korting nodig. Bijvoorbeeld: Gratis toegang tot de bioscoop.
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

                                    {form.values.price_type === 'informational' && (
                                        <FormGroup
                                            label={'Bedrag'}
                                            info={
                                                <Fragment>
                                                    Dit aanbod is alleen ter informatie. Het laat een voorbeeld of een
                                                    productcategorie zien. Er is geen prijs of korting. Bijvoorbeeld:
                                                    Schoolartikelen. Kom naar de winkel en bekijk ons aanbod.
                                                </Fragment>
                                            }
                                            input={(id) => (
                                                <input
                                                    id={id}
                                                    className="form-control"
                                                    disabled={true}
                                                    value={'Informatief'}
                                                />
                                            )}
                                        />
                                    )}
                                </div>
                            </div>

                            {!isInformational && (
                                <Fragment>
                                    {(!product || (product && !product.unlimited_stock)) && (
                                        <div className="row">
                                            <div className="col col-xs-12 col-sm-6">
                                                <FormGroup
                                                    label={'Voorraad'}
                                                    required={true}
                                                    info={
                                                        <Fragment>
                                                            Kies of het product een voorraadlimiet heeft of altijd
                                                            beschikbaar is.
                                                        </Fragment>
                                                    }
                                                    input={(id) => (
                                                        <SelectControl
                                                            id={id}
                                                            propKey={'value'}
                                                            propValue={'label'}
                                                            disabled={
                                                                !isEditable || (product && !product.unlimited_stock)
                                                            }
                                                            value={form.values.unlimited_stock}
                                                            options={[
                                                                { value: false, label: 'Aantal op voorraad' },
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
                                                            Kies of het product een voorraadlimiet heeft of altijd
                                                            beschikbaar is.
                                                        </Fragment>
                                                    }
                                                    error={form.errors.total_amount}
                                                    input={(id) =>
                                                        !form.values.unlimited_stock ? (
                                                            <input
                                                                id={id}
                                                                className="form-control"
                                                                disabled={
                                                                    !isEditable ||
                                                                    !!product ||
                                                                    form.values.unlimited_stock
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
                                                            Hoe vaak dit aanbod is gekocht. Dit wordt automatisch
                                                            bijgewerkt.
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
                                </Fragment>
                            )}
                        </FormPane>

                        {!isInformational && (
                            <FormPane title={'Productcodes'}>
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
                        )}

                        <FormPane title={'Geldigheid'}>
                            <div className="row">
                                <div className="col col-xs-12 col-sm-6">
                                    <FormGroup
                                        label={'Instelling voor geldigheid'}
                                        info={
                                            <Fragment>
                                                Kies of het aanbod een vervaldatum heeft of onbeperkt beschikbaar is.
                                                Dit kan later nog worden aangepast.
                                            </Fragment>
                                        }
                                        input={(id) => (
                                            <SelectControl
                                                id={id}
                                                propKey={'value'}
                                                propValue={'label'}
                                                disabled={!isEditable}
                                                options={[
                                                    { value: true, label: 'Het aanbod heeft geen verloopdatum' },
                                                    { value: false, label: 'Stel een verloopdatum in' },
                                                ]}
                                                value={nonExpiring}
                                                onChange={(value: boolean) => setNonExpiring(value)}
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
                                                De laatste dag waarop uw aanbieding geldig is. Daarna verdwijnt de
                                                aanbieding uit de webshop en kan deze niet meer worden gebruikt.
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

                        <FormPane title={'Betaalopties'}>
                            <FormGroup
                                className="form-group tooltipped"
                                label={'QR-code scannen op locatie'}
                                error={form.errors.qr_enabled}
                                info={
                                    <Fragment>
                                        De klant toont bij het afrekenen op uw locatie een QR-code. Scan deze QR-code
                                        met de app `Me` (gratis beschikbaar voor iOS en Android). Het aankoopbedrag
                                        wordt overgemaakt op uw bankrekening.
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

                            {allowsReservations && !isInformational && (
                                <FormGroup
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
                            )}

                            {form.values.reservation_enabled && !isInformational && (
                                <FormPane title={'Instellingen online betalen'}>
                                    <FormGroup
                                        label={'Reserveringen accepteren'}
                                        error={form.errors.reservation_policy}
                                        info={
                                            <Fragment>
                                                Geef aan of u reserveringen handmatig of automatisch wilt goedkeuren.
                                                Deze (algemene) instelling kunt u later aanpassen op de pagina
                                                Reserveringen - Instellingen.
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
                                        label={translate('product_edit.labels.reservation_note')}
                                        error={form.errors.reservation_note}
                                        info={
                                            <Fragment>
                                                Stuur een bericht naar de klant als u de reservering accepteert. In dit
                                                bericht kun je meer informatie kwijt over het aanbod. Bijv. Stuur ons
                                                een e-mail of bel ons om een afspraak in te plannen.
                                            </Fragment>
                                        }
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
                                                    placeholder={translate(
                                                        'product_edit.labels.custom_reservation_note_text',
                                                    )}
                                                    value={form.values.reservation_note_text || ''}
                                                    onChange={(e) =>
                                                        form.update({ reservation_note_text: e.target.value })
                                                    }
                                                />
                                            )}
                                        />
                                    )}

                                    {isProvider && (
                                        <Fragment>
                                            <FormGroup
                                                label={'Klantgegevens uitvragen'}
                                                error={form.errors.reservation_fields_enabled}
                                                info={translate('product_edit.tooltips.reservation_fields_enabled')}
                                                input={(id) => (
                                                    <SelectControl
                                                        id={id}
                                                        disabled={!isEditable}
                                                        propKey={'value'}
                                                        propValue={'label'}
                                                        value={form.values.reservation_fields_enabled}
                                                        options={[
                                                            {
                                                                value: true,
                                                                label: 'Aanvullende klantgegevens nodig',
                                                            },
                                                            {
                                                                value: false,
                                                                label: 'Geen aanvullende klantgegevens nodig',
                                                            },
                                                        ]}
                                                        onChange={(value: boolean) => {
                                                            form.update({ reservation_fields_enabled: value });
                                                        }}
                                                    />
                                                )}
                                            />

                                            {form.values.reservation_fields_enabled && (
                                                <FormPane title={'Klantgegevens'}>
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

                                                    <FormGroup
                                                        label={'Aangepaste velden'}
                                                        error={form.errors.reservation_fields_config}
                                                        input={(id) => (
                                                            <SelectControl
                                                                id={id}
                                                                className="form-control"
                                                                propKey={'value'}
                                                                propValue={'label'}
                                                                value={form.values.reservation_fields_config}
                                                                onChange={(reservation_fields_config: string) => {
                                                                    form.update({ reservation_fields_config });
                                                                }}
                                                                options={reservationFieldsConfigOptions}
                                                            />
                                                        )}
                                                    />

                                                    {form.values.reservation_fields_config === 'yes' && (
                                                        <FormGroup
                                                            label={translate('reservation_settings.labels.fields')}
                                                            input={() => (
                                                                <ReservationFieldsEditor
                                                                    fields={fields}
                                                                    onChange={setFields}
                                                                    errors={form.errors}
                                                                />
                                                            )}
                                                        />
                                                    )}
                                                </FormPane>
                                            )}
                                        </Fragment>
                                    )}
                                </FormPane>
                            )}
                        </FormPane>

                        {allowsExtraPayments && !isInformational && (
                            <FormPane title={'Bijbetaal opties'}>
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
                    </FormPaneContainer>
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
