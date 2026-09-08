import React, { SubmitEventHandler } from 'react';
import BlockDangerZone from '../../../elements/block-danger-zone/BlockDangerZone';
import useTranslate from '../../../../hooks/useTranslate';
import { ClarificationFormValues } from '../types';

export default function ClarificationConfirmation({
    values,
    isEditing,
    isLocked,
    onBack,
    onConfirm,
}: {
    values: ClarificationFormValues;
    isEditing: boolean;
    isLocked: boolean;
    onBack: () => void;
    onConfirm: SubmitEventHandler<HTMLFormElement>;
}) {
    const translate = useTranslate();
    const requirementText = { required: 'Ja (verplicht)', optional: 'Optioneel', no: 'Nee' };

    return (
        <form className="modal-window form" onSubmit={onConfirm}>
            <div className="modal-body form">
                <div className="modal-section">
                    <BlockDangerZone
                        title={translate('modals.danger_zone.fund_request_clarification.title')}
                        overview={[
                            { title: 'Vraag:', description: values.question },
                            {
                                title: 'Tekstuele uitleg:',
                                description: requirementText[values.text_requirement],
                            },
                            {
                                title: 'Uploaden bestand:',
                                description: requirementText[values.files_requirement],
                            },
                            ...(isEditing
                                ? [
                                      {
                                          title: 'Inwoner informeren:',
                                          description: values.notify_requester ? 'Ja' : 'Nee',
                                      },
                                  ]
                                : []),
                        ]}>
                        <div className="modal-heading">
                            {translate('modals.danger_zone.fund_request_clarification.description')}
                        </div>
                    </BlockDangerZone>
                </div>
            </div>
            <div className="modal-footer text-center">
                <button type="button" className="button button-default" disabled={isLocked} onClick={onBack}>
                    {translate('modals.danger_zone.fund_request_clarification.buttons.cancel')}
                </button>
                <button type="submit" className="button button-danger" disabled={isLocked}>
                    {translate('modals.danger_zone.fund_request_clarification.buttons.confirm')}
                </button>
            </div>
        </form>
    );
}
