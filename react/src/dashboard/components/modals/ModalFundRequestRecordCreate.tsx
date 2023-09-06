import React, { useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormError from '../elements/forms/errors/FormError';
import { ApiResponseSingle } from '../../props/ApiResponses';
import useSetProgress from '../../hooks/useSetProgress';
import FundRequest from '../../props/models/FundRequest';
import { useFundRequestValidatorService } from '../../services/FundRequestValidatorService';
import Organization from '../../props/models/Organization';
import FundRequestRecord from '../../props/models/FundRequestRecord';

export default function ModalFundRequestRecordCreate({
    modal,
    onCreated,
    className,
    fundRequest,
    organization,
}: {
    modal: ModalState;
    onCreated: (res?: ApiResponseSingle<FundRequestRecord>) => void;
    className?: string;
    fundRequest: FundRequest;
    organization: Organization;
}) {
    const setProgress = useSetProgress();
    const fundRequestService = useFundRequestValidatorService();
    const [verificationRequested, setVerificationRequested] = useState(null);

    const form = useFormBuilder(
        {
            value: '',
            record_type_key: 'partner_bsn',
        },
        (values) => {
            if (!verificationRequested) {
                form.setIsLocked(false);
                setVerificationRequested(true);
                return;
            }

            setProgress(0);

            return fundRequestService
                .appendRecord(organization.id, fundRequest.id, values)
                .then(
                    (res) => {
                        modal.close();
                        onCreated(res);
                    },
                    (res) => {
                        form.setIsLocked(false);
                        form.setErrors(res.data.errors);
                        setVerificationRequested(false);
                    },
                )
                .finally(() => setProgress(100));
        },
    );

    return (
        <div
            className={classList([
                'modal',
                'modal-md',
                'modal-animated',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">
                    {verificationRequested ? 'Gegevens controleren' : 'Relatie toevoegen'}
                </div>

                <div className="modal-body">
                    {!verificationRequested && (
                        <div className="modal-section">
                            <div className="row">
                                <div className="col col-lg-8 col-lg-offset-2 col-lg-12">
                                    <div className="form-group">
                                        <label className="form-label form-label-required">Partner</label>
                                        <input
                                            className="form-control"
                                            type="number"
                                            value={form.values.value}
                                            onChange={(e) => form.update({ value: e.target.value })}
                                            placeholder="Partner BSN"
                                        />
                                        <FormError error={form.errors.value} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {verificationRequested ? (
                        <div className="modal-section">
                            <div className="modal-text text-center">
                                Controleer of u de juiste gegevens hebt ingevuld voordat u deze bevestigd.
                            </div>
                            <div className="row">
                                <div className="col col-lg-8 col-lg-offset-2">
                                    <div className="block block-compact-datalist compact-datalist-outline">
                                        <div className="datalist-row">
                                            <div className="datalist-key">
                                                <strong>Partner</strong>
                                            </div>
                                            <div className="datalist-value text-right">{form.values.value}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="modal-section">
                            <div className="modal-info">
                                <em className="mdi mdi-information" />U voegt eigenschappen toe in naam van&nbsp;
                                <strong>{organization.name}</strong>
                            </div>
                        </div>
                    )}
                </div>

                {verificationRequested ? (
                    <div className="modal-footer text-center">
                        <button
                            className="button button-default"
                            type="button"
                            onClick={() => setVerificationRequested(false)}>
                            Sluiten
                        </button>
                        <button className="button button-primary" type="submit">
                            Bevestigen
                        </button>
                    </div>
                ) : (
                    <div className="modal-footer text-center">
                        <button className="button button-default" type="button" onClick={modal.close} id="close">
                            Sluiten
                        </button>
                        <button className="button button-primary" type="submit">
                            Bevestigen
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
