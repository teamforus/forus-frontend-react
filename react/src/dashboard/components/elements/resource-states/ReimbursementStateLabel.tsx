import React from 'react';
import Label from '../image_cropper/Label';
import Reimbursement from '../../../props/models/Reimbursement';

export default function ReimbursementStateLabel({
    reimbursement,
    dusk,
}: {
    reimbursement: Reimbursement;
    dusk?: string;
}) {
    if (reimbursement.expired) {
        return (
            <Label type="danger_light" dusk={dusk}>
                Verlopen
            </Label>
        );
    }

    if (reimbursement.state === 'pending') {
        return (
            <Label type={'default'} dusk={dusk}>
                {reimbursement.state_locale}
            </Label>
        );
    }

    if (reimbursement.state === 'approved') {
        return (
            <Label type={'success'} dusk={dusk}>
                {reimbursement.state_locale}
            </Label>
        );
    }

    if (reimbursement.state === 'declined') {
        return (
            <Label type={'danger'} dusk={dusk}>
                {reimbursement.state_locale}
            </Label>
        );
    }

    return null;
}
