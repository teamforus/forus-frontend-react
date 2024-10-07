import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import { useNavigateState } from '../../../modules/state_router/Router';
import Voucher from '../../../../dashboard/props/models/Voucher';
import { useVoucherService } from '../../../services/VoucherService';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import useEnvData from '../../../hooks/useEnvData';
import useComposeVoucherCardData from '../../../services/helpers/useComposeVoucherCardData';
import { useParams } from 'react-router-dom';
import { strLimit } from '../../../../dashboard/helpers/string';
import QrCode from '../../../../dashboard/components/elements/qr-code/QrCode';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import useAssetUrl from '../../../hooks/useAssetUrl';
import TranslateHtml from '../../../../dashboard/components/elements/translate-html/TranslateHtml';
import BlockVoucherRecords from '../../elements/block-voucher-records/BlockVoucherRecords';
import IconVoucherRecords from '../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-voucher-records.svg';
import IconReimbursement from '../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-reimbursement.svg';
import BlockProducts from '../../elements/block-products/BlockProducts';
import useAppConfigs from '../../../hooks/useAppConfigs';
import Product from '../../../props/models/Product';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import { useProductService } from '../../../services/ProductService';
import { GoogleMap } from '../../../../dashboard/components/elements/google-map/GoogleMap';
import MapMarkerProviderOffice from '../../elements/map-markers/MapMarkerProviderOffice';
import Office from '../../../../dashboard/props/models/Office';
import Markdown from '../../elements/markdown/Markdown';
import useOpenModal from '../../../../dashboard/hooks/useOpenModal';
import ModalNotification from '../../modals/ModalNotification';
import { useHelperService } from '../../../../dashboard/services/HelperService';
import ModalOpenInMe from '../../modals/ModalOpenInMe';
import ModalShareVoucher from '../../modals/ModalShareVoucher';
import ModalDeactivateVoucher from '../../modals/ModalDeactivateVoucher';
import ModalPhysicalCardUnlink from '../../modals/ModalPhysicalCardUnlink';
import ModalPhysicalCardType from '../../modals/ModalPhysicalCardType';
import useOpenPrintable from '../../../../dashboard/hooks/useOpenPrintable';
import VoucherQrCodePrintable from '../../printable/VoucherQrCodePrintable';
import useSetTitle from '../../../hooks/useSetTitle';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';

