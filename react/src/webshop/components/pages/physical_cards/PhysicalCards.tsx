import React, { Fragment, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import { useNavigateState } from '../../../modules/state_router/Router';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import VoucherCard from '../vouchers/elements/VoucherCard';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import { usePhysicalCardsService } from '../../../services/PhysicalCardsService';
import PhysicalCard from '../../../../dashboard/props/models/PhysicalCard';
import useAppConfigs from '../../../hooks/useAppConfigs';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';
import useFilterNext from '../../../../dashboard/modules/filter_next/useFilterNext';
import { BooleanParam, NumberParam, StringParam } from 'use-query-params';

export default function PhysicalCards() {
    const appConfigs = useAppConfigs();

    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const physicalCardService = usePhysicalCardsService();

    const [physicalCards, setPhysicalCards] = useState<PaginationData<PhysicalCard>>(null);

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        page: number;
        per_page: number;
        archived: 0 | 1;
        order_by?: string;
        order_dir?: string;
    }>(
        {
            page: 1,
            per_page: 15,
            archived: 0,
            order_by: 'voucher_type',
            order_dir: 'desc',
        },
        {
            queryParams: {
                page: NumberParam,
                archived: BooleanParam,
                per_page: NumberParam,
                order_by: StringParam,
                order_dir: StringParam,
            },
        },
    );

    const fetchPhysicalCards = useCallback(() => {
        setProgress(0);

        physicalCardService
            .index({ ...filterValuesActive, archived: filterValuesActive?.archived ? 1 : 0 })
            .then((res) => setPhysicalCards(res.data))
            .finally(() => setProgress(100));
    }, [filterValuesActive, setProgress, physicalCardService]);

    useEffect(() => {
        fetchPhysicalCards();
    }, [fetchPhysicalCards]);

    useEffect(() => {
        if (!appConfigs.has_physical_cards) {
            return navigateState(WebshopRoutes.HOME);
        }
    }, [appConfigs.has_physical_cards, navigateState]);

    if (!appConfigs.has_physical_cards) {
        return null;
    }

    return (
        <BlockShowcaseProfile
            contentDusk="listPhysicalCardsContent"
            breadcrumbItems={[
                { name: translate('physical_cards.breadcrumbs.home'), state: WebshopRoutes.HOME },
                { name: translate('physical_cards.breadcrumbs.vouchers') },
            ]}
            profileHeader={
                physicalCards && (
                    <div className="profile-content-header clearfix">
                        <div className="profile-content-title">
                            <div className="pull-left">
                                <div className="profile-content-title-count">{physicalCards.meta.total}</div>
                                <h1 className="profile-content-header">{translate('physical_cards.title')}</h1>
                            </div>
                        </div>
                        <div className="block block-label-tabs form pull-right">
                            <div className="label-tab-set">
                                <div
                                    className={classNames(
                                        'label-tab',
                                        'label-tab-sm',
                                        !filterValues.archived && 'active',
                                    )}
                                    onClick={() => filterUpdate({ archived: 0 })}
                                    onKeyDown={clickOnKeyEnter}
                                    tabIndex={0}
                                    aria-pressed={!filterValues.archived}
                                    data-dusk="physicalCardsFilterActive"
                                    role="button">
                                    {translate('physical_cards.filters.active')}
                                </div>
                                <div
                                    className={classNames(
                                        'label-tab',
                                        'label-tab-sm',
                                        filterValues.archived && 'active',
                                    )}
                                    onClick={() => filterUpdate({ archived: 1 })}
                                    onKeyDown={clickOnKeyEnter}
                                    tabIndex={0}
                                    aria-pressed={!!filterValues.archived}
                                    data-dusk="physicalCardsFilterArchived"
                                    role="button">
                                    {translate('physical_cards.filters.archive')}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }>
            {physicalCards && (
                <Fragment>
                    {physicalCards.data.length > 0 && (
                        <div className="block block-vouchers" data-dusk="vouchersList">
                            {physicalCards.data.map((physicalCard) => (
                                <VoucherCard
                                    type={'physical_card'}
                                    key={physicalCard.id}
                                    voucher={physicalCard.voucher}
                                    onVoucherDestroyed={() => fetchPhysicalCards()}
                                />
                            ))}

                            <div className="card" hidden={physicalCards?.meta?.last_page < 2}>
                                <div className="card-section">
                                    <Paginator
                                        meta={physicalCards.meta}
                                        filters={filterValues}
                                        updateFilters={filterUpdate}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {physicalCards.data.length == 0 && (
                        <EmptyBlock
                            svgIcon="reimbursements"
                            title={translate('physical_cards.empty.title')}
                            description={translate('physical_cards.empty.subtitle')}
                            hideLink={true}
                            button={{
                                text: translate('physical_cards.empty.button'),
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
