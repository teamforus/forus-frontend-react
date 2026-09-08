import FundRequestRecord from '../../../../../props/models/FundRequestRecord';
import React from 'react';
import FundRequestRecordClarificationsTabItem from './FundRequestRecordClarificationsTabItem';
import FundRequestClarification from '../../../../../props/models/FundRequestClarification';

export default function FundRequestRecordClarificationsTab({
    fundRequestRecord,
    canManageClarifications,
    editClarification,
    closeClarification,
}: {
    fundRequestRecord: FundRequestRecord;
    canManageClarifications: boolean;
    editClarification: (clarification: FundRequestClarification) => void;
    closeClarification: (clarification: FundRequestClarification) => void;
}) {
    return (
        <div className="block block-request-clarification" data-dusk="clarificationsTabContent">
            <div className="block-title">Aanvullingen</div>
            {fundRequestRecord.clarifications.map((clarification, index) => (
                <FundRequestRecordClarificationsTabItem
                    index={index}
                    key={clarification.id}
                    clarification={clarification}
                    canManageClarifications={canManageClarifications}
                    editClarification={() => editClarification(clarification)}
                    closeClarification={() => closeClarification(clarification)}
                />
            ))}
        </div>
    );
}
