import FundRequestRecord from '../../../../../props/models/FundRequestRecord';
import FundRequestRecordAttachmentsTab from './FundRequestRecordAttachmentsTab';
import React from 'react';
import MultilineText from '../../../../elements/multiline-text/MultilineText';

export default function FundRequestRecordClarificationsTab({
    fundRequestRecord,
}: {
    fundRequestRecord: FundRequestRecord;
}) {
    return (
        <div className="block block-request-clarification">
            <div className="block-title">Aanvullingen</div>
            {fundRequestRecord.clarifications.map((clarification, index) => (
                <div key={clarification.id} className="clarification-item">
                    <div className="clarification-item-nth">{index + 1}</div>
                    <div className="clarification-item-details">
                        <div className="clarification-item-question">
                            <div className="clarification-item-icon mdi mdi-message-text text-primary" />
                            <MultilineText text={clarification.question} />
                        </div>
                        <div className="clarification-item-answer">
                            <div className="clarification-item-icon mdi mdi-message-text text-primary-light" />
                            <MultilineText
                                className={clarification.answered_at ? '' : 'text-muted'}
                                text={clarification.answered_at ? clarification.answer : 'Geen antwoord...'}
                            />
                        </div>
                        {clarification?.files?.length > 0 && (
                            <div className="clarification-item-attachments">
                                <FundRequestRecordAttachmentsTab
                                    attachments={clarification.files.map((file) => ({
                                        file,
                                        date: clarification.answered_at_locale,
                                    }))}
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
