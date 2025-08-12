import FundRequestRecordAttachmentsTab from './FundRequestRecordAttachmentsTab';
import React, { useMemo } from 'react';
import MultilineText from '../../../../elements/multiline-text/MultilineText';
import classNames from 'classnames';
import FundRequestClarification from '../../../../../props/models/FundRequestClarification';

export default function FundRequestRecordClarificationsTabItem({
    index,
    clarification,
}: {
    index: number;
    clarification: FundRequestClarification;
}) {
    function splitDateTime(dt?: string) {
        if (dt) {
            const [timePart, datePart] = dt.split(' - ');

            return {
                time: timePart?.trim() || '',
                date: datePart?.trim() || '',
            };
        }

        return { date: '', time: '' };
    }

    const requested = useMemo(() => {
        return splitDateTime(clarification.created_at_locale);
    }, [clarification.created_at_locale]);

    const responded = useMemo(() => {
        return splitDateTime(clarification.answered_at_locale);
    }, [clarification.answered_at_locale]);

    const requirements = useMemo(() => {
        if (clarification.text_requirement !== 'no' && clarification.files_requirement !== 'no') {
            return 'text and files';
        }

        if (clarification.text_requirement !== 'no') {
            return 'text';
        }

        if (clarification.files_requirement !== 'no') {
            return 'files';
        }

        return null;
    }, [clarification]);

    return (
        <div className="clarification-item">
            <div className="clarification-item-nth">{index + 1}</div>
            <div className="clarification-item-details">
                {/* Question */}
                <div className="clarification-item-section">
                    <div className="clarification-item-section-header">
                        <div
                            className={classNames(
                                'clarification-item-section-header-label',
                                clarification.answered_at
                                    ? 'clarification-item-section-header-label-question-responded'
                                    : 'clarification-item-section-header-label-question-pending',
                            )}>
                            <em className="mdi mdi-help-circle" />
                            Question
                        </div>
                        <div className="clarification-item-section-header-title">
                            You’ve requested <strong>{requirements}</strong> on <strong>{requested.date}</strong> at{' '}
                            <strong>{requested.time}</strong>
                        </div>
                    </div>
                    <div className="clarification-item-section-body">
                        <div className="clarification-item-section-body-group">
                            <div className="clarification-item-section-body-bubble">
                                <MultilineText text={clarification.question} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Response */}
                <div className="clarification-item-section">
                    {clarification.answered_at ? (
                        <div className="clarification-item-section-header">
                            <div
                                className={classNames(
                                    'clarification-item-section-header-label',
                                    'clarification-item-section-header-label-answer-responded',
                                )}>
                                <em className="mdi mdi-check-circle" />
                                Response
                            </div>
                            <div className="clarification-item-section-header-title">
                                Response received on <strong>{responded.date}</strong> at{' '}
                                <strong>{responded.time}</strong>
                            </div>
                        </div>
                    ) : (
                        <div className="clarification-item-section-header">
                            <div
                                className={classNames(
                                    'clarification-item-section-header-label',
                                    'clarification-item-section-header-label-answer-pending',
                                )}>
                                <em className="mdi mdi-timer-sand" />
                                Waiting
                            </div>
                            <div className="clarification-item-section-header-title">
                                <strong>Requester</strong> was notified waiting for a response...
                            </div>
                        </div>
                    )}

                    {clarification?.answered_at && (
                        <div className="clarification-item-section-body">
                            {clarification?.answer && (
                                <div className="clarification-item-section-body-group clarification-item-section-body-group-with-title">
                                    <div className="clarification-item-section-body-group-title">Message</div>
                                    <div
                                        className={classNames(
                                            'clarification-item-section-body-bubble',
                                            'clarification-item-section-body-bubble-primary',
                                        )}>
                                        <MultilineText text={clarification.answer} />
                                    </div>
                                </div>
                            )}

                            {clarification?.files?.length > 0 && (
                                <div className="clarification-item-section-body-group clarification-item-section-body-group-with-title">
                                    <div className="clarification-item-section-body-group-title">
                                        Files ({clarification?.files?.length})
                                    </div>
                                    <FundRequestRecordAttachmentsTab
                                        attachments={clarification.files.map((file) => ({
                                            file,
                                            date: clarification.answered_at_locale,
                                        }))}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
