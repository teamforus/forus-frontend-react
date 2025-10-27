import React, { Fragment, useCallback, useEffect, useState } from 'react';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useFilter from '../../../../dashboard/hooks/useFilter';
import IconReimbursement from '../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-reimbursement.svg';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import { useNavigateState } from '../../../modules/state_router/Router';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import Voucher from '../../../../dashboard/props/models/Voucher';
import { useVoucherService } from '../../../services/VoucherService';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import VoucherCard from './elements/VoucherCard';
import useEnvData from '../../../hooks/useEnvData';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function Vouchers() {
    const envData = useEnvData();

    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const voucherService = useVoucherService();

    const [vouchers, setVouchers] = useState<PaginationData<Voucher>>(null);
    const [reimbursementVouchers, setReimbursementVouchers] = useState<PaginationData<Voucher>>(null);

    const filter = useFilter<{
        archived: 0 | 1;
    }>({
        per_page: 15,
        archived: 0,
        order_by: 'voucher_type',
        order_dir: 'desc',
    });

    const fetchVouchers = useCallback(() => {
        setProgress(0);

        voucherService
            .list(filter.activeValues)
            .then((res) => setVouchers(res.data))
            .finally(() => setProgress(100));
    }, [filter.activeValues, setProgress, voucherService]);

    const fetchReimbursementVouchers = useCallback(() => {
        setProgress(0);

        voucherService
            .list({
                archived: 0,
                per_page: 1,
                implementation_key: envData.client_key,
                allow_reimbursements: 1,
            })
            .then((res) => setReimbursementVouchers(res.data))
            .finally(() => setProgress(100));
    }, [envData.client_key, setProgress, voucherService]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    useEffect(() => {
        fetchReimbursementVouchers();
    }, [fetchReimbursementVouchers]);

    return (
        <BlockShowcaseProfile
            contentDusk="listVouchersContent"
            breadcrumbItems={[
                { name: translate('vouchers.breadcrumbs.home'), state: WebshopRoutes.HOME },
                { name: translate('vouchers.breadcrumbs.vouchers') },
            ]}
            profileHeader={
                vouchers && (
                    <div className="profile-content-header clearfix">
                        <div className="profile-content-title">
                            <div className="pull-left">
                                <div className="profile-content-title-count">{vouchers.meta.total}</div>
                                <h1 className="profile-content-header">{translate('vouchers.title')}</h1>
                            </div>
                        </div>
                        <div className="block block-label-tabs form pull-right">
                            <div className="label-tab-set">
                                <div
                                    className={`label-tab label-tab-sm ${filter.values.archived ? '' : 'active'}`}
                                    onClick={() => filter.update({ archived: 0 })}
                                    onKeyDown={clickOnKeyEnter}
                                    tabIndex={0}
                                    aria-pressed={!filter.values.archived}
                                    data-dusk="vouchersFilterActive"
                                    role="button">
                                    {translate('vouchers.filters.active')}
                                </div>
                                <div
                                    className={`label-tab label-tab-sm ${filter.values.archived ? 'active' : ''}`}
                                    onClick={() => filter.update({ archived: 1 })}
                                    onKeyDown={clickOnKeyEnter}
                                    tabIndex={0}
                                    aria-pressed={!!filter.values.archived}
                                    data-dusk="vouchersFilterArchived"
                                    role="button">
                                    {translate('vouchers.filters.archive')}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }>
            {vouchers && (
                <Fragment>
                    {vouchers.data.length > 0 && (
                        <div className="block block-vouchers" data-dusk="vouchersList">
                            {vouchers.data.map((voucher) => (
                                <VoucherCard
                                    key={voucher.id}
                                    voucher={voucher}
                                    onVoucherDestroyed={() => fetchVouchers()}
                                />
                            ))}

                            <div className="card" hidden={vouchers?.meta?.last_page < 2}>
                                <div className="card-section">
                                    <Paginator
                                        meta={vouchers.meta}
                                        filters={filter.values}
                                        updateFilters={filter.update}
                                    />
                                </div>
                            </div>

                            {vouchers.data.length > 0 && reimbursementVouchers?.meta.total > 0 && (
                                <div className="block block-action-card block-action-card-compact">
                                    <div className="block-card-logo">
                                        <IconReimbursement />
                                    </div>
                                    <div className="block-card-details">
                                        <h2 className="block-card-title">
                                            {translate('vouchers.reimbursement.title')}
                                        </h2>
                                    </div>
                                    <div className="block-card-actions">
                                        <StateNavLink name={WebshopRoutes.REIMBURSEMENT_CREATE}>
                                            <div className="button button-primary-outline">
                                                {translate('vouchers.reimbursement.button')}
                                            </div>
                                        </StateNavLink>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {vouchers.data.length == 0 && (
                        <EmptyBlock
                            svgIcon="reimbursements"
                            title={translate('vouchers.empty.title')}
                            description={translate('vouchers.empty.subtitle')}
                            hideLink={true}
                            button={{
                                text: translate('vouchers.empty.button'),
                                icon: 'arrow-right',
                                type: 'primary',
                                iconEnd: true,
                                onClick: () => navigateState(WebshopRoutes.START),
                            }}
                        />
                    )}
                </Fragment>
            )}
        </BlockShowcaseProfile>
    );
}
