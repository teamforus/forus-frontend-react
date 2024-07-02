import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFundService } from '../../../services/FundService';
import { useParams } from 'react-router-dom';
import Fund from '../../../props/models/Fund';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useEnvData from '../../../hooks/useEnvData';
import { useRecordTypeService } from '../../../../dashboard/services/RecordTypeService';
import useAppConfigs from '../../../hooks/useAppConfigs';
import { useVoucherService } from '../../../services/VoucherService';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import Voucher from '../../../../dashboard/props/models/Voucher';
import IconFundRequest from '../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-fund-request.svg';
import { useNavigateState, useStateParams } from '../../../modules/state_router/Router';
import useShowTakenByPartnerModal from '../../../services/helpers/useShowTakenByPartnerModal';
import FundsListItemModel from '../../../services/types/FundsListItemModel';
import BlockProducts from '../../elements/block-products/BlockProducts';
import Product from '../../../props/models/Product';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import { useProductService } from '../../../services/ProductService';
import Markdown from '../../elements/markdown/Markdown';
import BlockCard2FAWarning from '../../elements/block-card-2fa-warning/BlockCard2FAWarning';
import useSetTitle from '../../../hooks/useSetTitle';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import BlockLoader from '../../elements/block-loader/BlockLoader';
import BlockLoaderBreadcrumbs from '../../elements/block-loader/BlockLoaderBreadcrumbs';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';

