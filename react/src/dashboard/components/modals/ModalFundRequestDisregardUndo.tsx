import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import useFormBuilder from '../../hooks/useFormBuilder';
import { ResponseError } from '../../props/ApiResponses';
import useSetProgress from '../../hooks/useSetProgress';
import FundRequest from '../../props/models/FundRequest';
import { useFundRequestValidatorService } from '../../services/FundRequestValidatorService';
import Organization from '../../props/models/Organization';

export default function ModalFundRequestDisregardUndo({
    modal,
    className,
    fundRequest,
    onSubmitted,
    organization,
}: {
    modal: ModalState;
    className?: string;
    fundRequest: FundRequest;
    onSubmitted: (res?: ResponseError) => void;
    organization: Organization;
}) {
    const setProgress = useSetProgress();
    const fundRequestService = useFundRequestValidatorService();

    const form = useFormBuilder({}, (values) => {
        setProgress(0);

        return fundRequestService
            .disregardUndo(organization.id, fundRequest.id, values)
            .then(
                () => {
                    modal.close();
                    onSubmitted();
                },
                (res) => {
                    form.setIsLocked(false);

                    if (res.status === 422) {
                        return form.setErrors(res.data.errors);
                    }

                    modal.close();
                    onSubmitted(res);
                },
            )
            .finally(() => setProgress(100));
    });

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
                <div className="modal-icon modal-icon-primary">
                    <div className="mdi mdi-message-text-outline" />
                </div>

                <div className="modal-body form">
                    <div className="modal-section modal-section-pad">
                        <div className="text-center">
                            <div className="modal-heading">Opnieuw in behandeling nemen</div>
                            <div className="modal-warning">
                                <em className="mdi mdi-alert-circle text-warning" />
                                &nbsp;
                                <span>Let op: de aanvrager kan niet hierna een nieuwe aanvraag starten.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Annuleer
                    </button>
                    <button type="submit" className="button button-primary">
                        Bevestig
                    </button>
                </div>
            </form>
        </div>
    );
}
