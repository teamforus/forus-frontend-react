import React, { Fragment, useCallback, useContext, useEffect, useState } from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import FundRequest from '../../../../dashboard/props/models/FundRequest';
import { useFundRequestService } from '../../../services/FundRequestService';
import { useParams } from 'react-router-dom';
import FundRequestRecordCard from './elements/FundRequestRecordCard';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import useSetTitle from '../../../hooks/useSetTitle';
import PayoutCard from '../payouts/elements/PayoutCard';
import VoucherCard from '../vouchers/elements/VoucherCard';
import { useNavigateState } from '../../../modules/state_router/Router';
import { authContext } from '../../../contexts/AuthContext';

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

    const fundRequestService = useFundRequestService();

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
            navigateState('start', null, null, { state: { target: `fundRequest-${id}` } });
        }
    }, [id, identity, navigateState, token]);

    if (!identity || !fundRequest) {
        return null;
    }

    return (
        <BlockShowcaseProfile
            breadcrumbItems={[
                { name: translate('fund_request.breadcrumbs.home'), state: 'home' },
                { name: translate('fund_requests.title'), state: 'fund-requests' },
                { name: translate('fund_request.breadcrumbs.fund_request', { id: fundRequest?.id }) },
            ]}
            profileHeader={
                fundRequest && (
                    <div className="profile-content-header">
                        <div className="flex">
                            <div className="flex flex-grow flex-center">
                                <div className="profile-content-title flex flex-center flex-vertical">
                                    {translate('fund_request.title', { id: fundRequest?.id })}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }>
            {fundRequest && (
                <div className={'block block-fund-request'}>
                    <div className="card">
                        <div className="card-section">
                            <h3 className="card-heading card-heading-lg flex">
                                <div className="flex flex-grow">{translate('fund_request.details.title')}</div>
                                <div className="flex flex-center flex-vertical">
                                    {fundRequest.state === 'pending' && (
                                        <div className="label label-warning">{fundRequest.state_locale}</div>
                                    )}
                                    {fundRequest.state === 'approved' && (
                                        <div className="label label-success">{fundRequest.state_locale}</div>
                                    )}
                                    {fundRequest.state === 'declined' && (
                                        <div className="label label-default">{fundRequest.state_locale}</div>
                                    )}
                                    {fundRequest.state === 'disregarded' && (
                                        <div className="label label-danger">{fundRequest.state_locale}</div>
                                    )}
                                </div>
                            </h3>
                            <div className="fund-request-section">
                                <div className="fund-request-props">
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
                                            {translate('fund_request.details.id')}
                                        </div>
                                        <div className="fund-request-prop-value">#{fundRequest.id}</div>
                                    </div>
                                    <div className="fund-request-prop">
                                        <div className="fund-request-prop-label">
                                            {translate('fund_request.details.created_at')}
                                        </div>
                                        <div className="fund-request-prop-value">{fundRequest.created_at_locale}</div>
                                    </div>
                                    <div className="fund-request-prop">
                                        <div className="fund-request-prop-label">
                                            {translate('fund_request.details.number_of_records')}
                                        </div>
                                        <div className="fund-request-prop-value">{fundRequest.records.length}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(fundRequest.payouts?.length > 0 || fundRequest.vouchers?.length > 0) && (
                        <div className={`card card-collapsable ${showCreditInfo ? 'open' : ''}`}>
                            <div className="card-header" onClick={() => setShowCreditInfo(!showCreditInfo)}>
                                <div className="card-header-wrapper">
                                    <em className="mdi mdi-menu-down card-header-arrow" />
                                    <h2 className="card-heading card-heading-lg">
                                        {translate('fund_request.received.title')}
                                    </h2>
                                </div>
                            </div>

                            {showCreditInfo && (
                                <Fragment>
                                    <div className="card-section card-section-md">
                                        {fundRequest.payouts?.length > 0 && (
                                            <div className="block block-payouts-list">
                                                {fundRequest.payouts.map((payout, index) => (
                                                    <PayoutCard key={index} payout={payout} />
                                                ))}
                                            </div>
                                        )}

                                        {fundRequest.vouchers?.length > 0 && (
                                            <div className="block block-vouchers block-vouchers-with-border">
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
                                </Fragment>
                            )}
                        </div>
                    )}

                    <h2 className="profile-content-header">
                        <div className="profile-content-title profile-content-title-sm">
                            {translate('fund_request.records.title')}
                        </div>
                    </h2>

                    {fundRequest?.records.map((record) => (
                        <FundRequestRecordCard
                            key={record.id}
                            request={fundRequest}
                            setFundRequest={setFundRequest}
                            record={record}
                        />
                    ))}

                    {fundRequest.state === 'declined' && (
                        <div className={`card card-collapsable ${showDeclinedNote ? 'open' : ''}`}>
                            <div className="card-header" onClick={() => setShowDeclinedNote(!showDeclinedNote)}>
                                <div className="card-header-wrapper">
                                    <em className="mdi mdi-menu-down card-header-arrow" />
                                    <h2 className="card-heading card-heading-lg">
                                        {translate('fund_request.declined.title')}
                                    </h2>
                                </div>
                            </div>

                            {showDeclinedNote && (
                                <div className="card-section">
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
