import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useFundService } from '../../../services/FundService';
import { useParams } from 'react-router';
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
import Markdown from '../../elements/markdown/Markdown';
import BlockCard2FAWarning from '../../elements/block-card-2fa-warning/BlockCard2FAWarning';
import useSetTitle from '../../../hooks/useSetTitle';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import FaqBlock from '../../elements/faq-block/FaqBlock';
import FundProductsBlock from './elements/FundProductsBlock';
import useFundMeta from '../../../hooks/meta/useFundMeta';
import usePayoutTransactionService from '../../../services/PayoutTransactionService';
import PayoutTransaction from '../../../../dashboard/props/models/PayoutTransaction';
import Section from '../../elements/sections/Section';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';
import classNames from 'classnames';

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
    const recordTypesService = useRecordTypeService();
    const payoutTransactionService = usePayoutTransactionService();

    const { showBack } = useStateParams<{ showBack: boolean }>();

    const [fund, setFund] = useState<Fund>(null);
    const [payouts, setPayouts] = useState<Array<PayoutTransaction>>(null);
    const [vouchers, setVouchers] = useState<Array<Voucher>>(null);

    const fundMeta = useFundMeta(fund, payouts || [], vouchers || [], appConfigs);

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
            .then((res) => setFund(res.data.data))
            .finally(() => setProgress(100));
    }, [fundService, id, vouchers, setProgress]);

    const fetchVouchers = useCallback(() => {
        setProgress(0);

        voucherService
            .list({ implementation: 1, is_employee: 0 })
            .then((res) => setVouchers(res.data.data))
            .finally(() => setProgress(100));
    }, [voucherService, setProgress]);

    const fetchPayouts = useCallback(() => {
        setProgress(0);

        payoutTransactionService
            .list()
            .then((res) => setPayouts(res.data.data))
            .finally(() => setProgress(100));
    }, [setProgress, payoutTransactionService]);

    const applyFund = useCallback(
        (e: React.MouseEvent, fund: Fund) => {
            e.preventDefault();

            if (fund.taken_by_partner) {
                return showTakenByPartnerModal();
            }

            navigateState(WebshopRoutes.FUND_ACTIVATE, { id: fund.id });
        },
        [navigateState, showTakenByPartnerModal],
    );

    useEffect(() => {
        fetchFund();
    }, [fetchFund]);

    useEffect(() => {
        if (authIdentity) {
            fetchPayouts();
            fetchVouchers();
        } else {
            setVouchers([]);
            setPayouts([]);
        }
    }, [authIdentity, fetchPayouts, fetchVouchers]);

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
                    { fund_name: fund?.name || '', organization_name: fund?.organization?.name || '' },
                    'page_state_titles.fund',
                ),
            );
        }
    }, [envData, fund, fund?.name, fund?.organization?.name, setTitle, translate]);

    return (
        <BlockShowcase
            breadcrumbItems={
                fund && [
                    showBack && { name: translate('fund.breadcrumbs.back'), back: true },
                    { name: translate('fund.breadcrumbs.home'), state: WebshopRoutes.HOME },
                    {
                        name: translate(`funds.funds.${envData.client_key}.title`, {}, 'funds.header.title'),
                        state: WebshopRoutes.FUNDS,
                    },
                    { name: fund?.name },
                ]
            }>
            {fund && fundMeta && (
                <Section type={'default'}>
                    <div className="block block-fund">
                        <div className="fund-content">
                            <div className="fund-card">
                                <h1 className="fund-name" data-dusk="fundTitle">
                                    {fund?.name}
                                </h1>

                                {fund?.description_short && (
                                    <div className="fund-description">
                                        <div className="block block-markdown block-markdown-large">
                                            <p>{fund.description_short}</p>
                                        </div>
                                    </div>
                                )}

                                {!fund.hide_meta && (
                                    <dl className={'fund-details-items'}>
                                        <dt className="fund-details-item-label">{translate('fund.details.by')}</dt>
                                        <dd className="fund-details-item-value">{fund.organization?.name}</dd>
                                        {formulaList.multiply?.map((formula, index) => (
                                            <Fragment key={index}>
                                                <dt className="fund-details-item-label">
                                                    {translate('fund.criterias.multiplied_amount')}
                                                </dt>
                                                <dd className="fund-details-item-value">{formula.amount_locale}</dd>
                                            </Fragment>
                                        ))}
                                        {fund.key != 'IIT' && (
                                            <Fragment>
                                                <dt className="fund-details-item-label">
                                                    {translate('fund.details.start_date')}
                                                </dt>
                                                <dd className="fund-details-item-value">{fund.start_date_locale}</dd>
                                            </Fragment>
                                        )}
                                        {fund.key != 'IIT' && (
                                            <Fragment>
                                                <dt className="fund-details-item-label">
                                                    {translate('fund.details.end_date')}
                                                </dt>
                                                <dd className="fund-details-item-value">{fund.end_date_locale}</dd>
                                            </Fragment>
                                        )}
                                    </dl>
                                )}
                            </div>

                            <div className="fund-actions">
                                <div className="button-group">
                                    {fund.external_link_text && fund.external_link_url && (
                                        <a
                                            className={classNames(
                                                'button',
                                                fundMeta.linkPrimaryButton
                                                    ? 'button-primary'
                                                    : 'button-primary-outline',
                                            )}
                                            target="_blank"
                                            href={fund.external_link_url}
                                            rel="noreferrer">
                                            {fund.external_link_text}
                                            <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                        </a>
                                    )}

                                    {fundMeta.showRequestButton && (
                                        <StateNavLink
                                            name={WebshopRoutes.FUND_ACTIVATE}
                                            params={{ id: fund.id }}
                                            dataDusk="requestButton"
                                            className="button button-primary">
                                            {fund.request_btn_text}
                                            <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                        </StateNavLink>
                                    )}

                                    {fundMeta.showActivateButton && (
                                        <a
                                            className="button button-primary"
                                            type="button"
                                            data-dusk="activateButton"
                                            onClick={(e) => applyFund(e, fund)}>
                                            {translate('funds.buttons.is_applicable')}
                                            <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                        </a>
                                    )}

                                    {fundMeta && fundMeta.hasVouchers && (
                                        <StateNavLink
                                            name={WebshopRoutes.VOUCHER}
                                            params={{ number: fundMeta.vouchers[0]?.number }}
                                            dataDusk="voucherButton"
                                            className="button button-primary">
                                            {translate(
                                                `funds.buttons.${fund.key}.already_received`,
                                                {},
                                                'funds.buttons.already_received',
                                            )}
                                            <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                        </StateNavLink>
                                    )}

                                    {fundMeta && fundMeta.hasPayouts && (
                                        <StateNavLink
                                            name={WebshopRoutes.PAYOUTS}
                                            className="button button-primary"
                                            dataDusk="payoutsButton">
                                            {translate('funds.buttons.open_payouts')}
                                            <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                        </StateNavLink>
                                    )}
                                </div>
                            </div>

                            {fundMeta.showPendingButton && (
                                <div className="block block-action-card block-action-card-compact">
                                    <div className="block-card-logo">
                                        <IconFundRequest />
                                    </div>
                                    <div className="block-card-details">
                                        <h3 className="block-card-title">{translate('fund.pending_request.title')}</h3>
                                    </div>
                                    <div className="block-card-actions">
                                        <StateNavLink
                                            name={WebshopRoutes.FUND_REQUESTS}
                                            params={{ id: fund.id }}
                                            dataDusk="pendingButton"
                                            className="button button-primary">
                                            {translate('funds.buttons.check_status')}
                                            <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                        </StateNavLink>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Section>
            )}

            {fund && fundMeta && (
                <Fragment>
                    {authIdentity && fund && <BlockCard2FAWarning fund={fund} />}

                    {fund.description_position == 'before' ? (
                        <Fragment>
                            {fund.description_html && (
                                <Section type={'cms'}>
                                    <Markdown content={fund.description_html} className={'block-markdown-large'} />
                                </Section>
                            )}

                            <FaqBlock title={fund?.faq_title} items={fund?.faq} />
                            <FundProductsBlock fund={fund} />
                        </Fragment>
                    ) : (
                        <Fragment>
                            <FundProductsBlock fund={fund} />

                            {fund.description_html && (
                                <Section type={'cms'}>
                                    <Markdown content={fund.description_html} className={'block-markdown-large'} />
                                </Section>
                            )}

                            <FaqBlock title={fund?.faq_title} items={fund?.faq} />
                        </Fragment>
                    )}
                </Fragment>
            )}
        </BlockShowcase>
    );
}