export default function FundsShow() {
    const { id } = useParams();

    const envData = useEnvData();
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();

    const setTitle = useSetTitle();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const showTakenByPartnerModal = useShowTakenByPartnerModal();

    const fundService = useFundService();
    const voucherService = useVoucherService();
    const productService = useProductService();
    const recordTypesService = useRecordTypeService();

    const [fund, setFund] = useState<FundsListItemModel>(null);
    const [visibleFaq, setVisibleFaq] = useState({});
    const [products, setProducts] = useState<PaginationData<Product>>(null);
    const [subsidies, setSubsidies] = useState<PaginationData<Product>>(null);
    const [vouchers, setVouchers] = useState<Array<Voucher>>(null);

    const { searchParams } = useStateParams();

    const recordsByTypesKey = useMemo(async () => {
        return recordTypesService.list().then((res) => {
            return res.data.reduce((list, type) => ({ ...list, [type.key]: type }), {});
        });
    }, [recordTypesService]);

    const formulaList = useMemo(() => {
        if (!fund || !recordsByTypesKey) {
            return null;
        }

        return {
            fixed: fund.formulas.filter((formula) => formula.type == 'fixed'),
            multiply: fund.formulas
                .filter((formula) => formula.type == 'multiply')
                .map((multiply) => ({
                    ...multiply,
                    label: (recordsByTypesKey[multiply.record_type_key] || { name: multiply.record_type_key }).name,
                })),
        };
    }, [fund, recordsByTypesKey]);

    const fetchFund = useCallback(() => {
        if (!vouchers) {
            return null;
        }

        setProgress(0);

        fundService
            .read(parseInt(id), { check_criteria: 1 })
            .then((res) => setFund(fundService.mapFund(res.data.data, vouchers || [], appConfigs)))
            .finally(() => setProgress(100));
    }, [appConfigs, fundService, id, vouchers, setProgress]);

    const fetchVouchers = useCallback(() => {
        setProgress(0);

        voucherService
            .list({ implementation: 1, is_employee: 0 })
            .then((res) => setVouchers(res.data.data))
            .finally(() => setProgress(100));
    }, [voucherService, setProgress]);

    const fetchProducts = useCallback(() => {
        setProgress(0);

        if (fund?.type === 'budget') {
            productService
                .list({ fund_type: 'budget', sample: 1, per_page: 6, fund_id: fund?.id })
                .then((res) => setProducts(res.data))
                .finally(() => setProgress(100));
        }

        if (fund?.type === 'subsidies') {
            productService
                .list({ fund_type: 'subsidies', sample: 1, per_page: 6, fund_id: fund?.id })
                .then((res) => setSubsidies(res.data))
                .finally(() => setProgress(100));
        }
    }, [fund?.id, fund?.type, productService, setProgress]);

    const applyFund = useCallback(
        (e: React.MouseEvent, fund: Fund) => {
            e.preventDefault();

            if (fund.taken_by_partner) {
                return showTakenByPartnerModal();
            }

            navigateState('fund-activate', { id: fund.id });
        },
        [navigateState, showTakenByPartnerModal],
    );

    useEffect(() => {
        fetchFund();
    }, [fetchFund]);

    useEffect(() => {
        authIdentity ? fetchVouchers() : setVouchers([]);
    }, [authIdentity, fetchVouchers]);

    useEffect(() => {
        if (fund) {
            fetchProducts();
        }
    }, [fund, fetchProducts]);

    useEffect(() => {
        if (fund && fund.id !== parseInt(id)) {
            setFund(null);
        }
    }, [fund, id]);

    useEffect(() => {
        if (fund) {
            setTitle(
                translate(
                    `custom_page_state_titles.${envData?.client_key}.fund`,
                    {
                        fund_name: fund?.name || '',
                        organization_name: fund?.organization?.name || '',
                    },
                    'page_state_titles.fund',
                ),
            );
        }
    }, [envData, fund, fund?.name, fund?.organization?.name, setTitle, translate]);

    return (
        <BlockShowcase
            breadcrumbs={<></>}
            wrapper={true}
            loaderElement={
                <section className="section section-fund">
                    <div className="wrapper">
                        <BlockLoaderBreadcrumbs />
                        <BlockLoader />
                    </div>
                </section>
            }>
            {fund && (
                <section className="section section-fund">
                    <div className="wrapper">
                        <div className="block block-breadcrumbs">
                            {searchParams && (
                                <StateNavLink
                                    name="search-result"
                                    params={searchParams || null}
                                    className="breadcrumb-item breadcrumb-item-back">
                                    <em className="mdi mdi-chevron-left" />
                                    Terug
                                </StateNavLink>
                            )}
                            <StateNavLink name={'home'} className="breadcrumb-item">
                                Home
                            </StateNavLink>
                            <StateNavLink name={'funds'} className="breadcrumb-item" activeExact={true}>
                                {translate(`funds.funds.${envData.client_key}.title`, {}, 'funds.header.title')}
                            </StateNavLink>
                            <a className="breadcrumb-item active" aria-current="location">
                                {fund?.name}
                            </a>
                        </div>
                        <div className="block block-fund">
                            <div className="fund-content">
                                <div className="fund-card">
                                    <div className="fund-details">
                                        <h1 className="fund-name">{fund?.name}</h1>

                                        {fund?.description_short && (
                                            <div className="fund-description">
                                                <div className="block block-markdown">
                                                    <p>{fund.description_short}</p>
                                                </div>
                                            </div>
                                        )}

                                        {!fund.hide_meta && (
                                            <div className="fund-details-items">
                                                <div className="fund-details-item">
                                                    <div className="fund-details-item-label">Uitgifte door:</div>
                                                    <div className="fund-details-item-value">
                                                        {fund.organization?.name}
                                                    </div>
                                                </div>
                                                {fund.type == 'budget' &&
                                                    formulaList.multiply?.map((formula, index) => (
                                                        <div key={index} className="fund-details-item">
                                                            <div className="fund-details-item-label">
                                                                {translate('fund.criterias.multiplied_amount')}
                                                            </div>
                                                            <div className="fund-details-item-value">
                                                                {formula.amount_locale}
                                                            </div>
                                                        </div>
                                                    ))}
                                                {fund.key != 'IIT' && (
                                                    <div className="fund-details-item">
                                                        <div className="fund-details-item-label">Startdatum:</div>
                                                        <div className="fund-details-item-value">
                                                            {fund.start_date_locale}
                                                        </div>
                                                    </div>
                                                )}
                                                {fund.key != 'IIT' && (
                                                    <div className="fund-details-item">
                                                        <div className="fund-details-item-label">Einddatum:</div>
                                                        <div className="fund-details-item-value">
                                                            {fund.end_date_locale}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="fund-actions">
                                    <div className="button-group">
                                        {fund.external_link_text && fund.external_link_url && (
                                            <a
                                                className={`button button ${
                                                    fund.linkPrimaryButton ? 'button-primary' : 'button-primary-outline'
                                                }`}
                                                target="_blank"
                                                href={fund.external_link_url}
                                                rel="noreferrer">
                                                {fund.external_link_text}
                                                <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                            </a>
                                        )}

                                        {fund.showRequestButton && (
                                            <StateNavLink
                                                name={'fund-activate'}
                                                params={{ id: fund.id }}
                                                className="button button-primary">
                                                {fund.request_btn_text}
                                                <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                            </StateNavLink>
                                        )}

                                        {fund.showActivateButton && (
                                            <a
                                                className="button button-primary"
                                                type="button"
                                                onClick={(e) => applyFund(e, fund)}>
                                                {translate('funds.buttons.is_applicable')}
                                                <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                            </a>
                                        )}

                                        {fund.alreadyReceived && (
                                            <StateNavLink
                                                name={'voucher'}
                                                params={{ address: fund.vouchers[0]?.address }}
                                                className="button button-primary">
                                                {translate(
                                                    `funds.buttons.${fund.key}.already_received`,
                                                    {},
                                                    'funds.buttons.already_received',
                                                )}
                                                <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                            </StateNavLink>
                                        )}
                                    </div>
                                </div>

                                {fund.showPendingButton && (
                                    <div className="block block-action-card block-action-card-compact">
                                        <div className="block-card-logo">
                                            <IconFundRequest />
                                        </div>
                                        <div className="block-card-details">
                                            <h3 className="block-card-title">
                                                We zijn uw aanvraag aan het controleren
                                            </h3>
                                        </div>
                                        <div className="block-card-actions">
                                            <StateNavLink
                                                name={'fund-requests'}
                                                params={{ id: fund.id }}
                                                className="button button-primary">
                                                {translate('funds.buttons.check_status')}
                                                <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                            </StateNavLink>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div
                            className={`flex flex-vertical ${
                                fund.description_position == 'before' ? 'flex-vertical-reverse' : ''
                            }`}>
                            {authIdentity && fund && <BlockCard2FAWarning fund={fund} />}

                            {products && (!fund.description_html || fund.description_position !== 'replace') && (
                                <BlockProducts
                                    type={'budget'}
                                    display={'grid'}
                                    large={false}
                                    products={products.data}
                                    filters={{ fund_id: fund.id }}
                                />
                            )}

                            {subsidies && (!fund.description_html || fund.description_position !== 'replace') && (
                                <BlockProducts
                                    type={'subsidies'}
                                    display={'grid'}
                                    large={false}
                                    products={subsidies.data}
                                    filters={{ fund_id: fund.id }}
                                />
                            )}

                            <div>
                                {fund.description_html && <Markdown content={fund.description_html} />}

                                {fund.faq && (
                                    <section className="section section-faq">
                                        <div className="section-splash" />
                                        {fund.faq_title && <h2 className="section-title">{fund.faq_title}</h2>}
                                        <div className="faq faq-fund">
                                            {fund.faq.map((question, index) => (
                                                <div
                                                    key={index}
                                                    className={`faq-item ${visibleFaq?.[question.id] ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setVisibleFaq((list) => ({
                                                            ...list,
                                                            [question.id]: !list?.[question.id],
                                                        }));
                                                    }}
                                                    role="button"
                                                    aria-expanded={!!visibleFaq?.[question.id]}
                                                    aria-controls={`faq_item_${question.id}`}>
                                                    <div className="faq-item-header">
                                                        <h2 className="faq-item-title" role="button" tabIndex={0}>
                                                            {question.title}
                                                        </h2>
                                                        <em className="faq-item-chevron-down mdi mdi-chevron-down" />
                                                        <em className="faq-item-chevron-up mdi mdi-chevron-up" />
                                                    </div>
                                                    <div className="faq-item-content" id={`faq_item_${question.id}`}>
                                                        <Markdown content={question.description_html} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </BlockShowcase>
    );
}
