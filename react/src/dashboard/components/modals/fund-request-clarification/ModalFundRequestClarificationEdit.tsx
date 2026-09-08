import React, { useState } from 'react';
import ClarificationContactInfo from './elements/ClarificationContactInfo';
import { ModalState } from '../../../modules/modals/context/ModalContext';
import useFormBuilder from '../../../hooks/useFormBuilder';
import { ResponseError } from '../../../props/ApiResponses';
import useSetProgress from '../../../hooks/useSetProgress';
import FundRequest from '../../../props/models/FundRequest';
import { useFundRequestValidatorService } from '../../../services/FundRequestValidatorService';
import Organization from '../../../props/models/Organization';
import FundRequestRecord from '../../../props/models/FundRequestRecord';
import classNames from 'classnames';
import FundRequestClarification from '../../../props/models/FundRequestClarification';
import ClarificationConfirmation from './elements/ClarificationConfirmation';
import { ClarificationFormValues } from './types';
import ClarificationForm from './elements/ClarificationForm';

export default function ModalFundRequestClarificationEdit({
    modal,
    className,
    fundRequest,
    onSubmitted,
    organization,
    fundRequestRecord,
    clarification,
}: {
    modal: ModalState;
    className?: string;
    fundRequest: FundRequest;
    onSubmitted: (err?: ResponseError) => void;
    organization: Organization;
    fundRequestRecord: FundRequestRecord;
    clarification?: FundRequestClarification;
}) {
    const setProgress = useSetProgress();
    const fundRequestService = useFundRequestValidatorService();

    const [step, setStep] = useState<'form' | 'confirmation'>('form');

    const form = useFormBuilder<ClarificationFormValues>(
        {
            text_requirement: clarification?.text_requirement || 'required',
            files_requirement: clarification?.files_requirement || 'required',
            question: clarification?.question || '',
            notify_requester: false,
        },
        (values) => {
            setProgress(0);

            const data = {
                fund_request_record_id: fundRequestRecord.id,
                text_requirement: values.text_requirement,
                files_requirement: values.files_requirement,
                question: values.question,
            };

            const promise = clarification
                ? fundRequestService.updateRecordClarification(
                      organization.id,
                      fundRequestRecord.fund_request_id,
                      clarification.id,
                      { ...data, notify_requester: values.notify_requester },
                  )
                : fundRequestService.requestRecordClarification(
                      organization.id,
                      fundRequestRecord.fund_request_id,
                      data,
                  );

            return promise
                .then(() => {
                    modal.close();
                    onSubmitted();
                })
                .catch((err: ResponseError) => {
                    form.setIsLocked(false);

                    if (err.status === 422) {
                        form.setErrors(err.data.errors);
                        setStep('form');
                        return;
                    }

                    modal.close();
                    onSubmitted(err);
                })
                .finally(() => setProgress(100));
        },
    );

    return (
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading', className)}>
            <div className="modal-backdrop" onClick={modal.close} />

            {fundRequest.email ? (
                step === 'confirmation' ? (
                    <ClarificationConfirmation
                        values={form.values}
                        isEditing={!!clarification}
                        isLocked={form.isLocked}
                        onBack={() => setStep('form')}
                        onConfirm={form.submit}
                    />
                ) : (
                    <ClarificationForm
                        values={form.values}
                        errors={form.errors}
                        isEditing={!!clarification}
                        onUpdate={form.update}
                        onContinue={() => setStep('confirmation')}
                        onCancel={modal.close}
                    />
                )
            ) : (
                <ClarificationContactInfo contactInformation={fundRequest.contact_information} onClose={modal.close} />
            )}
        </div>
    );
}
