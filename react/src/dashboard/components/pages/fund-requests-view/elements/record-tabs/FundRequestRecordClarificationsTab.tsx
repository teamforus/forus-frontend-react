import FundRequestRecord from '../../../../../props/models/FundRequestRecord';
import React from 'react';
import FundRequestRecordClarificationsTabItem from './FundRequestRecordClarificationsTabItem';

export default function FundRequestRecordClarificationsTab({
    fundRequestRecord,
}: {
    fundRequestRecord: FundRequestRecord;
}) {
    return (
        <div className="block block-request-clarification" data-dusk="clarificationsTabContent">
            <div className="block-title">Aanvullingen</div>
            {fundRequestRecord.clarifications.map((clarification, index) => (
                <FundRequestRecordClarificationsTabItem
                    index={index}
                    key={clarification.id}
                    clarification={clarification}
                />
            ))}
        </div>
    );
}