export default function VouchersShow() {
    const { address } = useParams();
    const envData = useEnvData();
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();

    const assetUrl = useAssetUrl();
    const setTitle = useSetTitle();
    const openModal = useOpenModal();
    const openPrintable = useOpenPrintable();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();
    const composeVoucherCardData = useComposeVoucherCardData();

    const helperService = useHelperService();
    const productService = useProductService();
    const voucherService = useVoucherService();

    const [voucher, setVoucher] = useState<Voucher>(null);
    const [products, setProducts] = useState<PaginationData<Product>>(null);
    const [subsidies, setSubsidies] = useState<PaginationData<Product>>(null);
    const [showRecords, setShowRecords] = useState<boolean>(null);

    const voucherCard = useMemo(() => {
        return voucher ? composeVoucherCardData(voucher) : null;
    }, [voucher, composeVoucherCardData]);

    const showHistory = useMemo(
        () => voucher?.history.filter((history) => !history.event.startsWith('created_')).length > 0,
        [voucher?.history],
    );

    const showProducts = useMemo(
        () =>
            !voucher?.expired &&
            !voucher?.deactivated &&
            !voucher?.product &&
            !voucher?.is_external &&
            appConfigs?.products.list,
        [appConfigs, voucher],
    );

    const physicalCardIsLinkable = useMemo(() => {
        return voucher?.fund?.allow_physical_cards && voucher?.type === 'regular';
    }, [voucher]);

    const showPhysicalCardsOption = useMemo(() => {
        return physicalCardIsLinkable && !voucher.physical_card && !voucher?.expired;
    }, [physicalCardIsLinkable, voucher?.expired, voucher?.physical_card]);

    const deleteVoucher = useCallback(
        function (voucher: Voucher) {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    type={'confirm'}
                    title={'Annuleer reservering'}
                    description={translate('voucher.delete_voucher.popup_form.description')}
                    mdiIconType={'warning'}
                    mdiIconClass={'alert-outline'}
                    cancelBtnText={translate('voucher.delete_voucher.buttons.close')}
                    confirmBtnText={translate('voucher.delete_voucher.buttons.submit')}
                    onConfirm={() => voucherService.destroy(voucher.address).then(() => navigateState('vouchers'))}
                />
            ));
        },
        [navigateState, openModal, translate, voucherService],
    );

    const printQrCode = useCallback(
        (voucher: Voucher) => {
            openPrintable((printable) => (
                <VoucherQrCodePrintable
                    printable={printable}
                    voucher={voucher}
                    webshopUrl={appConfigs?.fronts.url_webshop}
                    organization={!voucher.product ? voucher.fund.organization : voucher.product.organization}
                    assetUrl={assetUrl}
                />
            ));
        },
        [appConfigs?.fronts?.url_webshop, assetUrl, openPrintable],
    );

    const sendVoucherEmail = useCallback(
        function (voucher: Voucher) {
            if (!authIdentity.email) {
                return navigateState('identity-emails');
            }

            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    type={'confirm'}
                    title={'E-mail naar mij'}
                    mdiIconType="primary"
                    mdiIconClass={'email-open-outline'}
                    description={'Stuur de QR-code naar mijn e-mailadres'}
                    onConfirm={() => {
                        voucherService.sendToEmail(voucher.address).then(() => {
                            const emailServiceUrl = helperService.getEmailServiceProviderUrl(authIdentity?.email);

                            openModal((modal) => (
                                <ModalNotification
                                    modal={modal}
                                    type="action-result"
                                    title="E-mail naar mij"
                                    header={translate('popup_auth.notifications.confirmation')}
                                    mdiIconType="success"
                                    mdiIconClass="check-circle-outline"
                                    description={translate('popup_auth.notifications.voucher_email')}
                                    confirmBtnText={translate(
                                        emailServiceUrl ? 'email_service_switch.confirm' : 'buttons.close',
                                    )}
                                    onConfirm={() => helperService.openInNewTab(emailServiceUrl)}
                                />
                            ));
                        });
                    }}
                />
            ));
        },
        [authIdentity?.email, helperService, navigateState, openModal, translate, voucherService],
    );

    const openInMeModal = useCallback(() => {
        openModal((modal) => <ModalOpenInMe modal={modal} />);
    }, [openModal]);

    const shareVoucher = useCallback(
        (voucher: Voucher) => {
            openModal((modal) => <ModalShareVoucher modal={modal} voucher={voucher} />);
        },
        [openModal],
    );

    const deactivateVoucher = useCallback(
        (voucher: Voucher) => {
            openModal((modal) => (
                <ModalDeactivateVoucher
                    modal={modal}
                    voucher={voucher}
                    onDeactivated={(voucher) => setVoucher(voucher)}
                />
            ));
        },
        [openModal],
    );

    const fetchVoucher = useCallback(() => {
        setProgress(0);

        voucherService
            .get(address)
            .then((res) => setVoucher(res.data.data))
            .finally(() => setProgress(100));
    }, [address, setProgress, voucherService]);

    const fetchProducts = useCallback(
        (voucher: Voucher) => {
            setProgress(0);

            productService
                .list({ fund_type: voucher?.fund?.type, sample: 1, per_page: 6, fund_id: voucher.fund_id })
                .then((res) => {
                    if (voucher?.fund?.type === 'budget') {
                        setProducts(res.data);
                    }

                    if (voucher?.fund?.type === 'subsidies') {
                        setSubsidies(res.data);
                    }
                })
                .finally(() => setProgress(100));
        },
        [setProgress, productService],
    );

    const linkPhysicalCard = useCallback(
        (voucher: Voucher, state?: 'select_type' | 'card_code') => {
            openModal((modal) => (
                <ModalPhysicalCardType
                    modal={modal}
                    voucher={voucher}
                    initialState={state}
                    onSendVoucherEmail={(voucher) => sendVoucherEmail(voucher)}
                    onOpenInMeModal={openInMeModal}
                    onPrintQrCode={printQrCode}
                    onAttached={() => fetchVoucher()}
                />
            ));
        },
        [fetchVoucher, openInMeModal, openModal, printQrCode, sendVoucherEmail],
    );

    const unlinkPhysicalCard = useCallback(
        (voucher: Voucher) => {
            openModal((modal) => (
                <ModalPhysicalCardUnlink
                    modal={modal}
                    voucher={voucher}
                    onPhysicalCardUnlinked={() => fetchVoucher()}
                    onClose={(requestNew) => {
                        voucherService.get(voucher.address).then((res) => {
                            setVoucher(res.data.data);

                            if (requestNew) {
                                linkPhysicalCard(res.data.data, 'select_type');
                            }
                        });
                    }}
                />
            ));
        },
        [fetchVoucher, linkPhysicalCard, openModal, voucherService],
    );

    useEffect(() => {
        fetchVoucher();
    }, [fetchVoucher]);

    useEffect(() => {
        if (voucher && !voucher.product && ['budget', 'subsidies'].includes(voucher?.fund?.type)) {
            fetchProducts(voucher);
        }
    }, [fetchProducts, voucher]);

    useEffect(() => {
        if (voucher?.fund) {
            setTitle(translate('page_state_titles.voucher', { fund_name: voucher.fund.name }));
        }
    }, [setTitle, translate, voucher?.fund]);

    return (
        <BlockShowcase
            wrapper={true}
            breadcrumbs={
                <div className={'wrapper'}>
                    <div className="block block-breadcrumbs hide-sm">
                        <StateNavLink name={'home'} className="breadcrumb-item">
                            Home
                        </StateNavLink>
                        <StateNavLink name={'vouchers'} className="breadcrumb-item" activeExact={true}>
                            Mijn tegoeden
                        </StateNavLink>
                        {voucher && (
                            <StateNavLink
                                name={'voucher'}
                                params={{ address: voucher.address }}
                                className="breadcrumb-item active"
                                aria-current="location">
                                {voucher.physical_card
                                    ? `Uw ${voucherCard.title} #${voucher.physical_card.code}`
                                    : voucherCard.title}
                            </StateNavLink>
                        )}
                    </div>
                </div>
            }>
            {voucher && voucherCard && (
                <section className="section section-voucher-details">
                    <div className="page page-voucher">
                        {/* Internal vouchers */}
                        {!voucherCard.deactivated && !voucher?.expired && !voucherCard.is_external && (
                            <div className="block block-voucher">
                                <h1 className="sr-only">Jouw tegoed</h1>
                                <div className="base-card base-card-voucher">
                                    <div className="card-inner">
                                        <div className="card-body">
                                            <div className="card-photo">
                                                <img className="voucher-img" src={voucherCard.thumbnail} alt={''} />
                                            </div>
                                            <div className="card-section">
                                                <h2 className="card-title" data-dusk="voucherTitle">
                                                    {strLimit(voucherCard.title, 40)}
                                                </h2>

                                                {!voucherCard.product ? (
                                                    <div className="card-subtitle">
                                                        {voucherCard.fund.organization.name}
                                                    </div>
                                                ) : (
                                                    <div className="card-subtitle">
                                                        {voucherCard.product.organization.name}
                                                    </div>
                                                )}

                                                {!voucherCard.is_external &&
                                                    voucherCard.fund.type == 'budget' &&
                                                    !voucherCard.product && (
                                                        <div>
                                                            <div className="card-value euro">
                                                                {voucherCard.amount_locale}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>

                                            {!voucherCard.is_external && (
                                                <Fragment>
                                                    <div className="card-qr_code show-sm">
                                                        {voucher.address && (
                                                            <QrCode
                                                                padding={5}
                                                                className={'card-qr_code-element'}
                                                                value={JSON.stringify({
                                                                    type: 'voucher',
                                                                    value: voucher.address,
                                                                })}
                                                            />
                                                        )}

                                                        <div className="card-qr_code-desc">
                                                            Geldig t/m {voucherCard.last_active_day_locale}
                                                        </div>
                                                    </div>
                                                    <div className="card-qr_code hide-sm">
                                                        {voucher.address && (
                                                            <QrCode
                                                                value={JSON.stringify({
                                                                    type: 'voucher',
                                                                    value: voucher.address,
                                                                })}
                                                            />
                                                        )}

                                                        {!voucherCard.used && (
                                                            <div className="card-qr_code-desc">
                                                                Geldig t/m {voucherCard.last_active_day_locale}
                                                            </div>
                                                        )}

                                                        {voucherCard.product && voucherCard.used && (
                                                            <div className="card-qr_code-desc">Gebruikt</div>
                                                        )}
                                                    </div>
                                                </Fragment>
                                            )}
                                        </div>
                                        <div className="card-footer">
                                            {voucherCard.product && (
                                                <Fragment>
                                                    {voucherCard.transactions.map((transaction) => (
                                                        <div key={transaction.id} className="card-section">
                                                            <div className="card-label">Gebruikt op:</div>
                                                            <div className="card-value">
                                                                {transaction?.created_at_locale}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </Fragment>
                                            )}

                                            <div className="card-actions">
                                                <div className="action-col">
                                                    <div
                                                        role={'button'}
                                                        tabIndex={0}
                                                        onKeyDown={clickOnKeyEnter}
                                                        className="action-item"
                                                        onClick={() => sendVoucherEmail(voucher)}>
                                                        <div className="action-item-icon">
                                                            <em className="mdi mdi-email-outline" />
                                                        </div>
                                                        <div className="action-item-name">
                                                            {translate(
                                                                'physical_card.modal_section.request_new_card.email_to_me',
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="action-col">
                                                    <div
                                                        role={'button'}
                                                        tabIndex={0}
                                                        onKeyDown={clickOnKeyEnter}
                                                        className="action-item"
                                                        onClick={openInMeModal}>
                                                        <div className="action-item-icon">
                                                            <em className="mdi mdi-account-circle" />
                                                        </div>
                                                        <div className="action-item-name">
                                                            {translate(
                                                                'physical_card.modal_section.request_new_card.open_in_app',
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {!envData.config.flags.noPrintOption && (
                                                    <div className="action-col">
                                                        <div
                                                            role={'button'}
                                                            tabIndex={0}
                                                            onKeyDown={clickOnKeyEnter}
                                                            className="action-item"
                                                            onClick={() => printQrCode(voucher)}>
                                                            <div className="action-item-icon">
                                                                <em className="mdi mdi-printer" />
                                                            </div>
                                                            <div className="action-item-name">
                                                                {translate(
                                                                    'physical_card.modal_section.request_new_card.print_pass',
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {voucher.fund.allow_physical_cards &&
                                                    voucher.type === 'regular' &&
                                                    !voucher.physical_card && (
                                                        <div className="action-col">
                                                            <div
                                                                role={'button'}
                                                                tabIndex={0}
                                                                onKeyDown={clickOnKeyEnter}
                                                                className="action-item"
                                                                onClick={() => linkPhysicalCard(voucher)}>
                                                                <div className="action-item-icon">
                                                                    <em className="mdi mdi-card-bulleted-outline" />
                                                                </div>
                                                                <div className="action-item-name">
                                                                    {translate(
                                                                        'physical_card.modal_section.type_selection.card_new.title',
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                {showPhysicalCardsOption && (
                                                    <div className="action-col">
                                                        <div
                                                            role={'button'}
                                                            tabIndex={0}
                                                            onKeyDown={clickOnKeyEnter}
                                                            className="action-item"
                                                            onClick={() => linkPhysicalCard(voucher, 'card_code')}>
                                                            <div className="action-item-icon">
                                                                <em className="mdi mdi-card-bulleted-outline" />
                                                            </div>
                                                            <div className="action-item-name">Activeer mijn pas</div>
                                                        </div>
                                                    </div>
                                                )}

                                                {voucher.physical_card && (
                                                    <div className="action-col">
                                                        <div
                                                            role={'button'}
                                                            tabIndex={0}
                                                            onKeyDown={clickOnKeyEnter}
                                                            className="action-item"
                                                            onClick={() => unlinkPhysicalCard(voucher)}>
                                                            <div className="action-item-icon">
                                                                <em className="mdi mdi-card-bulleted-outline" />
                                                            </div>
                                                            <div className="action-item-name">
                                                                Ik ben mijn pas kwijt
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="action-col">
                                                    <div
                                                        role={'button'}
                                                        tabIndex={0}
                                                        onKeyDown={clickOnKeyEnter}
                                                        className="action-item"
                                                        onClick={() => shareVoucher(voucher)}>
                                                        <div className="action-item-icon">
                                                            <em className="mdi mdi-share-variant" />
                                                        </div>
                                                        <div className="action-item-name">Delen</div>
                                                    </div>
                                                </div>

                                                {!voucherCard.used && voucherCard.product && voucherCard.returnable && (
                                                    <div className="action-col">
                                                        <div
                                                            role={'button'}
                                                            tabIndex={0}
                                                            onKeyDown={clickOnKeyEnter}
                                                            className="action-item"
                                                            onClick={() => deleteVoucher(voucher)}>
                                                            <div className="action-item-icon">
                                                                <em className="mdi mdi-cancel" />
                                                            </div>
                                                            <div className="action-item-name">Annuleren</div>
                                                        </div>
                                                    </div>
                                                )}

                                                {!voucher.expired && voucher.fund.allow_blocking_vouchers && (
                                                    <div className="action-col">
                                                        <div
                                                            role={'button'}
                                                            tabIndex={0}
                                                            onKeyDown={clickOnKeyEnter}
                                                            className="action-item"
                                                            onClick={() => deactivateVoucher(voucher)}>
                                                            <div className="action-item-icon">
                                                                <em className="mdi mdi-logout" />
                                                            </div>
                                                            <div className="action-item-name">Stop deelname</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {!voucherCard.product && (
                                    <div className="base-card base-card-sponsor">
                                        <div className="card-inner">
                                            <div className="card-body">
                                                <div className="card-photo">
                                                    <img
                                                        src={
                                                            voucherCard?.fund?.organization?.logo?.sizes?.large ||
                                                            assetUrl('/assets/img/placeholders/organization-large.png')
                                                        }
                                                        alt={voucherCard.fund?.organization?.name}
                                                    />
                                                </div>
                                                <div className="card-section">
                                                    <h2 className="card-title">
                                                        {translate('voucher.voucher_card.header.title')}
                                                    </h2>
                                                    <div className="card-description">
                                                        <TranslateHtml
                                                            i18n={'voucher.voucher_card.labels.description'}
                                                            values={{ fund_name: voucherCard.title }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-footer">
                                                <div className="card-label">
                                                    {translate('voucher.voucher_card.labels.contact_sponsor', {
                                                        fund_name: voucherCard.title,
                                                    })}
                                                </div>
                                                <div className="card-value card-value-sm">
                                                    E-mailadres:{' '}
                                                    <strong>{voucherCard.fund?.organization?.email}</strong>
                                                    <br />
                                                    Telefoonnummer:{' '}
                                                    <strong>{voucherCard.fund?.organization?.phone}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {voucherCard.product && (
                                    <div className="base-card base-card-sponsor">
                                        <div className="card-inner">
                                            <div className="card-body">
                                                <div className="card-photo">
                                                    <img
                                                        src={
                                                            voucherCard?.product?.organization?.logo?.sizes?.large ||
                                                            assetUrl('/assets/img/placeholders/organization-large.png')
                                                        }
                                                        alt={voucherCard.fund?.organization?.name}
                                                    />
                                                </div>
                                                <div className="card-section">
                                                    <h2 className="card-title">
                                                        {translate('voucher.voucher_card.header.title')}
                                                    </h2>
                                                    <div className="card-description">
                                                        <TranslateHtml
                                                            i18n={'voucher.voucher_card.labels.description'}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-footer">
                                                <div className="card-label">
                                                    {translate('voucher.voucher_card.labels.contact_sponsor')}
                                                </div>
                                                <div className="card-value card-value-sm">
                                                    E-mailadres:{' '}
                                                    <strong>{voucherCard.product.organization.email}</strong>
                                                    <br />
                                                    Telefoonnummer:{' '}
                                                    <strong>{voucherCard.product.organization.phone}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* External vouchers */}
                        {!voucherCard.deactivated && !voucher?.expired && !!voucherCard.is_external && (
                            <div className="block block-voucher block-voucher-combined">
                                <h1 className="sr-only">Jouw tegoed</h1>
                                <div className="base-card base-card-voucher">
                                    <div className="card-inner">
                                        <div className="card-body">
                                            <div className="card-photo">
                                                <img className="voucher-img" src={voucherCard.thumbnail} alt={''} />
                                            </div>
                                            <div className="card-section">
                                                <h2 className="card-title">{strLimit(voucherCard.title, 40)}</h2>

                                                {!voucherCard.product ? (
                                                    <div className="card-subtitle">
                                                        {voucherCard.fund?.organization?.name}
                                                    </div>
                                                ) : (
                                                    <div className="card-subtitle">
                                                        {voucherCard.product?.organization?.name}
                                                    </div>
                                                )}

                                                {voucherCard.fund.type == 'budget' &&
                                                    !voucherCard.product &&
                                                    voucherCard.fund.key == 'meedoenregeling_volwassenen_ww' && (
                                                        <div>
                                                            <div className="card-value euro">
                                                                {voucherCard.amount_locale}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                        <div className="card-footer">
                                            <div className="card-section">
                                                <h2 className="card-title">
                                                    {translate('voucher.voucher_card_combined.header.title')}
                                                </h2>
                                                <div className="card-description">
                                                    <TranslateHtml
                                                        i18n={`voucher.voucher_card_combined.labels.${voucherCard.fund?.key}.how_it_works`}
                                                        i18nDefault={
                                                            'voucher.voucher_card_combined.labels.how_it_works'
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="card-section">
                                                <div className="card-title">
                                                    {translate('voucher.voucher_card_combined.labels.contact_sponsor')}
                                                </div>
                                                <div className="card-description">
                                                    <span>
                                                        {translate(
                                                            'voucher.voucher_card_combined.labels.contact_sponsor_details',
                                                        )}
                                                    </span>
                                                    <br />
                                                    E-mailadres: <span>{voucherCard.fund.organization.email}</span>
                                                    <br />
                                                    Telefoonnummer: <span>{voucherCard.fund.organization.phone}</span>
                                                    <br />
                                                    <br />
                                                    <strong>
                                                        {translate(
                                                            `voucher.voucher_card_combined.labels.${voucherCard.fund.key}.redirect_to`,
                                                            null,
                                                            'voucher.voucher_card_combined.labels.redirect_to',
                                                        )}
                                                    </strong>
                                                    <br />
                                                    {voucherCard.fund.key == 'IIT' && (
                                                        <span>
                                                            Klik dan{' '}
                                                            <StateNavLink
                                                                name={'funds'}
                                                                className="card-description-link">
                                                                hier
                                                            </StateNavLink>{' '}
                                                            om terug te gaan naar het overzicht van de vergoedingen.
                                                        </span>
                                                    )}
                                                    {voucherCard.fund.key == 'meedoenregeling_volwassenen_ww' && (
                                                        <span>
                                                            Vraag uw kosten terug door een bon in te sturen. Klik{' '}
                                                            <StateNavLink
                                                                name={'reimbursements-create'}
                                                                params={{ voucher_address: voucher.address }}
                                                                className="card-description-link">
                                                                hier
                                                            </StateNavLink>{' '}
                                                            om uw bon in te sturen.{' '}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Voucher records */}
                        {voucherCard.records?.length > 0 && (
                            <div className="block block-action-card block-action-card-compact">
                                <div className="block-card-body">
                                    <div className="block-card-section">
                                        <div className="block-card-logo">
                                            <IconVoucherRecords />
                                        </div>
                                        {voucherCard.records_title ? (
                                            <div className="block-card-details">
                                                <h3 className="block-card-title block-card-title-sm text-muted-dim">
                                                    Persoonsgegevens
                                                </h3>
                                                <h2 className="block-card-title block-card-title-lg">
                                                    <strong>{voucherCard.records_title}</strong>
                                                    <span className="text-separator" />
                                                    <span className="text-muted-dim">
                                                        {voucherCard.records_by_key.birth_date}
                                                    </span>
                                                </h2>
                                            </div>
                                        ) : (
                                            <div className="block-card-details">
                                                <h3 className="block-card-title">Persoonsgegevens</h3>
                                            </div>
                                        )}

                                        <div className="block-card-actions">
                                            <div
                                                className="button button-primary-outline button-sm"
                                                onClick={() => setShowRecords(!showRecords)}>
                                                {showRecords ? 'Verberg alle details' : 'Toon alle details'}

                                                {showRecords ? (
                                                    <em className="mdi mdi-chevron-up icon-right" />
                                                ) : (
                                                    <em className="mdi mdi-chevron-right icon-right" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {showRecords && (
                                        <div className="block-card-section">
                                            <BlockVoucherRecords voucher={voucher} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Voucher physical card linking */}
                        {!voucherCard.deactivated && showPhysicalCardsOption && (
                            <div className="block block-action-card">
                                <div className="block-card-logo">
                                    <img
                                        src={assetUrl(
                                            '/assets/img/icon-physical-cards/icon-physical-cards-preview-vertical.png',
                                        )}
                                        alt={`Fysieke pas: '${voucherCard.title}'`}
                                    />
                                </div>
                                <div className="block-card-details">
                                    <h3 className="block-card-title">{translate('voucher.physical_card.title')}</h3>
                                </div>
                                <div className="block-card-actions">
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={clickOnKeyEnter}
                                        className="button button-primary"
                                        onClick={() => linkPhysicalCard(voucher, 'card_code')}>
                                        {translate('voucher.physical_card.buttons.reactivate')}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Voucher physical card linked */}
                        {!voucherCard.deactivated && voucher.physical_card && (
                            <div className="block block-action-card">
                                <div className="block-card-logo">
                                    <img
                                        src={assetUrl(
                                            '/assets/img/icon-physical-cards/icon-physical-cards-preview-vertical.png',
                                        )}
                                        alt={`Fysieke pas: '${voucherCard.title}'`}
                                    />
                                </div>
                                <div className="block-card-details">
                                    <div className="block-card-code">Pasnummer: {voucher.physical_card.code}</div>
                                </div>
                                <div className="block-card-actions">
                                    <div
                                        className="button button-primary-outline"
                                        onClick={() => unlinkPhysicalCard(voucher)}>
                                        {translate('voucher.physical_card.buttons.lost_pass')}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Make reimbursement request card */}
                        {voucher.fund.allow_reimbursements && !voucher.expired && !voucher.deactivated && (
                            <div className="block block-action-card">
                                <div className="block-card-logo block-card-logo-background">
                                    <IconReimbursement />
                                </div>
                                <div className="block-card-details">
                                    <h3 className="block-card-title">Kosten terugvragen</h3>
                                    <div className="block-card-description">
                                        Vraag uw gemaakte kosten terug door de gegevens van uw aankoop en de rekening of
                                        kassabon in te sturen.
                                    </div>
                                </div>
                                <div className="block-card-actions">
                                    <StateNavLink
                                        name={'reimbursements-create'}
                                        params={{ voucher_address: voucher.address }}
                                        className="button button-primary">
                                        <em className="mdi mdi-plus icon-start" />
                                        Bon insturen
                                    </StateNavLink>
                                </div>
                            </div>
                        )}

                        {/* Voucher history */}
                        {showHistory && (
                            <div className="block block-transactions">
                                <div className="transactions-header">
                                    <h2 className="transactions-title">Status </h2>
                                    {voucher.expired ? (
                                        <div className="label label-danger">Verlopen</div>
                                    ) : (
                                        <div
                                            className={`label ${
                                                voucherCard.deactivated ? 'label-light' : 'label-primary'
                                            }`}>
                                            {voucherCard.state_locale}
                                        </div>
                                    )}
                                </div>

                                <div className="transactions-body">
                                    <div className="transactions-list">
                                        {voucherCard.history?.map((log) => (
                                            <div key={log.id} className="transactions-item transactions-item-out">
                                                {log.event.startsWith('created') && (
                                                    <div className="transactions-item-icon text-primary">
                                                        <em className="mdi mdi-ticket-confirmation" />
                                                    </div>
                                                )}
                                                {log.event.startsWith('expired') && (
                                                    <div className="transactions-item-icon text-danger">
                                                        <em className="mdi mdi-close-octagon-outline" />
                                                    </div>
                                                )}
                                                {log.event == 'activated' && (
                                                    <div className="transactions-item-icon text-primary">
                                                        <em className="mdi mdi-ticket" />
                                                    </div>
                                                )}
                                                {log.event == 'deactivated' && (
                                                    <div className="transactions-item-icon text-danger">
                                                        <em className="mdi mdi-close-octagon-outline" />
                                                    </div>
                                                )}
                                                <div className="transactions-item-details">
                                                    <div className="transactions-item-counterpart">
                                                        {log.event_locale}
                                                    </div>
                                                    <div className="transactions-item-date">
                                                        {log.created_at_locale}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Voucher transactions */}
                        {!voucherCard.product && (voucherCard.transactionsList.length > 0 || voucher.expired) && (
                            <div className="block block-transactions">
                                <div className="transactions-header">
                                    <h2 className="transactions-title">
                                        {translate('voucher.labels.transactions')}
                                        {voucher.expired && (
                                            <span className="text-strong-half">
                                                {` - Verlopen op ${voucherCard.last_active_day_locale}`}
                                            </span>
                                        )}
                                    </h2>
                                </div>

                                {voucher.expired && voucherCard.transactionsList?.length == 0 && (
                                    <div className="transactions-body">
                                        <div className="transactions-list">
                                            <div className="transactions-item">
                                                <div className="transactions-item-details">
                                                    <div className="transactions-item-empty">Geen uitgaven</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="transactions-body">
                                    <div className="transactions-list">
                                        {voucherCard.transactionsList?.map((transaction) => (
                                            <div
                                                key={transaction.unique_id}
                                                className={`transactions-item ${
                                                    transaction.incoming ? '' : 'transactions-item-out'
                                                }`}>
                                                <div className="transactions-item-icon">
                                                    {transaction.incoming ? (
                                                        <em className="mdi mdi-arrow-down" />
                                                    ) : (
                                                        <em className="mdi mdi-arrow-up" />
                                                    )}
                                                </div>

                                                <div className="transactions-item-details">
                                                    {transaction.type == 'product_voucher' &&
                                                        transaction.product_reservation && (
                                                            <div className="transactions-item-counterpart">
                                                                Reservering{' '}
                                                                <StateNavLink
                                                                    name={'reservation-show'}
                                                                    params={{
                                                                        id: transaction.product_reservation.id,
                                                                    }}>
                                                                    #{transaction.product_reservation.code}
                                                                </StateNavLink>
                                                            </div>
                                                        )}

                                                    {(transaction.type == 'product_voucher' ||
                                                        voucherCard.fund.type != 'budget') &&
                                                        !transaction.product_reservation && (
                                                            <div className="transactions-item-counterpart">
                                                                {transaction.product.name}
                                                            </div>
                                                        )}

                                                    {transaction.type == 'transaction' &&
                                                        transaction.target == 'provider' && (
                                                            <div className="transactions-item-counterpart">
                                                                {transaction.organization.name}
                                                            </div>
                                                        )}

                                                    {transaction.type == 'transaction' &&
                                                        transaction.target == 'iban' && (
                                                            <div className="transactions-item-counterpart">
                                                                Bankoverschrijving
                                                            </div>
                                                        )}

                                                    {transaction.type == 'transaction' &&
                                                        transaction.target == 'top_up' && (
                                                            <div className="transactions-item-counterpart">
                                                                Opgewaardeerd
                                                            </div>
                                                        )}

                                                    <div className="transactions-item-date">
                                                        {transaction.created_at_locale}
                                                    </div>
                                                </div>

                                                {voucherCard.fund.type == 'budget' && (
                                                    <div className="transactions-item-amount">
                                                        <div className="transactions-item-value">
                                                            {(transaction.incoming ? '' : '-') +
                                                                ' ' +
                                                                transaction.amount_locale}
                                                        </div>
                                                        <div className="transactions-item-type">
                                                            {translate(
                                                                transaction.incoming
                                                                    ? 'voucher.labels.add'
                                                                    : 'voucher.labels.subtract',
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Voucher available budget products */}
                        {showProducts && products && voucher.fund.type == 'budget' && (
                            <BlockProducts
                                type="budget"
                                products={products.data}
                                filters={{ fund_id: voucher.fund_id }}
                            />
                        )}

                        {/* Voucher available subsidy products */}
                        {showProducts && subsidies && voucher.fund.type == 'subsidies' && (
                            <BlockProducts
                                type="subsidies"
                                products={subsidies.data}
                                filters={{ fund_id: voucher.fund_id }}
                            />
                        )}

                        {/* Providers map */}
                        {!voucherCard.deactivated &&
                            !voucher?.expired &&
                            appConfigs.show_voucher_map &&
                            !voucherCard.is_external &&
                            (voucherCard.offices.length || !voucherCard.product) && (
                                <div className="block block-map_card">
                                    <div className="map_card-header">
                                        <h2 className="map_card-title">
                                            {translate(
                                                voucherCard.product
                                                    ? 'voucher.labels.office'
                                                    : 'voucher.labels.offices',
                                            )}
                                        </h2>
                                    </div>

                                    <div className="map_card-iframe">
                                        <GoogleMap
                                            appConfigs={appConfigs}
                                            mapPointers={voucherCard.offices}
                                            markerTemplate={(office: Office) => (
                                                <MapMarkerProviderOffice office={office} />
                                            )}
                                            mapGestureHandling={'greedy'}
                                            mapGestureHandlingMobile={'none'}
                                            centerType={'avg'}
                                            fullscreenPosition={window.google.maps.ControlPosition.TOP_RIGHT}
                                        />
                                    </div>

                                    {!voucherCard.product && (
                                        <div className="map_card-footer">
                                            <div className="map_card-subtitle">
                                                <TranslateHtml i18n={'voucher.labels.info'} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        {!voucherCard.deactivated && voucherCard.product && (
                            <div className="block block-pane">
                                <div className="pane-head">
                                    <h2 className="pane-head-title">{translate('voucher.labels.productdetail')}</h2>
                                    {voucherCard.returnable && (
                                        <StateNavLink
                                            name={'product'}
                                            params={{ id: voucher.product.id }}
                                            className="pane-head-more">
                                            Bekijk details
                                            <em className="mdi mdi-arrow-right icon-start" aria-hidden="true" />
                                        </StateNavLink>
                                    )}
                                </div>
                                <div className="pane-section">
                                    <Markdown content={voucherCard.description} />
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </BlockShowcase>
    );
}
