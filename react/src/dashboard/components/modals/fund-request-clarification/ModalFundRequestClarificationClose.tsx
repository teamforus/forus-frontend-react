import React from 'react';
import { ModalState } from '../../../modules/modals/context/ModalContext';
import useFormBuilder from '../../../hooks/useFormBuilder';
import { ResponseError } from '../../../props/ApiResponses';
import useSetProgress from '../../../hooks/useSetProgress';
import FundRequest from '../../../props/models/FundRequest';
import { useFundRequestValidatorService } from '../../../services/FundRequestValidatorService';
import Organization from '../../../props/models/Organization';
import classNames from 'classnames';
import FormGroup from '../../elements/forms/elements/FormGroup';
import FormPane from '../../elements/forms/elements/FormPane';
import InfoBox from '../../elements/info-box/InfoBox';
import FundRequestClarification from '../../../props/models/FundRequestClarification';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';

import BlockDangerZone from '../../elements/block-danger-zone/BlockDangerZone';

export default function ModalFundRequestClarificationClose({
    modal,
    className,
    fundRequest,
    onSubmitted,
    organization,
    clarification,
}: {
    modal: ModalState;
    className?: string;
    fundRequest: FundRequest;
    onSubmitted: (err?: ResponseError) => void;
    organization: Organization;
    clarification: FundRequestClarification;
}) {
    const setProgress = useSetProgress();
    const fundRequestService = useFundRequestValidatorService();

    const form = useFormBuilder<{
        note: string;
        notify_requester: boolean;
    }>(
        {
            note: '',
            notify_requester: false,
        },
        (values) => {
            setProgress(0);

            fundRequestService
                .closeRecordClarification(organization.id, fundRequest.id, clarification.id, values)
                .then(() => {
                    modal.close();
                    onSubmitted();
                })
                .catch((err: ResponseError) => {
                    form.setIsLocked(false);

                    if (err.status === 422) {
                        return form.setErrors(err.data.errors);
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

            <form className="modal-window form" onSubmit={form.submit}>
                <div className="modal-body form">
                    <div className="modal-section modal-section-pad flex flex-vertical flex-gap">
                        <BlockDangerZone title="Weet u zeker dat u dit verzoek wilt sluiten?" />

                        <div className="text-center">
                            <div className="modal-text">
                                Als u het verzoek om aanvullende informatie afsluit, kan de inwoner niet meer reageren.
                                U kunt eventueel een toelichting of bestanden toevoegen.
                            </div>
                        </div>

                        <FormPane title={'Persoonlijke notitie'}>
                            <FormGroup
                                error={form.errors?.note}
                                input={(id) => (
                                    <textarea
                                        id={id}
                                        className="form-control"
                                        value={form.values.note}
                                        onChange={(e) => form.update({ note: e.target.value })}
                                        placeholder="Notitie"
                                    />
                                )}
                            />
                        </FormPane>
                        <FormPane title={'Informeren'}>
                            <CheckboxControl
                                title="Stuur de inwoner een nieuw bericht over deze wijziging."
                                checked={form.values.notify_requester}
                                onChange={(e) => {
                                    form.update({
                                        notify_requester: e.target.checked,
                                    });
                                }}
                            />
                        </FormPane>
                        <InfoBox>
                            Als u deze optie aanvinkt, ontvangt de inwoner een bericht dat het verzoek is gesloten.
                        </InfoBox>
                    </div>
                </div>
                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Annuleer
                    </button>
                    <button type="submit" className="button button-primary">
                        Bevestigen
                    </button>
                </div>
            </form>
        </div>
    );
}
