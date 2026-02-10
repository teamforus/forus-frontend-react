import React, { useCallback, useContext, useEffect, useState } from 'react';
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
import { uniq } from 'lodash';
import FundRequestRecord from '../../../../dashboard/props/models/FundRequestRecord';
import ModalFundRequestClarificationResponse from '../../modals/ModalFundRequestClarificationResponse';
import useOpenModal from '../../../../dashboard/hooks/useOpenModal';
import useIsMobile from '../../../hooks/useIsMobile';
import FundRequestClarification from '../../../../dashboard/props/models/FundRequestClarification';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function FundRequestsShow() {
    const { id } = useParams();

    const isMobile = useIsMobile();
    const openModal = useOpenModal();
    const setTitle = useSetTitle();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();
    const { identity, token } = useContext(authContext);

    const [fundRequest, setFundRequest] = useState<FundRequest>(null);
    const [showDeclinedNote, setShowDeclinedNote] = useState(true);
    const [showCreditInfo, setShowCreditInfo] = useState(true);

    const [shownRecords, setShownRecords] = useState([]);
    const [shownClarificationForms, setShownClarificationForms] = useState([]);
    const [clarificationsResponded, setClarificationsResponded] = useState([]);

    const fundRequestService = useFundRequestService();

    const fetchFundRequest = useCallback(() => {
        setProgress(0);

        fundRequestService
            .readRequester(parseInt(id))
            .then((res) => setFundRequest(res.data.data))
            .finally(() => setProgress(100));
    }, [fundRequestService, setProgress, id]);

    const scrollToAndFocus = useCallback(
        (idCard: string, idTextarea: string, ms: number = 500, delay: number = 100) => {
            setTimeout(() => {
                const elCard = document.getElementById(idCard);
                const elInput = document.getElementById(idTextarea);

                if (!elCard) {
                    return;
                }

                elCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

                setTimeout(() => {
                    if (elInput) {
                        elInput.focus({ preventScroll: true });
                    }
                }, ms);
            }, delay);
        },
        [],
    );

    const openResponseModal = useCallback(
        (record: FundRequestRecord, clarification?: FundRequestClarification) => {
            openModal((modal) => (
                <ModalFundRequestClarificationResponse
                    modal={modal}
                    record={record}
                    fundRequest={fundRequest}
                    setFundRequest={setFundRequest}
                    clarification={clarification}
                    setClarificationsResponded={setClarificationsResponded}
                />
            ));
        },
        [fundRequest, openModal, setClarificationsResponded, setFundRequest],
    );

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
                        <div className="card-section card-section-md">
                            <div className="fund-request-props">
                                <div className="fund-request-prop">
                                    <div className="fund-request-prop-label">
                                        {translate('fund_request.details.status')}
                                    </div>
                                    <div className="fund-request-prop-value" aria-live="polite">
                                        <div
                                            className={classNames(
                                                'label',
                                                fundRequest.state === 'pending' && 'label-warning',
                                                fundRequest.state === 'approved' && 'label-success',
                                                fundRequest.state === 'declined' && 'label-default',
                                                fundRequest.state === 'disregarded' && 'label-danger',
                                            )}>
                                            {fundRequest.state_locale}
                                        </div>
                                    </div>
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
                        onRespond={(record, clarification) => {
                            if (isMobile) {
                                openResponseModal(record, clarification);
                            } else {
                                setShownRecords((records) => uniq([...records, record.id]));
                                setShownClarificationForms((clarifications) =>
                                    uniq([...clarifications, clarification.id]),
                                );
                            }

                            scrollToAndFocus(
                                `clarificationCard${clarification.id}`,
                                `answerInput${clarification.id}`,
                                500,
                                isMobile ? 500 : 100,
                            );
                        }}
                    />

                    <FundRequestRecordsBlock
                        fundRequest={fundRequest}
                        setFundRequest={setFundRequest}
                        shownRecords={shownRecords}
                        setShownRecords={setShownRecords}
                        setClarificationsResponded={setClarificationsResponded}
                        shownClarificationForms={shownClarificationForms}
                        setShownClarificationForms={setShownClarificationForms}
                        openResponseModal={openResponseModal}
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
