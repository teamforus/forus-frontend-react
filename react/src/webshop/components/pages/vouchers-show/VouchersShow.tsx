import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import Voucher from '../../../../dashboard/props/models/Voucher';
import { useVoucherService } from '../../../services/VoucherService';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { useParams } from 'react-router';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import useAssetUrl from '../../../hooks/useAssetUrl';
import useSetTitle from '../../../hooks/useSetTitle';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import Section from '../../elements/sections/Section';
import PaneGroup from '../../elements/block-panel-group/PaneGroup';
import PaneGroupPanel from '../../elements/block-panel-group/PaneGroupPanel';
import Markdown from '../../elements/markdown/Markdown';
import VoucherProducts from './elements/VoucherProducts';
import VoucherTransactionsCard from './elements/VoucherTransactionsCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import VoucherPhysicalCards from './cards/VoucherPhysicalCards';
import VoucherActions from './elements/VoucherActions';
import useVoucherCard from './hooks/useVoucherCard';
import VoucherHistoryCard from './elements/VoucherHistoryCard';
import { GoogleMap } from '../../../../dashboard/components/elements/google-map/GoogleMap';
import Office from '../../../../dashboard/props/models/Office';
import MapMarkerProviderOffice from '../../elements/map-markers/MapMarkerProviderOffice';
import useAppConfigs from '../../../hooks/useAppConfigs';
import classNames from 'classnames';

