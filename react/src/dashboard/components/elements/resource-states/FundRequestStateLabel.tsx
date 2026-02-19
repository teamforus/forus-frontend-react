import React, { useCallback, useMemo, useState } from 'react';
import FundRequest from '../../../props/models/FundRequest';
import FundRequestClarification from '../../../props/models/FundRequestClarification';
import Label, { LabelType } from '../label/Label';

export default function FundRequestStateLabel({ fundRequest }: { fundRequest: FundRequest }) {
    const [stateLabels] = useState<Record<string, { type: LabelType; icon: string }>>({
        pending: { type: 'primary-light', icon: 'circle-outline' },
        declined: { type: 'danger', icon: 'circle-off-outline' },
        approved: { type: 'success', icon: 'circle-slice-8' },
        approved_partly: { type: 'success', icon: 'circle-slice-4' },
        disregarded: { type: 'default', icon: 'circle-outline' },
        assigned: { type: 'default', icon: 'circle-outline' },
        clarification_requested: { type: 'warning', icon: 'circle-outline' },
    });

    const hasPendingClarifications = useCallback((clarifications: Array<FundRequestClarification>) => {
        return clarifications.filter((clarification) => clarification.state == 'pending').length;
    }, []);

    const hasRecordsWithPendingClarifications = useMemo(() => {
        return fundRequest.records
            .map((record) => record.clarifications)
            .filter((clarifications) => hasPendingClarifications(clarifications)).length;
    }, [fundRequest.records, hasPendingClarifications]);

    const localState = useMemo(() => {
        if (fundRequest.state == 'pending' && fundRequest.employee) {
            return hasRecordsWithPendingClarifications
                ? { key: 'clarification_requested', label: 'Extra info nodig' }
                : { key: 'assigned', label: 'In behandeling' };
        }

        return {
            key: fundRequest.state,
            label:
                !fundRequest.employee && fundRequest.state == 'pending'
                    ? 'Beoordelaar nodig'
                    : fundRequest.state_locale,
        };
    }, [fundRequest, hasRecordsWithPendingClarifications]);

    return fundRequest.state == 'pending' && fundRequest.employee ? (
        hasRecordsWithPendingClarifications ? (
            <Label type={stateLabels.clarification_requested?.type} icon={stateLabels.clarification_requested?.icon}>
                Extra info nodig
            </Label>
        ) : (
            <Label type="primary" icon="circle-outline">
                In behandeling
            </Label>
        )
    ) : (
        <Label type={stateLabels[localState.key]?.type} icon={stateLabels[localState.key]?.icon}>
            {localState.label}
        </Label>
    );
}
