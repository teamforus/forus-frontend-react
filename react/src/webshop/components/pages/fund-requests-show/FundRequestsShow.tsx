import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import FundRequest from '../../../../dashboard/props/models/FundRequest';
import { useFundRequestService } from '../../../services/FundRequestService';
import { useParams } from 'react-router';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import useSetTitle from '../../../hooks/useSetTitle';
import PayoutCard from '../payouts/elements/PayoutCard';
import VoucherCard from '../vouchers/elements/VoucherCard';
import { useNavigateState } from '../../../modules/state_router/Router';
import { authContext } from '../../../contexts/AuthContext';
import FundRequestClarificationsBlock from './elements/FundRequestClarificationsBlock';
import FundRequestRecordsBlock from './elements/FundRequestRecordsBlock';
import classNames from 'classnames';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';
import EmptyValue from '../../../../dashboard/components/elements/empty-value/EmptyValue';
import StatusBanner from '../../elements/status-banner/StatusBanner';

export default function FundRequestsShow() {
    const { id } = useParams();

    const setTitle = useSetTitle();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();
    const { identity, token } = useContext(authContext);

    const [fundRequest, setFundRequest] = useState<FundRequest>(null);
    const [showDeclinedNote, setShowDeclinedNote] = useState(true);
    const [showCreditInfo, setShowCreditInfo] = useState(true);

    const [shownRecords, setShownRecords] = useState([]);
    const [clarificationsResponded, setClarificationsResponded] = useState([]);

    const fundRequestService = useFundRequestService();

    const latestAnswered = useMemo(() => {
        return fundRequest?.records
            ?.map((current) =>
                current?.clarifications.filter((clarification) => {
                    return clarification?.state === 'answered' || clarification?.state === 'closed';
                }),
            )
            .flat()
            .sort((a, b) => new Date(b.resolved_at).getTime() - new Date(a.resolved_at).getTime())?.[0];
    }, [fundRequest?.records]);

    const hasNotAnswered = useMemo(() => {
        return (
            fundRequest?.records?.filter((current) => {
                return (
                    current?.clarifications.filter((clarification) => {
                        return clarification?.state === 'pending';
                    }).length > 0
                );
            }).length > 0
        );
    }, [fundRequest?.records]);

    const fetchFundRequest = useCallback(() => {
        setProgress(0);

        fundRequestService
            .readRequester(parseInt(id))
            .then((res) => setFundRequest(res.data.data))
            .finally(() => setProgress(100));
    }, [fundRequestService, setProgress, id]);

    useEffect(() => {
        if (identity) {
            fetchFundRequest();
        }
    }, [identity, fetchFundRequest]);

    useEffect(() => {
        if (fundRequest) {
            setTitle(translate('page_state_titles.fund-request-show', { fund_name: fundRequest.fund.name }));
        }
    }, [fundRequest, setTitle, translate]);

    useEffect(() => {
        if (!identity && !token) {
            navigateState(WebshopRoutes.START, null, null, { state: { target: `fundRequest-${id}` } });
        }
    }, [id, identity, navigateState, token]);

    if (!identity || !fundRequest) {
        return null;
    }

    return (
        <BlockShowcaseProfile
            breadcrumbItems={[
                { name: translate('fund_request.breadcrumbs.home'), state: WebshopRoutes.HOME },
                { name: translate('fund_requests.title'), state: WebshopRoutes.FUND_REQUESTS },
                { name: translate('fund_request.breadcrumbs.fund_request', { id: fundRequest?.id }) },
            ]}
            profileHeader={
                fundRequest && (
                    <div className="profile-content-header">
                        <div className="profile-content-title">
                            {translate('fund_request.title', { id: fundRequest?.id })}
                        </div>
                        <div className="profile-content-subtitle">{translate('fund_request.subtitle')}</div>
                    </div>
                )
            }>
            {fundRequest && (
                <div className={'block block-fund-request'}>
                    <div className="card">
                        <div className="card-section">
                            <div className="fund-request-summary">
                                <div className="fund-request-summary-status">
                                    {fundRequest.state === 'pending' && !hasNotAnswered && (
                                        <StatusBanner type="pending">{fundRequest.state_locale}</StatusBanner>
                                    )}

                                    {fundRequest.state === 'pending' && hasNotAnswered && (
                                        <StatusBanner type="warning">
                                            {translate('fund_request.state.answer_needed')}
                                        </StatusBanner>
                                    )}

                                    {fundRequest.state === 'approved' && (
                                        <StatusBanner type="success">{fundRequest.state_locale}</StatusBanner>
                                    )}

                                    {fundRequest.state === 'disregarded' && (
                                        <StatusBanner type="danger">{fundRequest.state_locale}</StatusBanner>
                                    )}

                                    {fundRequest.state === 'declined' && (
                                        <StatusBanner type="default">{fundRequest.state_locale}</StatusBanner>
                                    )}
                                </div>

                                <div className="fund-request-props">
                                    <div className="fund-request-prop">
                                        <div className="fund-request-prop-label">
                                            {translate('fund_request.details.number')}
                                        </div>
                                        <div className="fund-request-prop-value">{fundRequest.id}</div>
                                    </div>
                                    <div className="fund-request-prop">
                                        <div className="fund-request-prop-label">
                                            {translate('fund_request.details.fund_name')}
                                        </div>
                                        <div className="fund-request-prop-value" data-dusk="fundRequestFund">
                                            {fundRequest.fund.name}
                                        </div>
                                    </div>
                                    <div className="fund-request-prop">
                                        <div className="fund-request-prop-label">
                                            {translate('fund_request.details.created_at')}
                                        </div>
                                        <div className="fund-request-prop-value">{fundRequest.created_at_locale}</div>
                                    </div>
                                    <div className="fund-request-prop">
                                        <div className="fund-request-prop-label">
                                            {translate('fund_request.details.last_answered')}
                                        </div>
                                        <div className="fund-request-prop-value">
                                            {latestAnswered?.resolved_at_locale || <EmptyValue />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(fundRequest.payouts?.length > 0 || fundRequest.vouchers?.length > 0) && (
                        <div className={classNames('card', 'card-collapsable', showCreditInfo && 'open')}>
                            <div
                                className="card-header"
                                onClick={() => setShowCreditInfo(!showCreditInfo)}
                                role="button"
                                tabIndex={0}
                                aria-expanded={showCreditInfo}
                                aria-controls={'fundRequestReceivedSection'}
                                aria-labelledby={'fundRequestReceivedHeader'}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setShowCreditInfo(!showCreditInfo);
                                    }
                                }}>
                                <div className="card-header-wrapper">
                                    <em className="mdi mdi-menu-down card-header-arrow" aria-hidden="true" />
                                    <h2 className="card-heading card-heading-lg" id={'fundRequestReceivedHeader'}>
                                        {translate('fund_request.received.title')}
                                    </h2>
                                </div>
                            </div>

                            {showCreditInfo && (
                                <div
                                    className="card-section card-section-md"
                                    id={'fundRequestReceivedSection'}
                                    role="region"
                                    aria-labelledby={'fundRequestReceivedHeader'}>
                                    {fundRequest.payouts?.length > 0 && (
                                        <div className="block block-payouts-list">
                                            {fundRequest.payouts.map((payout, index) => (
                                                <PayoutCard key={index} payout={payout} />
                                            ))}
                                        </div>
                                    )}

                                    {fundRequest.vouchers?.length > 0 && (
                                        <div className="block block-vouchers">
                                            {fundRequest.vouchers.map((voucher) => (
                                                <VoucherCard
                                                    key={voucher.id}
                                                    voucher={voucher}
                                                    onVoucherDestroyed={() => null}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <FundRequestClarificationsBlock
                        fundRequest={fundRequest}
                        clarificationsResponded={clarificationsResponded}
                        setFundRequest={setFundRequest}
                        setClarificationsResponded={setClarificationsResponded}
                    />

                    <FundRequestRecordsBlock
                        fundRequest={fundRequest}
                        shownRecords={shownRecords}
                        setShownRecords={setShownRecords}
                    />

                    {fundRequest.state === 'declined' && (
                        <div className={classNames('card', 'card-collapsable', showDeclinedNote && 'open')}>
                            <div
                                className="card-header"
                                onClick={() => setShowDeclinedNote(!showDeclinedNote)}
                                role="button"
                                tabIndex={0}
                                aria-expanded={showDeclinedNote}
                                aria-controls={'fundRequestDeclinedSection'}
                                aria-labelledby={'fundRequestDeclinedHeader'}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setShowDeclinedNote(!showDeclinedNote);
                                    }
                                }}>
                                <div className="card-header-wrapper">
                                    <em className="mdi mdi-menu-down card-header-arrow" aria-hidden="true" />{' '}
                                    <h2 className="card-heading card-heading-lg" id={'fundRequestDeclinedHeader'}>
                                        {translate('fund_request.declined.title')}
                                    </h2>
                                </div>
                            </div>

                            {showDeclinedNote && (
                                <div
                                    className="card-section"
                                    id={'fundRequestDeclinedSection'}
                                    role="region"
                                    aria-labelledby={'fundRequestDeclinedHeader'}>
                                    {fundRequest.note ? (
                                        <p className="block block-markdown">{fundRequest.note}</p>
                                    ) : (
                                        <p className="block block-markdown text-muted">
                                            {translate('fund_request.declined.no_note')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </BlockShowcaseProfile>
    );
}