export default function VouchersShow() {
    const { number } = useParams();
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();

    const assetUrl = useAssetUrl();
    const setTitle = useSetTitle();
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const voucherService = useVoucherService();

    const [voucher, setVoucher] = useState<Voucher>(null);

    const voucherCard = useVoucherCard(voucher);

    const showHistory = useMemo(
        () => voucher?.history.filter((history) => !history.event.startsWith('created_')).length > 0,
        [voucher?.history],
    );

    const showTransactions = useMemo(() => {
        return !voucher?.external && !voucherCard?.product && voucherCard?.transactionsList?.length > 0;
    }, [voucher?.external, voucherCard?.product, voucherCard?.transactionsList?.length]);

    const showPhysicalCardTypes = useMemo(() => {
        return (
            !voucher?.product &&
            !voucher?.expired &&
            !voucher?.external &&
            !voucher?.deactivated &&
            (voucher?.physical_card || voucher?.fund?.fund_physical_card_types?.length > 0)
        );
    }, [
        voucher?.product,
        voucher?.expired,
        voucher?.external,
        voucher?.deactivated,
        voucher?.physical_card,
        voucher?.fund?.fund_physical_card_types?.length,
    ]);

    const showHowItWorks = useMemo(() => {
        return !voucher?.deactivated && voucher?.fund?.how_it_works_html;
    }, [voucher?.deactivated, voucher?.fund?.how_it_works_html]);

    const showFundDetails = useMemo(() => {
        return !voucher?.deactivated && voucher?.fund?.description_short;
    }, [voucher?.deactivated, voucher?.fund?.description_short]);

    const showProductMap = useMemo(() => {
        return (
            !voucherCard?.expired &&
            !voucherCard?.external &&
            !voucherCard?.deactivated &&
            (!voucherCard?.product || voucherCard?.offices.length) &&
            appConfigs?.show_voucher_map
        );
    }, [
        voucherCard?.expired,
        voucherCard?.external,
        voucherCard?.deactivated,
        voucherCard?.product,
        voucherCard?.offices.length,
        appConfigs?.show_voucher_map,
    ]);

    const fetchVoucher = useCallback(() => {
        setProgress(0);

        voucherService
            .get(number)
            .then((res) => setVoucher(res.data.data))
            .finally(() => setProgress(100));
    }, [number, setProgress, voucherService]);

    useEffect(() => {
        if (authIdentity) {
            fetchVoucher();
        }
    }, [fetchVoucher, authIdentity]);

    useEffect(() => {
        if (voucher?.fund) {
            setTitle(translate('page_state_titles.voucher', { fund_name: voucher.fund.name }));
        }
    }, [setTitle, translate, voucher?.fund]);

    return (
        <BlockShowcase
            narrow={true}
            breadcrumbItems={[
                { name: translate('voucher.breadcrumbs.home'), state: 'home' },
                { name: translate('voucher.breadcrumbs.vouchers'), state: 'vouchers' },
                voucher && voucher?.physical_card
                    ? {
                          name: voucher?.physical_card
                              ? translate('voucher.breadcrumbs.voucher_physical', {
                                    title: `${voucherCard?.title} #${voucher?.physical_card.code}`,
                                })
                              : translate('voucher.breadcrumbs.voucher', { title: `#${voucherCard?.number}` }),
                      }
                    : null,
            ]}>
            {voucher && voucherCard && (
                <Fragment>
                    <Section type={'voucher_details'}>
                        <div className="block block-voucher">
                            {!voucherCard.deactivated && !voucherCard.expired && (
                                <Fragment>
                                    <div className="voucher-fund-overview">
                                        <div className="voucher-fund-overview-media">
                                            <img
                                                src={
                                                    voucher?.fund?.logo?.sizes?.thumbnail ??
                                                    assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                                                }
                                                alt={
                                                    voucher?.fund?.name
                                                        ? translate('voucher.fund.logo_alt_named', {
                                                              name: voucher.fund.name,
                                                          })
                                                        : translate('voucher.fund.logo_alt')
                                                }
                                            />
                                        </div>
                                        <div className="voucher-fund-overview-content">
                                            <div className="voucher-fund-overview-title">{voucher?.fund?.name}</div>
                                            <div className="voucher-fund-overview-description">
                                                {translate('voucher.overview.description')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="voucher-cards">
                                        <div className="voucher-details">
                                            <div className="voucher-details-info">
                                                {voucher?.product && (
                                                    <div
                                                        className={classNames(
                                                            'label',
                                                            voucher?.used ? 'label-default' : 'label-success',
                                                        )}>
                                                        {voucher?.used ? 'Gebruikt' : 'Ongebruikt'}
                                                    </div>
                                                )}
                                                <div className="voucher-details-info-fund" data-dusk="voucherTitle">
                                                    {voucherCard.title}
                                                </div>
                                                <div className="voucher-details-info-sponsor">
                                                    {voucher?.product
                                                        ? voucher?.product?.organization?.name
                                                        : voucher?.fund?.name}
                                                </div>
                                                <div className="voucher-details-info-date">
                                                    {translate('voucher.details.valid_until', {
                                                        date: voucherCard?.expire_at_locale,
                                                    })}
                                                </div>
                                                {!voucher?.product && (
                                                    <div className="voucher-details-info-amount">
                                                        {voucherCard?.amount_locale}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="voucher-details-records">
                                                <div className="voucher-details-records-title">
                                                    {translate('voucher.details.records.title')}
                                                </div>
                                                <div className="voucher-details-records-list">
                                                    <div className="voucher-details-records-item">
                                                        <div className="voucher-details-records-item-label">
                                                            {translate('voucher.details.records.number')}
                                                        </div>
                                                        <div className="voucher-details-records-item-value">
                                                            {`#${voucher?.number}`}
                                                        </div>
                                                    </div>

                                                    <div className="voucher-details-records-item">
                                                        <div className="voucher-details-records-item-label">
                                                            {translate('voucher.details.records.email')}
                                                        </div>
                                                        <div className="voucher-details-records-item-value">
                                                            {authIdentity?.email}
                                                        </div>
                                                    </div>

                                                    {voucherCard?.records?.map((record, index) => (
                                                        <div className="voucher-details-records-item" key={index}>
                                                            <div className="voucher-details-records-item-label">
                                                                {record.record_type_name}:
                                                            </div>
                                                            <div className="voucher-details-records-item-value">
                                                                {record.value_locale}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <VoucherActions
                                            voucher={voucher}
                                            setVoucher={setVoucher}
                                            fetchVoucher={fetchVoucher}
                                        />
                                    </div>
                                </Fragment>
                            )}

                            <PaneGroup>
                                {showHistory && (
                                    <PaneGroupPanel title={translate('voucher.history.title')}>
                                        <VoucherHistoryCard voucher={voucher} />
                                    </PaneGroupPanel>
                                )}

                                {showTransactions && (
                                    <PaneGroupPanel title={translate('voucher.transactions.title')}>
                                        <VoucherTransactionsCard voucher={voucher} />
                                    </PaneGroupPanel>
                                )}

                                {showPhysicalCardTypes && (
                                    <PaneGroupPanel title={translate('voucher.physical_cards.title')}>
                                        <VoucherPhysicalCards
                                            voucher={voucher}
                                            setVoucher={setVoucher}
                                            fetchVoucher={fetchVoucher}
                                        />
                                    </PaneGroupPanel>
                                )}

                                {showHowItWorks && (
                                    <PaneGroupPanel title={translate('voucher.how_it_works.title')}>
                                        <Markdown content={voucher.fund.how_it_works_html} />
                                    </PaneGroupPanel>
                                )}

                                {showFundDetails && (
                                    <PaneGroupPanel
                                        title={translate('voucher.fund_details.title')}
                                        openByDefault={false}>
                                        <div className="block block-markdown">
                                            <h4 className={'text-strong'}>{voucher?.fund?.name}</h4>
                                            <p>{voucher?.fund?.description_short}</p>
                                        </div>

                                        <div>
                                            <StateNavLink
                                                name={'fund'}
                                                params={{ id: voucher?.fund_id }}
                                                className="button button-primary button-sm">
                                                {translate('voucher.fund_details.view')}
                                                <em className="mdi mdi-arrow-right icon-right" />
                                            </StateNavLink>
                                        </div>
                                    </PaneGroupPanel>
                                )}

                                <PaneGroupPanel title={translate('voucher.help.title')} openByDefault={false}>
                                    <div className="voucher-help">
                                        <div className="voucher-help-title">
                                            {translate('voucher.help.description')}
                                        </div>

                                        <div className="voucher-help-props">
                                            <div className="voucher-help-prop">
                                                <div className="voucher-help-prop-label">
                                                    {translate('voucher.help.email')}
                                                </div>
                                                <div className="voucher-help-prop-value voucher-help-prop-value-link">
                                                    {voucherCard.fund.organization.email}
                                                </div>
                                            </div>

                                            <div className="voucher-help-prop">
                                                <div className="voucher-help-prop-label">
                                                    {translate('voucher.help.phone')}
                                                </div>
                                                <div className="voucher-help-prop-value">
                                                    {voucherCard.fund.organization.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </PaneGroupPanel>

                                {showProductMap && (
                                    <PaneGroupPanel
                                        title={translate(
                                            voucherCard.product ? 'voucher.labels.office' : 'voucher.labels.offices',
                                        )}
                                        openByDefault={false}>
                                        <div className="voucher-map-container">
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
                                    </PaneGroupPanel>
                                )}
                            </PaneGroup>
                        </div>
                    </Section>

                    <VoucherProducts voucher={voucher} />
                </Fragment>
            )}
        </BlockShowcase>
    );
}
