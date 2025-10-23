import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import Voucher from '../../../../dashboard/props/models/Voucher';
import { useVoucherService } from '../../../services/VoucherService';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { useParams } from 'react-router';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import TranslateHtml from '../../../../dashboard/components/elements/translate-html/TranslateHtml';
import useAppConfigs from '../../../hooks/useAppConfigs';
import { GoogleMap } from '../../../../dashboard/components/elements/google-map/GoogleMap';
import MapMarkerProviderOffice from '../../elements/map-markers/MapMarkerProviderOffice';
import Office from '../../../../dashboard/props/models/Office';
import Markdown from '../../elements/markdown/Markdown';
import useSetTitle from '../../../hooks/useSetTitle';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import Section from '../../elements/sections/Section';
import VoucherPhysicalCards from './cards/VoucherPhysicalCards';
import useVoucherData from '../../../services/helpers/useVoucherData';
import VoucherTransactionsCard from './cards/VoucherTransactionsCard';
import VoucherHistoryCard from './cards/VoucherHistoryCard';
import VoucherReimbursementCard from './cards/VoucherReimbursementCard';
import VoucherRecordsCard from './cards/VoucherRecordsCard';
import VoucherDetailsInternalCard from './cards/VoucherDetailsInternalCard';
import VoucherDetailsExternalCard from './cards/VoucherDetailsExternalCard';
import VoucherProductsCard from './cards/VoucherProductsCard';

export default function VouchersShow() {
    const { number } = useParams();
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();

    const setTitle = useSetTitle();
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const voucherService = useVoucherService();

    const [voucher, setVoucher] = useState<Voucher>(null);

    const voucherCard = useVoucherData(voucher);

    const breadCrumbName = useMemo(() => {
        if (voucher?.physical_card) {
            return translate('voucher.breadcrumbs.voucher_physical', {
                title: `${voucherCard?.title} #${voucher?.physical_card.code_locale}`,
            });
        }

        return voucher ? translate('voucher.breadcrumbs.voucher', { title: `#${voucherCard?.number}` }) : null;
    }, [translate, voucher, voucherCard?.number, voucherCard?.title]);

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
            breadcrumbItems={[
                { name: translate('voucher.breadcrumbs.home'), state: 'home' },
                { name: translate('voucher.breadcrumbs.vouchers'), state: 'vouchers' },
                voucher ? { name: breadCrumbName } : null,
            ]}>
            {voucher && voucherCard && (
                <div className="page page-voucher">
                    <Section type={'voucher_details'}>
                        {/* Internal vouchers */}
                        {!voucherCard.deactivated && !voucher?.expired && !voucherCard.external && (
                            <VoucherDetailsInternalCard
                                voucher={voucher}
                                setVoucher={setVoucher}
                                fetchVoucher={fetchVoucher}
                            />
                        )}

                        {/* External vouchers */}
                        {!voucherCard.deactivated && !voucher?.expired && !!voucherCard.external && (
                            <VoucherDetailsExternalCard voucher={voucher} />
                        )}

                        {/* Voucher records */}
                        <VoucherRecordsCard voucher={voucher} />

                        {/* Physical cards */}
                        <VoucherPhysicalCards voucher={voucher} setVoucher={setVoucher} fetchVoucher={fetchVoucher} />

                        {/* Make reimbursement request card */}
                        <VoucherReimbursementCard voucher={voucher} />

                        {/* Voucher history */}
                        <VoucherHistoryCard voucher={voucher} />

                        {/* Voucher transactions */}
                        <VoucherTransactionsCard voucher={voucher} />
                    </Section>

                    {/* Voucher available budget products */}
                    <VoucherProductsCard voucher={voucher} />

                    <Section type={'map'}>
                        {/* Providers map */}
                        {!voucherCard.deactivated &&
                            !voucher?.expired &&
                            appConfigs.show_voucher_map &&
                            !voucherCard.external &&
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
                    </Section>
                </div>
            )}
        </BlockShowcase>
    );
}
