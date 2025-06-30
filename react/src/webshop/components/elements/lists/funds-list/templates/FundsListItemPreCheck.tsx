import React, { Fragment, useCallback, useMemo, useState } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import { PreCheckCriteria, PreCheckTotalsFund } from '../../../../../services/types/PreCheckTotals';
import { useNavigateState } from '../../../../../modules/state_router/Router';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import { strLimit } from '../../../../../../dashboard/helpers/string';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';

export default function FundsListItemPreCheck({ fund }: { fund?: PreCheckTotalsFund }) {
    const [showMore, setShowMore] = useState(false);
    const [showMoreRequestInfo, setShowMoreRequestInfo] = useState(false);

    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const navigateSate = useNavigateState();

    const [shownKnokOutCriteria, setShownKnokOutCriteria] = useState<Array<number>>([]);

    const getCriteriaValidPercentage = useCallback((criteria: Array<PreCheckCriteria>) => {
        if (criteria.find((criterion) => !criterion.is_valid && criterion.is_knock_out)) {
            return 0;
        }

        const totalImpactPoints = criteria.reduce((total, criterion) => total + criterion.impact_level, 0);

        const validImpactPoints = criteria
            .filter((criterion) => criterion.is_valid)
            .reduce((total, criterion) => total + criterion.impact_level, 0);

        const validPercentage = Math.round((validImpactPoints / totalImpactPoints) * 100);

        return validPercentage < 0 ? 0 : validPercentage > 100 ? 100 : validPercentage;
    }, []);

    const criteriaValidPercentage = useMemo(() => {
        return Math.max(5, getCriteriaValidPercentage(fund.criteria));
    }, [fund.criteria, getCriteriaValidPercentage]);

    const progressStatusTitle = useMemo(() => {
        if (fund.pre_check_note) {
            return translate('list_blocks.funds_list_pre_check.no_indication');
        }

        if (criteriaValidPercentage < 33) return translate('list_blocks.funds_list_pre_check.low_chance');
        if (criteriaValidPercentage < 66) return translate('list_blocks.funds_list_pre_check.medium_chance');

        return translate('list_blocks.funds_list_pre_check.good_chance');
    }, [criteriaValidPercentage, fund.pre_check_note, translate]);

    const positiveAmount = useMemo(() => {
        return parseFloat(fund.amount_for_identity) > 0;
    }, [fund.amount_for_identity]);

    const products = useMemo(() => {
        return typeof fund?.fund_formula_products?.products === 'object'
            ? Object.values(fund?.fund_formula_products?.products)
            : [];
    }, [fund?.fund_formula_products?.products]);

    const applyFund = useCallback(
        function (e) {
            e.preventDefault();

            navigateSate('fund-activate', { id: fund.id });
        },
        [fund, navigateSate],
    );

    return (
        <div
            className={`fund-item ${fund.parent ? 'fund-item-child' : ''} ${
                fund.children.length > 0 ? 'fund-item-parent' : ''
            }`}>
            <div className={`fund-content ${showMoreRequestInfo ? 'fund-content-expanded' : ''}`}>
                <div className="fund-photo">
                    <img
                        src={
                            fund?.logo?.sizes?.thumbnail ||
                            fund?.logo?.sizes?.small ||
                            assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                        }
                        alt={``}
                    />
                </div>
                <div className="fund-details">
                    <h2 className="fund-name">
                        <StateNavLink name={'fund'} params={{ id: fund.id }}>
                            {fund.name}
                        </StateNavLink>
                    </h2>
                    {fund.description_short && (
                        <div className="fund-description">
                            <span id="fund_description_short">
                                {showMore ? fund.description_short : strLimit(fund.description_short, 190)}
                            </span>
                            <br />
                            {!showMore && fund.description_short.length > 190 && (
                                <button
                                    className="button button-text button-xs fund-description-more"
                                    onClick={() => setShowMore(true)}
                                    aria-expanded={showMore && fund.description_short.length > 190}
                                    aria-controls="fund_description_short">
                                    {translate('list_blocks.funds_list_pre_check.show_more')}
                                    <em className="mdi mdi-chevron-down icon-right" />
                                </button>
                            )}

                            {showMore && !fund.pre_check_excluded && fund.description_short.length > 190 && (
                                <button
                                    className="button button-text button-xs fund-description-more"
                                    onClick={() => setShowMore(false)}
                                    aria-expanded={showMore && fund.description_short.length > 190}
                                    aria-controls="fund_description_short">
                                    {translate('list_blocks.funds_list_pre_check.show_less')}
                                    <em className="mdi mdi-chevron-up icon-right" />
                                </button>
                            )}
                        </div>
                    )}

                    {fund.external_link_url && (
                        <a
                            className="button button-primary-outline button-sm"
                            target="_blank"
                            href={fund.external_link_url}
                            rel="noreferrer">
                            {fund.external_link_text || translate('list_blocks.funds_list_pre_check.external_website')}
                            <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                        </a>
                    )}
                </div>

                {fund.children.length > 0 && (
                    <div className="fund-related-funds-block">
                        <div className="fund-related-funds-description">
                            {translate('list_blocks.funds_list_pre_check.apply_related_funds')}
                        </div>

                        {fund.children.map((item) => (
                            <ul key={item.id} className="fund-related-funds-list">
                                <li className="fund-related-funds-list-item">{item.name}</li>
                            </ul>
                        ))}
                    </div>
                )}

                {fund.parent && (
                    <div className="fund-related-funds-block fund-related-funds-block-parent">
                        <div className="fund-related-funds-description">
                            {translate('list_blocks.funds_list_pre_check.apply_parent_fund')}
                        </div>
                        <ul className="fund-related-funds-list">
                            <li className="fund-related-funds-list-item">{fund.parent.name}</li>
                        </ul>
                    </div>
                )}
            </div>

            <div className={`fund-actions ${showMoreRequestInfo ? 'expanded' : ''}`}>
                <div className="fund-request-block">
                    <div className="fund-request-block-progress">
                        <div className="fund-request-block-progress-title">{progressStatusTitle}</div>
                        <div className="fund-request-block-progress-bar">
                            <div
                                className={`fund-request-block-progress-bar-value ${
                                    criteriaValidPercentage <= 49 ? 'fund-request-block-progress-bar-value-low' : ''
                                }`}
                                style={{ width: `${criteriaValidPercentage}%` }}
                            />
                        </div>
                    </div>

                    {!fund.external && !fund.pre_check_note && (
                        <div className="fund-request-block-button">
                            <button
                                className="button button-primary button-sm"
                                type="button"
                                disabled={!fund.allow_direct_requests}
                                onClick={(e) => applyFund(e)}>
                                {fund.allow_direct_requests
                                    ? translate('list_blocks.funds_list_pre_check.activate')
                                    : translate('list_blocks.funds_list_pre_check.not_available')}
                                <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </div>
                <div className="fund-totals-block">
                    {positiveAmount && (
                        <div className="fund-totals-block-amount">
                            <div className="fund-totals-block-amount-description">
                                {translate('list_blocks.funds_list_pre_check.total')}
                            </div>
                            <div className="fund-totals-block-amount-value">{fund.amount_total_locale}</div>
                        </div>
                    )}

                    <div className="fund-totals-block-show-details">
                        <button
                            className="button button-text button-xs"
                            onClick={() => setShowMoreRequestInfo(!showMoreRequestInfo)}
                            aria-expanded={showMoreRequestInfo}
                            aria-controls="fund_request_details">
                            {showMoreRequestInfo ? (
                                <Fragment>
                                    {translate('list_blocks.funds_list_pre_check.hide_explanation')}
                                    <em className="mdi mdi-chevron-up icon-right" />
                                </Fragment>
                            ) : (
                                <Fragment>
                                    {translate('list_blocks.funds_list_pre_check.view_explanation')}
                                    <em className="mdi mdi-chevron-down icon-right" />
                                </Fragment>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {showMoreRequestInfo && fund.pre_check_note && (
                <div className="fund-pre-check-info-block">
                    <div className="fund-pre-check-info-section">
                        <div className="fund-pre-check-info-title">
                            {translate('list_blocks.funds_list_pre_check.explanation')}
                        </div>
                        <div className="fund-pre-check-note-block">{fund.pre_check_note}</div>
                    </div>
                </div>
            )}

            {showMoreRequestInfo && !fund.pre_check_note && (
                <div className="fund-pre-check-info-block">
                    <div className="fund-pre-check-info-section">
                        <div className="fund-pre-check-info-title">
                            {translate('list_blocks.funds_list_pre_check.conditions')}
                        </div>

                        <div className="fund-pre-check-info-list">
                            {fund.criteria?.map((criterion) => (
                                <div
                                    key={criterion.id}
                                    className={`fund-pre-check-info-list-item ${
                                        criterion.is_valid ? 'criteria-valid' : ''
                                    } ${
                                        criterion.is_knock_out && !criterion.is_valid
                                            ? 'criteria-invalid-knock-out'
                                            : ''
                                    }`}>
                                    <div className="fund-pre-check-info-list-item-content">
                                        <div className="fund-pre-check-info-list-item-icon">
                                            {criterion.is_valid ? (
                                                <em className="mdi mdi-check-circle" aria-hidden="true" />
                                            ) : (
                                                <em className="mdi mdi-close-circle" aria-hidden="true" />
                                            )}
                                        </div>

                                        <div className="fund-pre-check-info-list-item-title">
                                            {`${criterion.name} ${criterion.value || '---'}`}
                                        </div>

                                        {criterion.product_count > 0 && (
                                            <div className="fund-pre-check-info-list-item-count">
                                                {`${criterion.product_count + 'x' || '---'}`}
                                            </div>
                                        )}

                                        {criterion.is_knock_out &&
                                            criterion.knock_out_description &&
                                            !criterion.is_valid && (
                                                <div
                                                    className="fund-pre-check-info-list-item-more clickable"
                                                    onClick={() => {
                                                        setShownKnokOutCriteria((shownKnokOutDetails) => {
                                                            if (shownKnokOutDetails.includes(criterion.id)) {
                                                                shownKnokOutDetails.splice(
                                                                    shownKnokOutDetails.indexOf(criterion.id),
                                                                    1,
                                                                );
                                                            } else {
                                                                shownKnokOutDetails.push(criterion.id);
                                                            }

                                                            return [...shownKnokOutDetails];
                                                        });
                                                    }}>
                                                    {translate('list_blocks.funds_list_pre_check.why')}
                                                    <em
                                                        className={`mdi ${
                                                            shownKnokOutCriteria.includes(criterion.id)
                                                                ? 'mdi-chevron-up'
                                                                : 'mdi-chevron-down'
                                                        }`}
                                                    />
                                                </div>
                                            )}
                                    </div>
                                    {shownKnokOutCriteria.includes(criterion.id) && (
                                        <div className="fund-pre-check-info-list-item-description">
                                            {criterion.knock_out_description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {products.length > 0 ? (
                        <div className="fund-pre-check-info-section">
                            <div className="fund-pre-check-info-title">
                                {translate('list_blocks.funds_list_pre_check.product_voucher')}
                            </div>
                            <div className="fund-pre-check-info-list">
                                {products.map((fund_formula_product, index) => (
                                    <div key={index} className="fund-pre-check-info-list-item">
                                        <div className="fund-pre-check-info-list-item-content">
                                            <div className="fund-pre-check-info-list-item-icon fund-pre-check-info-list-item-icon-product">
                                                <em className="mdi mdi-ticket-percent-outline" />
                                            </div>
                                            <div className="fund-pre-check-info-list-item-title">
                                                {fund_formula_product.name}
                                            </div>
                                            <div className="fund-pre-check-info-list-item-count">
                                                {fund_formula_product.count}x
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="fund-pre-check-info-section">
                            <div className="fund-pre-check-info-totals">
                                <div className="fund-pre-check-info-totals-title">
                                    {translate('list_blocks.funds_list_pre_check.total')}
                                </div>
                                <div className="fund-pre-check-info-totals-amount">{fund.amount_total_locale}</div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
